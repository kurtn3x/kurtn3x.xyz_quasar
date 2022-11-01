<template>
  <q-dialog v-model="folderDeleteDialog" @hide="availParents = []">
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
          @click="deleteItem(folderToDeleteUUID, 'folder')"
          >Continue</q-btn
        >
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-drawer
    side="right"
    v-model="updateItemDrawer"
    bordered
    @hide="
      drawerItemId = '';
      drawerItemNewName = '';
      availParents = [];
      drawerItemNewParent = '';
      allAvailableFolders = {};
      drawerItemType = '';
      drawerTab = 'info';
    "
  >
    <q-card bordered flat class="full-height">
      <q-toolbar class="q-mt-sm q-mb-sm">
        <q-icon size="lg" name="article" v-if="drawerItemType == 'document'" />
        <q-icon size="lg" name="file_present" v-if="drawerItemType == 'file'" />
        <q-icon size="lg" name="folder" v-if="drawerItemType == 'folder'" />
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
        style="
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-decoration: underline;
          text-decoration-thickness: 3px;
        "
        :style="item_text_width"
      >
        {{ drawerItemName }}
        <q-tooltip class="text-body1"> {{ drawerItemName }}</q-tooltip>
      </div>
      <q-tabs v-model="drawerTab" class="q-mt-md">
        <q-tab name="info" icon="info" />
        <q-tab name="edit" icon="edit" @click="fetchAllAvailableFolders()" />
        <q-tab
          name="share"
          icon="share"
          v-if="drawerItemType != 'folder_link'"
        />
      </q-tabs>
      <q-tab-panels v-model="drawerTab" animated style="height: 70%">
        <q-tab-panel name="info">
          <div class="text-h6 q-mt-sm">Info</div>
          <q-separator size="3px" />
          <div class="text-body1 q-mt-md q-ml-sm">
            Type: {{ drawerItemType }}
          </div>
          <div
            class="text-body1 q-mt-md q-ml-sm"
            v-if="
              drawerItemType != 'document' && drawerItemType != 'folder_link'
            "
          >
            Size: {{ drawerReadableSize }}
          </div>
          <div
            class="text-body1 q-mt-md q-ml-sm"
            v-if="drawerItemType != 'folder_link'"
          >
            Created: {{ drawerCreated }}
          </div>
          <div
            class="text-body1 q-mt-md q-ml-sm"
            v-if="drawerItemType != 'folder_link'"
          >
            Modified: {{ drawerModified }}
          </div>
          <div class="text-body1 q-mt-md q-ml-sm">
            Folder: {{ rawFolderContent.path }}
          </div>

          <q-btn
            label="Download"
            icon="file_download"
            class="cursor-pointer bg-green text-white full-width q-mt-md"
            flat
            @click="openInNewTab(drawerItemId)"
            :loading="loading"
            v-if="drawerItemType == 'file'"
            size="xl"
          />
        </q-tab-panel>
        <q-tab-panel name="edit">
          <div class="text-h6 q-mt-sm">Update Item</div>

          <q-separator size="3px" />

          <q-input
            dense
            outlined
            v-model="drawerItemNewName"
            label="Name"
            input-class="text-center"
            class="text-primary q-ma-md text-body1 q-mt-lg"
          />
          <q-select
            outlined
            v-model="drawerItemNewParent"
            :options="availParents"
            label="Parent Folder"
            class="q-ma-md text-body1"
          />

          <q-btn
            label="Edit Document"
            class="cursor-pointer full-width q-mt-lg"
            outline
            size="lg"
            :loading="loading"
            stretch
            :to="'doc/edit/' + drawerItemId"
            v-if="drawerItemType == 'document'"
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
            v-if="drawerItemType == 'folder'"
            class="cursor-pointer bg-red text-white q-mt-md full-width"
            flat
            label="Delete"
            icon="delete"
            @click.capture.stop="
              this.folderToDeleteUUID = drawerItemId;
              folderDeleteDialog = !folderDeleteDialog;
            "
            :loading="loading"
          />
          <q-btn
            v-if="drawerItemType != 'folder'"
            class="cursor-pointer bg-red text-white full-width q-mt-md"
            label="Delete"
            flat
            icon="delete"
            @click.capture.stop="deleteItem(drawerItemId, drawerItemType)"
            :loading="loading"
          />
        </q-tab-panel>
        <q-tab-panel name="share" v-if="drawerItemType != 'folder_link'">
          <div class="text-h6 q-mt-sm">Sharing</div>
          <q-separator size="3px" />
          <q-checkbox
            v-if="drawerItemType == 'folder'"
            v-model="drawerSharingRecursive"
            color="green"
            label="Apply recursively"
            class="q-mt-sm q-mb-xs"
          />
          <div
            class="q-mb-sm text-body1 text-center"
            v-if="
              drawerSharingRecursive &&
              drawerSharing &&
              drawerItemType == 'folder'
            "
          >
            This will apply the following settings for all subcontent contained
            in this folder.
          </div>
          <q-separator size="3px" v-if="drawerItemType == 'folder'" />

          <q-checkbox
            v-model="drawerSharing"
            color="green"
            label="Enable Sharing"
            class="q-mt-md"
            @click="updateSharing"
          />
          <q-checkbox
            v-model="drawerSharingAllowAllRead"
            color="green"
            label="Allow everyone to read"
            @click="updateSharing"
          />
          <q-checkbox
            v-model="drawerSharingAllowAllWrite"
            color="green"
            label="Allow everyone to write"
            @click="updateSharing"
          />
          <div class="text-body1 q-mt-md q-ml-sm" v-if="drawerSharing">
            Share Link:
          </div>
          <q-input
            filled
            square
            v-model="itemShareLink"
            readonly
            class="q-mt-sm"
            v-if="drawerSharing"
          />
          <q-item
            clickable
            @click="copyToClipboard(itemShareLink)"
            class="justify-center text-body2"
            v-if="drawerSharing"
          >
            Copy the link</q-item
          >
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-drawer>

  <q-dialog v-model="upload_file_dialog">
    <q-card style="min-width: 300px" bordered>
      <q-toolbar class="justify-center">
        <div class="text-h5 q-mt-md text-primary text-center text-weight-bold">
          UPLOAD FILES
        </div>
        <q-separator />
      </q-toolbar>

      <q-file
        style="min-height: 300px; min-width: 300px"
        v-model="upload_file_files"
        multiple
        append
        :loading="loading"
        counter
        use-chips
        hide-bottom-space
        square
        class="q-ma-md fileupload"
        label-color="white"
        borderless
        @dragover.prevent="
          (ev) => {
            if (ev.dataTransfer.items[0].kind == 'file') {
              this.upload_file_dragged = true;
            }
          }
        "
        @dragenter.self="
          (ev) => {
            if (ev.dataTransfer.items[0].kind == 'file') {
              this.upload_file_dragged = true;
            }
          }
        "
        @dragleave.prevent="
          (ev) => {
            if (ev.dataTransfer.items[0].kind == 'file') {
              this.upload_file_dragged = false;
            }
          }
        "
        @drop="
          (ev) => {
            if (ev.dataTransfer.items[0].kind == 'file') {
              this.upload_file_dragged = false;
            }
          }
        "
        :class="upload_file_dragged ? 'bg-blue' : ''"
      >
        <div
          class="absolute-left text-white text-body1 text-center"
          style="top: 300%; pointer-events: none"
        >
          Click me / Drag & Drop Files here. Folders can only be uploaded via
          drag&drop in the expanded area below the file browser.
        </div>
      </q-file>
      <template v-for="(file, index) in upload_file_files" :key="file">
        <q-input
          dense
          outlined
          v-model="upload_file_files[index].name"
          :label="'File ' + index + ' Name'"
          input-class="text-center"
          class="text-body1"
        />
      </template>

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

  <q-page
    class="column"
    :class="mobile ? 'q-ml-xs q-mr-xs' : 'q-mr-md q-ml-md'"
    :style-fn="styleFn"
  >
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
        <q-breadcrumbs style="font-size: 20px" separator=">">
          <template v-for="itemname in path_names" :key="itemname">
            <q-breadcrumbs-el
              clickable
              flat
              class="text-primary text-weight-bold pathitem"
              :class="mobile ? 'text-h6 ' : 'text-h4'"
              @click="getFolderPath(itemname)"
              @v-drag-enter="
                (e, x, y) =>
                  y.target.classList.add(dark ? 'active-dark' : 'active')
              "
              @v-drag-over="
                (e, x, y) =>
                  y.target.classList.add(dark ? 'active-dark' : 'active')
              "
              @v-drag-leave="
                (e, x, y) => y.target.classList.remove('active', 'active-dark')
              "
              @v-drag-drop="changeFolderToolbar($event, itemname)"
              v-droppable
              v-if="itemname != 'Home'"
            >
              <a>
                {{ itemname }}
              </a>
            </q-breadcrumbs-el>
            <q-breadcrumbs-el
              clickable
              flat
              class="text-primary text-weight-bold pathitem"
              :class="mobile ? 'text-h6 ' : 'text-h4'"
              @click="getFolderPath(itemname)"
              @v-drag-enter="
                (e, x, y) =>
                  y.target.classList.add(dark ? 'active-dark' : 'active')
              "
              @v-drag-over="
                (e, x, y) =>
                  y.target.classList.add(dark ? 'active-dark' : 'active')
              "
              @v-drag-leave="
                (e, x, y) => y.target.classList.remove('active', 'active-dark')
              "
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
                @dragleave="
                  (ev) => {
                    ev.srcElement.parentNode.classList.remove('active');
                  }
                "
              />
            </q-breadcrumbs-el>
          </template>
        </q-breadcrumbs>
      </div>
    </q-toolbar>
    <q-toolbar class="transparent q-mt-xs">
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

      <q-fab icon="add" direction="down" class="q-ml-lg" flat color="green">
        <q-fab-action
          color="primary"
          text-color="white"
          @click="
            newObjShow = true;
            newObjType = 'document';
          "
          icon="note_add"
          label="New Document"
        />
        <q-fab-action
          color="primary"
          text-color="white"
          icon="create_new_folder"
          label="New Folder"
          @click="
            newObjShow = true;
            newObjType = 'folder';
          "
        />
        <q-fab-action
          color="primary"
          text-color="white"
          @click="upload_file_dialog = !upload_file_dialog"
          icon="file_upload"
          label="Upload Files"
        />
      </q-fab>

      <q-space />
      <div
        v-if="
          selectedFolderLinks.length +
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
                selectedFolderLinks.length +
                selectedFolders.length +
                selectedFiles.length +
                selectedDocuments.length
              }}
              Item(s) selected
            </a>
          </div>
          <q-btn
            label="Move"
            class="full-width bg-blue text-light"
            @click="
              fetchAllAvailableFolders();
              selectionNewParent = this.rawFolderContent.path;
            "
            size="lg"
          >
            <q-menu @hide="availParents = []" style="min-width: 200px">
              <q-select
                outlined
                v-model="selectionNewParent"
                :options="availParents"
                label="Parent Folder"
                input-class="text-center text-body1"
              />
              <q-btn
                @click="moveSelection"
                label="Move"
                class="full-width bg-blue"
              />
            </q-menu>
          </q-btn>
          <q-btn
            label="Delete"
            class="full-width bg-red text-light"
            @click="deleteSelection"
            size="lg"
          />
        </q-btn-dropdown>

        <a class="q-mr-lg" v-if="!mobile">
          {{
            selectedFolderLinks.length +
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
        @drop.self.prevent="onBackgroundDrop"
        @dragover.prevent="
          (ev) => {
            if (ev.dataTransfer.items.length > 0) {
              if (ev.dataTransfer.items[0].kind == 'file') {
                this.fileDraggedMain = true;
              }
            }
          }
        "
        @dragenter.self="
          (ev) => {
            if (ev.dataTransfer.items.length > 0) {
              if (ev.dataTransfer.items[0].kind == 'file') {
                this.fileDraggedMain = true;
              }
            }
          }
        "
        @dragleave.prevent="
          (ev) => {
            if (ev.dataTransfer.items.length > 0) {
              if (ev.dataTransfer.items[0].kind == 'file') {
                this.fileDraggedMain = false;
              }
            }
          }
        "
        :class="fileDraggedMain ? 'bg-blue' : ''"
      >
        <q-item class="full-width bg-light-green-2" v-if="newObjShow">
          <q-item-section avatar v-if="!mobile"> </q-item-section>
          <q-item-section avatar top style="pointer-events: none">
            <q-avatar
              icon="folder"
              color="primary"
              text-color="white"
              v-if="newObjType == 'folder'"
            />
            <q-avatar
              icon="article"
              color="primary"
              text-color="white"
              v-if="newObjType == 'document'"
            />
          </q-item-section>

          <q-item-section>
            <q-input
              standout
              dense
              dark
              v-model="newObjName"
              :label="'New ' + newObjType + ' Name'"
              class="text-body1 q-ml-md"
              input-class="text-dark"
              label-color="dark"
              autofocus
              clearable
              @keyup.enter="createObj"
            />
          </q-item-section>
          <q-item-section side class="row">
            <div>
              <q-btn
                icon="done"
                class="q-ml-md bg-green text-white"
                round
                flat
                @click="createObj"
              />
              <q-btn
                icon="close"
                class="q-ml-md bg-red text-white"
                round
                flat
                @click="
                  newObjShow = false;
                  newObjName = '';
                  newObjType = '';
                "
              />
            </div>
          </q-item-section>
        </q-item>
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
              @click="getFolderId(folder.id, false)"
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
              @drop.self.prevent="
                onFolderDrop($event, folder.id);
                folder.drag_over = false;
              "
              @dragover.prevent="
                (ev) => {
                  if (ev.dataTransfer.items.length > 0) {
                    if (ev.dataTransfer.items[0].kind == 'file') {
                      folder.drag_over = true;
                    }
                  }
                }
              "
              @dragenter.self="
                (ev) => {
                  if (ev.dataTransfer.items.length > 0) {
                    if (ev.dataTransfer.items[0].kind == 'file') {
                      folder.drag_over = true;
                    }
                  }
                }
              "
              @dragleave.prevent="
                (ev) => {
                  if (ev.dataTransfer.items.length > 0) {
                    if (ev.dataTransfer.items[0].kind == 'file') {
                      folder.drag_over = false;
                    }
                  }
                }
              "
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
                    drawerItemId = folder.id;
                    drawerItemNewName = folder.name;
                    drawerItemType = 'folder';
                    drawerItemNewParent = rawFolderContent.path;
                    drawerItemName = folder.name;
                    drawerCreated = folder.created;
                    drawerModified = folder.modified;
                    drawerItemSize = folder.size;
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
              (optnShowFolders && search == '') ||
              (optnShowFolders && folder_link.name.includes(search))
            "
          >
            <q-item
              clickable
              @click="getFolderLinkId(folder_link.id)"
              class="full-width"
              v-droppable
              v-draggable="['folder_link', folder_link.id]"
              :class="[
                folder_link.drag_over ? 'bg-blue' : '',
                folder_link.selected ? 'bg-light-blue-4' : '',
              ]"
              @v-drag-enter="
                (ev) => {
                  if (ev[1] != folder_link.id) {
                    folder_link.drag_over = true;
                  }
                }
              "
              @v-drag-leave="folder_link.drag_over = false"
              @v-drag-over="
                (ev) => {
                  if (ev[1] != folder_link.id) {
                    folder_link.drag_over = true;
                  }
                }
              "
              @v-drag-drop="changeFolder($event, folder_link.id)"
            >
              <q-menu
                style="pointer-events: none"
                anchor="center middle"
                self="center middle"
                v-model="folder_link.drag_over"
                >Add to folder: {{ folder_link.name }}</q-menu
              >
              <q-item-section avatar>
                <q-checkbox
                  v-model="selectedFolderLinks"
                  :val="folder_link.id"
                  color="green"
                  @click="folder_link.selected = !folder_link.selected"
                />
              </q-item-section>
              <q-item-section avatar top style="pointer-events: none">
                <q-avatar
                  icon="folder_shared"
                  color="primary"
                  text-color="white"
                />
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
                  <q-icon name="share" />
                  {{ folder_link.name }}</q-item-label
                >
              </q-item-section>
              <q-item-section side>
                <q-btn
                  icon="more_vert"
                  class="cursor-pointer full-width"
                  flat
                  @click.capture.stop="
                    updateItemDrawer = true;
                    drawerItemId = folder_link.id;
                    drawerItemNewName = folder_link.name;
                    drawerItemType = 'folder_link';
                    drawerItemNewParent = rawFolderContent.path;
                    drawerItemName = folder_link.name;
                    drawerCreated = folder_link.created;
                    drawerModified = folder_link.modified;
                    drawerItemSize = folder_link.size;
                    drawerSharing = folder_link.shared;
                    drawerSharingAllowAllRead = folder_link.allow_all_read;
                    drawerSharingAllowedWrite = folder_link.allow_all_write;
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
                    drawerItemId = file.id;
                    drawerItemNewName = file.name;
                    drawerItemType = 'file';
                    drawerItemNewParent = rawFolderContent.path;
                    drawerItemName = file.name;
                    drawerCreated = file.created;
                    drawerModified = file.modified;
                    drawerItemSize = file.size;
                    drawerSharing = file.shared;
                    drawerSharingAllowAllRead = file.allow_all_read;
                    drawerSharingAllowedWrite = file.allow_all_write;
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
                    drawerItemId = document.id;
                    drawerItemNewName = document.name;
                    drawerItemType = 'document';
                    drawerItemNewParent = rawFolderContent.path;
                    drawerItemName = document.name;
                    drawerCreated = document.created;
                    drawerModified = document.modified;
                    drawerSharing = document.shared;
                    drawerSharingAllowAllRead = document.allow_all_read;
                    drawerSharingAllowedWrite = document.allow_all_write;
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
    <q-separator color="primary" />
    <div
      style="height: 125px"
      v-if="dropField"
      @drop.self.prevent="onBackgroundDrop"
      @dragover.prevent="
        (ev) => {
          if (ev.dataTransfer.items.length > 0) {
            if (ev.dataTransfer.items[0].kind == 'file') {
              this.dropFieldDragover = true;
            }
          }
        }
      "
      @dragenter.self="
        (ev) => {
          if (ev.dataTransfer.items.length > 0) {
            if (ev.dataTransfer.items[0].kind == 'file') {
              this.dropFieldDragover = true;
            }
          }
        }
      "
      @dragleave.prevent="
        (ev) => {
          if (ev.dataTransfer.items.length > 0) {
            if (ev.dataTransfer.items[0].kind == 'file') {
              this.dropFieldDragover = false;
            }
          }
        }
      "
      :class="dropFieldDragover ? 'bg-blue' : ''"
    >
      <div class="text-h6 text-center">
        Drag/Drop files or folders here to upload to current folder
      </div>
    </div>
    <q-page-sticky position="bottom" :offset="[18, 0]" v-if="!mobile">
      <q-fab
        color="primary"
        icon="keyboard_arrow_up"
        active-icon="keyboard_arrow_down"
        direction="up"
        style="width: 250px; top: 0.5em"
        @click="dropField = !dropField"
        class="text-layout-text"
      >
      </q-fab>
    </q-page-sticky>
  </q-page>
</template>

<script>
const WINDOW = window;
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { api } from 'boot/axios';
import { draggable, selected } from '../../components/draggable.js';
import { droppable } from '../../components/droppable.js';

export default defineComponent({
  name: 'FilesView',
  directives: {
    draggable,
    droppable,
  },
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
      selected,
      show: ref(false),
      axios_config,
      userStore,
      settings_store,
      q,
      upload: ref(null),
      loading: ref(false),
      dropField: ref(false),
      dropFieldDragover: ref(false),

      // raw content including children of current folder
      rawFolderContent: ref({
        name: 'Home',
        path: 'Home',
        id: '0000',
        children: {
          private_files: [
            {
              name: '.dmrc',
              id: '032f2834-8d91-4b39-b545-5a8475a07c9c',
              modified: '2022-10-28, 08:40:29',
              created: '2022-10-28, 08:40:29',
              size: 27,
            },
          ],
          folder_links: [],
          folders: [],
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
      upload_file_dragged: ref(false),

      allAvailableFolders: ref({}),

      //drawer general
      updateItemDrawer: ref(false),
      drawerTab: ref('info'),
      drawerItemType: ref(''),
      drawerItemId: ref(''),

      // drawer info tab
      drawerItemName: ref(''),
      drawerCreated: ref(''),
      drawerModified: ref(''),
      drawerItemSize: ref(''),

      // drawer edit tab
      drawerItemNewName: ref(''),
      drawerItemNewParent: ref(''),

      // drawer sharing tab
      drawerSharing: ref(false),
      drawerSharingAllowAllRead: ref(false),
      drawerSharingAllowAllWrite: ref(false),
      drawerSharingAllowedWrite: ref(''),
      drawerSharingAllowedRead: ref(''),
      drawerSharingRecursive: ref(true),
      // lists all available parents (all folders of user) for q-select
      availParents: ref([]),

      // delete folder
      folderToDeleteUUID: ref(''),
      folderDeleteDialog: ref(false),

      fileDraggedMain: ref(false),
      itemClickable: ref(true),
      selectedFolderLinks: ref([]),
      selectedFolders: ref([]),
      selectedFiles: ref([]),
      selectedDocuments: ref([]),
      allSelected: ref(false),
      selectionNewParent: ref(''),

      // new doc/folder handlers
      newObjShow: ref(false),
      newObjName: ref(''),
      newObjType: ref(''),

      // for folder drag & drop
      dirUploadParentId: ref(''),
    };
  },
  created() {
    this.getHomeFolder();
  },
  computed: {
    drawerReadableSize() {
      return this.humanFileSize(this.drawerItemSize);
    },
    itemShareLink() {
      return (
        'https://kurtn3x.xyz/public/' +
        this.drawerItemType +
        '/' +
        this.drawerItemId
      );
    },
    dark() {
      return this.settings_store.darkmode;
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
      if (this.dropField) {
        var height = this.q.screen.height - 425;
        return { '--min-height': height + 'px' };
      } else {
        var height = this.q.screen.height - 300;
        return { '--min-height': height + 'px' };
      }
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
    write_console(el) {
      console.log(el);
    },

    humanFileSize(bytes, dp = 1) {
      const thresh = 1024;

      if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
      }

      const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
      let u = -1;
      const r = 10 ** dp;

      do {
        bytes /= thresh;
        ++u;
      } while (
        Math.round(Math.abs(bytes) * r) / r >= thresh &&
        u < units.length - 1
      );

      return bytes.toFixed(dp) + ' ' + units[u];
    },

    async handleDirUpload() {
      console.log(WINDOW);
      var window = document.defaultView;
      console.log(window);
      const dirHandle = await window.showDirectoryPicker();
      console.log(dirHandle);
    },
    copyToClipboard(link) {
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
      for (var folder_link_id of this.selectedFolderLinks) {
        this.deleteItem(folder_link_id, 'folder_link');
      }
      this.selectedFolderLinks = [];
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
      for (var folder_link_id of this.selectedFolderLinks) {
        this.updateItemParent(
          folder_link_id,
          this.selectionNewParent,
          'folder_link'
        );
      }
      this.selectedFolderLinks = [];
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

    // drag & drop upload when dropping on free space ( current folder)
    async onBackgroundDrop(ev) {
      this.dropFieldDragover = false;
      this.fileDraggedMain = false;
      if (ev.dataTransfer.items[0].kind != 'string') {
        var errors = [];
        var handledObjects = 0;
        var successfulObjects = 0;
        const length = ev.dataTransfer.items.length;
        const notif = this.q.notify({
          type: 'positive',
          group: false,
          timeout: 0,
          spinner: true,
          message: 'Uploading...',
          caption: handledObjects + ' / ' + length,
        });

        let config = {
          withCredentials: true,
          headers: {
            'X-CSRFToken': this.q.cookies.get('csrftoken'),
            'Content-Type': 'multipart/form-data',
          },
        };

        for (item of ev.dataTransfer.items) {
          if (item.kind === 'file') {
            // check if its a file
            if (item.webkitGetAsEntry().isFile) {
              const validFile = item.getAsFile();
              notif({
                message:
                  'Uploading File ' + item.webkitGetAsEntry().name + '...',
              });
              let form_data = new FormData();
              form_data.append('filename', validFile.name);
              form_data.append('new_parent_id', this.rawFolderContent.id);
              form_data.append('file', validFile);
              form_data.append('size', validFile.size);
              await api
                .post('/files/create/file', form_data, config)
                .then((response) => {
                  if (response.status == 200) {
                    this.refreshFolder();
                    successfulObjects += 1;
                    handledObjects += 1;
                    notif({
                      caption: handledObjects + ' / ' + length,
                    });
                    if (handledObjects == length) {
                      if (errors.length == 0) {
                        notif({
                          type: 'positive',
                          icon: 'done', // we add an icon
                          spinner: false, // we reset the spinner setting so the icon can be displayed
                          message:
                            'Uploaded everything! ' +
                            successfulObjects +
                            '/' +
                            length,
                          timeout: 2500, // we will timeout it in 2.5s
                        });
                      } else {
                        var message =
                          'Uploaded ' +
                          successfulObjects +
                          '/' +
                          length +
                          ", following things couldn't be uploaded: ";
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
                    handledObjects += 1;
                    notif({
                      caption: handledObjects + ' / ' + length,
                    });
                    errors.push(validFile.name);
                    if (handledObjects == length) {
                      var message =
                        'Uploaded ' +
                        successfulObjects +
                        '/' +
                        length +
                        ", following things couldn't be uploaded: ";
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
                  handledObjects += 1;
                  errors.push(validFile.name);
                  notif({
                    caption: handledObjects + ' / ' + length,
                  });
                  if (handledObjects == length) {
                    var message =
                      'Uploaded ' +
                      successfulObjects +
                      '/' +
                      length +
                      ", following things couldn't be uploaded: ";
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
            } else if (item.webkitGetAsEntry().isDirectory) {
              // HANDLE DIRECTORY DRAG&DROP
              var item = item.webkitGetAsEntry();
              notif({
                message: 'Uploading Folder ' + item.name + '...',
              });
              await this.handleObj(item, this.rawFolderContent.id)
                .then((reva) => {
                  this.refreshFolder();
                  successfulObjects += 1;
                  handledObjects += 1;
                  notif({
                    caption: handledObjects + ' / ' + length,
                  });
                  if (handledObjects == length) {
                    if (errors.length == 0) {
                      notif({
                        type: 'positive',
                        icon: 'done', // we add an icon
                        spinner: false, // we reset the spinner setting so the icon can be displayed
                        message:
                          'Uploaded everything! ' +
                          successfulObjects +
                          '/' +
                          length,
                        timeout: 2500, // we will timeout it in 2.5s
                      });
                    } else {
                      var message =
                        'Uploaded ' +
                        successfulObjects +
                        '/' +
                        length +
                        ", following things couldn't be uploaded: ";
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
                .catch(() => {
                  handledObjects += 1;
                  notif({
                    caption: handledObjects + ' / ' + length,
                  });
                  if (handledObjects == length) {
                    errors.push(item.name);
                    var message =
                      'Uploaded ' +
                      successfulObjects +
                      '/' +
                      length +
                      ", following things couldn't be uploaded: ";
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
            } else {
              handledObjects += 1;
              if (handledObjects == length) {
                var message =
                  'Uploaded ' +
                  successfulObjects +
                  '/' +
                  length +
                  ", following things couldn't be uploaded: ";
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
          }
        }
      }
    },

    // drag & drop upload when dropping on a folder
    async onFolderDrop(ev, parentid) {
      this.fileDraggedMain = false;
      if (ev.dataTransfer.items[0].kind != 'string') {
        var errors = [];
        var handledObjects = 0;
        var successfulObjects = 0;
        const length = ev.dataTransfer.items.length;
        const notif = this.q.notify({
          type: 'positive',
          group: false,
          timeout: 0,
          spinner: true,
          message: 'Uploading...',
          caption: handledObjects + ' / ' + length,
        });

        let config = {
          withCredentials: true,
          headers: {
            'X-CSRFToken': this.q.cookies.get('csrftoken'),
            'Content-Type': 'multipart/form-data',
          },
        };

        for (item of ev.dataTransfer.items) {
          if (item.kind === 'file') {
            // check if its a file
            if (item.webkitGetAsEntry().isFile) {
              const validFile = item.getAsFile();
              notif({
                message:
                  'Uploading File ' + item.webkitGetAsEntry().name + '...',
              });
              let form_data = new FormData();
              form_data.append('filename', validFile.name);
              form_data.append('new_parent_id', parentid);
              form_data.append('file', validFile);
              form_data.append('size', validFile.size);
              await api
                .post('/files/create/file', form_data, config)
                .then((response) => {
                  if (response.status == 200) {
                    successfulObjects += 1;
                    handledObjects += 1;
                    notif({
                      caption: handledObjects + ' / ' + length,
                    });
                    if (handledObjects == length) {
                      if (errors.length == 0) {
                        notif({
                          type: 'positive',
                          icon: 'done', // we add an icon
                          spinner: false, // we reset the spinner setting so the icon can be displayed
                          message:
                            'Uploaded everything! ' +
                            successfulObjects +
                            '/' +
                            length,
                          timeout: 2500, // we will timeout it in 2.5s
                        });
                      } else {
                        var message =
                          'Uploaded ' +
                          successfulObjects +
                          '/' +
                          length +
                          ", following things couldn't be uploaded: ";
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
                    handledObjects += 1;
                    notif({
                      caption: handledObjects + ' / ' + length,
                    });
                    errors.push(validFile.name);
                    if (handledObjects == length) {
                      var message =
                        'Uploaded ' +
                        successfulObjects +
                        '/' +
                        length +
                        ", following things couldn't be uploaded: ";
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
                  handledObjects += 1;
                  errors.push(validFile.name);
                  notif({
                    caption: handledObjects + ' / ' + length,
                  });
                  if (handledObjects == length) {
                    var message =
                      'Uploaded ' +
                      successfulObjects +
                      '/' +
                      length +
                      ", following things couldn't be uploaded: ";
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
            } else if (item.webkitGetAsEntry().isDirectory) {
              // HANDLE DIRECTORY DRAG&DROP
              var item = item.webkitGetAsEntry();
              notif({
                message: 'Uploading Folder ' + item.name + '...',
              });
              await this.handleObj(item, parentid)
                .then((reva) => {
                  successfulObjects += 1;
                  handledObjects += 1;
                  notif({
                    caption: handledObjects + ' / ' + length,
                  });
                  if (handledObjects == length) {
                    if (errors.length == 0) {
                      notif({
                        type: 'positive',
                        icon: 'done', // we add an icon
                        spinner: false, // we reset the spinner setting so the icon can be displayed
                        message:
                          'Uploaded everything! ' +
                          successfulObjects +
                          '/' +
                          length,
                        timeout: 2500, // we will timeout it in 2.5s
                      });
                    } else {
                      var message =
                        'Uploaded ' +
                        successfulObjects +
                        '/' +
                        length +
                        ", following things couldn't be uploaded: ";
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
                .catch(() => {
                  handledObjects += 1;
                  notif({
                    caption: handledObjects + ' / ' + length,
                  });
                  if (handledObjects == length) {
                    errors.push(item.name);
                    var message =
                      'Uploaded ' +
                      successfulObjects +
                      '/' +
                      length +
                      ", following things couldn't be uploaded: ";
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
            } else {
              handledObjects += 1;
              if (handledObjects == length) {
                var message =
                  'Uploaded ' +
                  successfulObjects +
                  '/' +
                  length +
                  ", following things couldn't be uploaded: ";
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
          }
        }
      }
    },

    // used with drag&drop uploads of folders
    async handleObj(obj, parentid) {
      return new Promise(async (resolve, reject) => {
        var total = 0;
        if (obj.isDirectory) {
          // obj is a directory
          // create the directory
          this.createFolder(obj.name, parentid).then((response) => {
            if (response.status == 200) {
              var ID = response.data.ID;
              var directoryReader = obj.createReader();
              directoryReader.readEntries(async (entries) => {
                for (var entry of entries) {
                  await this.handleObj(entry, ID);
                }
                resolve(total);
              });
            }
          });
        } else {
          await this.handleFile(obj, parentid);
          resolve(total);
        }
      });
    },

    // used with drag&drop uploads of folders
    async uploadFile(file) {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };
      let form_data = new FormData();
      form_data.append('filename', file.name);
      form_data.append('new_parent_id', this.dirUploadParentId);
      form_data.append('size', file.size);
      form_data.append('file', file);
      await api.post('/files/create/file', form_data, config);
      return;
    },

    // used with drag&drop uploads of folders
    handleFile(file, parentid) {
      return new Promise((resolve, reject) => {
        this.dirUploadParentId = parentid;
        file.file(async (file) => {
          let config = {
            withCredentials: true,
            headers: {
              'X-CSRFToken': this.q.cookies.get('csrftoken'),
              'Content-Type': 'multipart/form-data',
            },
          };
          let form_data = new FormData();
          form_data.append('filename', file.name);
          form_data.append('new_parent_id', this.dirUploadParentId);
          form_data.append('file', file);
          form_data.append('size', file.size);
          await api.post('/files/create/file', form_data, config).then(() => {
            resolve();
          });
        });
      });
    },

    // create folder and return the response, used when drag&drop uploading nested folders
    async createFolder(name, parentid) {
      this.loading = true;
      var data = {
        folderid: parentid,
        name: name,
      };
      var reval = 0;
      await api
        .post('/files/create/folder', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.loading = false;
            reval = response;
          } else {
            this.notify('negative', '' + response.data.error);
            this.loading = false;
            reval = response;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
          reval = error;
        });
      return reval;
    },

    // go back navbar button
    navGoBack() {
      this.loading = true;
      api
        .get(
          '/files/folder/' + this.rawFolderContent.parentid,
          this.axios_config
        )
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.updateItemDrawer = false;

            this.path_names.pop();
            this.path_ids.pop();
            this.selectedFolderLinks = [];
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
          .put('/files/update/' + itemtype, data, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.notify('positive', 'Updated');
              this.refreshFolder();
              this.loading = false;
              this.selectedFolderLinks = [];
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
          .put('/files/update/' + itemtype, data, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.notify('positive', 'Updated');
              this.refreshFolder();
              this.loading = false;
              this.selectedFolderLinks = [];
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

    // update parent of an item using the path string
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
        .put('/files/update/' + itemtype, data, this.axios_config)
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

    // update sharing information of an object
    updateSharing() {
      this.loading = true;
      var data = {
        item_id: this.drawerItemId,
        shared: this.drawerSharing,
        shared_allow_all_read: this.drawerSharingAllowAllRead,
        shared_allow_all_write: this.drawerSharingAllowAllWrite,
        shared_recursive: this.drawerSharingRecursive,
      };
      api
        .put(
          '/files/update-sharing/' + this.drawerItemType,
          data,
          this.axios_config
        )
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Sharing settings saved.');
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
      this.loading = false;
    },

    // update the configuration (name / parent) of a doc, folder or file
    updateItem() {
      this.loading = true;
      var update_id = 0;
      for (var item of this.allAvailableFolders.folders) {
        if (item.path == this.drawerItemNewParent) {
          update_id = item.id;
        }
      }
      var data = {
        item_id: this.drawerItemId,
        name: this.drawerItemNewName,
        new_parent_id: update_id,
      };
      api
        .put('/files/update/' + this.drawerItemType, data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Updated');
            this.refreshFolder();
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolderLinks = [];
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

    // fetch all available folders on user (for changing folder path of a file)
    fetchAllAvailableFolders() {
      if (this.availParents.length == 0 || this.availParents.length == 1) {
        api
          .get('/files/list_all_available_folders', this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.allAvailableFolders = response.data;
              for (var availableFolder of response.data.folders) {
                if (
                  this.availParents.indexOf(availableFolder.path) === -1 &&
                  availableFolder.id != this.drawerItemId
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

    // universal
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

    // open a file for download
    openInNewTab(id) {
      window
        .open('https://api.kurtn3x.xyz/files/download/' + id, '_blank')
        .focus();
    },

    // universal function to refetch the current folder when any change is made
    refreshFolder() {
      this.loading = true;
      api
        .get('/files/folder/' + this.rawFolderContent.id, this.axios_config)
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

    // get folder content with folder name ( from toolbar on top )
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
        .get('/files/folder/' + folderid, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolderLinks = [];

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
    getFolderId(folderid, publicfolder) {
      this.previousFolder = this.rawFolderContent.id;
      this.loading = true;
      if (publicfolder) {
        var getstr = '/files/public/folder/' + folderid;
      } else {
        var getstr = '/files/folder/' + folderid;
      }
      api
        .get(getstr, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.path_names.push(response.data.name);
            this.path_ids.push(response.data.id);
            this.loading = false;
            this.updateItemDrawer = false;
            this.availParents = [];
            this.selectedFolderLinks = [];

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
        .get('/files/home', this.axios_config)
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

    // create documents and folders from add button
    createObj() {
      this.loading = true;
      var data = {
        folderid: this.rawFolderContent.id,
        name: this.newObjName,
      };
      api
        .post('/files/create/' + this.newObjType, data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.newObjName = '';
            this.newObjShow = false;
            this.notify('positive', 'Created');
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

    // upload file(s) from add button
    uploadFiles() {
      var errors = [];
      var handledObjects = 0;
      var successfulObjects = 0;
      const length = this.upload_file_files.length;
      const notif = this.q.notify({
        type: 'positive',
        group: false,
        timeout: 0,
        spinner: true,
        message: 'Uploading file...',
        caption: handledObjects + ' / ' + length,
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
        filename = this.upload_file_files[index].name;

        form_data.append('filename', filename);

        form_data.append('new_parent_id', this.rawFolderContent.id);
        if (this.upload_file_files != null) {
          form_data.append('file', this.upload_file_files[index]);
          form_data.append('size', this.upload_file_files[index].size);
        }
        api
          .post('/files/create/file', form_data, config)
          .then((response) => {
            if (response.status == 200) {
              this.refreshFolder();
              successfulObjects += 1;
              handledObjects += 1;
              notif({
                caption: handledObjects + ' / ' + length,
              });
              if (handledObjects == length) {
                if (errors.length == 0) {
                  notif({
                    type: 'positive',
                    icon: 'done', // we add an icon
                    spinner: false, // we reset the spinner setting so the icon can be displayed
                    message:
                      'Uploaded ' +
                      successfulObjects +
                      '/' +
                      length +
                      ' files!',
                    timeout: 2500, // we will timeout it in 2.5s
                  });
                } else {
                  var message =
                    'Uploaded ' +
                    successfulObjects +
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
              handledObjects += 1;
              notif({
                type: 'negative',
                caption: handledObjects + ' / ' + length,
              });
              errors.push(filename);
              if (handledObjects == length) {
                var message =
                  'Uploaded ' +
                  successfulObjects +
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
            handledObjects += 1;
            errors.push(filename);
            notif({
              type: 'negative',
              caption: handledObjects + ' / ' + length,
            });
            if (handledObjects == length) {
              var message =
                'Uploaded ' +
                successfulObjects +
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
    },
  },
});
</script>

<style scoped lang="scss">
.item_parent_container {
  min-height: var(--min-height);
}
.item_text {
  max-width: var(--max-width);
}
.active-dark {
  text-decoration: underline;
  text-decoration-thickness: 3px;
  background: rgba(224, 255, 255, 0.2);
}

.active {
  text-decoration: underline;
  text-decoration-thickness: 3px;
  background: rgba(26, 0, 175, 0.2);
}

.fileupload {
  background-color: $grey-8;
}
.fileupload:hover {
  background-color: $grey-7;
}

.fileuploadhover {
  background-color: $grey-4;
}

.pathitem:hover {
  text-decoration: underline;
  text-decoration-thickness: 3px;
  cursor: pointer;
}

.disable-select {
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}
</style>
