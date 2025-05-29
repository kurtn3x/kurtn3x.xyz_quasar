import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { useQuasar } from 'quasar';
import axios from 'axios';
import { apiPost } from 'src/api/apiWrapper';
import {
  fileSizeIEC,
  transferedPercentLabel,
} from 'src/components/lib/functions';
import { useFileOperationsStore } from './fileOperationsStore';
import type {
  TraverseFolderMapType,
  UploadProgressEntryType,
  UploadEntryType,
} from 'src/types/localTypes';

import { FileNode } from 'src/types/apiTypes';

export const useUploadStore = defineStore('upload', () => {
  const q = useQuasar();
  const fileOps = useFileOperationsStore();

  // Progress panel state
  const progressPanel = ref(false);
  const progressSticky = ref(false);
  const uniqueFolderUploadId = ref(0);

  // Upload dialog state

  // holds temporary entries before uploading
  const uploadList = ref<UploadEntryType[]>([]);
  // after starting uploading, holds the entries that track the progress
  const uploadProgessList = ref([] as UploadProgressEntryType[]);

  // Constants
  const MAX_FILE_SIZE = 524288000; // 500MB
  const MAX_FOLDER_ENTRIES = 500;

  // Computed values
  const hasUploadListItems = computed(() => uploadList.value.length > 0);

  const hasActiveUploads = computed(() =>
    uploadProgessList.value.some((p) => p.status === 'loading')
  );

  /**
   * Check if a name exists in current upload context
   */
  function validName(name: string) {
    if (name.length < 1) {
      q.notify({
        type: 'negative',
        message: 'Name must be at least 1 character long.',
      });
      return false;
    }

    if (/\/|\x00/.test(name)) {
      q.notify({
        type: 'negative',
        message: 'Name contains invalid characters.',
      });
      return false;
    }

    if (nameAvailable(name) === false) {
      q.notify({
        type: 'negative',
        message: 'Item with same name already exists in upload list',
      });
      return false;
    }

    return true;
  }

  function nameAvailable(name: string) {
    if (uploadList.value.some((el: UploadEntryType) => el.name === name)) {
      return false;
    }

    if (fileOps.rawFolderContent.children.some((el) => el.name === name)) {
      return false;
    }
    return true;
  }

  /**
   * Find a valid name for a file or folder
   * If the name already exists, add (1), (2), etc. until a unique name is found
   *
   * @param name The original name to check and potentially modify
   * @param type 'file' or 'folder' - affects how extensions are handled
   * @returns A valid, unique name
   */
  function findAvailableName(
    originalName: string,
    type: 'file' | 'folder'
  ): string {
    // Check if the original name is valid as-is
    if (nameAvailable(originalName)) {
      return originalName;
    }

    // For files, we need to handle extensions properly
    if (type === 'file') {
      // Get the file name without the extension
      let nameWithoutExtension = originalName;
      let extension = '';

      // Check if this file has an extension (it has a dot that isn't the first character)
      if (originalName.indexOf('.') > 0) {
        extension = originalName.substring(originalName.lastIndexOf('.'));
        nameWithoutExtension = originalName.substring(
          0,
          originalName.lastIndexOf('.')
        );
      }

      // Check if the name already has a number in parentheses
      const parenthesisRegex = /\((\d+)\)$/;
      const match = nameWithoutExtension.match(parenthesisRegex);

      let counter = 1;
      let newName = '';

      if (match) {
        // If it already has a number, start counting from that number + 1
        counter = parseInt(match[1], 10) + 1;
        nameWithoutExtension = nameWithoutExtension.replace(
          parenthesisRegex,
          ''
        );
      }

      // Keep incrementing the counter until we find a unique name
      do {
        newName = `${nameWithoutExtension}(${counter})${extension}`;
        counter++;
      } while (!nameAvailable(newName));

      return newName;
    }
    // For folders (simpler, no extension handling)
    else {
      const parenthesisRegex = /\((\d+)\)$/;
      const match = originalName.match(parenthesisRegex);

      let counter = 1;
      let nameBase = originalName;
      let newName = '';

      if (match) {
        // If it already has a number, start counting from that number + 1
        counter = parseInt(match[1], 10) + 1;
        nameBase = originalName.replace(parenthesisRegex, '');
      }

      // Keep incrementing the counter until we find a unique name
      do {
        newName = `${nameBase}(${counter})`;
        counter++;
      } while (!nameAvailable(newName));

      return newName;
    }
  }

  function addUploadEntry(
    entry: FileSystemEntry | File,
    type: 'file' | 'folder'
  ) {
    const name = entry.name;

    // dont bother finding names for files/folders with invalid names
    if (/\/|\x00/.test(name) || name.length < 1) {
      q.notify({
        type: 'negative',
        message: 'Item has an invalid name',
      });
      return;
    }

    if (type === 'file' && entry instanceof File) {
      const validName = findAvailableName(name, type);
      if (validName) {
        uploadList.value.push({
          name: validName,
          type: 'file',
          content: entry,
          temp: '',
          edit: false,
          error: false,
        });
      }
    } else if (type === 'folder' && entry instanceof FileSystemDirectoryEntry) {
      const validName = findAvailableName(name, type);
      if (validName) {
        uploadList.value.push({
          name: validName,
          type: 'folder',
          content: entry,
          temp: '',
          edit: false,
          error: false,
        });
      }
    }
  }

  /**
   * Remove a file from the upload list
   */
  function removeUploadEntry(file: UploadEntryType) {
    uploadList.value = uploadList.value.filter(
      (item) => item.name !== file.name
    );
  }

  /**
   * Clear the upload list
   */
  function clearUploadList() {
    uploadList.value = [];
  }

  /**
   * Handle file name changes
   */
  function changeFileName(file: UploadEntryType) {
    if (!file.temp || file.temp === file.name) {
      file.edit = false;
      return;
    }
    if (validName(file.temp)) {
      file.name = file.temp;
      file.edit = false;
      file.error = false;
    } else {
      file.error = true;
    }
  }

  /**
   * Start uploading files from the dialog
   */
  function startUploadFromDialog() {
    if (uploadList.value.length > 0) {
      uploadFiles(uploadList.value, fileOps.rawFolderContent.id);
      clearUploadList();
      return true;
    }
    return false;
  }

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

    uploadProgessList.value.push(folderProgress);

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

  async function uploadFile(fileItem: UploadEntryType, parentId: string) {
    if (fileItem.content instanceof FileSystemEntry) return;

    const file = fileItem.content;
    const itemSize = file.size;
    const formData = new FormData();

    formData.append('name', fileItem.name);
    formData.append('parent_id', parentId);
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

    uploadProgessList.value.push(fileProgress);

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
    uploadProgessList.value = uploadProgessList.value.filter(
      (p) => p.status === 'loading'
    );
  }

  return {
    // State
    progressPanel,
    progressSticky,
    uploadProgessList,
    uniqueFolderUploadId,
    uploadList,
    hasUploadListItems,

    // Constants
    MAX_FILE_SIZE,
    MAX_FOLDER_ENTRIES,

    // Computed
    hasActiveUploads,

    // Upload List operations
    addUploadEntry,
    removeUploadEntry,
    clearUploadList,
    changeFileName,

    // Upload operations
    uploadFiles,
    uploadFile,
    uploadFolder,
    cancelRequest,
    clearCompletedUploads,
    traverseFolder,
    findAvailableName,
    startUploadFromDialog,
  };
});
