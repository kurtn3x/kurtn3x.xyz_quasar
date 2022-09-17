<template>
  <q-dialog v-model="upload_file_dialog">
    <q-card style="min-width: 200px">
      <q-file
        color="teal"
        filled
        v-model="upload_file_file"
        label="Select File"
        @update:model-value="fileNameVmodel"
      >
        <template v-slot:prepend>
          <q-icon name="cloud_upload" />
        </template>
      </q-file>
      <q-input
        dense
        standout
        v-model="upload_file_name"
        label="File Name"
        input-class="text-center"
      />
      <div class="row justify-center">
        <q-btn
          label="Upload"
          class="cursor-pointer full-width text-green"
          flat
          @click="sendFile"
          :loading="loading"
        />
      </div>
    </q-card>
  </q-dialog>
  <q-page class="column q-ml-sm q-mr-sm" :style-fn="styleFn">
    <q-scroll-area class="col">
      <q-list padding class="rounded-borders">
        <q-toolbar class="bg-primary">
          <div class="row">
            <div>
              <template v-for="key in path" :key="key">
                <q-btn
                  :label="key"
                  flat
                  class="text-light q-ml-lg text-body1"
                  @click="
                    next_folder = key;
                    getFolder();
                  "
                />
                <a
                  class="text-light text-h5 q-ml-xs"
                  style="position: absolute; top: 20%"
                  >/</a
                >
              </template>
            </div>
          </div>
          <q-input
            dark
            dense
            standout
            v-model="search"
            input-class="text-left"
            class="absolute-center"
          >
            <template v-slot:append>
              <q-icon v-if="search === ''" name="search" />
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="search = ''"
              />
            </template>
          </q-input>
          <q-space />
          <q-btn stretch flat icon="add" label="Folder" class="text-light" />
          <q-btn
            stretch
            flat
            icon="add"
            label="File"
            class="text-light"
            @click="upload_file_dialog = !upload_file_dialog"
          />
        </q-toolbar>
        <q-separator />
        <template
          v-for="folder in folder_content.children.folders"
          :key="folder"
        >
          <q-item
            clickable
            v-ripple
            @click="
              next_folder = folder.name;
              getFolder();
            "
          >
            <q-item-section avatar top>
              <q-avatar icon="folder" color="primary" text-color="white" />
            </q-item-section>

            <q-item-section>
              <q-item-label lines="1">{{ folder.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
        </template>
        <template
          v-for="file in folder_content.children.private_files"
          :key="file"
        >
          <q-item clickable v-ripple @click="openInNewTab(file.link)">
            <q-item-section avatar top>
              <q-avatar icon="description" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ file.name }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-separator />
        </template>
      </q-list>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'FilesView',
  setup() {
    const userStore = useUserStore();
    const settings_store = useSettingsStore();
    const q = useQuasar();
    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axios_config,
      userStore,
      settings_store,
      q,
      upload: ref(null),
      folder_content: ref({
        name: 'root',
        children: {
          private_files: [],
          public_files: [],
          folders: [],
        },
      }),
      path: ref(['root']),
      next_folder: ref(''),
      upload_file_dialog: ref(false),
      upload_file_file: ref(null),
      upload_file_name: ref(''),
      loading: ref(false),
    };
  },
  created() {
    this.next_folder = 'root';
    this.getFolder();
  },
  methods: {
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },
    openInNewTab(url) {
      window.open('https://' + url, '_blank').focus();
    },
    fileNameVmodel() {
      this.upload_file_name = this.upload_file_file.name;
    },

    styleFn(offset, height) {
      let pageheight = height - offset;
      return 'height: ' + pageheight + 'px';
    },
    getFolder() {
      this.loading = true;
      api
        .get('/files/list/' + this.next_folder, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.folder_content = response.data;
            this.path = response.data.path.split('/');
            this.loading = false;
          } else {
            this.notify('negative', 'Something went wrong :/');
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'Something went wrong with the API :/');
          this.loading = false;
          console.log(error);
        });
    },

    sendFile() {
      this.loading = true;

      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };
      let form_data = new FormData();
      form_data.append('filename', this.upload_file_name);
      form_data.append('current_foldername', this.folder_content.name);
      if (this.upload_file_file != null) {
        form_data.append('file', this.upload_file_file);
      }
      api
        .post('/files/upload', form_data, config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Uploaded');
            this.loading = false;
          } else {
            this.notify('negative', 'Something went wrong :/');
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'Something went wrong with the API :/');
          this.loading = false;
          console.log(error);
        });
    },
  },
});
</script>

<style scoped>
.disable-select {
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}
</style>
