import { defineStore } from 'pinia';
import { computed } from 'vue';
import { useFileOperationsStore } from './fileStores/fileOperationsStore';
import { useUploadStore } from './fileStores/uploadStore';
import { useSelectionStore } from './fileStores/selectionStore';
import { useFilterStore } from './fileStores/filterStore';
import { useNavigationStore } from './fileStores/navigationStore';

export const useFileStore = defineStore('fileSystem', () => {
  const fileOps = useFileOperationsStore();
  const upload = useUploadStore();
  const selection = useSelectionStore();
  const filter = useFilterStore();
  const navigation = useNavigationStore();

  // Example of cross-store computed property
  const isLoading = computed(
    () => fileOps.loading || fileOps.componentLoading || upload.hasActiveUploads
  );

  return {
    // Access to all stores
    fileOps,
    upload,
    selection,
    filter,
    navigation,

    // Cross-store computed properties
    isLoading,
  };
});
