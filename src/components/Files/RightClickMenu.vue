<template>
  <ItemInformationDialog
    :prop-item="propItem"
    :active="showItemInformationDialog"
    @close="showItemInformationDialog = false"
  />

  <ItemLinksDialog
    :prop-item="propItem"
    :active="showItemLinksDialog"
    @close="showItemLinksDialog = false"
    v-if="showItemLinksDialog"
  />

  <RenameItemDialog
    :current-name="propItem.name"
    :active="showRenameItemDialog"
    @close="showRenameItemDialog = false"
    @rename="
      (newName) => {
        console.log(newName);
        updateName(newName);
      }
    "
  />

  <q-dialog v-model="sharingPasswordDialog">
    <q-card
      bordered
      style="width: 350px"
    >
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Set new Password</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-sm">
        <q-input
          v-model="sharingPasswordOptions.sharedPassword"
          class="q-ma-md full-width"
          style="max-width: 400px"
          label="Password"
          input-class="text-body1"
          outlined
          no-error-icon
          hide-bottom-space
          :type="sharingPasswordOptions.isPwd ? 'password' : 'text'"
          :color="darkmode ? 'white' : 'black'"
          :rules="[
            (val) =>
              /^[a-z0-9]+$/i.test(val) ||
              'Only alphanumerical characters and length > 0',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="lock" />
          </template>
          <template v-slot:append>
            <q-icon
              class="pw_icon"
              :name="
                sharingPasswordOptions.isPwd ? 'visibility' : 'visibility_off'
              "
              @click="
                sharingPasswordOptions.isPwd = !sharingPasswordOptions.isPwd
              "
            />
          </template>
        </q-input>
      </div>
      <q-separator />
      <q-card-actions
        align="center"
        class="row q-mt-sm q-mb-sm"
      >
        <q-btn
          v-close-popup
          push
          icon="close"
          label="Cancel"
          class="bg-red text-white col"
          @click="sharingPasswordOptions.sharedPassword = ''"
        />
        <q-btn
          push
          class="bg-green text-white col"
          icon="done"
          size="md"
          label="Set"
          @click="
            sharingPasswordOptions.sharedPasswordProtected = true;
            updateSharingPassword();
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-list
    separator
    bordered
  >
    <q-item
      clickable
      v-close-popup
      v-if="item.type == 'folder' || item.type == 'file'"
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
          <q-item v-if="item.shared == true">
            <q-checkbox
              dense
              v-model="sharingOptions.sharedAllowAllRead"
              color="green"
              label="Allow everyone to read"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="item.shared == true">
            <q-checkbox
              dense
              v-model="sharingOptions.sharedAllowAllWrite"
              color="green"
              label="Allow everyone to write"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="item.shared && item.sharedPasswordProtected">
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
                  @click="
                    sharingPasswordOptions.sharedPasswordProtected = false;
                    updateSharingPassword();
                  "
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-if="item.shared == true && item.sharedPasswordProtected == false"
          >
            <q-btn
              push
              icon="lock"
              label="Set Password"
              class="full-width full-height bg-primary text-layout-text"
              @click="sharingPasswordDialog = true"
            />
          </q-item>
          <q-item v-if="item.shared">
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

<script lang="ts">
import { defineComponent, ref, Ref, defineAsyncComponent } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { FolderEntryType } from 'src/types/index';
import ItemInformationDialog from 'components/Files/Dialogs/ItemInformationDialog.vue';
import RenameItemDialog from 'components/Files/Dialogs/RenameItemDialog.vue';

import { apiPut } from 'src/components/apiWrapper';

const ItemLinksDialog = defineAsyncComponent(
  () => import('components/Files/Dialogs/ItemLinksDialog.vue')
);

export default defineComponent({
  name: 'RightClickMenu',
  components: { ItemInformationDialog, RenameItemDialog, ItemLinksDialog },
  props: {
    propItem: Object,
  },
  emits: ['moveItem', 'deleteItem', 'renameItem', 'showInformation'],
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    var item = ref(props.propItem) as Ref<FolderEntryType>;

    var sharingOptions = ref({
      itemId: item.value.id,
      sharedRecursive: true,
      shared: item.value.shared,
      sharedAllowAllRead: item.value.sharedAllowAllRead,
      sharedAllowAllWrite: item.value.sharedAllowAllWrite,
    });

    var sharingPasswordOptions = ref({
      itemId: item.value.id,
      sharedPasswordProtected: item.value.sharedPasswordProtected,
      sharedPassword: '',
      isPwd: true,
    });

    const newName = ref(item.value.name);

    return {
      q,
      axiosConfig,
      item,
      localStore,
      newName,
      sharingOptions,
      sharingPasswordDialog: ref(false),
      sharingPasswordOptions,
      showItemInformationDialog: ref(false),
      showRenameItemDialog: ref(false),
      showItemLinksDialog: ref(false),
    };
  },

  computed: {
    darkmode() {
      return this.localStore.darkmode;
    },
    itemShareLink() {
      return 'https://kurtn3x.xyz/files/' + this.item.type + '/' + this.item.id;
    },
  },

  methods: {
    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
      });
    },

    generatePassword() {
      var length = 10,
        charset =
          'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
        retVal = '';
      for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
      }
      this.sharingPasswordOptions.sharedPassword = retVal;
    },

    updateSharing() {
      apiPut(
        '/files/' + this.item.type + '/' + this.item.id,
        this.sharingOptions,
        this.axiosConfig
      ).then((apiData) => {
        if (apiData.error == false) {
          Object.assign(this.item, this.sharingOptions);
          this.notify('positive', 'Updated');
        } else {
          Object.assign(this.sharingOptions, this.item);
          this.notify('negative', apiData.errorMessage);
        }
      });
    },

    updateSharingPassword() {
      apiPut(
        '/files/' + this.item.type + '/' + this.item.id,
        this.sharingPasswordOptions,
        this.axiosConfig
      ).then((apiData) => {
        if (apiData.error == false) {
          Object.assign(this.item, this.sharingPasswordOptions);
          this.sharingPasswordOptions.sharedPassword = '';
          this.sharingPasswordDialog = false;
          this.notify('positive', 'Updated');
        } else {
          Object.assign(this.sharingPasswordOptions, this.item);
          this.notify('negative', apiData.errorMessage);
        }
      });
    },

    moveItem() {
      this.$emit('moveItem', true);
    },

    deleteItem() {
      this.$emit('deleteItem', true);
    },

    renameItem() {
      this.$emit('renameItem', true);
    },

    downloadItem() {
      var args = '';
      args += '?attachment=1';

      var url =
        'https://api.kurtn3x.xyz/files/download/' +
        this.item.type +
        '/' +
        this.item.id +
        args;
      var link = document.createElement('a');
      link.setAttribute('download', '');
      link.href = url;
      document.body.appendChild(link);
      link.click();
      link.remove();
    },

    updateName(newName: string) {
      if (newName.length < 1) {
        this.notify('negative', 'Name must be at least 1 character long.');
        return;
      }
      if (/\/|\x00/.test(newName)) {
        this.notify('negative', 'Name contains invalid characters.');
        return;
      }

      var data = {
        name: newName,
      };

      apiPut(
        '/files/' + this.item.type + '/' + this.item.id,
        data,
        this.axiosConfig
      ).then((apiData) => {
        if (apiData.error == false) {
          this.item.name = newName;
          this.notify('positive', 'Updated');
          this.showRenameItemDialog = false;
        } else {
          this.notify('negative', apiData.errorMessage);
        }
      });
    },
  },
});
</script>
