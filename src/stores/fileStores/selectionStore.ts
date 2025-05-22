import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FolderEntryType } from 'src/types/index';

export const useSelectionStore = defineStore('selection', () => {
  // Selection state using Set instead of Array
  const selectedItems = ref(new Set<FolderEntryType>());
  const allSelected = ref(false);

  // Computed properties
  const hasSelectedItems = computed(() => selectedItems.value.size > 0);
  const selectedCount = computed(() => selectedItems.value.size);

  // Helper to convert set to array when needed
  const selectedItemsArray = computed(() => Array.from(selectedItems.value));

  function clearSelectedItems() {
    selectedItems.value.forEach(function (item) {
      item.selected = false;
    });
    selectedItems.value.clear();
    allSelected.value = false;
  }

  function toggleItemSelection(item: FolderEntryType) {
    if (item.selected) {
      selectedItems.value.add(item);
    } else {
      selectedItems.value.delete(item);
    }
  }

  function toggleSelectAll(items: FolderEntryType[]) {
    allSelected.value = !allSelected.value;
    if (allSelected.value) {
      for (const item of items) {
        selectedItems.value.add(item);
        item.selected = true;
      }
    } else {
      clearSelectedItems();
    }
  }

  return {
    // State
    selectedItems,
    allSelected,

    // Computed
    hasSelectedItems,
    selectedCount,
    selectedItemsArray,

    // Methods
    clearSelectedItems,
    toggleItemSelection,
    toggleSelectAll,
  };
});
