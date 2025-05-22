import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { apiGet, apiPut, apiPost, apiDelete } from 'src/components/apiWrapper';
import type { RawFolderContentType, FolderEntryType } from 'src/types/index';
import { useSelectionStore } from './selectionStore';
import { useNavigationStore } from './navigationStore';
import { useLocalStore } from '../localStore';
import { createMockFolder } from 'src/types/mockfolder';

export const useFileOperationsStore = defineStore('fileOperations', () => {
  const q = useQuasar();
  const selectionStore = useSelectionStore();
  const navigationStore = useNavigationStore();
  const localStore = useLocalStore();

  // Configuration for API requests
  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  // State
  const loading = ref(false);
  const componentLoading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');
  const rawFolderContent = ref({} as RawFolderContentType);

  // Functions that get a folder
  async function getHomeFolder() {
    loading.value = true;

    if (localStore.isDebugMode) {
      rawFolderContent.value = createMockFolder();
      navigationStore.setHomeFolderId(rawFolderContent.value.id);
      navigationStore.clearNavigation();
      loading.value = false;
      return true;
    }

    const apiData = await apiGet('/files/folder/home', axiosConfig);

    if (apiData.error === false) {
      rawFolderContent.value = apiData.data as RawFolderContentType;
      navigationStore.setHomeFolderId(
        (apiData.data as RawFolderContentType).id
      );
      navigationStore.clearNavigation();
      error.value = false;
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      error.value = true;
      errorMessage.value = apiData.errorMessage;
    }

    loading.value = false;
    return !apiData.error;
  }

  async function getFolderById(folderId: string, navbarAdd: boolean) {
    componentLoading.value = true;
    const apiData = await apiGet(`/files/folder/${folderId}`, axiosConfig);

    if (apiData.error === false) {
      rawFolderContent.value = apiData.data as RawFolderContentType;
      if (navbarAdd === true) {
        navigationStore.addNavbarItem({
          name: rawFolderContent.value.name,
          id: rawFolderContent.value.id,
        });
      }
      selectionStore.clearSelectedItems();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  async function refreshFolder() {
    componentLoading.value = true;
    const apiData = await apiGet(
      `/files/folder/${rawFolderContent.value.id}`,
      axiosConfig
    );

    if (apiData.error === false) {
      rawFolderContent.value = apiData.data as RawFolderContentType;
      selectionStore.clearSelectedItems();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  function downloadItem(itemType: string, itemId: string) {
    const url = `https://api.kurtn3x.xyz/files/download/${itemType}/${itemId}?attachment=1`;

    const link = document.createElement('a');
    link.setAttribute('download', '');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  // Functions that create a folder or file
  async function createFolder(name: string, parentId: string) {
    if (!validName(name)) {
      return;
    }

    componentLoading.value = true;

    const apiData = await apiPost(
      '/files/folder',
      {
        parentId: parentId,
        name,
      },
      axiosConfig
    );

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Folder created' });
      await refreshFolder();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  async function createFile(name: string, mime: string, parentId: string) {
    if (!validName(name)) {
      return;
    }

    componentLoading.value = true;

    const file = new File([''], name);
    const formData = new FormData();

    formData.append('file', file);
    formData.append('parent_id', parentId);
    formData.append('name', name);
    formData.append('mime', mime);
    formData.append('size_bytes', '0');

    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const apiData = await apiPost('/files/file', formData, config);

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'File created' });
      await refreshFolder();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  // Function that deletes a folder or file
  async function deleteItem(itemType: string, itemId: string) {
    componentLoading.value = true;
    const apiData = await apiDelete(
      `/files/${itemType}/${itemId}`,
      axiosConfig
    );

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Item deleted' });
      deleteItemFromStore(itemId);
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  // Functions that update an existing item
  async function updateParent(
    itemType: string,
    itemId: string,
    newParentId: string
  ) {
    if (newParentId === itemId) {
      return false;
    }
    // other error handling is done in the backend

    componentLoading.value = true;

    const apiData = await apiPut(
      `/files/${itemType}/${itemId}`,
      { parentId: newParentId },
      axiosConfig
    );

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Item moved successfully' });
      // this function is only called from the current context; so any parent change will move it to another context
      deleteItemFromStore(itemId);
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  async function updateName(itemType: string, itemId: string, newName: string) {
    if (!validName(newName)) {
      return;
    }

    const apiData = await apiPut(
      `/files/${itemType}/${itemId}`,
      { name: newName },
      axiosConfig
    );

    if (apiData.error === false) {
      updateItemInStore(itemId, { name: newName });
      q.notify({ type: 'positive', message: 'Sharing settings updated' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
  }

  async function updateSharing(
    itemType: string,
    itemId: string,
    sharingOptions: {
      shared: boolean;
      sharedAllowAllRead: boolean;
      sharedAllowAllWrite: boolean;
    }
  ) {
    componentLoading.value = true;

    const apiData = await apiPut(
      `/files/${itemType}/${itemId}`,
      sharingOptions,
      axiosConfig
    );

    if (apiData.error === false) {
      updateItemInStore(itemId, {
        shared: sharingOptions.shared,
        sharedAllowAllRead: sharingOptions.sharedAllowAllRead,
        sharedAllowAllWrite: sharingOptions.sharedAllowAllWrite,
      });
      q.notify({ type: 'positive', message: 'Sharing settings updated' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  async function updateSharingPassword(
    itemType: string,
    itemId: string,
    passwordOptions: {
      sharedPasswordProtected: boolean;
      sharedPassword: string;
    }
  ) {
    componentLoading.value = true;

    const apiData = await apiPut(
      `/files/${itemType}/${itemId}`,
      passwordOptions,
      axiosConfig
    );

    if (apiData.error === false) {
      updateItemInStore(itemId, {
        sharedPasswordProtected: passwordOptions.sharedPasswordProtected,
      });
      q.notify({ type: 'positive', message: 'Password settings updated' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
    return !apiData.error;
  }

  // Utilities
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

    if (
      rawFolderContent.value.children?.some(
        (el: FolderEntryType) => el.name === name
      )
    ) {
      q.notify({
        type: 'negative',
        message: 'Item with same name exists in this path.',
      });
      return false;
    }

    return true;
  }

  // helpers to manipulate the items directly, so the api only has to be called on panic
  function updateItemInStore(
    itemId: string,
    updates: Partial<FolderEntryType>
  ) {
    if (!rawFolderContent.value.children) {
      return false;
    }

    const index = rawFolderContent.value.children.findIndex(
      (item) => item.id === itemId
    );

    if (index !== -1) {
      rawFolderContent.value.children[index] = {
        ...rawFolderContent.value.children[index],
        ...updates,
      };
      return true;
    }

    return false;
  }

  function deleteItemFromStore(itemId: string) {
    if (!rawFolderContent.value.children) {
      return false;
    }

    const index = rawFolderContent.value.children.findIndex(
      (item) => item.id === itemId
    );

    if (index !== -1) {
      rawFolderContent.value.children.splice(index, 1);
      return true;
    }

    return false;
  }

  return {
    // State
    loading,
    componentLoading,
    error,
    errorMessage,
    rawFolderContent,

    // Methods
    getHomeFolder,
    getFolderById,
    refreshFolder,
    downloadItem,
    createFolder,
    createFile,
    deleteItem,
    updateParent,
    updateName,
    updateSharing,
    updateSharingPassword,
  };
});
