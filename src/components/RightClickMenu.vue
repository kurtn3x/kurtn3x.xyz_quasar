<template>
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
        <q-icon name="keyboard_arrow_right" />
      </q-item-section>
      <q-menu anchor="top end" self="top start">
        <q-list bordered separator>
          <q-item>
            <q-checkbox
              dense
              v-model="item.shared"
              color="green"
              label="Enable Sharing"
              @click="updateSharing(1)"
            />
          </q-item>
          <q-item>
            <q-checkbox
              dense
              v-model="item.shared_allow_all_read"
              color="green"
              label="Allow everyone to read"
              @click="updateSharing(2)"
            />
          </q-item>
          <q-item>
            <q-checkbox
              dense
              v-model="item.shared_allow_all_write"
              color="green"
              label="Allow everyone to write"
              @click="updateSharing(3)"
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
        anchor="center right"
        self="center left"
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
            style="width: 215px"
            outlined
            dense
            clearable
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
              flat
              icon="close"
              class="bg-red text-white q-mr-sm"
              style="width: 95px"
            />
            <q-btn
              flat
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
    <q-item clickable v-close-popup @click="showInformation">
      <q-item-section avatar>
        <q-icon name="info" />
      </q-item-section>
      <q-item-section>
        <q-item-label>Information</q-item-label>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="js">
import { defineComponent, ref } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'RightClickMenu',
  props: {
    propItem: Object
  },
  emits:[
    'moveItem',
    'deleteItem',
    'showInformation'
],
  setup(props) {
    const settingsStore = useSettingsStore();
    var item = ref(props.propItem);
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    const newName = ref(item.value.name);

    return {
      q,
      axiosConfig,
      item,
      settingsStore,
      itemInformationDialog: ref(false),
      newName,
    };
  },

  computed: {
    darkmode() {
      return this.settingsStore.darkmode;
    },
    itemShareLink() {
      return (
        'https://kurtn3x.xyz/public/' +
        this.item.type +
        '/' +
        this.item.id
      );
    },
  },

  methods: {

    validateName(val){
      if (val.length < 1 && /\/|\x00/.test(val) ){
        return false
      } else {
        return true
      }
    },

    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      this.notify('positive', 'Copied to clipboard.');
    },

    updateName(){
      this.$refs.inputMenu.hide()
      var data = {
        item_id: this.item.id,
        name: this.newName,
      };
      api
        .put('/files/update/' + this.item.type, data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.item.name = this.newName
          } else {
            this.notify('negative', response.data.error)
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error)
          } else {
            this.notify('negative', error.message)
          }
        });
    },

    updateSharing(type) {
      var data = {
        item_id: this.item.id,
        shared_recursive: true,
      };
      if (type == 1) {
        data.shared = this.item.shared;
      } else if (type == 2) {
        data.shared_allow_all_read = this.item.shared_allow_all_read;
      } else if (type == 3) {
        data.shared_allow_all_write = this.item.shared_allow_all_write;
      }
      api
        .put(
          '/files/update-sharing/' + this.item.type,
          data,
          this.axiosConfig
        )
        .then((response) => {
          if (response.status == 200) {
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

    moveItem(){
      this.$emit('moveItem', true)
    },

    deleteItem(){
      this.$emit('deleteItem', true)
    },

    showInformation(){
      this.$emit('showInformation', true)
    },

    downloadItem(){
      if (this.item.type == 'file'){
        window
        .open('https://api.kurtn3x.xyz/files/download/' + this.item.id, '_blank')
        .focus();
      } else if (this.item.type == 'folder'){
        window
        .open('https://api.kurtn3x.xyz/files/folder/zip/' + this.item.id, '_blank')
        .focus();
      }
    }
  },
});
</script>

<style></style>
