<template>
  <q-dialog v-model="docCreateDialog">
    <q-card bordered>
      <q-toolbar class="justify-center">
        <div class="text-h6 q-ma-md text-primary text-center text-weight-bold">
          CREATE A NEW DOCUMENT
        </div>
      </q-toolbar>
      <q-separator />
      <q-input
        outlined
        dense
        v-model="updatedDocName"
        label="Name"
        input-class="text-center"
        class="text-primary q-ma-md"
      />
      <q-select
        outlined
        v-model="updatedDocParent"
        :options="availParents"
        label="Parent Folder"
        class="q-ma-md"
        input-class="text-center"
      />
      <q-btn
        label="Create"
        class="cursor-pointer full-width bg-green"
        size="lg"
        flat
        @click="createDocument"
        :loading="loading"
      />
    </q-card>
  </q-dialog>

  <q-dialog
    seamless
    full-height
    :maximized="this.pdf_viewer_maximized"
    v-model="show_file_editor"
    style="'width:800px"
  >
    <q-card bordered>
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
  <q-drawer
    side="right"
    v-model="updateItemDrawer"
    bordered
    :breakpoint="500"
    @hide="
      updateItemId = '';
      updateItemName = '';
      availParents = [];
      updateItemNewParent = '';
      allAvailableFolders = {};
      updateItemType = '';
    "
  >
    <q-toolbar>
      <q-btn
        icon="close"
        class="bg-red text-white"
        flat
        @click="updateItemDrawer = !updateItemDrawer"
      />
    </q-toolbar>
    <q-card bordered flat>
      <div class="text-h6 q-ml-md">
        Type: <a class="q-ml-lg">{{ updateItemType }}</a>
      </div>
      <div class="text-h6 q-ml-md">
        Name: <a class="q-ml-lg">{{ updateItemName }}</a>
      </div>

      <q-input
        dense
        outlined
        v-model="updateItemName"
        label="Name"
        input-class="text-center"
        class="text-primary q-ma-md"
      />
      <q-select
        outlined
        v-model="updateItemNewParent"
        :options="availParents"
        label="Parent Folder"
        class="q-ma-md"
      />
      <q-btn
        label="Update"
        class="cursor-pointer full-width bg-green text-white"
        flat
        @click="updateItem"
        :loading="loading"
      />
    </q-card>
  </q-drawer>
  <!-- <q-dialog
    v-model="updateItemDrawer"
    @hide="
      updateItemId = '';
      updateItemName = '';
      availParents = [];
      updateItemNewParent = '';
      allAvailableFolders = {};
      updateItemType = '';
    "
    seamless
    position="right"
  >
    <q-card class="full-height">
      <q-toolbar>
        <q-btn icon="close" class="text-red" flat v-close-popup />
        <a class="text-h6">{{ updateItemType }}: {{ updateItemName }}</a>
      </q-toolbar>
      <q-separator size="4px" />

      <q-input
        dense
        outlined
        v-model="updateItemName"
        label="Name"
        input-class="text-center"
        class="text-primary q-ma-md"
      />
      <q-select
      outlined
        v-model="updateItemNewParent"
        :options="availParents"
        label="Parent Folder"
        class="q-ma-md"
      />
      <q-btn
        label="Update"
        class="cursor-pointer full-width text-green"
        flat
        @click="updateItem"
        :loading="loading"
      />
    </q-card>
  </q-dialog> -->

  <q-dialog v-model="folder_delete_dialog">
    <q-card bordered>
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
    <q-card style="min-width: 200px" bordered>
      <q-toolbar class="justify-center">
        <div class="text-h6 q-ma-md text-primary text-center text-weight-bold">
          UPLOAD FILES
        </div>
        <q-separator />
      </q-toolbar>

      <q-file
        color="primary"
        filled
        v-model="upload_file_files"
        label="Select/Drag & Drop"
        multiple
        append
        @update:model-value="uploaderHandleFilenames"
        :loading="loading"
        counter
        use-chips
        outlined
        hide-bottom-space
        square
        class="q-ma-md"
      >
        <template v-slot:prepend>
          <q-icon name="cloud_upload" />
        </template>
      </q-file>
      <template v-for="(file, index) in upload_file_files" :key="file">
        <q-input
          dense
          outlined
          v-model="upload_file_names[index]"
          :label="'File ' + index + ' Name'"
          input-class="text-center"
          :suffix="'.' + upload_file_types[index]"
          v-if="!upload_file_freeEdit"
        />
        <q-input
          dense
          outlined
          v-model="upload_file_files[index].name"
          :label="'File ' + index + ' Name'"
          input-class="text-center"
          v-if="upload_file_freeEdit"
        />
      </template>
      <q-btn
        v-if="upload_file_files_exist"
        flat
        label="Edit Filename with extension"
        icon="edit"
        @click="upload_file_freeEdit = !upload_file_freeEdit"
        class="full-width q-mt-md"
      />
      <div class="row justify-center">
        <div
          v-if="upload_file_freeEdit"
          style="max-width: 260px"
          class="text-center text-body2 justify-center q-mb-sm q-mt-sm"
        >
          Preview features depend on the file extension. Your File will stay
          untouched.
        </div>
      </div>

      <q-btn
        label="Upload"
        class="cursor-pointer full-width bg-green text-white"
        flat
        @click="uploadFiles"
        v-close-popup
        size="lg"
      />
    </q-card>
  </q-dialog>
  <q-page class="column q-ml-sm q-mr-sm" :style-fn="styleFn">
    <q-scroll-area class="col">
      <!-- <q-toolbar class="bg-primary">
          <q-input dense outlined v-model="search" input-class="text-left">
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
                    dense
                    outlined
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
                @click="
                  docCreateDialog = !docCreateDialog;
                  availParents.push(rawFolderContent.path);
                  updatedDocParent = rawFolderContent.path;
                  fetchAllAvailableFolders();
                "
              />
            </div>
          </q-btn-dropdown>
        </q-toolbar> -->
      <q-toolbar class="transparent q-mt-md q-mb-sm">
        <div class="row">
          <q-btn
            v-if="this.rawFolderContent.name != 'root'"
            icon="arrow_back"
            flat
            class="text-primary"
            @click="navGoBack"
          >
            <q-tooltip>Go back</q-tooltip>
          </q-btn>
          <template v-for="itemname in path_names" :key="itemname">
            <q-item
              clickable
              flat
              class="text-primary q-ml-sm text-h6 text-weight-bold"
              @click="getFolderPath(itemname)"
              @v-drag-enter="(e, x, y) => y.target.classList.add('active')"
              @v-drag-over="(e, x, y) => y.target.classList.add('active')"
              @v-drag-leave="(e, x, y) => y.target.classList.remove('active')"
              @v-drag-drop="changeFolderToolbar($event, itemname)"
              v-droppable
            >
              <div v-if="itemname != 'root'" class="text-h5">
                {{ itemname }}
              </div>
              <div v-if="itemname == 'root'" class="text-h5">⌂</div>
            </q-item>
            <q-item class="text-primary q-ml-xs text-h4 text-weight-bold">
              <q-icon name="arrow_forward_ios" />
            </q-item>
          </template>
          <q-btn icon="add" class="text-primary" size="md" outline>
            <q-menu>
              <div>
                <q-btn stretch flat icon="create_new_folder" label="New Folder">
                  <q-menu anchor="center left" self="top right">
                    <q-input
                      dense
                      outlined
                      v-model="create_folder_name"
                      label="New Folder Name"
                      input-class="text-center"
                      class="full-width text-primary"
                    />
                    <div class="row justify-center">
                      <q-btn
                        label="Create"
                        class="cursor-pointer full-width bg-green"
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
                  @click="
                    docCreateDialog = !docCreateDialog;
                    availParents.push(rawFolderContent.path);
                    updatedDocParent = rawFolderContent.path;
                    fetchAllAvailableFolders();
                  "
                />
              </div>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
      <q-toolbar class="transparent q-mt-md">
        <q-space />
        <q-input
          dense
          outlined
          v-model="search"
          input-class="text-left"
          class="justify-center"
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
          <q-toggle
            v-model="optnShowFolders"
            color="green"
            label="Show Folders"
          />
          <q-toggle v-model="optnShowFiles" color="green" label="Show Files" />
          <q-toggle
            v-model="optnShowDocuments"
            color="green"
            label="Show Documents"
          />
        </q-input>
        <q-space />
      </q-toolbar>
      <q-separator size="2px" color="primary" />
      <template
        v-for="folder in rawFolderContent.children.folders"
        :key="folder"
      >
        <div class="row">
          <q-item
            clickable
            @click="getFolderId(folder.id)"
            class="full-width"
            v-droppable
            v-draggable="['folder', folder.id]"
            :class="folder.drag_over ? 'bg-blue' : ''"
            @v-drag-enter="folder.drag_over = true"
            @v-drag-leave="folder.drag_over = false"
            @v-drag-over="folder.drag_over = true"
            @v-drag-drop="changeFolder($event, folder.id)"
          >
            <q-menu
              anchor="center middle"
              self="center middle"
              v-model="folder.drag_over"
              >Add to folder: {{ folder.name }}</q-menu
            >
            <q-item-section avatar top>
              <q-avatar icon="folder" color="primary" text-color="white" />
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-body1">{{ folder.name }} </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="edit"
                class="cursor-pointer full-width"
                flat
                @click.capture.stop="
                  updateItemDrawer = true;
                  updateItemId = folder.id;
                  updateItemName = folder.name;
                  availParents.push(rawFolderContent.path);
                  updateItemType = 'folder';
                  updateItemNewParent = rawFolderContent.path;
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
      <template
        v-for="file in rawFolderContent.children.private_files"
        :key="file"
      >
        <q-item
          clickable
          class="full-width"
          v-draggable="['file', file.id]"
          @click="openInNewTab(file.id)"
        >
          <q-item-section avatar top>
            <q-avatar icon="file_present" color="primary" text-color="white" />
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
                previewPDF(file.id);
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
                updateItemDrawer = true;
                updateItemId = file.id;
                updateItemName = file.name;
                availParents.push(rawFolderContent.path);
                updateItemType = 'file';
                updateItemNewParent = rawFolderContent.path;
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
        v-for="document in rawFolderContent.children.documents"
        :key="document"
      >
        <q-item
          clickable
          @click="showDOCUMENT"
          class="full-width"
          v-draggable="['document', document.id]"
        >
          <q-item-section avatar top>
            <q-avatar icon="article" color="light-blue" text-color="white" />
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
              @click.capture.stop="deleteDocument(document.id)"
              :loading="loading"
              stretch
            />
          </q-item-section>
        </q-item>
        <q-separator />
      </template>
    </q-scroll-area>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, onUnmounted } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { api } from 'boot/axios';
import VuePdfEmbed from 'vue-pdf-embed';
import { draggable, droppable } from 'v-drag-drop';
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
  directives: {
    draggable,
    droppable,
  },
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
      loading: ref(false),
      search: ref(''),

      // raw content including children of current folder
      rawFolderContent: ref({
        name: 'root',
        path: 'root',
        id: 30,
        children: {
          private_files: [
            {
              name: 'Untitled.png',
              id: 56,
              changed: '2022-09-24 21:16:02',
            },
            {
              name: 'ProjektClaudia_Kurt.docx',
              id: 55,
              changed: '2022-09-24 21:20:48',
            },
            {
              name: 'DIAGRAMMITLF7.drawio',
              id: 62,
              changed: '2022-09-24 21:20:58',
            },
            {
              name: '1663788962540645672255300633021.jpg',
              id: 42,
              changed: '2022-09-25 15:00:32',
            },
          ],
          public_files: [],
          folders: [
            {
              name: 'test2',
              id: 32,
              path: 'root/test2',
            },
            {
              name: 'test',
              id: 31,
              path: 'root/test',
            },
          ],
          documents: [
            {
              name: 'test2',
              id: 6,
              changed: '2022-09-24 21:13:55',
            },
            {
              name: 'dokument',
              id: 7,
              changed: '2022-09-23 10:29:34',
            },
          ],
        },
      }),
      // file hader to show which path is currently opened and ability to go back
      path_names: ref(['root', 'test', 'test2']),
      path_ids: ref([]),
      // dialog to upload a new file
      upload_file_dialog: ref(false),
      upload_file_files: ref(null),
      upload_file_names: ref([]),
      upload_file_types: ref([]),
      upload_file_freeEdit: ref(false),
      // create new folder
      create_folder_name: ref(''),
      // update file or folder or document name/parent (handled all in one, but different api calls depending on updateItemType)
      updateItemDrawer: ref(false),
      updateItemId: ref(''),
      updateItemName: ref(''),
      updateItemType: ref(''),
      updateItemNewParent: ref(''),
      availParents: ref([]),
      allAvailableFolders: ref({}),
      // delete folder
      folder_to_delete: ref(''),
      folder_delete_dialog: ref(false),
      // pdf preview handlers
      initial_doc: ref(''),
      show_file_editor: ref(false),
      initial_doc_filename: ref(''),
      pdf_viewer_maximized: ref(false),
      zoom: ref(800),

      // update
      updatedDocName: ref(''),
      updatedDocParent: ref(''),
      docCreateDialog: ref(false),
    };
  },
  created() {
    this.getRootFolder();
  },
  computed: {
    upload_file_files_exist() {
      if (this.upload_file_files == null) {
        return false;
      } else if (this.upload_file_files.length == 0) {
        return false;
      } else {
        return true;
      }
    },
    small() {
      if (this.q.screen.width < 1024) {
        return true;
      } else {
        return false;
      }
    },
  },
  methods: {
    showDOCUMENT() {
      console.log();
    },
    // go back navbar button
    navGoBack() {
      this.loading = true;
      api
        .get('/files/list/' + this.rawFolderContent.parentid, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.path_names.pop();
            this.path_ids.pop();
            // this.path_names.push(response.data.name);
            // this.path_ids.push(response.data.id);
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

    // drag and drop change parent folder on nav toolbar
    changeFolderToolbar(itemProps, foldername) {
      var folderid = '';
      var i = 1;
      for (var name of this.path_names) {
        if (name == foldername) {
          folderid = this.path_ids[i - 1];
        }
        i += 1;
      }
      var itemtype = itemProps[0];
      var itemid = itemProps[1];
      var data = {
        item_id: itemid,
        new_parent_id: folderid,
      };
      if (folderid != itemid) {
        this.loading = true;
        api
          .put('/files/update/' + itemtype, data, this.axios_config)
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
      }
    },

    // drag and drop update parent folder
    changeFolder(itemProps, folderid) {
      var itemtype = itemProps[0];
      var itemid = itemProps[1];
      var data = {
        item_id: itemid,
        new_parent_id: folderid,
      };
      if (folderid != itemid) {
        this.loading = true;
        api
          .put('/files/update/' + itemtype, data, this.axios_config)
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
      }
    },

    // update the configuration (name / parent) of a doc, folder or file
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
        item_id: this.updateItemId,
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
            this.updateItemDrawer = false;
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

    // fetch all available folders on user ( for changing folder path of a file)
    fetchAllAvailableFolders() {
      api
        .get('/files/list_all_available_folders', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.allAvailableFolders = response.data;
            for (var availableFolder of response.data.folders) {
              if (
                this.availParents.indexOf(availableFolder.path) === -1 &&
                availableFolder.id != this.updateItemId
              ) {
                this.availParents.push(availableFolder.path);
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
    previewPDF(fileid) {
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

    uploaderHandleFilenames() {
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

    refreshFolder() {
      this.loading = true;
      api
        .get('/files/list/' + this.rawFolderContent.id, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
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

    // get folder content with folder name
    getFolderPath(foldername) {
      this.previousFolder = this.rawFolderContent.id;
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
            this.rawFolderContent = response.data;
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

    // get Folder content with folderid
    getFolderId(folderid) {
      this.previousFolder = this.rawFolderContent.id;
      this.loading = true;
      api
        .get('/files/list/' + folderid, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
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

    // get root folder content on initial page load
    getRootFolder() {
      this.loading = true;
      api
        .get('/files/list_root', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
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

    // delete files, folders, documents

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

    deleteDocument(id) {
      this.loading = true;
      api
        .delete('/files/delete/document/' + id, this.axios_config)
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

    // create document, files, folders

    createDocument() {
      this.loading = true;
      var update_id = 0;
      for (var item in this.allAvailableFolders.folders) {
        if (
          this.allAvailableFolders.folders[item].path == this.updatedDocParent
        ) {
          update_id = this.allAvailableFolders.folders[item].id;
        }
      }
      var data = {
        current_folder_id: update_id,
        name: this.updatedDocName,
        text: '',
      };
      api
        .post('/files/create/document', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Created');
            this.loading = false;
            this.refreshFolder();
            this.docCreateDialog = false;
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
      if (this.create_folder_name != 'root') {
        this.loading = true;
        var data = {
          current_folder_id: this.rawFolderContent.id,
          foldername: this.create_folder_name,
        };

        api
          .post('/files/create/folder', data, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              console.log(this.rawFolderContent);
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
      } else {
        this.notify('negative', 'you cant name your folder root.');
      }
    },

    uploadFiles() {
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
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };
      for (const file in this.upload_file_files) {
        let form_data = new FormData();
        if (this.upload_file_freeEdit) {
          form_data.append('filename', this.upload_file_files[file].name);
        } else {
          form_data.append(
            'filename',
            this.upload_file_names[file] + '.' + this.upload_file_types[file]
          );
        }
        form_data.append('current_folder_id', this.rawFolderContent.id);
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
              files_state += 1;
              notif({
                type: 'negative',
                caption: files_state + ' / ' + length,
              });
              if (files_state == length) {
                notif({
                  type: 'negative',
                  icon: 'done', // we add an icon
                  spinner: false, // we reset the spinner setting so the icon can be displayed
                  message: 'Something went wrong',
                  timeout: 2500, // we will timeout it in 2.5s
                });
              }
            }
          })
          .catch((error) => {
            files_state += 1;
            notif({
              type: 'negative',
              caption: files_state + ' / ' + length,
            });
            if (files_state == length) {
              notif({
                type: 'negative',
                icon: 'done', // we add an icon
                spinner: false, // we reset the spinner setting so the icon can be displayed
                message: 'Something went wrong.',
                timeout: 2500, // we will timeout it in 2.5s
              });
            }
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
.active {
  background-color: #2196f3;
}
.disable-select {
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}
</style>
