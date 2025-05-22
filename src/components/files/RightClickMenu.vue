<template>
  <q-dialog v-model="showItemInformationDialog">
    <ItemInformationDialog :prop-item="propItem" />
  </q-dialog>

  <q-dialog v-model="showItemLinksDialog">
    <ItemLinksDialog :prop-item="propItem" />
  </q-dialog>

  <q-dialog v-model="showRenameItemDialog">
    <RenameItemDialog :prop-item="propItem" />
  </q-dialog>

  <q-dialog v-model="sharingPasswordDialog">
    <SharingPasswordDialog :prop-item="propItem" />
  </q-dialog>

  <q-list
    separator
    bordered
  >
    <q-item
      clickable
      v-close-popup
      @click="downloadItem"
    >
      <q-item-section avatar>
        <q-icon name="file_download" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Download</q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable>
      <q-item-section avatar>
        <q-icon name="share" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Share</q-item-label>
      </q-item-section>
      <q-item-section side>
        <q-icon name="keyboard_arrow_down" />
      </q-item-section>
      <q-menu
        anchor="bottom middle"
        self="top middle"
        style="width: 250px"
      >
        <q-list
          bordered
          separator
        >
          <q-item>
            <q-checkbox
              dense
              v-model="sharingOptions.shared"
              color="green"
              label="Enable Sharing"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="propItem.shared == true">
            <q-checkbox
              dense
              v-model="sharingOptions.sharedAllowAllRead"
              color="green"
              label="Allow everyone to read"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="propItem.shared == true">
            <q-checkbox
              dense
              v-model="sharingOptions.sharedAllowAllWrite"
              color="green"
              label="Allow everyone to write"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="propItem.shared && propItem.sharedPasswordProtected">
            <q-item-section>
              <q-item-label
                class="text-center text-green text-weight-bold"
                overline
                style="font-size: 13px"
              >
                Password protected
              </q-item-label>
              <div class="row full-width q-mt-xs">
                <q-btn
                  push
                  icon="lock edit"
                  class="col q-mr-sm bg-blue text-white"
                  @click="sharingPasswordDialog = true"
                />
                <q-btn
                  push
                  icon="lock close"
                  class="col q-ml-sm bg-red text-white"
                  @click="clearSharingPassword"
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-if="
              propItem.shared == true &&
              propItem.sharedPasswordProtected == false
            "
          >
            <q-btn
              push
              icon="lock"
              label="Set Password"
              class="full-width full-height bg-primary text-layout-text"
              @click="sharingPasswordDialog = true"
            />
          </q-item>
          <q-item v-if="propItem.shared">
            <q-btn
              icon="link"
              label="Manage Links"
              push
              class="full-width full-height bg-green text-white"
              @click="showItemLinksDialog = true"
            />
          </q-item>
        </q-list>
      </q-menu>
    </q-item>
    <q-item
      clickable
      @click="showRenameItemDialog = true"
    >
      <q-item-section avatar>
        <q-icon name="edit" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Rename</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      clickable
      v-close-popup
      @click="moveItem"
    >
      <q-item-section avatar>
        <q-icon name="trending_flat" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Move</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      clickable
      v-close-popup
      @click="deleteItem"
    >
      <q-item-section avatar>
        <q-icon name="close" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Delete</q-item-label>
      </q-item-section>
    </q-item>
    <q-item
      clickable
      @click="showItemInformationDialog = true"
    >
      <q-item-section avatar>
        <q-icon name="info" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Information</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { FolderEntryType } from 'src/types/index';
import { useFileStore } from 'src/stores/fileStore';

import RenameItemDialog from 'components/files/dialogs/RenameItemDialog.vue';
import SharingPasswordDialog from 'components/files/dialogs/SharingPasswordDialog.vue';
import ItemInformationDialog from 'components/files/dialogs/ItemInformationDialog.vue';
import ItemLinksDialog from 'components/files/dialogs/ItemLinksDialog.vue';

// Define props
const props = defineProps({
  propItem: {
    type: Object as () => FolderEntryType,
    required: true,
  },
});

// Setup store and Quasar
const filesStore = useFileStore();

const sharingPasswordDialog = ref(false);
const showItemInformationDialog = ref(false);
const showRenameItemDialog = ref(false);
const showItemLinksDialog = ref(false);

const sharingOptions = ref({
  shared: props.propItem.shared,
  sharedAllowAllRead: props.propItem.sharedAllowAllRead,
  sharedAllowAllWrite: props.propItem.sharedAllowAllWrite,
});

function deleteItem() {
  filesStore.fileOps.deleteItem(props.propItem.type, props.propItem.id);
}

function moveItem() {
  filesStore.fileOps.updateParent(props.propItem.type, props.propItem.id, '');
}

function clearSharingPassword() {
  filesStore.fileOps.updateSharingPassword(
    props.propItem.type,
    props.propItem.id,
    { sharedPasswordProtected: false, sharedPassword: '' }
  );
}

function downloadItem() {
  filesStore.fileOps.downloadItem(props.propItem.type, props.propItem.id);
}

async function updateSharing() {
  const successful = await filesStore.fileOps.updateSharing(
    props.propItem.type,
    props.propItem.id,
    sharingOptions.value
  );

  if (!successful) {
    sharingOptions.value.shared = props.propItem.shared;
    sharingOptions.value.sharedAllowAllRead = props.propItem.sharedAllowAllRead;
    sharingOptions.value.sharedAllowAllWrite =
      props.propItem.sharedAllowAllWrite;
  }
}
</script>
