<template>
  <q-dialog
    seamless
    full-height
    :maximized="this.pdf_viewer_maximized"
    v-model="show_file_editor"
    style="'width:800px"
  >
    <q-card>
      <q-bar>
        <q-icon name="laptop_chromebook" />
        <div>File: {{ initial_doc_filename }}</div>

        <q-space />

        <q-btn
          dense
          flat
          :icon="pdf_viewer_maximized ? 'close_fullscreen' : 'crop_square'"
          @click="pdf_viewer_maximized = !pdf_viewer_maximized"
        />
        <q-btn
          dense
          flat
          icon="close"
          @click="show_file_editor = !show_file_editor"
        />
      </q-bar>

      <q-slider
        v-model="zoom"
        :min="200"
        :max="1200"
        :step="100"
        label
        label-value="Zoom"
      />
      <div class="row justify-center">
        <vue-pdf-embed
          ref="pdfRef"
          :source="this.initial_doc"
          :height="zoom"
          :width="zoom"
        />
      </div>
    </q-card>
  </q-dialog>

  <!-- <PdfViewer
    v-if="show_file_editor"
    :initialDoc="this.initial_doc"
    :show="this.show_file_editor"
  /> -->
  <q-dialog
    v-model="updateItemDialog"
    @hide="
      updateItemItem = '';
      updateItemName = '';
      updateItemParents = [];
      updateItemNewParent = '';
      allAvailableFolders = {};
      updateItemType = '';
    "
  >
    <q-card>
      <q-input
        dark
        dense
        standout
        v-model="updateItemName"
        label="Name"
        input-class="text-center"
        class="full-width text-primary"
      />
      <q-select
        v-model="updateItemNewParent"
        :options="updateItemParents"
        label="Parent Folder"
      />
      <q-btn
        label="Update"
        class="cursor-pointer full-width text-green"
        flat
        @click="updateItem"
        :loading="loading"
        v-close-popup
      />
    </q-card>
  </q-dialog>

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
        color="primary"
        filled
        v-model="upload_file_files"
        label="Select/Drag & Drop"
        multiple
        append
        @update:model-value="fileNameVmodel"
        :loading="loading"
        counter
        use-chips
        standout
        hide-bottom-space
        outlined
        square
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
          v-close-popup
        />
      </div>
    </q-card>
  </q-dialog>
  <q-page class="column q-ml-sm q-mr-sm" :style-fn="styleFn">
    <q-scroll-area class="col">
      <q-list padding class="rounded-borders">
        <q-toolbar class="bg-primary">
          <q-input dark dense standout v-model="search" input-class="text-left">
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
          <q-btn-dropdown icon="add" flat class="text-light">
            <div>
              <q-btn stretch flat icon="create_new_folder" label="New Folder">
                <q-menu anchor="center left" self="top right">
                  <q-input
                    dark
                    dense
                    standout
                    v-model="create_folder_name"
                    label="New Folder Name"
                    input-class="text-center"
                    class="full-width text-primary"
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
            </div>
            <div>
              <q-btn
                stretch
                flat
                icon="file_upload"
                label="Upload File(s)"
                @click="upload_file_dialog = !upload_file_dialog"
              />
            </div>
            <div>
              <q-btn
                stretch
                flat
                icon="note_add"
                label="New Document"
                :to="'doc/create/' + this.folder_content.id"
              />
            </div>
          </q-btn-dropdown>
        </q-toolbar>
        <q-toolbar class="transparent">
          <div class="row">
            <div>
              <template v-for="name in path_names" :key="name">
                <q-btn
                  :label="name"
                  flat
                  class="text-primary q-ml-lg text-body1 text-weight-bold"
                  @click="getFolderPath(name)"
                  style="text-decoration: underline"
                />
                <a
                  class="text-primary text-h5 q-ml-xs"
                  style="position: absolute; top: 20%"
                  >/</a
                >
              </template>
            </div>
          </div>
        </q-toolbar>
        <q-separator size="2px" color="primary" />
        <div class="q-mt-lg text-h6 q-mb-sm text-primary text-weight-bolder">
          Subfolders
        </div>
        <q-separator size="2px" color="primary" />
        <template
          v-for="folder in folder_content.children.folders"
          :key="folder"
        >
          <div class="row">
            <q-item clickable @click="getFolder(folder.id)" class="full-width">
              <q-item-section avatar top>
                <q-avatar icon="folder" color="primary" text-color="white" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-body1">{{
                  folder.name
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  icon="edit"
                  class="cursor-pointer full-width"
                  flat
                  @click.capture.stop="
                    updateItemDialog = true;
                    updateItemItem = folder.id;
                    updateItemName = folder.name;
                    updateItemParents.push(folder_content.path);
                    updateItemType = 'folder';
                    updateItemNewParent = folder_content.path;
                    fetchAllAvailableFolders();
                  "
                  :loading="loading"
                  stretch
                />
              </q-item-section>
              <q-item-section side>
                <q-btn
                  class="cursor-pointer full-width text-red"
                  flat
                  icon="delete"
                  @click.capture.stop="
                    this.folder_to_delete = folder.id;
                    folder_delete_dialog = !folder_delete_dialog;
                  "
                  :loading="loading"
                  stretch
                />
              </q-item-section>
            </q-item>
          </div>

          <q-separator />
        </template>
        <div class="q-mt-lg text-h6 q-mb-sm text-primary text-weight-bolder">
          Files
        </div>
        <q-separator size="2px" color="primary" />
        <template
          v-for="file in folder_content.children.private_files"
          :key="file"
        >
          <q-item clickable @click="openInNewTab(file.id)" class="full-width">
            <q-item-section avatar top>
              <q-avatar icon="description" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ file.name }}</q-item-label>
              <q-item-label caption lines="1">{{ file.changed }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                label="Preview"
                class="cursor-pointer full-width"
                flat
                @click.capture.stop="
                  runFileEditor(file.id);
                  initial_doc_filename = file.name;
                "
                :loading="loading"
                stretch
                v-if="file.name.includes('.pdf')"
              >
              </q-btn>
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="edit"
                class="cursor-pointer full-width"
                flat
                @click.capture.stop="
                  updateItemDialog = true;
                  updateItemItem = file.id;
                  updateItemName = file.name;
                  updateItemParents.push(folder_content.path);
                  updateItemType = 'file';
                  updateItemNewParent = folder_content.path;
                  fetchAllAvailableFolders();
                "
                :loading="loading"
                stretch
              />
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="delete"
                class="cursor-pointer full-width text-red"
                flat
                @click.capture.stop="deleteFile(file.id)"
                :loading="loading"
                stretch
              />
            </q-item-section>
          </q-item>
          <q-separator />
        </template>
        <!-- DOCUMENTS -->
        <template
          v-for="document in folder_content.children.documents"
          :key="document"
        >
          <q-item clickable @click="showDOCUMENT" class="full-width">
            <q-item-section avatar top>
              <q-avatar icon="description" color="primary" text-color="white" />
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ document.name }}</q-item-label>
              <q-item-label caption lines="1">{{
                document.changed
              }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="edit"
                class="cursor-pointer full-width"
                flat
                :loading="loading"
                stretch
                :to="'doc/edit/' + document.id"
              />
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="delete"
                class="cursor-pointer full-width text-red"
                flat
                :loading="loading"
                stretch
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
import VuePdfEmbed from 'vue-pdf-embed';
// ADD
// DOCUMENT VIEWS
// 	POST
// 		/create/document: data: name, text, current_folder_id

// 	DELETE
// 		/delete/document/<id>

// 	GET
// 		/get/document/<id>

// 	PUT /update/document, data: id, (name, text, new_parent_id)

// (PRIVATE) FILE VIEWS
// 	PUT
// 		/update/file, data: id, (name, new_parent_id)

// FOLDER VIEWS
// 	PUT
// 		/update/folder, data: id, (name, new_parent_id)

export default defineComponent({
  name: 'FilesView',
  components: { VuePdfEmbed },
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
      show: ref(false),
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
      loading: ref(false),
      uploading: ref(false),
      search: ref(''),

      // file hader to show which path is currently opened and ability to go back
      path_names: ref([]),
      path_ids: ref([]),
      // dialog to upload a new file
      upload_file_dialog: ref(false),
      upload_file_files: ref(null),
      upload_file_names: ref([]),
      upload_file_types: ref([]),
      // name of new folder
      create_folder_name: ref(''),
      // update file or folder or document name/parent (handled all in one, but different api calls depending on updateItemType)
      updateItemDialog: ref(false),
      updateItemItem: ref(''),
      updateItemName: ref(''),
      updateItemParents: ref([]),
      updateItemNewParent: ref(''),
      allAvailableFolders: ref({}),
      updateItemType: ref(''),
      // delete folder
      folder_to_delete: ref(''),
      folder_delete_dialog: ref(false),
      // pdf preview handlers
      initial_doc: ref(''),
      show_file_editor: ref(false),
      initial_doc_filename: ref(''),
      pdf_viewer_maximized: ref(false),
      zoom: ref(800),
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
    updateItem() {
      this.loading = true;
      var update_id = 0;
      for (var item in this.allAvailableFolders.folders) {
        if (
          this.allAvailableFolders.folders[item].path ==
          this.updateItemNewParent
        ) {
          update_id = this.allAvailableFolders.folders[item].id;
        }
      }
      var data = {
        item_id: this.updateItemItem,
        name: this.updateItemName,
        new_parent_id: update_id,
      };
      api
        .put('/files/update/' + this.updateItemType, data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Updated');
            this.refreshFolder();
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

    fetchAllAvailableFolders() {
      api
        .get('/files/list_all_available_folders', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.allAvailableFolders = response.data;
            for (var availableFolder of response.data.folders) {
              if (
                this.updateItemParents.indexOf(availableFolder.path) === -1 &&
                availableFolder.id != this.updateItemItem
              ) {
                this.updateItemParents.push(availableFolder.path);
              }
            }
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
    styleFn(offset, height) {
      let pageheight = height - offset;
      return 'height: ' + pageheight + 'px';
    },
    runFileEditor(fileid) {
      // django private storage adds another layer between user and pdf file -> pdf file is seen as html not as pdf
      // solution: load file into blob and edit the blob
      const config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
        responseType: 'blob',
      };

      api
        .get('/files/download/' + fileid, config)
        .then((response) => {
          if (response.status == 200) {
            const content = response.headers['content-type'];
            const blob = new Blob([response.data]);
            const objectUrl = URL.createObjectURL(blob);
            this.initial_doc = objectUrl;
            this.show_file_editor = true;
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
        .get('/files/list/' + folderid, this.axios_config)
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
      var files_state = 0;
      const length = this.upload_file_files.length;
      const notif = this.q.notify({
        type: 'positive',
        group: false,
        timeout: 0,
        spinner: true,
        message: 'Uploading file...',
        caption: files_state + ' / ' + length,
      });
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
          .post('/files/create/file', form_data, config)
          .then((response) => {
            if (response.status == 200) {
              files_state += 1;
              this.refreshFolder();
              notif({
                caption: files_state + ' / ' + length,
              });
              this.uploading = false;
              if (files_state == length) {
                notif({
                  type: 'positive',
                  icon: 'done', // we add an icon
                  spinner: false, // we reset the spinner setting so the icon can be displayed
                  message: 'Uploading done!',
                  timeout: 2500, // we will timeout it in 2.5s
                });
              }
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
