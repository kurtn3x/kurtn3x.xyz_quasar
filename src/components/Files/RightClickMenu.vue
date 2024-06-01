<template>
  <q-dialog v-model="itemInformationDialog">
    <ItemInformation :prop-item="propItem" />
  </q-dialog>

  <q-dialog v-model="sharingPasswordDialog">
    <q-card bordered style="width: 350px">
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Set new Password</q-toolbar-title>

        <div class="absolute-right row items-center q-mr-sm">
          <q-btn
            icon="question_mark"
            push
            class="bg-blue text-white"
            round
            size="sm"
            style="height: 15px; width: 15px"
          >
            <q-tooltip
              class="text-body2 bg-layout-bg text-layout-text text-center"
              style="width: 250px"
              anchor="bottom left"
              self="top middle"
            >
              <div class="q-ma-xs">
                Passwords set for files are handled unsecurely. Don't use
                personal Passwords here. (Password Generator recommended)
              </div>
            </q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-sm">
        <q-input
          v-model="sharingPasswordOptions.shared_password"
          class="q-mt-sm full-width"
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
              /^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/.test(
                val
              ) ||
              'Only alphanumeric characters allowed and must contain at least 1 character.',
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
      <q-card-actions
        align="center"
        class="row q-ml-md q-mr-md q-mb-sm q-mt-sm"
      >
        <q-btn
          label="Random"
          icon="refresh"
          push
          class="bg-blue text-white col"
          @click="generatePassword()"
        />
        <q-btn
          icon="content_copy"
          label="Copy"
          push
          class="bg-blue text-white col"
          @click="copyToClipboard(sharingPasswordOptions.shared_password)"
        />
      </q-card-actions>
      <q-separator />
      <q-card-actions align="center" class="row q-mt-sm q-mb-sm">
        <q-btn
          v-close-popup
          push
          icon="close"
          label="Cancel"
          class="bg-red text-white col"
          @click="sharingPasswordOptions.shared_password = ''"
        />
        <q-btn
          push
          class="bg-green text-white col"
          icon="done"
          size="md"
          label="Set"
          @click="
            sharingPasswordOptions.shared_password_protected = true;
            updateSharingPassword();
          "
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-list separator bordered>
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
      <q-menu anchor="bottom middle" self="top middle" style="width: 250px">
        <q-list bordered separator>
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
              v-model="sharingOptions.shared_allow_all_read"
              color="green"
              label="Allow everyone to read"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="item.shared == true">
            <q-checkbox
              dense
              v-model="sharingOptions.shared_allow_all_write"
              color="green"
              label="Allow everyone to write"
              @click="updateSharing"
            />
          </q-item>
          <q-item v-if="item.shared && item.shared_password_protected">
            <q-item-section>
              <q-item-label
                class="text-center text-green text-weight-bold"
                overline
                style="font-size: 13px"
                >Password protected</q-item-label
              >
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
                    sharingPasswordOptions.shared_password_protected = false;
                    updateSharingPassword();
                  "
                />
              </div>
            </q-item-section>
          </q-item>
          <q-item
            v-if="
              item.shared == true && item.shared_password_protected == false
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
          <q-item v-if="item.shared">
            <q-input
              label="Share Link"
              :color="darkmode ? 'white' : 'black'"
              outlined
              v-model="itemShareLink"
              readonly
              dense
            >
              <template v-slot:append>
                <q-btn
                  @click="copyToClipboard(itemShareLink)"
                  icon="content_copy"
                  flat
                  size="md"
                  round
                >
                </q-btn>
              </template>
            </q-input>
          </q-item>
        </q-list>
      </q-menu>
    </q-item>
    <q-item clickable>
      <q-item-section avatar>
        <q-icon name="edit" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Rename</q-item-label>
      </q-item-section>
      <q-menu
        anchor="bottom middle"
        self="top middle"
        separate-close-popup
        ref="inputMenu"
      >
        <q-card bordered flat>
          <q-input
            label="New Name"
            v-model="newName"
            autofocus
            :color="darkmode ? 'white' : 'black'"
            @keyup.enter="updateName"
            class="text-primary text-body1 q-ma-sm"
            style="max-width: 300px"
            outlined
            dense
            hide-bottom-space
            :rules="[
              (val) => val.length > 0 || 'Please type something',
              (val) => !/\/|\x00/.test(val) || 'No slash or Null char.',
            ]"
            lazy-rules
          />
          <q-separator class="q-ma-sm" />

          <q-card-actions align="center" class="row">
            <q-btn
              v-close-popup
              push
              icon="close"
              class="bg-red text-white q-mr-sm"
              style="width: 95px"
            />
            <q-btn
              push
              class="bg-green text-white q-ml-sm"
              icon="done"
              size="md"
              @click="updateName"
              style="width: 95px"
            />
          </q-card-actions>
        </q-card>
      </q-menu>
    </q-item>
    <q-item clickable v-close-popup @click="moveItem">
      <q-item-section avatar>
        <q-icon name="trending_flat" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Move</q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable v-close-popup @click="deleteItem">
      <q-item-section avatar>
        <q-icon name="close" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Delete</q-item-label>
      </q-item-section>
    </q-item>
    <q-item clickable @click="itemInformationDialog = true">
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
import { defineComponent, ref, Ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { FolderEntryType } from 'src/types/index';
import ItemInformation from './ItemInformation.vue';

export default defineComponent({
  name: 'RightClickMenu',
  components: { ItemInformation },
  props: {
    propItem: Object,
  },
  emits: ['moveItem', 'deleteItem', 'showInformation'],
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
      item_id: item.value.id,
      shared_recursive: true,
      shared: item.value.shared,
      shared_allow_all_read: item.value.shared_allow_all_read,
      shared_allow_all_write: item.value.shared_allow_all_write,
    });

    var sharingPasswordOptions = ref({
      item_id: item.value.id,
      shared_password_protected: item.value.shared_password_protected,
      shared_password: '',
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
      itemInformationDialog: ref(false),
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
      this.sharingPasswordOptions.shared_password = retVal;
    },

    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      this.notify('positive', 'Copied to clipboard.');
    },

    updateName() {
      if (this.newName.length < 1) {
        this.notify('negative', 'Please type something');
        return;
      }
      if (/\/|\x00/.test(this.newName)) {
        this.notify('negative', 'No Slash or null char');
        return;
      }

      (this.$refs as any).inputMenu.hide();
      var data = {
        item_id: this.item.id,
        name: this.newName,
      };
      api
        .put('/files/update/' + this.item.type, data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.item.name = this.newName;
            this.notify('positive', 'Updated');
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },

    updateSharing() {
      api
        .put(
          '/files/update/' + this.item.type,
          this.sharingOptions,
          this.axiosConfig
        )
        .then((response) => {
          if (response.status == 200) {
            // set item to sharingOptions values
            Object.assign(this.item, this.sharingOptions);
            this.notify('positive', 'Updated');
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          // reset sharingOptions to before values
          if (error.response) {
            this.notify('negative', error.response.data.error);
            Object.assign(this.sharingOptions, this.item);
          } else {
            this.notify('negative', error.message);
            Object.assign(this.sharingOptions, this.item);
          }
        });
    },

    updateSharingPassword() {
      api
        .put(
          '/files/update/' + this.item.type,
          this.sharingPasswordOptions,
          this.axiosConfig
        )
        .then((response) => {
          if (response.status == 200) {
            // set item to sharingOptions values
            Object.assign(this.item, this.sharingPasswordOptions);
            this.notify('positive', 'Updated');
            this.sharingPasswordOptions.shared_password = '';
            this.sharingPasswordDialog = false;
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          // reset sharingOptions to before values
          if (error.response) {
            this.notify('negative', error.response.data.error);
            Object.assign(this.sharingPasswordOptions, this.item);
          } else {
            this.notify('negative', error.message);
            Object.assign(this.sharingPasswordOptions, this.item);
          }
        });
    },

    moveItem() {
      this.$emit('moveItem', true);
    },

    deleteItem() {
      this.$emit('deleteItem', true);
    },

    downloadItem() {
      (
        window.open(
          'https://api.kurtn3x.xyz/files/download/' +
            this.item.type +
            '/' +
            this.item.id,
          '_blank'
        ) as Window
      ).focus();
    },
  },
});
</script>
