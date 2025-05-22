<template>
  <!-- List content -->
  <q-list>
    <template
      v-for="(item, index) in filesStore.fileOps.rawFolderContent.children"
      :key="item.id"
    >
      <!-- Folder items -->
      <q-item
        v-if="item.type == 'folder'"
        ref="folderRefs"
        :id="index"
        :data-id="item.id"
        :data-type="item.type"
        clickable
        class="file-item selecto-target"
        :class="[
          item.dragOver ? 'dragover' : '',
          item.selected ? 'selected' : '',
          isDropTarget(item.id) ? 'drop-target' : '',
          isDragging(item.id) ? 'is-dragging' : '',
        ]"
        draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragend="handleDragEnd($event)"
        @dragover.prevent
        @dragenter.prevent="handleDragEnter($event, item.id)"
        @dragleave.prevent="handleDragLeave($event, item.id)"
        @drop.prevent="handleDrop($event, item.id)"
      >
        <q-popup-proxy
          context-menu
          :breakpoint="0"
        >
          <RightClickMenu :prop-item="item" />
        </q-popup-proxy>

        <div
          class="file-item-content full-height full-width flex-center q-pa-sm no-pointer-events"
        >
          <!-- Checkbox -->
          <div class="file-checkbox flex-center pointer-events">
            <q-checkbox
              :modelValue="item.selected"
              dense
              color="primary"
              @update:modelValue="handleCheckboxClick(item)"
              @click.stop
            />
          </div>

          <!-- Icon -->
          <div class="file-icon">
            <q-icon
              name="folder"
              color="primary"
              size="sm"
            />
          </div>

          <!-- Filename -->
          <div class="file-name">
            <q-icon
              name="share"
              v-if="item.shared"
              size="xs"
              class="q-mr-sm"
            />
            {{ item.name }}
          </div>

          <!-- Size - hidden on small screens -->
          <div class="file-size">-</div>

          <!-- Modified date - hidden on smaller screens -->
          <div class="file-date">
            {{ item.modified }}
          </div>

          <!-- Actions -->
          <div class="file-actions pointer-events">
            <q-btn
              icon="more_vert"
              flat
              round
              dense
              size="sm"
              color="primary"
              :loading="filesStore.fileOps.componentLoading"
              @click.prevent.stop
            >
              <q-menu>
                <RightClickMenu :prop-item="item" />
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-item>

      <!-- File items -->
      <q-item
        v-else
        ref="fileRefs"
        :id="index"
        :data-id="item.id"
        :data-type="item.type"
        clickable
        draggable="true"
        @dragstart="handleDragStart($event, item)"
        @dragend="handleDragEnd($event)"
        @click="
          showFilePreviewDialog = true;
          filePreviewDialogItem = item;
        "
        class="file-item selecto-target"
        :class="[
          item.selected ? 'selected' : '',
          isDragging(item.id) ? 'is-dragging' : '',
        ]"
      >
        <q-popup-proxy
          context-menu
          :breakpoint="0"
        >
          <RightClickMenu :prop-item="item" />
        </q-popup-proxy>

        <div
          class="file-item-content full-height full-width flex-center q-pa-sm no-pointer-events"
        >
          <!-- Checkbox -->
          <div class="file-checkbox pointer-events">
            <q-checkbox
              :modelValue="item.selected"
              dense
              color="primary"
              @update:modelValue="handleCheckboxClick(item)"
              @click.stop
            />
          </div>

          <!-- Icon -->
          <div class="file-icon">
            <q-icon
              :name="getIcon(item.mime)"
              color="primary"
              size="sm"
            />
          </div>

          <!-- Filename -->
          <div class="file-name">
            <q-icon
              name="share"
              v-if="item.shared"
              size="xs"
              class="q-mr-sm"
            />
            {{ item.name }}
          </div>

          <!-- Size - hidden on small screens -->
          <div class="file-size">
            {{ item.size }}
          </div>

          <!-- Modified date - hidden on smaller screens -->
          <div class="file-date">
            {{ item.modified }}
          </div>

          <!-- Actions -->
          <div class="file-actions pointer-events">
            <q-btn
              icon="more_vert"
              flat
              round
              dense
              size="sm"
              color="primary"
              :loading="filesStore.fileOps.componentLoading"
              @click.prevent.stop
            >
              <q-menu>
                <RightClickMenu :prop-item="item" />
              </q-menu>
            </q-btn>
          </div>
        </div>
      </q-item>

      <q-separator class="q-ma-none" />
    </template>
  </q-list>
</template>

<script setup>
/*
When the API is updated to use a single item for files & folders, fix the selection logic to only use ids
*/
import { ref, reactive, onMounted } from 'vue';
import { useFileStore } from 'src/stores/fileStore';
import RightClickMenu from 'src/components/files/RightClickMenu.vue';
import { getIcon } from 'src/components/lib/mimeMap';

// Store and Quasar
const filesStore = useFileStore();

// Refs for DOM elements
const folderRefs = ref([]);
const fileRefs = ref([]);

// Drag and drop state
const dragState = reactive({
  currentDraggedId: null,
  currentDraggedType: null,
  activeDropTargets: new Set(),
  selectedItemsBeingDragged: false,
});

// Track which items are being dragged
function isDragging(itemId) {
  return (
    dragState.currentDraggedId === itemId ||
    (dragState.selectedItemsBeingDragged &&
      Array.from(filesStore.selection.selectedItems).some(
        (item) => item.id === itemId
      ))
  );
}

// Track which folders are potential drop targets
function isDropTarget(folderId) {
  if (dragState.currentDraggedId === folderId) {
    return false;
  }
  if (
    dragState.selectedItemsBeingDragged &&
    Array.from(filesStore.selection.selectedItems).some(
      (item) => item.id === folderId
    )
  ) {
    return false;
  }

  return dragState.activeDropTargets.has(folderId);
}

// Handle the start of a drag operation
function handleDragStart(event, item) {
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData(
    'text/plain',
    JSON.stringify({
      id: item.id,
      type: item.type,
    })
  );

  // Set drag image/ghost (optional)
  const dragImage = document.createElement('div');

  // If multiple items are selected and this is one of them, drag all selected items
  if (item.selected && filesStore.selection.selectedItems.size > 1) {
    dragState.selectedItemsBeingDragged = true;
    dragImage.textContent = `Moving ${filesStore.selection.selectedItems.size} items`;

    // Add all selected item IDs to the transfer data
    const selectedIds = Array.from(filesStore.selection.selectedItems).map(
      (item) => item.id
    );
    event.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        ids: selectedIds,
        isMultiple: true,
      })
    );
  } else {
    // Single item drag
    dragImage.textContent = `Moving ${item.name}`;
    dragState.selectedItemsBeingDragged = false;

    if (!item.selected && filesStore.selection.selectedItems.size > 0) {
      filesStore.selection.clearSelectedItems();
    }
  }

  dragImage.className =
    'drag-ghost q-pa-sm bg-primary text-white rounded-borders';
  dragImage.style.maxWidth = '250px';
  dragImage.style.overflow = 'hidden';
  dragImage.style.textOverflow = 'ellipsis';
  dragImage.style.whiteSpace = 'nowrap';
  document.body.appendChild(dragImage);

  // Position the drag image off-screen initially
  dragImage.style.position = 'absolute';
  dragImage.style.top = '-1000px';

  // Use the created element as drag image
  event.dataTransfer.setDragImage(dragImage, 0, 0);

  // Clean up after a short delay
  setTimeout(() => {
    document.body.removeChild(dragImage);
  }, 100);

  // Update the drag state
  dragState.currentDraggedId = item.id;
  dragState.currentDraggedType = item.type;
}

function handleDragEnd(event) {
  // Clear visual state for all items
  dragState.activeDropTargets.clear();

  // Reset the dragging state
  dragState.currentDraggedId = null;
  dragState.currentDraggedType = null;
  dragState.selectedItemsBeingDragged = false;
}

// Handle when a dragged item enters a potential drop target
function handleDragEnter(event, folderItemId) {
  // Don't allow dropping on the item being dragged
  if (folderItemId === dragState.currentDraggedId) return;

  // Add visual indication that this is a drop target
  dragState.activeDropTargets.add(folderItemId);
}

// Handle when a dragged item leaves a potential drop target
function handleDragLeave(event, folderItemId) {
  dragState.activeDropTargets.delete(folderItemId);
}

// Handle the actual drop
function handleDrop(event, targetFolderId) {
  // Prevent folder dropping on itself
  if (dragState.currentDraggedId === targetFolderId) return;

  if (
    dragState.selectedItemsBeingDragged &&
    Array.from(filesStore.selection.selectedItems).some(
      (item) => item.id === targetFolderId
    )
  ) {
    return;
  }

  // Get the dragged data
  const plainData = event.dataTransfer.getData('text/plain');
  const jsonData = event.dataTransfer.getData('application/json');

  try {
    // Clear drag state
    dragState.currentDraggedId = null;
    dragState.currentDraggedType = null;
    dragState.selectedItemsBeingDragged = false;
    dragState.activeDropTargets.clear();

    // Handle multiple items drop (selected items)
    if (jsonData) {
      const data = JSON.parse(jsonData);
      if (data.isMultiple && Array.isArray(data.ids)) {
        console.log(`Dropping multiple items into folder: ${targetFolderId}`);
        data.ids.forEach((id) => {
          console.log(`Item ID: ${id} -> Target Folder ID: ${targetFolderId}`);
        });
        data.ids.forEach((id) => {
          filesStore.fileOps.updateParent(data.type, id, targetFolderId);
        });

        // Here you would call your store method to move multiple items
        // filesStore.fileOps.moveSelectedItems(targetFolderId);
        return;
      }
    }

    // Handle single item drop
    if (plainData) {
      const data = JSON.parse(plainData);
      console.log(
        `Dropping item ID: ${data.id} into folder ID: ${targetFolderId}`
      );
      filesStore.fileOps.updateParent(data.type, data.id, targetFolderId);
    }
  } catch (error) {
    console.error('Error processing drop data:', error);
  } finally {
    // Clear the drag state
    filesStore.selection.clearSelectedItems();
    dragState.currentDraggedId = null;
    dragState.currentDraggedType = null;
    dragState.selectedItemsBeingDragged = false;
    dragState.activeDropTargets.clear();
  }
}

// Handle checkbox clicks with the Set
function handleCheckboxClick(item) {
  // Toggle selected state
  item.selected = !item.selected;

  // Update the selection store
  if (item.selected) {
    filesStore.selection.selectedItems.add(item);
  } else {
    filesStore.selection.selectedItems.delete(item);
  }
}

// Initialize on mount
onMounted(() => {
  filesStore.fileOps.getHomeFolder();
});
</script>

<style scoped>
.selected {
  background-color: rgba(0, 191, 255, 0.2);
}

.pointer-events {
  pointer-events: auto;
}

/* Existing drag and drop styles remain unchanged */
.drop-target {
  background-color: rgba(var(--q-primary-rgb), 0.1);
  border: 2px dashed var(--q-primary);
}

.is-dragging {
  opacity: 0.5;
}

.drag-ghost {
  padding: 8px 16px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.file-item {
  min-height: 48px;
}

.file-item-content {
  display: grid;
  grid-template-columns: 40px 35px minmax(100px, 1fr) 75px 170px 40px;
  min-height: 48px;
}

.file-checkbox {
  width: 40px;
  min-width: 40px;
}

.file-icon {
  width: 35px;
  min-width: 35px;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 100px;
}

.file-size {
  width: 75px;
  min-width: 75px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  padding-right: 20px;
}

.file-date {
  width: 170px;
  min-width: 170px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
}

.file-actions {
  width: 40px;
  min-width: 40px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* Responsive behavior */
@media (max-width: 768px) {
  .file-item-content {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 75px 40px;
  }

  .file-date {
    display: none;
  }
}

@media (max-width: 480px) {
  .file-item-content {
    grid-template-columns: 40px 35px minmax(100px, 1fr) 40px;
  }

  .file-size {
    display: none;
  }
}
</style>
