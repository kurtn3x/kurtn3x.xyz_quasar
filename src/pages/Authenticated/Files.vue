<template>
  <q-dialog v-model="docCreateDialog" @hide="availParents = []">
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
        v-model="createDocName"
        label="Name"
        input-class="text-center"
        class="text-primary text-body1 q-ma-md"
      />
      <q-select
        outlined
        v-model="createDocParent"
        :options="availParents"
        label="Parent Folder"
        class="q-ma-md"
        input-class="text-center text-body1"
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
    <q-card bordered flat class="full-height">
      <q-toolbar>
        <q-icon size="lg" name="article" v-if="updateItemType == 'document'" />
        <q-icon size="lg" name="file_present" v-if="updateItemType == 'file'" />
        <q-icon size="lg" name="folder" v-if="updateItemType == 'folder'" />
        <a class="text-h5 text-weight-bold q-ml-md">Settings</a>
        <q-space />
        <q-btn
          icon="close"
          class="bg-red text-white"
          flat
          @click="updateItemDrawer = !updateItemDrawer"
        />
      </q-toolbar>
      <div class="text-h5 q-mt-md text-center">
        {{ drawerItemName }}
      </div>

      <q-input
        dense
        outlined
        v-model="updateItemName"
        label="Name"
        input-class="text-center"
        class="text-primary q-ma-md text-body1"
      />
      <q-select
        dense
        outlined
        v-model="updateItemNewParent"
        :options="availParents"
        label="Parent Folder"
        class="q-ma-md text-body1"
      />
      <q-btn
        label="Preview"
        class="cursor-pointer full-width"
        flat
        @click.capture.stop="
          previewPDF(updateItemId);
          initial_doc_filename = drawerItemName;
        "
        :loading="loading"
        stretch
        v-if="drawerItemName.includes('.pdf')"
      />
      <q-btn
        label="Open in Document Editor"
        class="cursor-pointer full-width"
        flat
        :to="'doc/edit/' + updateItemId"
        :loading="loading"
        stretch
        v-if="updateItemType == 'document'"
      />

      <q-btn
        label="Update"
        class="cursor-pointer full-width bg-green text-white"
        flat
        @click="updateItem"
        :loading="loading"
      />
      <div style="position: absolute; bottom: 0; right: 0" class="full-width">
        <q-btn
          v-if="updateItemType == 'folder'"
          class="cursor-pointer full-width bg-red text-white"
          flat
          icon="delete"
          @click.capture.stop="
            this.folder_to_delete = updateItemId.id;
            folder_delete_dialog = !folder_delete_dialog;
          "
          :loading="loading"
          stretch
        />
        <q-btn
          v-if="updateItemType == 'file'"
          class="cursor-pointer full-width bg-red text-white"
          flat
          icon="delete"
          @click.capture.stop="deleteItem(updateItemId, 'file')"
          :loading="loading"
          stretch
        />
        <q-btn
          v-if="updateItemType == 'document'"
          class="cursor-pointer full-width bg-red text-white"
          flat
          icon="delete"
          @click.capture.stop="deleteItem(updateItemId, 'document')"
          :loading="loading"
          stretch
        />
      </div>
    </q-card>
  </q-drawer>

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
          class="text-body1"
        />
        <q-input
          dense
          outlined
          v-model="upload_file_files[index].name"
          :label="'File ' + index + ' Name'"
          input-class="text-center"
          v-if="upload_file_freeEdit"
          class="text-body1"
        />
      </template>
      <q-btn
        v-if="filesInUploadField"
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
  <q-page class="column q-ml-md q-mr-md" :style-fn="styleFn">
    <q-toolbar class="transparent q-mt-md q-mb-sm">
      <div class="row">
        <q-btn
          v-if="this.rawFolderContent.name != 'Home'"
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
            class="text-primary q-ml-sm text-h5 text-weight-bold"
            @click="getFolderPath(itemname)"
            @v-drag-enter="(e, x, y) => y.target.classList.add('active')"
            @v-drag-over="(e, x, y) => y.target.classList.add('active')"
            @v-drag-leave="(e, x, y) => y.target.classList.remove('active')"
            @v-drag-drop="changeFolderToolbar($event, itemname)"
            v-droppable
            v-if="itemname != 'Home'"
          >
            {{ itemname }}
          </q-item>
          <q-item
            clickable
            flat
            class="text-primary q-ml-sm text-h5 text-weight-bold"
            @click="getFolderPath(itemname)"
            @v-drag-enter="(e, x, y) => y.target.classList.add('active')"
            @v-drag-over="(e, x, y) => y.target.classList.add('active')"
            @v-drag-leave="(e, x, y) => y.target.classList.remove('active')"
            @v-drag-drop="changeFolderToolbar($event, itemname)"
            v-droppable
            v-if="itemname == 'Home'"
          >
            <q-icon
              color="primary"
              name="home"
              class="full-width full-height"
              @dragover="
                (ev) => {
                  ev.srcElement.parentNode.classList.add('active');
                }
              "
              @drop="
                (ev) => {
                  ev.srcElement.parentNode.classList.remove('active');
                }
              "
            />
          </q-item>
          <q-item class="text-primary q-ml-xs text-h4 text-weight-bold">
            <q-icon name="arrow_forward_ios" />
          </q-item>
        </template>
      </div>
    </q-toolbar>
    <q-toolbar class="transparent q-mt-md">
      <q-input
        dense
        v-model="search"
        input-class="text-left"
        style="width: 30%"
        label="Search"
        class="text-body1"
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
      <q-btn-dropdown icon="settings" flat>
        <q-card bordered style="min-width: 190px; max-width: 190px">
          <q-toggle
            v-model="optnShowFolders"
            color="green"
            label="Show Folders"
            class="full-width"
          />
          <q-separator />
          <q-toggle
            v-model="optnShowFiles"
            color="green"
            label="Show Files"
            class="full-width"
          />
          <q-separator />
          <q-toggle
            v-model="optnShowDocuments"
            color="green"
            label="Show Documents"
            class="full-width"
          />
        </q-card>
      </q-btn-dropdown>
    </q-toolbar>
    <q-separator size="2px" color="primary" class="q-mt-sm" />
    <div
      id="drop_zone"
      @drop.prevent="onDrop"
      @dragover.prevent="
        (ev) => {
          if (ev.dataTransfer.items[0].kind == 'file') {
            this.fileDraggedMain = true;
          }
        }
      "
      @dragenter.self="
        (ev) => {
          if (ev.dataTransfer.items[0].kind == 'file') {
            this.fileDraggedMain = true;
          }
        }
      "
      @dragleave.prevent="
        (ev) => {
          if (ev.dataTransfer.items[0].kind == 'file') {
            this.fileDraggedMain = false;
          }
        }
      "
      :class="fileDraggedMain ? 'bg-blue' : ''"
    >
      <template
        v-for="folder in rawFolderContent.children.folders"
        :key="folder"
      >
        <div
          v-if="
            (optnShowFolders && search == '') ||
            (optnShowFolders && folder.name.includes(search))
          "
        >
          <q-item
            clickable
            @click="getFolderId(folder.id)"
            class="full-width"
            v-droppable
            v-draggable="['folder', folder.id]"
            :class="folder.drag_over ? 'bg-blue' : ''"
            @v-drag-enter="
              (ev) => {
                if (ev[1] != folder.id) {
                  folder.drag_over = true;
                }
              }
            "
            @v-drag-leave="folder.drag_over = false"
            @v-drag-over="
              (ev) => {
                if (ev[1] != folder.id) {
                  folder.drag_over = true;
                }
              }
            "
            @v-drag-drop="changeFolder($event, folder.id)"
          >
            <q-menu
              style="pointer-events: none"
              anchor="center middle"
              self="center middle"
              v-model="folder.drag_over"
              >Add to folder: {{ folder.name }}</q-menu
            >
            <q-item-section avatar top style="pointer-events: none">
              <q-avatar icon="folder" color="primary" text-color="white" />
            </q-item-section>

            <q-item-section style="pointer-events: none">
              <q-item-label class="text-body1">{{ folder.name }} </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="more_vert"
                class="cursor-pointer full-width"
                flat
                @click.capture.stop="
                  updateItemDrawer = true;
                  updateItemId = folder.id;
                  updateItemName = folder.name;
                  updateItemType = 'folder';
                  updateItemNewParent = rawFolderContent.path;
                  drawerItemName = folder.name;
                  fetchAllAvailableFolders();
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
        <div
          v-if="
            (optnShowFiles && search == '') ||
            (optnShowFiles && file.name.includes(search))
          "
        >
          <q-item
            clickable
            class="full-width"
            v-draggable="['file', file.id]"
            @click="openInNewTab(file.id)"
          >
            <q-item-section avatar top>
              <q-avatar
                icon="file_present"
                color="primary"
                text-color="white"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label lines="1">{{ file.name }}</q-item-label>
              <q-item-label caption lines="1">{{ file.changed }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                icon="more_vert"
                class="cursor-pointer full-width"
                flat
                @click.capture.stop="
                  updateItemDrawer = true;
                  updateItemId = file.id;
                  updateItemName = file.name;
                  updateItemType = 'file';
                  updateItemNewParent = rawFolderContent.path;
                  drawerItemName = file.name;
                  fetchAllAvailableFolders();
                "
                :loading="loading"
                stretch
              />
            </q-item-section>
          </q-item>
          <q-separator />
        </div>
      </template>
      <!-- DOCUMENTS -->
      <template
        v-for="document in rawFolderContent.children.documents"
        :key="document"
      >
        <div
          v-if="
            (optnShowDocuments && search == '') ||
            (optnShowDocuments && document.name.includes(search))
          "
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
              <!-- <q-btn
                icon="edit"
                class="cursor-pointer full-width"
                flat
                :loading="loading"
                stretch
                :to="'doc/edit/' + document.id"
              /> -->
              <q-btn
                icon="more_vert"
                class="cursor-pointer full-width"
                flat
                @click.capture.stop="
                  updateItemDrawer = true;
                  updateItemId = document.id;
                  updateItemName = document.name;
                  updateItemType = 'document';
                  updateItemNewParent = rawFolderContent.path;
                  drawerItemName = document.name;
                  fetchAllAvailableFolders();
                "
                :loading="loading"
                stretch
              />
            </q-item-section>
          </q-item>
          <q-separator />
        </div>
      </template>
    </div>
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-fab color="primary" text-color="white" icon="add" direction="left">
        <q-fab-action
          color="primary"
          text-color="white"
          @click="
            upload_file_dialog = !upload_file_dialog;
            fetchAllAvailableFolders();
          "
          icon="file_upload"
          label="Upload Files"
        />
        <q-fab-action
          color="primary"
          text-color="white"
          @click="
            docCreateDialog = !docCreateDialog;
            createDocParent = rawFolderContent.path;
            fetchAllAvailableFolders();
          "
          icon="note_add"
          label="New Document"
        />
        <q-fab-action
          color="primary"
          text-color="white"
          icon="create_new_folder"
          label="New Folder"
        >
          <q-menu anchor="center right" self="center middle">
            <q-card bordered>
              <q-input
                v-model="create_folder_name"
                label="New Folder Name"
                input-class="text-center"
                class="full-width text-primary text-body1"
              />
              <q-btn
                label="Create"
                class="cursor-pointer full-width bg-green"
                flat
                @click="createFolder"
                :loading="loading"
              />
            </q-card>
          </q-menu>
        </q-fab-action>
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { api } from 'boot/axios';
import VuePdfEmbed from 'vue-pdf-embed';
import { draggable } from '../../components/draggable.js';
import { droppable } from '../../components/droppable.js';

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

      // raw content including children of current folder
      rawFolderContent: ref({
        name: 'Home',
        path: 'Home',
        id: 39,
        children: {
          private_files: [
            {
              name: 'img_avatar.png',
              id: 67,
              changed: '2022-09-28 09:18:08',
            },
          ],
          public_files: [],
          folders: [
            {
              name: 'Hi',
              id: 40,
              path: 'Home/Hi',
            },
            {
              name: 'Test2',
              id: 41,
              path: 'Home/Test2',
            },
          ],
          documents: [
            {
              name: 'TestDoc',
              id: 10,
              changed: '2022-09-28 09:18:44',
            },
          ],
        },
      }),
      // toolbar handlers
      path_names: ref([]),
      path_ids: ref([]),
      optnShowFolders: ref(true),
      optnShowFiles: ref(true),
      optnShowDocuments: ref(true),
      search: ref(''),

      // file upload dialog handlers
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
      allAvailableFolders: ref({}),
      drawerItemName: ref(''),
      // lists all available parents (all folders of user) for q-select
      availParents: ref([]),

      // delete folder
      folder_to_delete: ref(''),
      folder_delete_dialog: ref(false),
      // pdf preview handlers
      initial_doc: ref(''),
      show_file_editor: ref(false),
      initial_doc_filename: ref(''),
      pdf_viewer_maximized: ref(false),
      zoom: ref(800),

      // create new doc
      createDocName: ref(''),
      createDocParent: ref(''),
      docCreateDialog: ref(false),

      fileDraggedMain: ref(false),
      itemClickable: ref(true),
    };
  },
  created() {
    this.getHomeFolder();
  },
  computed: {
    filesInUploadField() {
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
    test(a, b, c, d) {
      console.log(a);
    },
    onDragEnter(ev) {
      [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind == 'file') {
          this.fileDraggedMain = true;
        }
      });
    },
    onDragLeave(ev) {
      [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind == 'file') {
          this.fileDraggedMain = false;
        }
      });
    },

    onDrop(ev) {
      this.fileDraggedMain = false;
      var files_state = 0;
      const length = ev.dataTransfer.items.length;
      const notif = this.q.notify({
        type: 'positive',
        group: false,
        timeout: 0,
        spinner: true,
        message: 'Uploading file...',
        caption: files_state + ' / ' + length,
      });
      console.log(ev);
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };

      [...ev.dataTransfer.items].forEach((item, i) => {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          let form_data = new FormData();
          form_data.append('filename', file.name);
          form_data.append('current_folder_id', this.rawFolderContent.id);
          form_data.append('file', file);
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
      });
    },
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
            this.updateItemDrawer = false;

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
            this.availParents = [];
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
      console.log('Y');
      if (this.availParents.length == 0 || this.availParents.length == 1) {
        console.log('X');
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
      }
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
            this.updateItemDrawer = false;
            this.availParents = [];
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
            this.updateItemDrawer = false;
            this.availParents = [];
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
            this.updateItemDrawer = false;
            this.availParents = [];
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

    // get Home folder content on initial page load
    getHomeFolder() {
      this.loading = true;
      api
        .get('/files/list_home', this.axios_config)
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

    deleteItem(id, type) {
      this.loading = true;
      api
        .delete('/files/delete/' + type + '/' + id, this.axios_config)
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
          this.allAvailableFolders.folders[item].path == this.createDocParent
        ) {
          update_id = this.allAvailableFolders.folders[item].id;
        }
      }
      var data = {
        current_folder_id: update_id,
        name: this.createDocName,
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
      if (
        this.create_folder_name != 'Home' &&
        this.create_folder_name != 'home'
      ) {
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
        this.notify('negative', 'you cant name your folder Home.');
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
