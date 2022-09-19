<template>
  <q-dialog v-model="folder_delete_dialog">
    <q-card>
      <q-card-section class="row items-center">
        <span class="q-ml-sm"
          >This action will delete all subfiles and subfolders contained in this
          folder.</span
        >
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancel"
          color="red"
          v-close-popup
          @click="this.folder_to_delete = ''"
        />
        <q-btn
          flat
          label="Continue"
          color="green"
          v-close-popup
          @click="deleteFolder(this.folder_to_delete)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
  <q-dialog v-model="upload_file_dialog">
    <q-card style="min-width: 200px">
      <q-file
        color="teal"
        filled
        v-model="upload_file_files"
        label="Select/Drag & Drop"
        multiple
        append
        @update:model-value="fileNameVmodel"
        :loading="loading"
        counter
      >
        <template v-slot:prepend>
          <q-icon name="cloud_upload" />
        </template>
      </q-file>
      <div class="q-mt-xs"></div>
      <template v-for="(file, index) in upload_file_files" :key="file">
        <q-input
          dense
          standout
          v-model="upload_file_names[index]"
          :label="'File ' + index + ' Name'"
          input-class="text-center"
          :suffix="'.' + upload_file_types[index]"
        />
      </template>
      <div class="row justify-center">
        <q-btn
          label="Upload"
          class="cursor-pointer full-width text-green"
          flat
          @click="sendFile"
        />
      </div>
    </q-card>
  </q-dialog>
  <q-page class="column q-ml-sm q-mr-sm" :style-fn="styleFn">
    <q-scroll-area class="col">
      <q-list padding class="rounded-borders">
        <q-toolbar class="bg-primary" v-if="small">
          <q-input
            dark
            dense
            standout
            v-model="search"
            input-class="text-left"
            class="absolute-left"
            >center
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
          <q-btn stretch flat icon="add" label="Folder" class="text-light">
            <q-menu>
              <q-input
                dense
                standout
                v-model="create_folder_name"
                label="New Folder Name"
                input-class="text-center"
              />
              <div class="row justify-center">
                <q-btn
                  label="Create"
                  class="cursor-pointer full-width text-green"
                  flat
                  @click="createFolder"
                  :loading="loading"
                />
              </div>
            </q-menu>
          </q-btn>
          <q-btn
            stretch
            flat
            icon="add"
            label="File"
            class="text-light"
            @click="upload_file_dialog = !upload_file_dialog"
          />
        </q-toolbar>
        <q-toolbar class="bg-primary" v-if="small">
          <div class="row">
            <div>
              <template v-for="name in path_names" :key="name">
                <q-btn
                  :label="name"
                  flat
                  class="text-light q-ml-lg text-body1"
                  @click="getFolderPath(name)"
                />
                <a
                  class="text-light text-h5 q-ml-xs"
                  style="position: absolute; top: 20%"
                  >/</a
                >
              </template>
            </div>
          </div>
        </q-toolbar>
        <q-toolbar class="bg-primary" v-if="!small">
          <div class="row">
            <div>
              <template v-for="name in path_names" :key="name">
                <q-btn
                  :label="name"
                  flat
                  class="text-light q-ml-lg text-body1"
                  @click="getFolderPath(name)"
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
          <q-btn stretch flat icon="add" label="Folder" class="text-light">
            <q-menu>
              <q-input
                dense
                standout
                v-model="create_folder_name"
                label="New Folder Name"
                input-class="text-center"
              />
              <div class="row justify-center">
                <q-btn
                  label="Create"
                  class="cursor-pointer full-width text-green"
                  flat
                  @click="createFolder"
                  :loading="loading"
                />
              </div>
            </q-menu>
          </q-btn>
          <q-btn
            stretch
            flat
            icon="add"
            label="File"
            class="text-light"
            @click="upload_file_dialog = !upload_file_dialog"
          />
        </q-toolbar>
        <div class="q-mt-sm text-h6 q-mb-sm text-primary">Subfolders</div>
        <q-separator />
        <template
          v-for="folder in folder_content.children.folders"
          :key="folder"
        >
          <div class="row">
            <q-item clickable @click="getFolder(folder.id)" style="width: 75%">
              <q-item-section avatar top>
                <q-avatar icon="folder" color="primary" text-color="white" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body1">{{
                  folder.name
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-space />
            <q-btn
              class="justify-end"
              flat
              icon="delete"
              @click="
                this.folder_to_delete = folder.id;
                folder_delete_dialog = !folder_delete_dialog;
              "
            />
            <q-btn flat icon="more_vert" />
          </div>

          <q-separator />
        </template>
        <div class="q-mt-lg text-h6 q-mb-sm text-primary">Files</div>
        <q-separator />
        <template
          v-for="file in folder_content.children.private_files"
          :key="file"
        >
          <q-item>
            <q-item-section avatar top>
              <q-avatar icon="description" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ file.name }}</q-item-label>
              <q-item-label caption lines="1">{{ file.changed }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                label="Download"
                class="cursor-pointer full-width text-green"
                flat
                @click="openInNewTab(file.id)"
                :loading="loading"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn
                label="Delete"
                class="cursor-pointer full-width text-red"
                flat
                @click="deleteFile(file.id)"
                :loading="loading"
              />
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
      path_names: ref([]),
      path_ids: ref([]),
      upload_file_dialog: ref(false),
      upload_file_files: ref(null),
      upload_file_names: ref([]),
      upload_file_types: ref([]),
      loading: ref(false),
      create_folder_name: ref(''),
      search: ref(''),
      uploading: ref(false),
      folder_to_delete: ref(''),
      folder_delete_dialog: ref(false),
    };
  },
  created() {
    this.getRootFolder();
  },
  computed: {
    small() {
      if (this.q.screen.width < 1024) {
        return true;
      } else {
        return false;
      }
    },
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

    openInNewTab(id) {
      window
        .open('https://api.kurtn3x.xyz/files/download/' + id, '_blank')
        .focus();
    },

    fileNameVmodel() {
      var i = 0;
      console.log(this.upload_file_files);
      for (const file in this.upload_file_files) {
        // get the filename without extension
        this.upload_file_names[i] = this.upload_file_files[file].name.replace(
          /\.[^/.]+$/,
          ''
        );
        // get file extension as suffix
        this.upload_file_types[i] = this.upload_file_files[file].name
          .split('.')
          .pop();
        i += 1;
      }
    },

    styleFn(offset, height) {
      let pageheight = height - offset;
      return 'height: ' + pageheight + 'px';
    },

    getFolderPath(foldername) {
      this.loading = true;
      var folderid = '';
      var i = 1;
      for (var name of this.path_names) {
        if (name == foldername) {
          this.path_names.length = i;
          this.path_ids.length = i;
        }
        folderid = this.path_ids[i - 1];
        i += 1;
      }
      api
        .get('/files/list/' + folderid, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.folder_content = response.data;
            this.loading = false;
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
        });
    },

    getFolder(folderid) {
      this.loading = true;
      api
        .get('/files/list/' + 1, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.folder_content = response.data;
            this.path_names.push(response.data.name);
            this.path_ids.push(response.data.id);
            this.loading = false;
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
        });
    },

    refreshFolder() {
      this.loading = true;
      api
        .get('/files/list/' + this.folder_content.id, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.folder_content = response.data;
            this.loading = false;
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
        });
    },

    getRootFolder() {
      this.loading = true;
      api
        .get('/files/list_root', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.folder_content = response.data;
            this.path_names.push(response.data.name);
            this.path_ids.push(response.data.id);
            this.loading = false;
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
        });
    },

    deleteFile(id) {
      this.loading = true;
      api
        .delete('/files/delete/file/' + id, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Deleted');
            this.loading = false;
            this.refreshFolder();
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
        });
    },

    deleteFolder(id) {
      this.loading = true;
      api
        .delete('/files/delete/folder/' + id, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Deleted');
            this.loading = false;
            this.refreshFolder();
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
        });
    },

    createFolder() {
      this.loading = true;
      var data = {
        current_folder_id: this.folder_content.id,
        foldername: this.create_folder_name,
      };
      api
        .post('/files/create/folder', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            console.log(this.folder_content);
            this.refreshFolder();
            this.notify('positive', 'Created');
            this.loading = false;
            this.create_folder_name = ref('');
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
        });
    },

    sendFile() {
      this.uploading = true;
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };
      for (const file in this.upload_file_files) {
        let form_data = new FormData();
        form_data.append(
          'filename',
          this.upload_file_names[file] + '.' + this.upload_file_types[file]
        );
        form_data.append('current_folder_id', this.folder_content.id);
        if (this.upload_file_files != null) {
          form_data.append('file', this.upload_file_files[file]);
        }
        api
          .post('/files/upload', form_data, config)
          .then((response) => {
            if (response.status == 200) {
              this.refreshFolder();
              this.notify('positive', 'Uploaded');
              this.uploading = false;
            } else {
              this.notify('negative', '' + response.data.error);
              this.uploading = false;
            }
          })
          .catch((error) => {
            this.notify('negative', 'API ERROR :/');
            this.uploading = false;
            console.log(error);
          });
      }
      this.upload_file_files = null;
      this.upload_file_names = [];
      this.upload_file_types = [];
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
