import {
  UploadStatus,
  ChunkInfo,
  UploadSessionInfo,
  UploadTrackingInfo,
} from 'src/types/localTypes';

import { UploadSessionCreateRequest, UploadSession } from 'src/types/apiTypes';

import { apiPost, apiGet, apiDelete } from './apiWrapper';
import { Cookies } from 'quasar';

// Quasar cookies instance
const cookies = Cookies;

/**
 * Upload manager for handling chunked uploads with pause/resume capability
 * Updated to work with Django chunked upload API
 * Note: Uploads are only maintained in memory - no localStorage persistence
 */
export class ChunkedUploadManager {
  // Use a Map to track ongoing uploads by ID
  private static activeUploads = new Map<string, UploadTrackingInfo>();
  private static CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

  private static getAxiosConfig() {
    return {
      withCredentials: true,
      headers: {
        'X-CSRFToken': cookies.get('csrftoken'),
      },
    };
  }

  /**
   * Initialize a new chunked upload
   */
  static async initUpload(
    file: File,
    parentId: string,
    chunkSize: number = ChunkedUploadManager.CHUNK_SIZE
  ): Promise<UploadTrackingInfo> {
    // Generate a unique ID for this upload
    const uploadId = `upload_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    // Create the tracking info object
    const uploadInfo: UploadTrackingInfo = {
      id: uploadId,
      name: file.name,
      originalFilename: file.name,
      status: UploadStatus.PREPARING,
      parentId,
      size: file.size,
      uploadedBytes: 0,
      uploadSpeed: 0,
      eta: 0,
      message: 'Preparing upload...',
      sourceFile: file,
      fileType: 'file',
      typeIcon: 'file_present',
      createdAt: new Date(),
      canResume: true,
      isPaused: false,
    };

    // Store in the active uploads map
    ChunkedUploadManager.activeUploads.set(uploadId, uploadInfo);

    try {
      // Calculate total chunks
      const totalChunks = Math.ceil(file.size / chunkSize);

      // Prepare chunks info
      const chunks: ChunkInfo[] = [];
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(file.size, start + chunkSize);
        chunks.push({
          index: i,
          start,
          end,
          status: UploadStatus.QUEUED,
          retries: 0,
        });
      }

      const sessionRequest: UploadSessionCreateRequest = {
        filename: file.name,
        parentFolderId: parentId,
        fileSize: file.size,
        mimeType: file.type,
        totalChunks: totalChunks,
        chunkSize: chunkSize,
      };

      // Initialize session with server
      const response = await apiPost(
        'files/uploads/',
        sessionRequest,
        ChunkedUploadManager.getAxiosConfig()
      );

      if (response.error) {
        throw new Error(
          response.errorMessage || 'Failed to initialize upload session'
        );
      }

      const sessionData: UploadSession = response.data;

      // Update tracking info with session details
      uploadInfo.sessionInfo = {
        sessionId: sessionData.id, // Django returns 'id', not 'sessionId'
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        chunkSize,
        totalChunks,
        chunks,
        uploadedChunks: sessionData.uploadedChunks || 0,
        createdAt: new Date(sessionData.createdAt),
        lastUpdatedAt: new Date(sessionData.updatedAt),
        resumeToken: sessionData.resumeToken,
      };

      uploadInfo.status = UploadStatus.QUEUED;
      uploadInfo.message = 'Ready to upload';

      return uploadInfo;
    } catch (error: any) {
      // Handle initialization error
      uploadInfo.status = UploadStatus.FAILED;
      uploadInfo.message = error.message || 'Failed to initialize upload';
      return uploadInfo;
    }
  }

  /**
   * Start or resume a chunked upload
   */
  static async startUpload(uploadId: string): Promise<void> {
    const upload = ChunkedUploadManager.activeUploads.get(uploadId);
    if (!upload || !upload.sessionInfo) {
      throw new Error('Upload not found or not initialized');
    }

    // Only start if not already uploading
    if (upload.status === UploadStatus.UPLOADING) {
      return;
    }

    upload.status = UploadStatus.UPLOADING;
    upload.message = 'Uploading...';
    upload.isPaused = false;

    // Store the last update time for speed calculation
    let lastUpdateTime = Date.now();
    let lastUploadedBytes = upload.uploadedBytes;

    try {
      // Get chunks that need to be uploaded
      const pendingChunks = upload.sessionInfo.chunks.filter(
        (chunk) => chunk.status !== UploadStatus.COMPLETED
      );

      // Use Promise.all with a limited concurrency
      const concurrencyLimit = 3; // Upload 3 chunks at a time

      // Process chunks in sequence with limited concurrency
      for (let i = 0; i < pendingChunks.length; i += concurrencyLimit) {
        // Exit early if upload is paused or canceled
        if (
          upload.status === UploadStatus.PAUSED ||
          upload.status === UploadStatus.CANCELED
        ) {
          break;
        }

        const chunkBatch = pendingChunks.slice(i, i + concurrencyLimit);
        await Promise.all(
          chunkBatch.map((chunk) =>
            ChunkedUploadManager.uploadChunk(upload, chunk)
          )
        );

        // Calculate upload speed every batch
        const now = Date.now();
        const timeElapsed = (now - lastUpdateTime) / 1000; // in seconds
        if (timeElapsed > 0) {
          upload.uploadSpeed =
            (upload.uploadedBytes - lastUploadedBytes) / timeElapsed;
          upload.eta =
            upload.uploadSpeed > 0
              ? Math.ceil(
                  (upload.size - upload.uploadedBytes) / upload.uploadSpeed
                )
              : 0;

          lastUpdateTime = now;
          lastUploadedBytes = upload.uploadedBytes;
        }
      }

      // Check if all chunks are complete
      const allComplete = upload.sessionInfo.chunks.every(
        (chunk) => chunk.status === UploadStatus.COMPLETED
      );

      if (allComplete && upload.status !== UploadStatus.PAUSED) {
        // Finalize the upload
        await ChunkedUploadManager.finalizeUpload(upload);
      }
    } catch (error: any) {
      // Only update status if not paused (user-initiated)
      if (upload.status !== UploadStatus.PAUSED) {
        upload.status = UploadStatus.FAILED;
        upload.message = error.message || 'Upload failed';
      }
    }
  }

  /**
   * Upload a single chunk
   */
  private static async uploadChunk(
    upload: UploadTrackingInfo,
    chunk: ChunkInfo
  ): Promise<void> {
    if (!upload.sourceFile || !upload.sessionInfo) return;

    // Skip completed chunks
    if (chunk.status === UploadStatus.COMPLETED) return;

    // Mark as uploading
    chunk.status = UploadStatus.UPLOADING;

    try {
      // Extract the chunk data
      const chunkData = upload.sourceFile.slice(chunk.start, chunk.end);

      // Prepare form data with snake_case field names
      const formData = new FormData();
      formData.append('chunk', chunkData);
      formData.append('chunk_index', chunk.index.toString()); // ✅ Fixed: was 'chunkIndex'

      // Use your apiWrapper with proper config for FormData
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': cookies.get('csrftoken'),
          // Don't set Content-Type manually for FormData - let axios handle it
        },
      };

      const response = await apiPost(
        `files/uploads/${upload.sessionInfo.sessionId}/upload_chunk/`,
        formData,
        axiosConfig
      );

      if (response.error) {
        throw new Error(
          response.errorMessage || `Failed to upload chunk ${chunk.index}`
        );
      }

      // Update chunk status
      chunk.status = UploadStatus.COMPLETED;
      chunk.uploadedAt = new Date();
      upload.sessionInfo.uploadedChunks =
        response.data.uploadedChunks || upload.sessionInfo.uploadedChunks + 1;
      upload.sessionInfo.lastUpdatedAt = new Date();

      // Update the overall upload progress
      upload.uploadedBytes += chunk.end - chunk.start;
    } catch (error: any) {
      // Check if this was an abort error (user-initiated pause)
      if (error.name === 'AbortError') {
        chunk.status = UploadStatus.PAUSED;
        return;
      }

      // Handle chunk upload failure (with retry logic)
      if (chunk.retries < 3) {
        chunk.retries++;
        chunk.status = UploadStatus.QUEUED;
        // The chunk will be retried in the next batch
      } else {
        chunk.status = UploadStatus.FAILED;
        throw new Error(
          `Failed to upload chunk ${chunk.index} after ${chunk.retries} retries: ${error.message}`
        );
      }
    }
  }

  /**
   * Pause an ongoing upload
   */
  static pauseUpload(uploadId: string): boolean {
    const upload = ChunkedUploadManager.activeUploads.get(uploadId);
    if (!upload) return false;

    upload.status = UploadStatus.PAUSED;
    upload.isPaused = true;
    upload.message = 'Upload paused';

    return true;
  }

  /**
   * Resume a paused upload
   */
  static resumeUpload(uploadId: string): Promise<void> {
    return ChunkedUploadManager.startUpload(uploadId);
  }

  /**
   * Cancel an upload
   */
  static async cancelUpload(uploadId: string): Promise<boolean> {
    const upload = ChunkedUploadManager.activeUploads.get(uploadId);
    if (!upload || !upload.sessionInfo) return false;

    upload.status = UploadStatus.CANCELED;
    upload.message = 'Upload canceled';

    try {
      // Cancel the session on the server using DELETE (REST convention)
      await apiDelete(`files/uploads/${upload.sessionInfo.sessionId}/`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': cookies.get('csrftoken'),
        },
      });
      return true;
    } catch (error: any) {
      console.error('Failed to cancel upload on server:', error);
      return true; // Still consider it canceled locally
    }
  }

  /**
   * Finalize a completed upload
   */
  private static async finalizeUpload(
    upload: UploadTrackingInfo
  ): Promise<void> {
    if (!upload.sessionInfo) return;

    try {
      // Complete the upload using your Django API
      const response = await apiPost(
        `files/uploads/${upload.sessionInfo.sessionId}/complete/`,
        {}, // Django complete endpoint doesn't need additional data
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': cookies.get('csrftoken'),
          },
        }
      );

      if (response.error) {
        throw new Error(response.errorMessage || 'Failed to finalize upload');
      }

      upload.status = UploadStatus.COMPLETED;
      upload.message = 'Upload completed';
      upload.uploadedBytes = upload.size;
    } catch (error: any) {
      upload.status = UploadStatus.FAILED;
      upload.message = error.message || 'Failed to finalize upload';
      throw error;
    }
  }

  /**
   * Get upload status from server (for resuming)
   */
  static async getUploadStatus(sessionId: string): Promise<any> {
    try {
      const response = await apiGet(`files/uploads/${sessionId}/`, {
        withCredentials: true,
        headers: {
          'X-CSRFToken': cookies.get('csrftoken'),
        },
      });

      if (response.error) {
        throw new Error(response.errorMessage || 'Failed to get upload status');
      }

      return response.data;
    } catch (error: any) {
      console.error('Failed to get upload status:', error);
      throw error;
    }
  }

  /**
   * Resume upload from server state (for same-session resumes only)
   */
  static async resumeFromServer(uploadId: string): Promise<void> {
    const upload = ChunkedUploadManager.activeUploads.get(uploadId);
    if (!upload || !upload.sessionInfo) {
      throw new Error('Upload not found or not initialized');
    }

    try {
      // Get current status from server
      const serverStatus = await ChunkedUploadManager.getUploadStatus(
        upload.sessionInfo.sessionId
      );

      // Update our local state with server state
      upload.sessionInfo.uploadedChunks = serverStatus.uploadedChunks;

      // Mark uploaded chunks as completed
      for (let i = 0; i < serverStatus.uploadedChunks; i++) {
        if (upload.sessionInfo.chunks[i]) {
          upload.sessionInfo.chunks[i].status = UploadStatus.COMPLETED;
          upload.uploadedBytes +=
            upload.sessionInfo.chunks[i].end -
            upload.sessionInfo.chunks[i].start;
        }
      }

      // Continue with remaining chunks
      await ChunkedUploadManager.startUpload(uploadId);
    } catch (error: any) {
      upload.status = UploadStatus.FAILED;
      upload.message = error.message || 'Failed to resume upload';
      throw error;
    }
  }

  /**
   * Get all active uploads
   */
  static getAllUploads(): UploadTrackingInfo[] {
    return Array.from(ChunkedUploadManager.activeUploads.values());
  }

  /**
   * Get a specific upload by ID
   */
  static getUpload(uploadId: string): UploadTrackingInfo | undefined {
    return ChunkedUploadManager.activeUploads.get(uploadId);
  }

  /**
   * Remove a specific upload by ID
   */
  static removeUpload(uploadId: string): boolean {
    return ChunkedUploadManager.activeUploads.delete(uploadId);
  }

  /**
   * Clear all uploads from the manager
   */
  static clearAllUploads(): void {
    // Cancel any active uploads first
    for (const [uploadId, upload] of ChunkedUploadManager.activeUploads) {
      if (
        [
          UploadStatus.UPLOADING,
          UploadStatus.QUEUED,
          UploadStatus.PREPARING,
        ].includes(upload.status)
      ) {
        ChunkedUploadManager.cancelUpload(uploadId);
      }
    }

    // Clear the map
    ChunkedUploadManager.activeUploads.clear();
  }

  /**
   * Remove completed uploads only
   */
  static removeCompletedUploads(): void {
    const completedIds: string[] = [];

    for (const [uploadId, upload] of ChunkedUploadManager.activeUploads) {
      if (upload.status === UploadStatus.COMPLETED) {
        completedIds.push(uploadId);
      }
    }

    completedIds.forEach((id) => {
      ChunkedUploadManager.activeUploads.delete(id);
    });
  }

  /**
   * Get upload statistics
   */
  static getUploadStats() {
    const uploads = Array.from(ChunkedUploadManager.activeUploads.values());

    return {
      total: uploads.length,
      uploading: uploads.filter((u) => u.status === UploadStatus.UPLOADING)
        .length,
      queued: uploads.filter((u) => u.status === UploadStatus.QUEUED).length,
      paused: uploads.filter((u) => u.status === UploadStatus.PAUSED).length,
      completed: uploads.filter((u) => u.status === UploadStatus.COMPLETED)
        .length,
      failed: uploads.filter((u) => u.status === UploadStatus.FAILED).length,
      canceled: uploads.filter((u) => u.status === UploadStatus.CANCELED)
        .length,
    };
  }
}
