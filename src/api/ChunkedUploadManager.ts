import {
  UploadStatus,
  ChunkInfo,
  UploadSessionInfo,
  UploadTrackingInfo,
} from 'src/types/localTypes';
import { apiPost, apiGet } from './apiWrapper';
import { Cookies } from 'quasar';

// Quasar cookies instance
const cookies = Cookies;

/**
 * Upload manager for handling chunked uploads with pause/resume capability
 */
export class ChunkedUploadManager {
  // Use a Map to track ongoing uploads by ID
  private static activeUploads = new Map<string, UploadTrackingInfo>();
  private static CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

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

      // Initialize session with server
      const response = await apiPost(
        'files/upload/init-session',
        {
          filename: file.name,
          parentId,
          fileSize: file.size,
          mimeType: file.type,
          totalChunks,
          chunkSize,
        },
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': cookies.get('csrftoken'),
          },
        }
      );

      if (response.error) {
        throw new Error(
          response.errorMessage || 'Failed to initialize upload session'
        );
      }

      // Update tracking info with session details
      uploadInfo.sessionInfo = {
        sessionId: response.data.sessionId,
        filename: file.name,
        fileSize: file.size,
        mimeType: file.type,
        chunkSize,
        totalChunks,
        chunks,
        uploadedChunks: 0,
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        resumeToken: response.data.resumeToken,
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

      // Prepare form data
      const formData = new FormData();
      formData.append('chunk', chunkData);
      formData.append('chunkIndex', chunk.index.toString());
      formData.append('sessionId', upload.sessionInfo.sessionId);

      // Create an abort controller for this chunk
      const controller = new AbortController();

      // We need to use fetch here since apiWrapper doesn't support AbortController
      // But we'll follow the same error handling pattern
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/files/upload/chunk`,
        {
          method: 'POST',
          body: formData,
          headers: {
            'X-CSRFToken': cookies.get('csrftoken'),
          },
          signal: controller.signal,
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || `Failed to upload chunk ${chunk.index}`
        );
      }

      // Update chunk status
      chunk.status = UploadStatus.COMPLETED;
      chunk.uploadedAt = new Date();
      upload.sessionInfo.uploadedChunks++;
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
          `Failed to upload chunk ${chunk.index} after ${chunk.retries} retries`
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
      // Notify server to cancel the session
      await apiPost(
        `files/upload/cancel-session/${upload.sessionInfo.sessionId}`,
        {},
        {
          withCredentials: true,
          headers: {
            'X-CSRFToken': cookies.get('csrftoken'),
          },
        }
      );
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
      const response = await apiPost(
        `files/upload/finalize/${upload.sessionInfo.sessionId}`,
        {
          name: upload.name, // Use the potentially renamed file
          parentId: upload.parentId,
        },
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
   * Save upload state to local storage for possible future resuming
   */
  static saveUploadState(): void {
    // Convert Map to object for storage
    const uploadsToSave = Array.from(
      ChunkedUploadManager.activeUploads.entries()
    )
      .filter(
        ([_, upload]) =>
          // Only save uploads that can be resumed (have session info)
          upload.canResume &&
          upload.sessionInfo &&
          upload.status !== UploadStatus.COMPLETED
      )
      .map(([id, upload]) => {
        // Don't store the file object itself
        const { sourceFile, ...uploadWithoutFile } = upload;
        return [id, uploadWithoutFile];
      });

    localStorage.setItem(
      'chunked_uploads',
      JSON.stringify(Object.fromEntries(uploadsToSave))
    );
  }

  /**
   * Restore upload state from local storage
   */
  static restoreUploadState(): void {
    try {
      const savedUploads = localStorage.getItem('chunked_uploads');
      if (!savedUploads) return;

      const uploadEntries = Object.entries(JSON.parse(savedUploads));

      for (const [id, uploadData] of uploadEntries) {
        // Cast dates back from strings
        const upload = uploadData as UploadTrackingInfo;
        upload.createdAt = new Date(upload.createdAt);
        if (upload.sessionInfo) {
          upload.sessionInfo.createdAt = new Date(upload.sessionInfo.createdAt);
          upload.sessionInfo.lastUpdatedAt = new Date(
            upload.sessionInfo.lastUpdatedAt
          );

          for (const chunk of upload.sessionInfo.chunks) {
            if (chunk.uploadedAt) {
              chunk.uploadedAt = new Date(chunk.uploadedAt);
            }
          }
        }

        // Add to active uploads map
        ChunkedUploadManager.activeUploads.set(id, upload);
      }
    } catch (error) {
      console.error('Failed to restore upload state:', error);
    }
  }

  /**
   * Helper method to verify if an upload exists and has valid session info
   */
  private static validateUpload(uploadId: string): UploadTrackingInfo {
    const upload = ChunkedUploadManager.activeUploads.get(uploadId);
    if (!upload) {
      throw new Error(`Upload with ID ${uploadId} not found`);
    }
    if (!upload.sessionInfo) {
      throw new Error(`Upload ${uploadId} has no session information`);
    }
    return upload;
  }
}
