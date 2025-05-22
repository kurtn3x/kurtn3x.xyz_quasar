import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { apiPost } from 'src/components/apiWrapper';
import {
  fileSizeIEC,
  transferedPercentLabel,
} from 'src/components/lib/functions';
import { useFileOperationsStore } from './fileOperationsStore';
import type {
  TraverseFolderMapType,
  UploadProgressEntryType,
} from 'src/types/index';

export const useUploadStore = defineStore('upload', () => {
  const q = useQuasar();
  const fileOps = useFileOperationsStore();

  // Progress panel state
  const progressPanel = ref(false);
  const progressSticky = ref(false);
  const progressPanelProgressMap = ref([] as UploadProgressEntryType[]);
  const uniqueFolderUploadId = ref(0);

  // Constants
  const MAX_FILE_SIZE = 524288000; // 500MB
  const MAX_FOLDER_ENTRIES = 500;

  // Computed values
  const hasActiveUploads = computed(() =>
    progressPanelProgressMap.value.some((p) => p.status === 'loading')
  );

  async function traverseFolder(
    folder: FileSystemDirectoryEntry,
    returnArray: TraverseFolderMapType[],
    parentId: number
  ) {
    return new Promise(async (resolve) => {
      const rememberParent = parentId;
      const directoryReader = folder.createReader();

      directoryReader.readEntries(async (entries: FileSystemEntry[]) => {
        for (const entry of entries) {
          uniqueFolderUploadId.value += 1;

          if (entry.isDirectory) {
            // Handle folder
            const uniqueFolderId = parentId + 1;
            const folderStructure: TraverseFolderMapType = {
              type: 'folder',
              id: uniqueFolderUploadId.value,
              name: entry.name,
              folderId: uniqueFolderId,
              parentId: rememberParent,
            };

            returnArray.push(folderStructure);
            await traverseFolder(
              entry as FileSystemDirectoryEntry,
              returnArray,
              uniqueFolderId
            );
          } else if (entry.isFile) {
            // Handle file
            const fileEntity: TraverseFolderMapType = {
              type: 'file',
              id: uniqueFolderUploadId.value,
              name: entry.name,
              entry: entry,
              parentId: rememberParent,
            };

            returnArray.push(fileEntity);
          }
        }
        resolve(true);
      });
    });
  }

  async function uploadFiles(uploadFileList: any[], parentFolderId: string) {
    progressPanel.value = true;
    progressSticky.value = true;

    for (const item of uploadFileList) {
      if (item.type === 'folder') {
        await uploadFolder(item, parentFolderId);
      } else if (item.type === 'file' && item.content instanceof File) {
        await uploadFile(item, parentFolderId);
      }
    }
  }

  async function uploadFolder(folderItem: any, parentFolderId: string) {
    const source = axios.CancelToken.source();

    const folderProgress: UploadProgressEntryType = reactive({
      name: folderItem.name,
      typeIcon: 'folder',
      status: 'loading',
      statusColor: 'bg-blue',
      message: '',
      abort: source,
      size: '0B',
      transferred: '0B',
      transferredPercent: 0,
    });

    progressPanelProgressMap.value.push(folderProgress);

    const folderId = 1;
    const folder: TraverseFolderMapType = {
      type: 'folder',
      id: uniqueFolderUploadId.value,
      name: folderItem.name,
      folderId: folderId,
      parentId: 0,
    };

    const folderDirectory: TraverseFolderMapType[] = [folder];

    await traverseFolder(
      folderItem.content as FileSystemDirectoryEntry,
      folderDirectory,
      folderId
    );

    let folderSizeByte = 0;
    let folderEntries = 0;

    const formData = new FormData();
    formData.append('current_folder', parentFolderId);

    for (const thing of folderDirectory) {
      if (thing.type === 'folder') {
        formData.append(thing.id + '_type', 'folder');
        formData.append(thing.id + '_name', thing.name);
        formData.append(
          thing.id + '_folder_id',
          (thing.folderId as number).toString()
        );
        formData.append(thing.id + '_parent_id', thing.parentId.toString());
      } else {
        // Get file
        const getFile = (fileEntry: FileSystemFileEntry): Promise<File> => {
          return new Promise((resolve, reject) =>
            fileEntry.file(resolve, reject)
          );
        };

        const file: File = await getFile(thing.entry as FileSystemFileEntry);
        formData.append(thing.id + '_type', 'file');
        formData.append(thing.id + '_name', thing.name);
        formData.append(thing.id + '_content', file);
        formData.append(thing.id + '_size_bytes', file.size.toString());
        formData.append(thing.id + '_parent_id', thing.parentId.toString());
        folderSizeByte += file.size;
      }
      folderEntries += 1;
    }

    // Validate folder size
    if (folderSizeByte > MAX_FILE_SIZE) {
      folderProgress.status = 'error';
      folderProgress.statusColor = 'bg-red';
      folderProgress.transferredPercent = 0;
      folderProgress.message = 'Folder too large (>500MiB).';
      q.notify({
        type: 'negative',
        message: 'Folder exceeds the maximum upload limit of 500MiB.',
      });
      return false;
    }

    // Validate entry count
    if (folderEntries > MAX_FOLDER_ENTRIES) {
      folderProgress.status = 'error';
      folderProgress.statusColor = 'bg-red';
      folderProgress.transferredPercent = 0;
      folderProgress.message = 'Folder contains too many items (>500).';
      q.notify({
        type: 'negative',
        message: 'Folder exceeds the maximum entry limit of 500 Files.',
      });
      return false;
    }

    folderProgress.size = fileSizeIEC(folderSizeByte);

    const config = {
      withCredentials: true,
      onUploadProgress: (progressEvent: ProgressEvent) => {
        folderProgress.transferred = fileSizeIEC(progressEvent.loaded);
        folderProgress.transferredPercent =
          progressEvent.loaded / folderSizeByte;
      },
      cancelToken: source.token,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
        'Content-Type': 'multipart/form-data',
      },
    };

    const apiData = await apiPost('files/upload/folder', formData, config);

    if (apiData.error === false) {
      folderProgress.status = 'ok';
      folderProgress.transferredPercent = 1;
      folderProgress.statusColor = 'bg-green';
      await fileOps.refreshFolder();
      return true;
    } else {
      folderProgress.status = 'error';
      folderProgress.statusColor = 'bg-red';
      folderProgress.transferredPercent = 0;
      folderProgress.message = apiData.errorMessage;
      return false;
    }
  }

  async function uploadFile(fileItem: any, parentFolderId: string) {
    const file = fileItem.content;
    const itemSize = file.size;
    const formData = new FormData();

    formData.append('name', fileItem.name);
    formData.append('parent_id', parentFolderId);
    formData.append('file', file);
    formData.append('size_bytes', itemSize.toString());

    const source = axios.CancelToken.source();

    const fileProgress: UploadProgressEntryType = reactive({
      name: fileItem.name,
      typeIcon: 'file_present',
      status: 'loading',
      statusColor: 'bg-blue',
      message: '',
      abort: source,
      size: fileSizeIEC(itemSize),
      transferred: '0B',
      transferredPercent: 0,
    });

    progressPanelProgressMap.value.push(fileProgress);

    if (itemSize > MAX_FILE_SIZE) {
      fileProgress.status = 'error';
      fileProgress.statusColor = 'bg-red';
      fileProgress.transferredPercent = 0;
      fileProgress.message = 'File too large (>500MiB).';
      q.notify({
        type: 'negative',
        message: 'File exceeds the maximum upload limit of 500MiB.',
      });
      return false;
    }

    const config = {
      withCredentials: true,
      onUploadProgress: (progressEvent: ProgressEvent) => {
        fileProgress.transferred = fileSizeIEC(progressEvent.loaded);
        fileProgress.transferredPercent = progressEvent.loaded / itemSize;
      },
      cancelToken: source.token,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
        'Content-Type': 'multipart/form-data',
      },
    };

    const apiData = await apiPost('files/file', formData, config);

    if (apiData.error === false) {
      fileProgress.status = 'ok';
      fileProgress.statusColor = 'bg-green';
      fileProgress.transferredPercent = 1;
      await fileOps.refreshFolder();
      return true;
    } else {
      fileProgress.status = 'error';
      fileProgress.statusColor = 'bg-red';
      fileProgress.transferredPercent = 0;
      fileProgress.message = apiData.errorMessage;
      return false;
    }
  }

  function cancelRequest(progress: UploadProgressEntryType) {
    progress.abort.cancel();
    progress.transferredPercent = 1;
    progress.transferred = 'ERROR';
    progress.status = 'error';
    progress.statusColor = 'bg-red';
  }

  function clearCompletedUploads() {
    progressPanelProgressMap.value = progressPanelProgressMap.value.filter(
      (p) => p.status === 'loading'
    );
  }

  return {
    // State
    progressPanel,
    progressSticky,
    progressPanelProgressMap,
    uniqueFolderUploadId,

    // Constants
    MAX_FILE_SIZE,
    MAX_FOLDER_ENTRIES,

    // Computed
    hasActiveUploads,

    // Methods
    uploadFiles,
    uploadFile,
    uploadFolder,
    cancelRequest,
    clearCompletedUploads,
    traverseFolder,
  };
});
