import { defineStore } from 'pinia';
import { ref, reactive, computed } from 'vue';
import { useFileOperationsStore } from './fileOperationsStore';
import type { FolderEntryType } from 'src/types/index';

export const useFilterStore = defineStore('filter', () => {
  const fileOps = useFileOperationsStore();

  // Filter state
  const filterDialog = ref(false);
  const filterSearch = ref('');
  const filterSortBy = ref(null as string | object | null);
  const filterSortByOptions = [
    { label: 'Type', value: 1 },
    { label: 'Alphabetically', value: 2 },
    { label: 'Created', value: 3 },
    { label: 'Modified', value: 4 },
    { label: 'Size', value: 5 },
    { label: 'Shared', value: 6 },
  ];

  const filterState = reactive({
    type: 0,
    name: 0,
    size: 0,
    modified: 0,
    created: 0,
    shared: 0,
  });

  // Computed properties
  const filteredContent = computed(() => {
    if (!filterSearch.value) {
      return fileOps.rawFolderContent.children || [];
    }

    const search = filterSearch.value.toLowerCase();
    return (fileOps.rawFolderContent.children || []).filter(
      (item: FolderEntryType) => item.name.toLowerCase().includes(search)
    );
  });

  function resetFilterState() {
    filterState.type = 0;
    filterState.modified = 0;
    filterState.name = 0;
    filterState.size = 0;
    filterState.created = 0;
    filterState.shared = 0;
  }

  function toggleFilterDialog() {
    filterDialog.value = !filterDialog.value;
  }

  function sortRawFolderContent(type: { label: string; value: number }) {
    const typeVal = type.value;
    const content = fileOps.rawFolderContent.children;

    if (!content) return;

    if (typeVal === 1) {
      // Sort by type
      if (filterState.type === 1) {
        content
          .sort((a: FolderEntryType) => (a.type !== 'folder' ? 1 : 0))
          .reverse();
        resetFilterState();
        filterState.type = 2;
      } else {
        content.sort((a: FolderEntryType) => (a.type !== 'folder' ? 1 : 0));
        resetFilterState();
        filterState.type = 1;
      }
    } else if (typeVal === 2) {
      // Sort alphabetically
      if (filterState.name === 1) {
        content
          .sort((a: FolderEntryType, b: FolderEntryType) =>
            a.name.localeCompare(b.name)
          )
          .reverse();
        resetFilterState();
        filterState.name = 2;
      } else {
        content.sort((a: FolderEntryType, b: FolderEntryType) =>
          a.name.localeCompare(b.name)
        );
        resetFilterState();
        filterState.name = 1;
      }
    } else if (typeVal === 3) {
      // Sort by created date
      if (filterState.created === 1) {
        content
          .sort((a: FolderEntryType, b: FolderEntryType) =>
            a.createdTimeIso.localeCompare(b.createdTimeIso)
          )
          .reverse();
        resetFilterState();
        filterState.created = 2;
      } else {
        content
          .sort((a: FolderEntryType, b: FolderEntryType) =>
            a.createdTimeIso.localeCompare(b.createdTimeIso)
          )
          .reverse();
        resetFilterState();
        filterState.created = 1;
      }
    } else if (typeVal === 4) {
      // Sort by modified date
      if (filterState.modified === 1) {
        content.sort((a: FolderEntryType, b: FolderEntryType) =>
          a.modifiedTimeIso.localeCompare(b.modifiedTimeIso)
        );
        resetFilterState();
        filterState.modified = 2;
      } else {
        content
          .sort((a: FolderEntryType, b: FolderEntryType) =>
            a.modifiedTimeIso.localeCompare(b.modifiedTimeIso)
          )
          .reverse();
        resetFilterState();
        filterState.modified = 1;
      }
    } else if (typeVal === 5) {
      // Sort by size
      if (filterState.size === 1) {
        content
          .sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.sizeBytes - b.sizeBytes
          )
          .reverse();
        resetFilterState();
        filterState.size = 2;
      } else {
        content.sort(
          (a: FolderEntryType, b: FolderEntryType) => a.sizeBytes - b.sizeBytes
        );
        resetFilterState();
        filterState.size = 1;
      }
    } else if (typeVal === 6) {
      // Sort by shared status
      if (filterState.shared === 1) {
        content.sort((a: FolderEntryType, b: FolderEntryType) =>
          a.shared === b.shared ? 0 : a.shared ? 1 : -1
        );
        resetFilterState();
        filterState.shared = 2;
      } else {
        content.sort((a: FolderEntryType, b: FolderEntryType) =>
          a.shared === b.shared ? 0 : a.shared ? -1 : 1
        );
        resetFilterState();
        filterState.shared = 1;
      }
    }
  }

  return {
    // State
    filterDialog,
    filterSearch,
    filterSortBy,
    filterSortByOptions,
    filterState,

    // Computed
    filteredContent,

    // Methods
    resetFilterState,
    toggleFilterDialog,
    sortRawFolderContent,
  };
});
