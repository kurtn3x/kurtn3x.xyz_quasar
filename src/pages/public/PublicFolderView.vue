<template>
  <!-- <div v-if="!allowed && !loading">Not allowed</div> -->
  <div v-if="!allowed && !loading">
    <q-dialog v-model="docCreateDialog" @hide="availParents = []">
      <q-card bordered>
        <q-toolbar class="justify-center">
          <div
            class="text-h6 q-ma-md text-primary text-center text-weight-bold"
          >
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
    <q-dialog v-model="folder_delete_dialog" @hide="availParents = []">
      <q-card bordered>
        <div class="text-body1 text-center q-ma-md">
          This will delete the folder and all its subfolders and files.
        </div>
        <q-card-actions align="right">
          <q-btn v-close-popup flat class="bg-red text-light">Cancel</q-btn>
          <q-btn
            v-close-popup
            flat
            class="bg-green text-light"
            @click="deleteItem(folder_to_delete, 'folder')"
            >Continue</q-btn
          >
        </q-card-actions>
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
        <q-toolbar class="q-mt-sm q-mb-sm">
          <q-icon
            size="lg"
            name="article"
            v-if="updateItemType == 'document'"
          />
          <q-icon
            size="lg"
            name="file_present"
            v-if="updateItemType == 'file'"
          />
          <q-icon size="lg" name="folder" v-if="updateItemType == 'folder'" />
          <a class="text-h5 text-weight-bold q-ml-md">Settings</a>
          <q-space />
          <q-btn
            push
            icon="close"
            class="bg-red text-white"
            @click="updateItemDrawer = !updateItemDrawer"
          />
        </q-toolbar>
        <q-separator />
        <div
          class="text-h5 q-mt-md text-center text-weight-bold q-ml-sm"
          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
          :style="item_text_width"
        >
          {{ drawerItemName }}
          <q-tooltip> {{ drawerItemName }}</q-tooltip>
        </div>
        <q-tabs v-model="drawerTab" class="q-mt-md">
          <q-tab name="info" icon="info" />
          <q-tab
            name="edit"
            icon="edit"
            v-if="
              rawFolderContent.permissions.includes('write') ||
              rawFolderContent.permissions.includes('owner')
            "
          />
        </q-tabs>
        <q-tab-panels v-model="drawerTab" animated style="height: 70%">
          <q-tab-panel name="info">
            <div class="text-h6 q-mb-md q-mt-sm">Info</div>
            <div class="text-body1 q-mt-md q-ml-sm">
              Type: {{ updateItemType }}
            </div>
            <div
              class="text-body1 q-mt-md q-ml-sm"
              v-if="updateItemType != 'document'"
            >
              Size: {{ drawerSize }}
            </div>
            <div class="text-body1 q-mt-md q-ml-sm">
              Created: {{ drawerCreated }}
            </div>
            <div class="text-body1 q-mt-md q-ml-sm">
              Modified: {{ drawerModified }}
            </div>
            <div class="text-body1 q-mt-md q-ml-sm">
              Folder: {{ rawFolderContent.path }}
            </div>

            <q-btn
              label="Download"
              icon="file_download"
              class="cursor-pointer bg-green text-white full-width q-mt-sm"
              flat
              @click="openInNewTab(updateItemId)"
              :loading="loading"
              v-if="updateItemType == 'file'"
              size="xl"
            />
          </q-tab-panel>
          <q-tab-panel
            name="edit"
            v-if="
              rawFolderContent.permissions.includes('write') ||
              rawFolderContent.permissions.includes('owner')
            "
          >
            <div class="text-h6 q-mb-md q-mt-sm">Update Item</div>

            <q-input
              dense
              outlined
              v-model="updateItemName"
              label="Name"
              input-class="text-center"
              class="text-primary q-ma-md text-body1 q-mt-lg"
            />

            <q-btn
              label="Edit Document"
              class="cursor-pointer full-width q-mt-lg"
              outline
              size="lg"
              :loading="loading"
              stretch
              :to="'doc/edit/' + updateItemId"
              v-if="updateItemType == 'document'"
            />

            <q-btn
              label="Save"
              class="cursor-pointer bg-green text-white q-mt-sm full-width"
              flat
              icon="save"
              @click="updateItem"
              :loading="loading"
              style="width: 240px"
              size="lg"
            />
            <q-btn
              v-if="updateItemType == 'folder'"
              class="cursor-pointer bg-red text-white q-mt-sm full-width"
              flat
              label="Delete"
              icon="delete"
              @click.capture.stop="
                this.folder_to_delete = updateItemId.id;
                folder_delete_dialog = !folder_delete_dialog;
              "
              :loading="loading"
            />
            <q-btn
              v-if="updateItemType != 'folder'"
              class="cursor-pointer bg-red text-white full-width q-mt-sm"
              label="Delete"
              flat
              icon="delete"
              @click.capture.stop="deleteItem(updateItemId, updateItemType)"
              :loading="loading"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-drawer>

    <q-dialog v-model="upload_file_dialog">
      <q-card style="min-width: 200px" bordered>
        <q-toolbar class="justify-center">
          <div
            class="text-h6 q-ma-md text-primary text-center text-weight-bold"
          >
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
        <q-checkbox
          v-model="allSelected"
          color="green"
          class="q-ml-xs"
          @click="selectAllItems"
        />
        <q-input
          dense
          v-model="search"
          input-class="text-left"
          style="width: 30%"
          label="Search"
          class="text-body1 q-ml-lg"
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

        <q-fab
          color="primary"
          text-color="white"
          icon="add"
          direction="down"
          class="q-ml-lg"
          flat
          v-if="
            rawFolderContent.permissions.includes('write') ||
            rawFolderContent.permissions.includes('owner')
          "
        >
          <q-fab-action
            color="primary"
            text-color="white"
            @click="upload_file_dialog = !upload_file_dialog"
            icon="file_upload"
            label="Upload Files"
          />
          <q-fab-action
            color="primary"
            text-color="white"
            @click="
              docCreateDialog = !docCreateDialog;
              createDocParent = rawFolderContent.path;
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
            <q-menu anchor="bottom middle" self="center middle">
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
                  v-close-popup
                />
              </q-card>
            </q-menu>
          </q-fab-action>
        </q-fab>

        <q-space />
        <div
          v-if="
            selectedFolders.length +
              selectedFiles.length +
              selectedDocuments.length >
            0
          "
          class="text-h6"
        >
          <q-btn-dropdown flat icon="more_horiz">
            <div class="row justify-center">
              <a class="q-ma-sm text-body1 text-center" v-if="mobile">
                {{
                  selectedFolders.length +
                  selectedFiles.length +
                  selectedDocuments.length
                }}
                Item(s) selected
              </a>
            </div>
            <q-btn
              v-if="
                rawFolderContent.permsissions.includes('write') ||
                rawFolderContent.permissions.includes('owner')
              "
              label="Delete"
              class="full-width bg-red text-light"
              @click="deleteSelection"
            />
          </q-btn-dropdown>

          <a class="q-mr-lg" v-if="!mobile">
            {{
              selectedFolders.length +
              selectedFiles.length +
              selectedDocuments.length
            }}
            Item(s) selected
          </a>
        </div>
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
      <q-scroll-area class="col">
        <div
          class="item_parent_container"
          :style="item_parent_container_height"
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
                :class="[
                  folder.drag_over ? 'bg-blue' : '',
                  folder.selected ? 'bg-light-blue-4' : '',
                ]"
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
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedFolders"
                    :val="folder.id"
                    color="green"
                    @click="folder.selected = !folder.selected"
                  />
                </q-item-section>
                <q-item-section avatar top style="pointer-events: none">
                  <q-avatar icon="folder" color="primary" text-color="white" />
                </q-item-section>

                <q-item-section style="pointer-events: none">
                  <q-item-label
                    class="item_text"
                    lines="1"
                    style="
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                    :style="item_text_width"
                  >
                    <q-icon name="share" v-if="folder.shared" />
                    {{ folder.name }}</q-item-label
                  >
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
                      drawerCreated = folder.created;
                      drawerModified = folder.modified;
                      drawerSize = folder.size;
                      drawerSharing = folder.shared;
                      drawerSharingAllowAllRead = folder.allow_all_read;
                      drawerSharingAllowedWrite = folder.allow_all_write;
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
            v-for="folder_link in rawFolderContent.children.folder_links"
            :key="folder_link"
          >
            <div
              v-if="
                (optnShowFiles && search == '') ||
                (optnShowFiles && folder_link.name.includes(search))
              "
            >
              <q-item
                clickable
                class="full-width"
                v-draggable="['file_folder', folder_link.id]"
                @click="openInNewTab(folder_link.id)"
                :class="folder_link.selected ? 'bg-light-blue-4' : ''"
              >
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedFiles"
                    :val="folder_link.id"
                    color="green"
                    @click="folder_link.selected = !folder_link.selected"
                  />
                </q-item-section>
                <q-item-section avatar top>
                  <q-avatar
                    icon="file_present"
                    color="primary"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="item_text"
                    lines="1"
                    style="
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                    :style="item_text_width"
                  >
                    <q-icon name="share" v-if="folder_link.shared" />
                    {{ folder_link.name }}</q-item-label
                  >
                  <q-item-label caption lines="1">{{
                    folder_link.modified
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    icon="more_vert"
                    class="cursor-pointer full-width"
                    flat
                    @click.capture.stop="
                      updateItemDrawer = true;
                      updateItemId = folder_link.id;
                      updateItemName = folder_link.name;
                      updateItemType = 'folder_link';
                      updateItemNewParent = rawFolderContent.path;
                      drawerItemName = folder_link.name;
                      drawerCreated = folder_link.created;
                      drawerModified = folder_link.modified;
                      drawerSize = folder_link.size;
                    "
                    :loading="loading"
                    stretch
                  />
                </q-item-section>
              </q-item>
              <q-separator />
            </div>
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
                :class="file.selected ? 'bg-light-blue-4' : ''"
              >
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedFiles"
                    :val="file.id"
                    color="green"
                    @click="file.selected = !file.selected"
                  />
                </q-item-section>
                <q-item-section avatar top>
                  <q-avatar
                    icon="file_present"
                    color="primary"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="item_text"
                    lines="1"
                    style="
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                    :style="item_text_width"
                  >
                    <q-icon name="share" v-if="file.shared" />
                    {{ file.name }}</q-item-label
                  >
                  <q-item-label caption lines="1">{{
                    file.modified
                  }}</q-item-label>
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
                      drawerCreated = file.created;
                      drawerModified = file.modified;
                      drawerSize = file.size;
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
                @click="openDocEditor(document.id)"
                class="full-width"
                v-draggable="['document', document.id]"
                :class="document.selected ? 'bg-light-blue-4' : ''"
              >
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedDocuments"
                    :val="document.id"
                    color="green"
                    @click="document.selected = !document.selected"
                  />
                </q-item-section>
                <q-item-section avatar top>
                  <q-avatar
                    icon="article"
                    color="light-blue"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label
                    class="item_text"
                    lines="1"
                    style="
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                    :style="item_text_width"
                  >
                    <q-icon name="share" v-if="document.shared" />
                    {{ document.name }}</q-item-label
                  >
                  <q-item-label caption lines="1">{{
                    document.modified
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
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
                      drawerCreated = document.created;
                      drawerModified = document.modified;
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
      </q-scroll-area>

      <q-page-sticky position="bottom">
        <q-fab icon="info" text-color="white" color="primary" direction="up">
          <q-card style="width: 250px">
            <q-card-section>
              <a class="text-body1 q-ma-sm"> Folder Information</a>
              <q-separator class="q-ma-sm" />
              <div class="text-body2 q-ma-sm">
                Owner: {{ rawFolderContent.owner }}
              </div>
              <div class="text-body2 q-mt-sm q-ml-sm q-mr-sm">
                Permissions: {{ rawFolderContent.permissions }}
              </div>
            </q-card-section>
            <q-btn
              label="Create Folder Link"
              icon="folder_shared"
              class="full-width"
              flat
              color="green"
              @click="createFolderLink"
            >
              <q-tooltip>
                This will create a link to this Folder in your Home
                directory.</q-tooltip
              >
            </q-btn>
          </q-card>
        </q-fab>
      </q-page-sticky>
    </q-page>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { api } from 'boot/axios';
import { draggable, selected } from '../../components/draggable.js';
import { droppable } from '../../components/droppable.js';

export default defineComponent({
  name: 'PublicFilesView',
  directives: {
    draggable,
    droppable,
  },
  setup() {
    const userStore = useUserStore();
    const settings_store = useSettingsStore();
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      selected,
      show: ref(false),
      axiosConfig,
      userStore,
      settings_store,
      q,
      upload: ref(null),
      loading: ref(false),
      allowed: ref(false),

      // raw content including children of current folder
      rawFolderContent: ref({
        name: 'Home',
        path: 'Home',
        id: 'b2ea057d-fa9b-4f42-a50f-d9db1bc510e4',
        permissions: 'read write',
        owner: 'bla',
        children: {
          private_files: [],
          public_files: [],
          folders: [],
          folder_links: [],
          documents: [],
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
      drawerCreated: ref(''),
      drawerModified: ref(''),
      drawerSize: ref(''),
      drawerTab: ref('info'),

      drawerSharing: ref(false),
      drawerSharingAllowAllRead: ref(false),
      drawerSharingAllowAllWrite: ref(false),
      drawerSharingAllowedWrite: ref(''),
      drawerSharingAllowedRead: ref(''),
      drawerSharingPassword: ref(false),
      drawerSharingPasswordPW: ref(''),
      // lists all available parents (all folders of user) for q-select
      availParents: ref([]),

      // delete folder
      folder_to_delete: ref(''),
      folder_delete_dialog: ref(false),

      // create new doc
      createDocName: ref(''),
      createDocParent: ref(''),
      docCreateDialog: ref(false),

      fileDraggedMain: ref(false),
      itemClickable: ref(true),

      selectedFolders: ref([]),
      selectedFiles: ref([]),
      selectedDocuments: ref([]),
      allSelected: ref(false),
      selectionNewParent: ref(''),
    };
  },
  created() {
    this.getInitialFolder();
  },
  computed: {
    itemShareLink() {
      return 'https://kurtn3x.xyz/folder/' + this.updateItemId;
    },
    filesInUploadField() {
      if (this.upload_file_files == null) {
        return false;
      } else if (this.upload_file_files.length == 0) {
        return false;
      } else {
        return true;
      }
    },
    mobile() {
      if (this.q.screen.width < 700) {
        return true;
      } else {
        return false;
      }
    },
    small() {
      if (this.q.screen.width < 1024) {
        return true;
      } else {
        return false;
      }
    },

    item_parent_container_height() {
      var height = this.q.screen.height - 300;
      return { '--min-height': height + 'px' };
    },

    width() {
      return this.q.screen.width;
    },

    item_text_width() {
      var width = this.q.screen.width;
      if (this.updateItemDrawer) {
        width -= 650;
      } else {
        width -= 250;
      }

      return { '--max-width': width + 'px' };
    },
  },
  methods: {
    createFolderLink() {
      var data = {
        folderid: this.rawFolderContent.id,
        foldername: this.rawFolderContent.name,
      };
      api
        .post('/files/create/folder_link', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Link created in your home directory.');
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
          this.allowed = false;
        });
    },
    getInitialFolder() {
      var folderid = this.$route.params.id;
      this.previousFolder = this.rawFolderContent.id;
      this.loading = true;
      api
        .get('/files/public/folder/' + folderid, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.path_names.push(response.data.name);
            this.path_ids.push(response.data.id);
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolders = [];
            this.selectedFiles = [];
            this.selectedDocuments = [];
            this.allSelected = false;
            this.allowed = true;
          } else {
            this.loading = false;
            this.allowed = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
          this.allowed = false;
        });
    },
    copyuserlink(link) {
      navigator.clipboard.writeText(link);
    },
    openDocEditor(docId) {
      this.$router.push('doc/edit/' + docId);
    },
    addFileCheckbox(el) {
      this.selected.push(el.target.parentElement.parentNode.offsetParent);
    },
    deleteSelection() {
      for (var folder_id of this.selectedFolders) {
        this.deleteItem(folder_id, 'folder');
      }
      for (var file_id of this.selectedFiles) {
        this.deleteItem(file_id, 'file');
      }
      for (var document_id of this.selectedDocuments) {
        this.deleteItem(document_id, 'document');
      }
      this.selectedFolders = [];
      this.selectedFiles = [];
      this.selectedDocuments = [];
      this.allSelected = false;
    },
    moveSelection() {
      for (var folder_id of this.selectedFolders) {
        this.updateItemParent(folder_id, this.selectionNewParent, 'folder');
      }
      for (var file_id of this.selectedFiles) {
        this.updateItemParent(file_id, this.selectionNewParent, 'file');
      }
      for (var document_id of this.selectedDocuments) {
        this.updateItemParent(document_id, this.selectionNewParent, 'document');
      }
      this.selectedFolders = [];
      this.selectedFiles = [];
      this.selectedDocuments = [];
      this.allSelected = false;
    },
    selectAllItems() {
      if (this.allSelected == true) {
        for (var folder of this.rawFolderContent.children.folders) {
          if (!this.selectedFolders.includes(folder.id)) {
            this.selectedFolders.push(folder.id);
            this.selected.push(folder.id);
            folder.selected = true;
          }
        }
        for (var file of this.rawFolderContent.children.private_files) {
          if (!this.selectedFiles.includes(file.id)) {
            this.selectedFiles.push(file.id);
            this.selected.push(file.id);
            file.selected = true;
          }
        }
        for (var document of this.rawFolderContent.children.documents) {
          if (!this.selectedDocuments.includes(document.id)) {
            this.selectedDocuments.push(document.id);
            this.selected.push(document.id);
            document.selected = true;
          }
        }
      } else {
        for (var folder of this.rawFolderContent.children.folders) {
          folder.selected = false;
        }
        for (var file of this.rawFolderContent.children.private_files) {
          file.selected = false;
        }
        for (var document of this.rawFolderContent.children.documents) {
          document.selected = false;
        }
        this.selectedFolders = [];
        this.selectedFiles = [];
        this.selectedDocuments = [];
      }
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
      if (ev.dataTransfer.items[0].kind != 'string') {
        var errors = [];
        var files_state = 0;
        var succ_files = 0;
        const length = ev.dataTransfer.items.length;
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

        [...ev.dataTransfer.items].forEach((item, i) => {
          if (item.kind === 'file') {
            const file = item.getAsFile();
            // check if its a file
            this.isThisAFile(file)
              .then((validFile) => {
                let form_data = new FormData();
                form_data.append('filename', validFile.name);
                form_data.append('current_folder_id', this.rawFolderContent.id);
                form_data.append('file', validFile);
                api
                  .post('/files/create/file', form_data, config)
                  .then((response) => {
                    if (response.status == 200) {
                      succ_files += 1;
                      files_state += 1;
                      this.refreshFolder();
                      notif({
                        caption: files_state + ' / ' + length,
                      });
                      if (files_state == length) {
                        if (errors.length == 0) {
                          notif({
                            type: 'positive',
                            icon: 'done', // we add an icon
                            spinner: false, // we reset the spinner setting so the icon can be displayed
                            message:
                              'Uploaded ' +
                              succ_files +
                              '/' +
                              length +
                              ' files!',
                            timeout: 2500, // we will timeout it in 2.5s
                          });
                        } else {
                          var message =
                            'Uploaded ' +
                            succ_files +
                            '/' +
                            length +
                            " Files, following files couldn't be uploaded: ";
                          for (var err_file of errors) {
                            message += err_file + ', ';
                          }
                          notif({
                            type: 'negative',
                            icon: 'error', // we add an icon
                            spinner: false, // we reset the spinner setting so the icon can be displayed
                            message: message,
                            timeout: 4000, // we will timeout it in 2.5s
                            caption: '',
                          });
                        }
                      }
                    } else {
                      files_state += 1;
                      notif({
                        type: 'negative',
                        caption: files_state + ' / ' + length,
                      });
                      errors.push(file.name);
                      if (files_state == length) {
                        var message =
                          'Uploaded ' +
                          succ_files +
                          '/' +
                          length +
                          " Files, following files couldn't be uploaded: ";
                        for (var err_file of errors) {
                          message += err_file + ', ';
                        }
                        notif({
                          type: 'negative',
                          icon: 'error', // we add an icon
                          spinner: false, // we reset the spinner setting so the icon can be displayed
                          message: message,
                          timeout: 4000, // we will timeout it in 2.5s
                          caption: '',
                        });
                      }
                    }
                  })
                  .catch((error) => {
                    files_state += 1;
                    errors.push(file.name);
                    notif({
                      type: 'negative',
                      caption: files_state + ' / ' + length,
                    });
                    if (files_state == length) {
                      var message =
                        'Uploaded ' +
                        succ_files +
                        '/' +
                        length +
                        " Files, following files couldn't be uploaded: ";
                      for (var err_file of errors) {
                        message += err_file + ', ';
                      }
                      notif({
                        type: 'negative',
                        icon: 'error', // we add an icon
                        spinner: false, // we reset the spinner setting so the icon can be displayed
                        message: message,
                        timeout: 4000, // we will timeout it in 2.5s
                        caption: '',
                      });
                    }
                  });
              })
              .catch((error) => {
                files_state += 1;
                errors.push(file.name);
                if (files_state == length) {
                  var message =
                    'Uploaded ' +
                    succ_files +
                    '/' +
                    length +
                    " Files, following files couldn't be uploaded: ";
                  for (var err_file of errors) {
                    message += err_file + ', ';
                  }
                  notif({
                    type: 'negative',
                    icon: 'error', // we add an icon
                    spinner: false, // we reset the spinner setting so the icon can be displayed
                    message: message,
                    timeout: 4000, // we will timeout it in 2.5s
                    caption: '',
                  });
                }
              });
          }
        });
      }
    },
    isThisAFile(maybeFile) {
      return new Promise(function (resolve, reject) {
        if (maybeFile.type !== '') {
          return resolve(maybeFile);
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          if (
            reader.error &&
            (reader.error.name === 'NotFoundError' ||
              reader.error.name === 'NotReadableError')
          ) {
            return reject(reader.error.name);
          }
          resolve(maybeFile);
        };
        reader.readAsBinaryString(maybeFile);
      });
    },
    showDOCUMENT() {
      console.log();
    },
    // go back navbar button
    navGoBack() {
      this.loading = true;
      api
        .get(
          '/files/public/folder/' + this.rawFolderContent.parentid,
          this.axiosConfig
        )
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.updateItemDrawer = false;

            this.path_names.pop();
            this.path_ids.pop();
            this.selectedFolders = [];
            this.selectedFiles = [];
            this.selectedDocuments = [];
            this.allSelected = false;

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
          .put('/files/update/' + itemtype, data, this.axiosConfig)
          .then((response) => {
            if (response.status == 200) {
              this.notify('positive', 'Updated');
              this.refreshFolder();
              this.loading = false;
              this.selectedFolders = [];
              this.selectedFiles = [];
              this.selectedDocuments = [];
              this.allSelected = false;
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
          .put('/files/update/' + itemtype, data, this.axiosConfig)
          .then((response) => {
            if (response.status == 200) {
              this.notify('positive', 'Updated');
              this.refreshFolder();
              this.loading = false;
              this.selectedFolders = [];
              this.selectedFiles = [];
              this.selectedDocuments = [];
              this.allSelected = false;
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

    updateItemParent(id, new_parent_path, itemtype) {
      this.loading = true;
      var update_id = 0;
      for (var item of this.allAvailableFolders.folders) {
        if (item.path == new_parent_path) {
          update_id = item.id;
        }
      }
      var data = {
        item_id: id,
        new_parent_id: update_id,
      };
      api
        .put('/files/update/' + itemtype, data, this.axiosConfig)
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

    // update the configuration (name / parent) of a doc, folder or file
    updateSharing() {
      this.loading = true;
      var data = {
        item_id: this.updateItemId,
        shared: this.drawerSharing,
        shared_allow_all_read: this.drawerSharingAllowAllRead,
        shared_allow_all_write: this.drawerSharingAllowAllWrite,
        password_protected: this.drawerSharingPassword,
        password: this.drawerSharingPasswordPW,
      };
      api
        .put(
          '/files/update-sharing/' + this.updateItemType,
          data,
          this.axiosConfig
        )
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Updated');
            this.refreshFolder();
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolders = [];
            this.selectedFiles = [];
            this.selectedDocuments = [];
            this.allSelected = false;
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
      this.loading = false;
    },

    // update the configuration (name / parent) of a doc, folder or file
    updateItem() {
      this.loading = true;
      var update_id = 0;
      for (var item of this.allAvailableFolders.folders) {
        if (item.path == this.updateItemNewParent) {
          update_id = item.id;
        }
      }
      var data = {
        item_id: this.updateItemId,
        name: this.updateItemName,
        new_parent_id: update_id,
      };
      api
        .put('/files/update/' + this.updateItemType, data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Updated');
            this.refreshFolder();
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolders = [];
            this.selectedFiles = [];
            this.selectedDocuments = [];
            this.allSelected = false;
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
      this.loading = false;
    },

    // fetch all available folders on user ( for changing folder path of a file)
    styleFn(offset, height) {
      let pageheight = height - offset;
      return 'height: ' + pageheight + 'px';
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
        .get(
          '/files/public/folder/' + this.rawFolderContent.id,
          this.axiosConfig
        )
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
        .get('/files/public/folder/' + folderid, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolders = [];
            this.selectedFiles = [];
            this.selectedDocuments = [];
            this.allSelected = false;
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
        .get('/files/public/folder/' + folderid, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.path_names.push(response.data.name);
            this.path_ids.push(response.data.id);
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolders = [];
            this.selectedFiles = [];
            this.selectedDocuments = [];
            this.allSelected = false;
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
        .get('/files/home', this.axiosConfig)
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
        .delete('/files/delete/' + type + '/' + id, this.axiosConfig)
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
        .post('/files/create/document', data, this.axiosConfig)
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
          .post('/files/create/folder', data, this.axiosConfig)
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
      var errors = [];
      var files_state = 0;
      var succ_files = 0;
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

      for (var index in this.upload_file_files) {
        // check if its a file
        let form_data = new FormData();
        var filename = '';
        if (this.upload_file_freeEdit) {
          filename = this.upload_file_files[index].name;
        } else {
          filename =
            this.upload_file_names[index] + '.' + this.upload_file_types[index];
        }
        form_data.append('filename', filename);

        form_data.append('current_folder_id', this.rawFolderContent.id);
        if (this.upload_file_files != null) {
          form_data.append('file', this.upload_file_files[index]);
        }
        api
          .post('/files/create/file', form_data, config)
          .then((response) => {
            if (response.status == 200) {
              this.refreshFolder();
              succ_files += 1;
              files_state += 1;
              notif({
                caption: files_state + ' / ' + length,
              });
              if (files_state == length) {
                if (errors.length == 0) {
                  notif({
                    type: 'positive',
                    icon: 'done', // we add an icon
                    spinner: false, // we reset the spinner setting so the icon can be displayed
                    message:
                      'Uploaded ' + succ_files + '/' + length + ' files!',
                    timeout: 2500, // we will timeout it in 2.5s
                  });
                } else {
                  var message =
                    'Uploaded ' +
                    succ_files +
                    '/' +
                    length +
                    " Files, following files couldn't be uploaded: ";
                  for (var err_file of errors) {
                    message += err_file + ', ';
                  }
                  notif({
                    type: 'negative',
                    icon: 'error', // we add an icon
                    spinner: false, // we reset the spinner setting so the icon can be displayed
                    message: message,
                    timeout: 4000, // we will timeout it in 2.5s
                    caption: '',
                  });
                }
              }
            } else {
              files_state += 1;
              notif({
                type: 'negative',
                caption: files_state + ' / ' + length,
              });
              errors.push(filename);
              if (files_state == length) {
                var message =
                  'Uploaded ' +
                  succ_files +
                  '/' +
                  length +
                  " Files, following files couldn't be uploaded: ";
                for (var err_file of errors) {
                  message += err_file + ', ';
                }
                notif({
                  type: 'negative',
                  icon: 'error', // we add an icon
                  spinner: false, // we reset the spinner setting so the icon can be displayed
                  message: message,
                  timeout: 4000, // we will timeout it in 2.5s
                  caption: '',
                });
              }
            }
          })
          .catch((error) => {
            files_state += 1;
            errors.push(filename);
            notif({
              type: 'negative',
              caption: files_state + ' / ' + length,
            });
            if (files_state == length) {
              var message =
                'Uploaded ' +
                succ_files +
                '/' +
                length +
                " Files, following files couldn't be uploaded: ";
              for (var err_file of errors) {
                message += err_file + ', ';
              }
              notif({
                type: 'negative',
                icon: 'error', // we add an icon
                spinner: false, // we reset the spinner setting so the icon can be displayed
                message: message,
                timeout: 4000, // we will timeout it in 2.5s
                caption: '',
              });
            }
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
.item_parent_container {
  min-height: var(--min-height);
}
.item_text {
  max-width: var(--max-width);
}
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
