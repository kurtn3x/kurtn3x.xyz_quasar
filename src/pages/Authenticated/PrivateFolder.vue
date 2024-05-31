<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <viewer-wrapper
      :propItem="mediaItem"
      :active="mediaPreview"
      @close="mediaPreview = false"
    />
    <!-- createFileDialog -->
    <q-dialog
      v-model="createFileDialog"
      @hide="
        newFile.name = '';
        newFile.mime = 'Unknown';
      "
    >
      <q-card bordered style="width: 350px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm">Create new File</q-toolbar-title>
        </q-toolbar>
        <div class="text-body1 text-center q-ma-md">
          <q-input
            :color="darkmode ? 'white' : 'black'"
            v-model="newFile.name"
            dense
            outlined
            label="Name"
            class="text-primary text-body1 col"
            style="height: 45px"
            @keyup.enter="createFile"
          />
        </div>
        <div class="q-ml-md">
          <a class="text-h6"> Type:</a>
          <q-option-group
            v-model="newFile.mime"
            :options="mimeOptions"
            color="primary"
            class="q-mt-xs text-body1"
          />
        </div>
        <q-separator class="q-mt-md" />
        <q-card-actions align="center" class="row q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            push
            icon="close"
            label="Cancel"
            class="bg-red text-white col"
          />
          <q-btn
            push
            class="bg-green text-white col"
            icon="done"
            size="md"
            label="Create"
            @click="createFile"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- delteSelectedItemsDialog (Confirmation) -->
    <q-dialog v-model="deleteItemsDialog">
      <q-card bordered style="width: 350px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm"
            >Delete selected Items</q-toolbar-title
          >
        </q-toolbar>
        <div class="text-body1 text-center q-ma-md">
          This will delete all selected items and all their subitems.
        </div>
        <div class="row justify-center q-ma-md">
          <q-btn
            push
            icon="expand_more"
            :label="selectedItems.length + ' Items'"
            class="bg-blue text-white q-ml-sm text-body2"
          >
            <q-menu anchor="bottom middle" self="top middle" class="no-shadow">
              <q-card bordered flat style="max-width: 200px; max-height: 250px">
                <template v-for="item in selectedItems" :key="item">
                  <div class="ellipsis text-body1 q-ma-sm">
                    <q-icon
                      :name="item.type == 'folder' ? 'folder' : 'file_present'"
                    />
                    <a class="q-ml-sm"> {{ item.name }} </a>
                  </div>
                  <q-separator />
                </template>
              </q-card>
            </q-menu>
          </q-btn>
        </div>
        <q-separator class="q-mt-sm" />
        <q-card-actions align="center" class="row q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            push
            icon="close"
            label="Cancel"
            class="bg-red text-white col"
          />
          <q-btn
            v-close-popup
            push
            class="bg-green text-white col"
            icon="done"
            size="md"
            label="Continue"
            @click="deleteSelection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- moveSelectedItemsDialog -->
    <q-dialog
      v-model="moveSelectedItemsDialog"
      @hide="
        moveItemsExpanded = [];
        moveItemsFilter = '';
        moveItemsSelectedPath = '';
        moveItemsSelectedId = '';
      "
    >
      <q-card bordered style="min-width: 350px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm"
            >Move Items to new Folder</q-toolbar-title
          >
        </q-toolbar>
        <div
          v-if="allAvailableFolders.length == 0"
          class="q-ma-md row justify-center items-center"
          style="height: 375px"
        >
          <q-spinner size="10em" />
        </div>
        <div class="q-ma-sm" v-if="allAvailableFolders.length != 0">
          <div class="row">
            <q-input
              :color="darkmode ? 'white' : 'black'"
              v-model="moveItemsFilter"
              dense
              outlined
              label="Search"
              class="text-primary text-body1 col"
              style="height: 45px; max-width: 300px"
            />

            <q-btn
              icon="expand_more"
              :label="selectedItems.length + ' Items'"
              class="bg-blue text-white q-ml-sm text-body2 col"
              push
              dense
              style="height: 40px; max-width: 130px"
            >
              <q-menu
                anchor="bottom middle"
                self="top middle"
                class="no-shadow"
              >
                <q-card
                  flat
                  bordered
                  style="max-width: 200px; max-height: 250px"
                >
                  <template v-for="item in selectedItems" :key="item">
                    <div class="ellipsis text-body1 q-ma-sm">
                      <q-icon
                        :name="
                          item.type == 'folder' ? 'folder' : 'file_present'
                        "
                      />
                      <a class="q-ml-sm"> {{ item.name }} </a>
                    </div>
                    <q-separator />
                  </template>
                </q-card>
              </q-menu>
            </q-btn>
          </div>
          <q-separator />
          <q-scroll-area style="height: 350px">
            <q-tree
              :nodes="allAvailableFolders"
              v-model:selected="moveItemsSelectedId"
              v-model:expanded="moveItemsExpanded"
              :filter="moveItemsFilter"
              node-key="id"
              label-key="name"
              selected-color="green"
              class="text-body1"
              no-transition
              no-selection-unset
              no-results-label="No folder found"
              @update:selected="moveItemsUpdateSelectedLabel"
            >
              <!-- this is the add button in the tree, ugly af and annoying so removed for now -->
              <!-- <template v-slot:default-body="prop">
                <q-btn
                  icon="add"
                  v-if="(prop as any).node.temporary_show_input != true"
                  @click="
                    (prop as any).node.temporary_show_input = true;
                    (prop as any).node.temporary_label = '';
                  "
                  push
                  dense
                  size="sm"
                  color="green"
                />
                <q-input
                  v-if="(prop as any).node.temporary_show_input==true"
                  v-model="(prop as any).node.temporary_label"
                  :rules="[
                    (val) => !/\/|\x00/.test(val) || 'No slash or null char',
                  ]"
                  dense
                  color="primary"
                  filled
                  autofocus
                  hide-bottom-space
                  @keyup.enter="createFolderMoveDialog(prop.node)"
                  placeholder="Folder Name"
                >
                  <template v-slot:after>
                    <q-btn
                      icon="done"
                      class="bg-green text-white"
                      push
                      size="sm"
                      round
                      @click="createFolderMoveDialog(prop.node)"
                    />
                    <q-btn
                      icon="close"
                      class="bg-red text-white"
                      push
                      size="sm"
                      round
                      @click="
                        (prop as any).node.temporary_show_input = false;
                        (prop as any).node.temporary_label = '';
                      "
                    />
                  </template>
                </q-input>
              </template> -->
            </q-tree>
          </q-scroll-area>
        </div>
        <q-separator />

        <q-card-actions class="q-mb-sm column">
          <div class="full-width">
            <a class="text-weight-bolder">New Folder: </a>
            {{ moveItemsSelectedPath }}
          </div>
          <div class="row full-width q-mt-sm">
            <q-btn
              v-close-popup
              push
              icon="close"
              label="Cancel"
              class="bg-red text-white col q-mr-xs"
            />
            <q-btn
              push
              class="bg-green text-white col q-ml-xs"
              icon="done"
              label="Move"
              @click="moveSelection"
            />
          </div>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- filterDialog -->
    <q-page-sticky v-if="filterDialog" position="top" style="z-index: 100">
      <q-card bordered flat style="width: 350px">
        <div class="q-ma-md">
          <q-input
            :color="darkmode ? 'white' : 'black'"
            v-model="filterSearch"
            input-class="text-left"
            style="width: 30%"
            label="Search"
            class="text-body1 full-width"
            outlined
            dense
          >
            <template v-slot:append>
              <q-icon v-if="filterSearch === ''" name="search" />
              <q-icon
                v-else
                name="clear"
                class="cursor-pointer"
                @click="filterSearch = ''"
              />
            </template>
          </q-input>
          <div class="row q-mt-md">
            <q-select
              :color="darkmode ? 'white' : 'black'"
              outlined
              v-model="filterSortBy"
              :options="filterSortByOptions"
              label="Sort by..."
              dense
              popup-content-style="z-index: 101"
              @update:model-value="sortRawFolderContent"
              style="width: 260px"
            />
            <q-btn
              icon="swap_vert"
              push
              class="bg-blue text-white q-ml-sm"
              style="width: 40px; height: 40px"
              @click="sortRawFolderContent(filterSortBy as any)"
            />
          </div>
        </div>

        <div style="height: 20px">
          <q-btn
            icon="close"
            class="bg-red text-white absolute-bottom-right"
            style="width: 15px; height: 15px"
            size="sm"
            unelevated
            @click="filterDialog = !filterDialog"
          />
        </div>
      </q-card>
    </q-page-sticky>

    <q-dialog v-model="uploadFilesDialog" persistent>
      <q-card bordered style="width: 350px; height: 500px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm">Upload Files </q-toolbar-title>
        </q-toolbar>

        <div class="q-ma-md">
          <div
            style="border: 2px dashed lightblue; height: 290px"
            class="q-mt-md"
            @drop.prevent="uploadFilesDialogAreaDrop"
            @dragover.prevent="
              (ev: DragEvent) => {
                if (ev.dataTransfer!.items.length > 0) {
                  if (ev.dataTransfer!.items[0].kind == 'file') {
                    uploadFilesDialogAreaDragover = true;
                  }
                }
              }
            "
            @dragenter.self="
              (ev: DragEvent) => {
                if (ev.dataTransfer!.items.length > 0) {
                  if (ev.dataTransfer!.items[0].kind == 'file') {
                    uploadFilesDialogAreaDragover = true;
                  }
                }
              }
            "
            @dragleave.prevent="
              (ev: DragEvent) => {
                if (ev.dataTransfer!.items.length > 0) {
                  if (ev.dataTransfer!.items[0].kind == 'file') {
                    uploadFilesDialogAreaDragover = false;
                  }
                }
              }
            "
            :class="uploadFilesDialogAreaDragover ? 'bg-blue' : ''"
          >
            <q-scroll-area class="row" style="height: 285px">
              <div
                v-if="uploadFilesDialogUploadMap.length == 0"
                class="text-center text-h6 q-mt-md"
              >
                Select some Files or Folders or Drag & Drop them here.
                <q-icon
                  name="ads_click"
                  :size="uploadFilesDialogAreaDragover ? '100px' : '50px'"
                  class="absolute-center q-mt-md"
                />
              </div>

              <q-list class="q-ma-xs">
                <template
                  v-for="file in uploadFilesDialogUploadMap"
                  :key="file"
                >
                  <q-card class="bg-primary text-layout-text q-mt-sm" flat>
                    <q-item
                      dense
                      clickable
                      @click="
                        file.temp = file.name;
                        file.edit = !file.edit;
                      "
                      class="bg-primary text-layout-text"
                    >
                      <q-item-section avatar class="q-pa-none">
                        <q-icon
                          :name="
                            file.type == 'file' ? 'file_present' : 'folder'
                          "
                        />
                      </q-item-section>
                      <q-item-section class="q-pa-none">
                        <q-item-label class="ellipsis" style="width: 165px">
                          {{ file.name }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          size="xs"
                          style="height: 10px"
                          icon="delete"
                          round
                          unelevated
                          outline
                          class="bg-red text-white q-ml-sm"
                          @click="
                            uploadFilesDialogUploadMap =
                              uploadFilesDialogUploadMap.filter(
                                (item) => item.name !== file.name
                              )
                          "
                        />
                      </q-item-section>
                    </q-item>
                    <div v-if="file.edit">
                      <q-input
                        v-model="file.temp"
                        :rules="[
                          (val) =>
                            !/\/|\x00/.test(val) || 'No slash or null char',
                        ]"
                        dense
                        color="layout-text"
                        filled
                        autofocus
                        input-class="text-layout-text"
                        hide-bottom-space
                      >
                        <template v-slot:append>
                          <q-btn
                            icon="done"
                            class="bg-green text-white"
                            unelevated
                            outline
                            size="xs"
                            round
                            @click="
                              if (!/\/|\x00/.test(file.temp as string)) {
                                if (
                                  checkNameExistFolderContext(
                                    file.temp as string
                                  ) == false &&
                                  checkNameExistUploadContext(
                                    file.temp as string,
                                    file.name
                                  ) == false
                                ) {
                                  file.name = file.temp as string;
                                  file.edit = false;
                                } else {
                                  notify('negative', 'Name already exists');
                                }
                              }
                            "
                          />
                          <q-btn
                            icon="close"
                            class="bg-red text-white"
                            unelevated
                            outline
                            size="xs"
                            round
                            @click="
                              file.edit = false;
                              file.temp = '';
                            "
                          />
                        </template>
                      </q-input>
                    </div>
                  </q-card>
                </template>
              </q-list>
            </q-scroll-area>
          </div>
          <div class="row justify-between q-mt-sm">
            <div class="row">
              <q-file
                unelevated
                dense
                label-slot
                multiple
                v-model="uploadFilesDialogFiles"
                @update:model-value="appendFiles"
                color="white"
                class="bg-primary text-layout-text rounded-borders q-mr-md"
                label-color="white"
              >
                <template v-slot:label>
                  <div class="text-body1 q-ml-sm items-center">
                    <q-icon name="add" size="24px" />
                    <a class="q-ml-sm">Select Files</a>
                  </div>
                </template>
              </q-file>
            </div>
            <div style="height: 25px; width: 35px">
              <q-btn
                style="height: 25px; width: 35px"
                @click="uploadFilesDialogUploadMap = []"
                icon="delete"
                size="xs"
                class="bg-red text-white"
                push
                v-if="uploadFilesDialogUploadMap.length > 0"
              />
            </div>
          </div>
        </div>

        <q-separator class="q-mt-sm" />

        <q-card-actions align="evenly" class="q-mt-sm q-mb-sm row">
          <q-btn
            v-close-popup
            push
            icon="close"
            label="Close"
            class="bg-red text-white col-4"
            style="height: 45px"
            @click="uploadFilesDialogUploadMap = []"
          />
          <q-btn
            v-close-popup
            push
            class="bg-green text-white col"
            icon="done"
            size="md"
            label="Upload"
            @click="
              uploadFiles(uploadFilesDialogUploadMap, rawFolderContent.id);
              uploadFilesDialogUploadMap = [];
            "
            style="width: 210px; height: 45px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page class="column q-mr-xs q-ml-xs" :style-fn="styleFn">
      <div class="q-mt-sm" @dragover.stop.prevent="" @drop.prevent="">
        <q-toolbar class="q-pa-none">
          <!-- navbar toolbar -->

          <div
            style="
              font-size: 20px;
              overflow: hidden;
              text-overflow: clip;
              white-space: nowrap;
              display: inline;
            "
            :style="navBarWidth"
            class="row"
            ref="navbar"
          >
            <q-item
              clickable
              flat
              class="rounded-borders text-primary text-weight-bold text-h5 q-ml-sm"
              @click="getFolderNavbar({ name: '', id: '' }, 0)"
              @v-drag-enter="
               (e: any, x: any, y: any) => y.target.classList.add('bg-indigo-11')
              "
              @v-drag-over="(e: any, x: any, y: any) => y.target.classList.add('bg-indigo-11')"
              @v-drag-leave="
                (e: any, x: any, y: any) => y.target.classList.remove('bg-indigo-11')
              "
              @v-drag-drop="
                changeParentDragNDrop($event, navbarIndex.homeFolderId)
              "
              v-droppable
              style="display: inline-block"
            >
              <q-icon
                color="primary"
                name="home"
                class="full-width full-height no-pointer-events"
              />
            </q-item>
            <a v-if="navbarIndex.menuItems.length != 0">/</a>
            <q-item
              clickable
              flat
              class="rounded-borders text-primary text-weight-bold text-h5"
              v-if="navbarIndex.menuItems.length > 0"
              style="display: inline-block"
              @dragover="navbarOverflowMenuHover = true"
              @dragstop="navbarOverflowMenuHover = false"
            >
              <a class="no-pointer-events"> ... </a>
              <q-menu
                v-model="navbarOverflowMenuHover"
                @mouseleave="navbarOverflowMenuHover = false"
                class="no-shadow"
              >
                <q-card
                  flat
                  bordered
                  style="min-width: 150px; max-width: 250px"
                >
                  <q-separator
                    size="1px"
                    :color="darkmode ? 'white' : 'dark'"
                  />
                  <template v-for="item in navbarIndex.menuItems" :key="item">
                    <q-item
                      clickable
                      class="text-primary text-weight-bold text-h6"
                      @click="getFolderNavbar(item, 1)"
                      @v-drag-enter="
                       (e: any, x: any, y: any) => y.target.classList.add('bg-indigo-11')
                      "
                      @v-drag-over="
                        (e: any, x: any, y: any) => y.target.classList.add('bg-indigo-11')
                      "
                      @v-drag-leave="
                        (e: any, x: any, y: any) => y.target.classList.remove('bg-indigo-11')
                      "
                      @v-drag-drop="changeParentDragNDrop($event, item.id)"
                      v-droppable
                    >
                      <div class="no-pointer-events ellipsis">
                        {{ item.name }}
                      </div>
                      <q-tooltip
                        class="text-body1 bg-layout-bg text-layout-text"
                      >
                        {{ item.name }}
                      </q-tooltip>
                    </q-item>
                    <q-separator
                      size="1px"
                      :color="darkmode ? 'white' : 'dark'"
                    />
                  </template>
                </q-card>
              </q-menu>
            </q-item>
            <template v-for="item in navbarIndex.navbarItems" :key="item">
              <a class="text-weight-bolder">/</a>
              <q-item
                clickable
                flat
                class="rounded-borders text-primary text-weight-bold text-h5"
                @click="getFolderNavbar(item, 2)"
                @v-drag-enter="
                  (e: any, x: any, y: any) => y.target.classList.add('bg-indigo-11')
                "
                @v-drag-over="
                  (e: any, x: any, y: any) => y.target.classList.add('bg-indigo-11')
                "
                @v-drag-leave="
                  (e: any, x: any, y: any) => y.target.classList.remove('bg-indigo-11')
                "
                @v-drag-drop="changeParentDragNDrop($event, item.id)"
                v-droppable
                style="display: inline-block"
              >
                <a class="no-pointer-events ellipsis">
                  {{ item.name }}
                </a>
              </q-item>
            </template>
          </div>
        </q-toolbar>
        <q-toolbar class="q-mt-sm">
          <q-checkbox
            v-model="allSelected"
            color="green"
            class="q-ml-xs"
            @click="selectAllItems"
          />

          <!-- toolbar on larger screens -->

          <div class="row gt-xs full-width">
            <q-fab
              push
              icon="add"
              direction="down"
              class="q-ml-md"
              color="light-green"
              round
              padding="none"
              style="height: 40px; width: 40px; z-index: 1"
            >
              <q-fab-action
                outline
                class="text-body1 bg-light-green"
                text-color="white"
                icon="note_add"
                label="New File"
                @click="createFileDialog = true"
                style="width: 180px"
              />
              <q-fab-action
                outline
                class="text-body1 bg-light-green"
                text-color="white"
                icon="create_new_folder"
                label="New Folder"
                @click="newFolder.show = true"
                style="width: 180px"
              />
              <q-fab-action
                push
                @click="uploadFilesDialog = true"
                icon="file_upload"
                label="Upload Files"
                class="text-body1 bg-light-green"
                text-color="white"
                style="width: 180px"
                outline
              />
            </q-fab>

            <q-space />

            <q-input
              :color="darkmode ? 'white' : 'black'"
              v-model="filterSearch"
              input-class="text-left"
              label="Search"
              class="text-body1 col q-ml-md"
              outlined
              dense
              style="max-width: 400px"
            >
              <template v-slot:append>
                <q-icon v-if="filterSearch === ''" name="search" />
                <q-icon
                  v-else
                  name="clear"
                  class="cursor-pointer"
                  @click="filterSearch = ''"
                />
              </template>
              <template v-slot:after>
                <q-btn
                  push
                  dense
                  icon="search"
                  class="bg-primary text-white"
                  @click="filterDialog = !filterDialog"
                  style="height: 40px; width: 65px"
                />
              </template>
            </q-input>

            <q-space />
            <div style="width: 130px" class="q-ml-md q-mr-sm">
              <q-fab
                push
                icon="check_box"
                active-icon="expand_more"
                direction="down"
                color="cyan-14"
                :label="
                  selectedItems.length +
                  ' Item' +
                  (selectedItems.length > 1 ? 's' : '')
                "
                v-if="selectedItems.length > 0"
                padding="none"
                style="height: 40px; width: 140px; z-index: 1"
              >
                <q-fab-action
                  class="text-body1 bg-blue"
                  text-color="white"
                  outline
                  label="Move"
                  icon="trending_flat"
                  @click="
                    moveSelectedItemsDialog = true;
                    fetchAllAvailableFolders();
                  "
                  style="width: 150px"
                />
                <q-fab-action
                  class="text-body1 bg-red"
                  text-color="white"
                  outline
                  icon="close"
                  label="Delete"
                  @click="deleteItemsDialog = true"
                  style="width: 150px"
                />
              </q-fab>
            </div>
          </div>

          <!-- toolbar on small screens -->
          <div class="row lt-sm full-width">
            <q-fab
              push
              icon="add"
              direction="down"
              class="q-mr-sm q-ml-md"
              color="light-green"
              padding="sm"
              style="z-index: 1"
            >
              <q-fab-action
                class="text-body1 bg-light-green"
                text-color="white"
                outline
                icon="note_add"
                label="New File"
                @click="createFileDialog = true"
                style="width: 180px"
                padding="sm"
              />

              <q-fab-action
                class="text-body1 bg-light-green"
                text-color="white"
                outline
                icon="create_new_folder"
                label="New Folder"
                @click="newFolder.show = true"
                style="width: 180px"
                padding="sm"
              />

              <q-fab-action
                @click="uploadFilesDialog = true"
                icon="file_upload"
                label="Upload Files"
                class="text-body1 bg-light-green"
                text-color="white"
                style="width: 180px"
                outline
                padding="sm"
              />
            </q-fab>
            <q-input
              :color="darkmode ? 'white' : 'black'"
              v-model="filterSearch"
              input-class="text-left"
              label="Search"
              class="text-body1 col q-ml-sm"
              outlined
              dense
            >
              <template v-slot:append>
                <q-icon v-if="filterSearch === ''" name="search" />
                <q-icon
                  v-else
                  name="clear"
                  class="cursor-pointer"
                  @click="filterSearch = ''"
                />
              </template>
              <template v-slot:after>
                <q-btn
                  push
                  dense
                  icon="search"
                  class="bg-primary text-white"
                  @click="filterDialog = !filterDialog"
                  style="height: 40px; width: 50px"
                />
              </template>
            </q-input>

            <div class="q-ml-md q-mr-sm" style="width: 80px">
              <q-fab
                push
                icon="check_box"
                :label="selectedItems.length"
                active-icon=" expand_more"
                direction="down"
                color="cyan-14"
                v-if="selectedItems.length > 0"
                padding="none"
                style="height: 40px; width: 80px; z-index: 1"
              >
                <q-fab-action
                  class="text-body1 bg-blue"
                  text-color="white"
                  outline
                  label="Move"
                  icon="trending_flat"
                  @click="
                    moveSelectedItemsDialog = true;
                    fetchAllAvailableFolders();
                  "
                  style="width: 110px"
                />
                <q-fab-action
                  class="text-body1 bg-red"
                  text-color="white"
                  outline
                  icon="close"
                  label="Delete"
                  @click="deleteItemsDialog = true"
                  style="width: 110px"
                />
              </q-fab>
            </div>
          </div>
        </q-toolbar>

        <!-- column descriptions/sorting on large screens only -->
        <div class="row gt-xs">
          <q-item-section avatar class="q-ml-lg" />
          <q-item-section avatar>
            <q-btn
              align="left"
              size="sm"
              dense
              flat
              style="width: 50px"
              @click="sortRawFolderContent({ label: '', value: 1 })"
            >
              Type
              <q-icon
                v-if="filterState.type != 0"
                :name="
                  filterState.type == 1 ? 'arrow_upward' : 'arrow_downward'
                "
                class="q-ml-xs"
              />
            </q-btn>
          </q-item-section>

          <q-item-section :style="'min-width:' + itemTextWidth + 'px;'">
            <q-btn
              align="left"
              size="sm"
              dense
              flat
              :style="'width:' + itemTextWidth + 'px;'"
              @click="sortRawFolderContent({ label: '', value: 2 })"
            >
              Name
              <q-icon
                v-if="filterState.name != 0"
                :name="
                  filterState.name == 1 ? 'arrow_upward' : 'arrow_downward'
                "
                class="q-ml-md"
              />
            </q-btn>
          </q-item-section>
          <q-item-section>
            <q-btn
              align="left"
              size="sm"
              dense
              flat
              class="full-width"
              @click="sortRawFolderContent({ label: '', value: 5 })"
            >
              Size
              <q-icon
                v-if="filterState.size != 0"
                :name="
                  filterState.size == 1 ? 'arrow_upward' : 'arrow_downward'
                "
                class="q-ml-md"
              />
            </q-btn>
          </q-item-section>
          <q-item-section>
            <q-btn
              align="left"
              size="sm"
              dense
              flat
              class="full-width"
              @click="sortRawFolderContent({ label: '', value: 4 })"
            >
              Modified
              <q-icon
                v-if="filterState.modified != 0"
                :name="
                  filterState.modified == 1 ? 'arrow_upward' : 'arrow_downward'
                "
                class="q-ml-md"
              />
            </q-btn>
          </q-item-section>

          <q-item-section side class="q-mr-md">
            <div style="width: 50px" />
          </q-item-section>
        </div>

        <q-separator size="2px" color="primary" />
      </div>
      <div class="row justify-center" v-if="scrollShow.top">
        <q-btn
          icon="arrow_upward"
          size="lg"
          color="primary"
          round
          class="absolute"
          style="z-index: 50; width: 60px; height: 60px"
          @dragover.prevent="scrollUp"
        />
      </div>
      <q-scroll-area
        class="col"
        ref="mainScrollArea"
        :class="scrollAreaDragover ? 'bg-cyan-14' : ''"
        @drop.prevent.stop="
            (ev: DragEvent) => {
              if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
                if (ev.dataTransfer.items[0].kind == 'file') {
                  uploadFilesDialogAreaDrop(ev);
                  uploadFilesDialog = true;
                  scrollAreaDragover = false;
                }
              }
            }
          "
        @dragover.prevent="
            (ev: DragEvent) => {
              if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
                if (ev.dataTransfer.items[0].kind == 'file') {
                  scrollAreaDragover = true;
                }
              }
            }
          "
        @dragenter.self="
            (ev: DragEvent) => {
              if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
                if (ev.dataTransfer.items[0].kind == 'file') {
                  scrollAreaDragover = true;
                }
              }
            }
          "
        @dragleave.prevent="
            (ev: DragEvent) => {
              if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
                if (ev.dataTransfer.items[0].kind == 'file') {
                  scrollAreaDragover = false;
                }
              }
            }
          "
      >
        <div v-if="newFolder.show">
          <q-item
            class="full-width rounded-borders"
            style="background-color: rgba(60, 177, 60, 0.801)"
          >
            <q-item-section avatar top class="no-pointer-events">
              <q-avatar
                icon="folder"
                color="transparent"
                text-color="primary"
                size="4.5em"
                style="height: 40px"
              />
            </q-item-section>

            <q-item-section>
              <q-input
                dark
                outlined
                dense
                color="white"
                v-model="newFolder.name"
                label="New Folder Name"
                class="text-body1 q-ml-md"
                input-class="text-body2"
                clearable
                @keyup.enter="createFolder"
                ref="newItemInput"
                hide-bottom-space
                autofocus
              >
              </q-input>
            </q-item-section>
            <q-item-section side>
              <div class="row">
                <q-btn
                  icon="done"
                  class="q-ml-md bg-green text-white"
                  round
                  flat
                  @click="createFolder"
                />
                <q-btn
                  icon="close"
                  class="q-ml-md bg-red text-white"
                  round
                  flat
                  @click="
                    newFolder.show = false;
                    newFolder.name = '';
                  "
                />
              </div>
            </q-item-section>
          </q-item>
          <q-separator size="2px" color="light-green" />
        </div>
        <template v-for="item in rawFolderContent.children" :key="item">
          <!--  Search filtering, only by name for now -->
          <div
            v-if="
              filterSearch == '' ||
              item.name.toLowerCase().includes(filterSearch)
            "
          >
            <!-- Folder Items -->
            <div v-if="item.type == 'folder'">
              <q-item
                clickable
                @click="getFolderId(item.id, true)"
                class="rounded-borders full-width"
                v-droppable
                v-draggable="['folder', item.id]"
                :class="[
                    (item as FolderEntryType).drag_over ? 'bg-indigo-11' : '',
                    item.selected ? 'bg-cyan-14 text-white' : '',
                  ]"
                @drag="showScroll"
                @dragend="hideScroll"
                @v-drag-enter="
                    (ev: string[]) => {
                      if (ev[1] != item.id) {
                        (item as FolderEntryType).drag_over = true;
                      }
                    }
                  "
                @v-drag-leave="(item as FolderEntryType).drag_over = false"
                @v-drag-over="
                    (ev: string[]) => {
                      if (ev[1] != item.id) {
                        (item as FolderEntryType).drag_over = true;
                      }
                    }
                  "
                @v-drag-drop="changeParentDragNDrop($event, item.id)"
                @drop.prevent.self.stop="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          onFolderDrop(ev, item.id);
                          (item as FolderEntryType).drag_over = false;
                        }
                      }
                    }
                  "
                @dragover.prevent.self.stop="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          (item as FolderEntryType).drag_over = true;
                        }
                      }
                    }
                  "
                @dragenter.prevent="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          (item as FolderEntryType).drag_over = true;
                        }
                      }
                    }
                  "
                @dragleave.prevent="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          (item as FolderEntryType).drag_over = false;
                        }
                      }
                    }
                  "
              >
                <q-popup-proxy
                  context-menu
                  :breakpoint="0"
                  @before-show="
                    clearSelectedItems();
                    allSelected = false;
                    item.selected = true;
                  "
                  @before-hide="
                    selectedItems.indexOf(item) == -1
                      ? (item.selected = false)
                      : (item.selected = true)
                  "
                >
                  <RightClickMenu
                    :propItem="item"
                    @moveItem="
                      () => {
                        clearSelectedItems();
                        fetchAllAvailableFolders();
                        moveSelectedItemsDialog = true;
                        selectedItems.push(item);
                      }
                    "
                    @deleteItem="
                      () => {
                        deleteObj(item.id, item.type);
                      }
                    "
                  />
                </q-popup-proxy>

                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedItems"
                    :val="item"
                    color="green"
                    @click="
                      selectedItems.indexOf(item) == -1
                        ? (item.selected = false)
                        : (item.selected = true)
                    "
                  />
                </q-item-section>
                <q-item-section avatar top style="pointer-events: none">
                  <q-avatar
                    icon="folder"
                    color="transparent"
                    text-color="primary"
                    size="4.5em"
                    style="height: 40px"
                  />
                </q-item-section>
                <q-item-section
                  :style="'min-width:' + itemTextWidth + 'px;'"
                  style="pointer-events: none"
                  class="row"
                >
                  <q-item-label
                    class="item_text ellipsis"
                    :style="'--max-width: ' + itemTextWidth + 'px;'"
                  >
                    <q-icon name="share" v-if="item.shared" />
                    {{ item.name }}</q-item-label
                  >
                </q-item-section>

                <q-item-section
                  class="text-caption gt-xs"
                  style="pointer-events: none"
                  >-</q-item-section
                >

                <q-item-section
                  class="text-caption gt-xs"
                  style="pointer-events: none"
                >
                  {{ item.modified }}
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    icon="more_vert"
                    flat
                    :loading="loading"
                    @click.prevent.stop
                    round
                  >
                    <q-menu>
                      <RightClickMenu
                        :propItem="item"
                        @moveItem="
                          () => {
                            clearSelectedItems();
                            fetchAllAvailableFolders();
                            moveSelectedItemsDialog = true;
                            selectedItems.push(item);
                          }
                        "
                        @deleteItem="
                          () => {
                            deleteObj(item.id, item.type);
                          }
                        "
                      />
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </div>

            <!-- File Items -->

            <div v-else>
              <q-item
                clickable
                class="rounded-borders full-width"
                v-draggable="['file', item.id]"
                @click="openInNewTab(item)"
                :class="item.selected ? 'bg-cyan-14 text-white' : ''"
                @drag="showScroll"
                @dragend="hideScroll"
              >
                <q-popup-proxy
                  context-menu
                  :breakpoint="0"
                  @before-show="
                    clearSelectedItems();
                    allSelected = false;
                    item.selected = true;
                  "
                  @before-hide="
                    selectedItems.indexOf(item) == -1
                      ? (item.selected = false)
                      : (item.selected = true)
                  "
                >
                  <RightClickMenu
                    :propItem="item"
                    @moveItem="
                      () => {
                        clearSelectedItems();
                        fetchAllAvailableFolders();
                        moveSelectedItemsDialog = true;
                        selectedItems.push(item);
                      }
                    "
                    @deleteItem="
                      () => {
                        deleteObj(item.id, item.type);
                      }
                    "
                  />
                </q-popup-proxy>
                <q-item-section avatar>
                  <q-checkbox
                    v-model="selectedItems"
                    :val="item"
                    color="green"
                    @click="
                      selectedItems.indexOf(item) == -1
                        ? (item.selected = false)
                        : (item.selected = true)
                    "
                  />
                </q-item-section>
                <q-item-section avatar top>
                  <q-avatar
                    :icon="getIcon(item.mime)"
                    color="transparent"
                    text-color="primary"
                    size="4.5em"
                    style="height: 40px"
                  />
                </q-item-section>

                <q-item-section :style="'min-width:' + itemTextWidth + 'px;'">
                  <q-item-label
                    class="item_text ellipsis"
                    :style="'width: ' + itemTextWidth + 'px;'"
                  >
                    <q-icon name="share" v-if="item.shared" />
                    {{ item.name }}</q-item-label
                  >
                </q-item-section>
                <q-item-section
                  class="text-caption gt-xs"
                  style="pointer-events: none"
                >
                  {{ (item as FolderEntryType).size }}
                </q-item-section>
                <q-item-section
                  class="text-caption gt-xs"
                  style="pointer-events: none"
                >
                  {{ item.modified }}
                </q-item-section>

                <q-item-section side>
                  <q-btn
                    icon="more_vert"
                    flat
                    round
                    :loading="loading"
                    @click.prevent.stop
                  >
                    <q-menu>
                      <RightClickMenu
                        :propItem="item"
                        @moveItem="
                          () => {
                            clearSelectedItems();
                            fetchAllAvailableFolders();
                            moveSelectedItemsDialog = true;
                            selectedItems.push(item);
                          }
                        "
                        @deleteItem="
                          () => {
                            deleteObj(item.id, item.type);
                          }
                        "
                      />
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
            </div>
            <q-separator
              @drop.stop.prevent=""
              @dragover.stop.prevent=""
              @dragenter.stop.prevent=""
            />
          </div>
        </template>
      </q-scroll-area>

      <q-btn
        v-if="scrollShow.bottom"
        icon="arrow_downward"
        size="lg"
        class="absolute-bottom"
        color="primary"
        round
        @dragover.prevent="scrollDown"
        style="
          z-index: 10000000;
          position: absolute;
          left: 50%;
          margin-left: -30px;
          width: 60px;
          height: 60px;
        "
      />

      <!-- Bottom Right Upload Progress -->

      <q-page-sticky position="bottom-right" style="z-index: 100">
        <q-btn
          icon="analytics"
          class="bg-primary text-white"
          unelevated
          size="sm"
          v-if="!progressSticky"
          @click="
            progressSticky = true;
            progressPanel = true;
          "
        />
        <q-card bordered style="width: 325px" v-if="progressSticky">
          <q-item
            class="bg-layout-bg text-layout-text row justify-center items-center"
            clickable
            dense
            @click="progressPanel = !progressPanel"
          >
            <q-icon color="layout-text" name="analytics" />
            <a class="text-layout-text q-ml-sm text-weight-bold"
              >Upload Progress</a
            >
            <div class="absolute-top-right">
              <q-btn
                icon="minimize"
                class="bg-light-blue text-white"
                style="width: 15px; height: 15px"
                size="xs"
                unelevated
                square
                @click.prevent.stop="progressPanel = false"
                v-if="progressPanel"
              />
              <q-btn
                square
                icon="close"
                class="bg-red text-white"
                style="width: 15px; height: 15px"
                size="xs"
                unelevated
                @click.prevent.stop="progressSticky = false"
              />
            </div>
          </q-item>
          <div class="row text-body1 q-ma-sm items-center">
            <div class="text-blue">
              {{
                progressPanelProgressMap.filter(
                  (obj) => obj.status == 'loading'
                ).length
              }}
              <q-icon name="hourglass_bottom" size="18px" class="q-ml-xs" />
            </div>
            <div class="q-ml-md text-green">
              {{
                progressPanelProgressMap.filter((obj) => obj.status == 'ok')
                  .length
              }}
              <q-icon name="done" size="18px" class="q-ml-xs" />
            </div>
            <div class="q-ml-md text-red">
              {{
                progressPanelProgressMap.filter((obj) => obj.status == 'error')
                  .length
              }}
              <q-icon name="warning" size="18px" class="q-ml-xs" />
            </div>
            <q-space />
            <q-btn
              v-if="progressPanel == true"
              icon="delete"
              size="sm"
              unelevated
              class="bg-red text-white"
              @click="
                progressPanelProgressMap = progressPanelProgressMap.filter(
                  (obj) => obj.status == 'loading'
                )
              "
            />
          </div>
          <q-card
            style="height: 300px"
            class="q-pa-none q-ma-none"
            v-if="progressPanel"
          >
            <q-separator size="2px" color="layout-bg" />
            <div class="q-ma-sm">
              <q-scroll-area class="row" style="height: 305px">
                <q-list>
                  <template
                    v-for="progress in progressPanelProgressMap"
                    :key="progress"
                  >
                    <div v-if="progress.status != ''">
                      <q-item
                        class="full-width text-white"
                        :class="progress.statusColor"
                        style="height: 10px"
                      >
                        <q-item-section avatar>
                          <q-icon :name="progress.typeIcon" size="sm" />
                          <div
                            class="q-ml-md text-body1 ellipsis"
                            style="width: 100px"
                          >
                            {{ progress.name }}

                            <q-tooltip
                              class="text-body1 bordered"
                              :class="
                                darkmode
                                  ? 'bg-dark text-white'
                                  : 'bg-white text-dark'
                              "
                            >
                              {{ progress.name }}
                            </q-tooltip>
                          </div>
                        </q-item-section>

                        <q-item-section no-wrap>
                          <q-linear-progress
                            size="25px"
                            :value="
                              progress.status == 'ok'
                                ? 1
                                : progress.transferredPercent
                            "
                            :color="
                              progress.status == 'error'
                                ? 'red-8'
                                : 'light-green'
                            "
                            dark
                            class="q-ml-md"
                            stripe
                          >
                            <div class="absolute-full flex flex-center">
                              <q-badge
                                :color="
                                  progress.status == 'error'
                                    ? 'red-8'
                                    : 'light-green'
                                "
                                class="text-body2"
                                text-color="white"
                                :label="
                                  progress.message
                                    ? 'Error'
                                    : transferedPercentLabel(
                                        progress.transferredPercent
                                      )
                                "
                              />
                            </div>
                            <q-tooltip
                              :class="
                                progress.message ? 'bg-red-8' : 'bg-blue-8'
                              "
                            >
                              <q-badge
                                class="text-body1 row justify-evenly bg-blue-8"
                                style="width: 200px"
                                v-if="!progress.message"
                              >
                                <div>
                                  {{ progress.transferred }}
                                </div>
                                <div>/</div>

                                <div>{{ progress.size }}</div>
                              </q-badge>
                              <q-badge
                                class="text-body1 row justify-evenly bg-red-8"
                                style="width: 200px"
                                v-if="progress.message"
                              >
                                <div>
                                  {{ progress.message }}
                                </div>
                              </q-badge>
                            </q-tooltip>
                          </q-linear-progress>
                        </q-item-section>

                        <q-item-section side class="q-ml-md">
                          <q-btn
                            v-if="progress.status == 'loading'"
                            icon="close"
                            class="text-white bg-red"
                            size="sm"
                            unelevated
                            round
                            @click="cancelRequest(progress)"
                          >
                            <q-tooltip class="text-body1 bg-red text-white">
                              Cancel
                            </q-tooltip>
                          </q-btn>
                          <q-btn
                            v-if="
                              progress.status == 'ok' ||
                              progress.status == 'error'
                            "
                            icon="done"
                            size="sm"
                            class="bg-white text-green"
                            unelevated
                            round
                            @click="
                              progressPanelProgressMap.splice(
                                progressPanelProgressMap.findIndex(
                                  ({ name }) => name == progress.name
                                ),
                                1
                              )
                            "
                          >
                            <q-tooltip class="text-body1 bg-green text-white">
                              Clear
                            </q-tooltip>
                          </q-btn>
                        </q-item-section>
                      </q-item>
                    </div>
                    <q-separator color="white" size="2px" />
                  </template>
                </q-list>
              </q-scroll-area>
            </div>
          </q-card>
        </q-card>
      </q-page-sticky>
    </q-page>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar, scroll, QInput } from 'quasar';
import { api } from 'boot/axios';
import { draggable, selected } from 'components/Files/draggable.js';
import { droppable } from 'components/Files/droppable.js';
import RightClickMenu from 'components/Files/RightClickMenu.vue';
import { FOLDER } from 'src/testdata/folder';
import ViewerWrapper from 'src/components/Files/ViewerWrapper.vue';
import { getIcon } from 'src/components/Files/mimeMap';

import type { Ref } from 'vue';
import type {
  TraverseFolderMapType,
  UploadProgressEntryType,
  FolderEntryType,
  UploadDialogEntryType,
  NavbarIndexType,
  AllAvailableFoldersType,
  RawFolderContentType,
} from 'src/types/index';

export default defineComponent({
  name: 'PrivateFolderView',
  directives: {
    draggable,
    droppable,
  },

  components: { RightClickMenu, ViewerWrapper },

  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };
    const { setVerticalScrollPosition } = scroll;

    const navbarIndex: Ref<NavbarIndexType> = ref({
      // holds the id of the home folder
      homeFolderId: '',
      // holds all items in the navbar; items={name: "www", id: "123"}
      navbarItems: [],
      // holds items in the menu if navbar is too big
      menuItems: [],
      lastMovedItemId: '',
    });

    return {
      getIcon,
      // icons

      // general
      selected,
      axiosConfig,
      localStore,
      q,
      setVerticalScrollPosition,

      // loading / initial load
      loading: ref(false),
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),

      // raw content including children of current folder
      rawFolderContent: ref(FOLDER) as Ref<RawFolderContentType>,

      // Dialog handlers when uploading files
      uploadFilesDialog: ref(false),
      uploadFilesDialogUploadMap: ref([]) as Ref<UploadDialogEntryType[]>,
      uploadFilesDialogAreaDragover: ref(false),
      uploadFilesDialogFiles: ref(null),

      // Bottom Progress Panel handlers when files are being uploaded -> shows state
      progressSticky: ref(false),
      progressPanel: ref(false),
      progressPanelProgressMap: ref([]) as Ref<UploadProgressEntryType[]>,

      // a unique id which every file gets when a folder is being uploaded
      // just counted up by one for each file for the page duration
      uniqueFolderUploadId: 0,

      // toolbar handlers
      navbarIndex,
      navbarOverflowMenuHover: ref(false),

      // filter / sorting
      filterDialog: ref(false),
      filterSearch: ref(''),
      filterSortBy: ref(null) as Ref<string | object | null>,
      filterSortByOptions: [
        {
          label: 'Type',
          value: 1,
        },
        {
          label: 'Alphabetically',
          value: 2,
        },
        {
          label: 'Created',
          value: 3,
        },
        {
          label: 'Last Changed',
          value: 4,
        },
        {
          label: 'Size',
          value: 5,
        },
        {
          label: 'Shared',
          value: 6,
        },
      ],

      // 0- not active, 1 active, 2 reversed
      filterState: ref({
        type: 0,
        name: 0,
        size: 0,
        modified: 0,
        created: 0,
        shared: 0,
      }),

      // selection handlers
      selectedItems: ref([]) as Ref<FolderEntryType[]>,
      allSelected: ref(false),

      // dragover
      scrollAreaDragover: ref(false),
      scrollShow: ref({ top: false, bottom: false }),

      // map of all folders the user has, used when moving items (given into q-tree)
      allAvailableFolders: ref([]) as Ref<AllAvailableFoldersType[]>,

      // dialog for moving selections
      moveSelectedItemsDialog: ref(false),

      moveItemsExpanded: ref(['']),
      moveItemsFilter: ref(''),
      moveItemsSelectedPath: ref(''),
      moveItemsSelectedId: ref(''),

      // delete items
      deleteItemsDialog: ref(false),

      // delete folder
      folderToDeleteUUID: ref(''),
      folderDeleteDialog: ref(false),

      // new folder handler
      newFolder: ref({
        show: false,
        name: '',
      }),

      // new file handler
      createFileDialog: ref(false),
      newFile: ref({
        name: '',
        mime: 'Unknown',
      }),
      mimeOptions: [
        {
          label: 'Text',
          value: 'text/plain',
        },
        {
          label: 'WYSIWYG (Rich Text Editor)',
          value: 'text/wysiwyg',
        },
        {
          label: 'Code',
          value: 'text/code',
        },
        {
          label: 'Unknown',
          value: 'Unknown',
        },
      ],

      // media preview
      mediaPreview: ref(false),
      mediaItem: ref({}) as Ref<FolderEntryType>,
    };
  },

  created() {
    this.getHomeFolder();
  },

  watch: {
    pathNames() {
      // this handles changes in the navbar
      // navbar is only supposed to be a single-line div with full screen space
      // if the path if too long, there wouldn't be enough space for it
      // this makes sure, that if the path is too long, the first items of the navbar
      // get pushed into a menu, (... item), which can be expanded to show all items in it
      // this also makes sure that when changing folders via click on the navbar, that
      // everything is handled correctly

      // wait for next tick, so clientWidth and scrollWidth are properly updated
      this.$nextTick(() => {
        var navbar = this.$refs.navbar as {
          clientWidth: number;
          scrollWidth: number;
        };
        var t = navbar.clientWidth;
        var l = navbar.scrollWidth;

        // if the width of the item is larger than the actual place for it
        // always show at least 1 item even if it's too large
        if (l > t && this.navbarIndex.navbarItems.length > 1) {
          // → handle overflowing navbar

          // check if the last element of the navbar isn't the last moved item
          // this is used to prevent an infinite loop
          var l = this.navbarIndex.navbarItems.length;
          var x = this.navbarIndex.navbarItems[l - 1];
          if (x.id != this.navbarIndex.lastMovedItemId) {
            // grab the first item of the navbar and push it to the menu list
            var removed = this.navbarIndex.navbarItems.shift() as {
              name: string;
              id: string;
            };
            this.navbarIndex.menuItems.push(removed);
            // set the moved element as the last moved element
            this.navbarIndex.lastMovedItemId = removed.id;
          }
        } else {
          // if the width of the item is smaller than the actual place for it
          // we may be able to clear items of the list which is created when content overflows
          if (this.navbarIndex.menuItems.length > 0) {
            // grab the last item of menuItems array
            var l = this.navbarIndex.menuItems.length;
            var x = this.navbarIndex.menuItems[l - 1];
            // check if that isn't the item that was moved in a previous run → prevent inf loop
            if (x.id != this.navbarIndex.lastMovedItemId) {
              // remove that item from the menuItems array and add it to the navbar Items
              var removed = this.navbarIndex.menuItems.shift() as {
                name: string;
                id: string;
              };
              this.navbarIndex.navbarItems.push(removed);
              this.navbarIndex.lastMovedItemId = removed.id;
            }
          }
        }
      });
    },
  },

  computed: {
    pathNames() {
      return this.navbarIndex.navbarItems.length;
    },

    darkmode() {
      return this.localStore.darkmode;
    },

    scrollAreaHeight() {
      var height = this.q.screen.height - 200;
      return { height: height + 'px' };
    },

    navBarWidth() {
      var width = this.q.screen.width - 65;
      return { width: width + 'px' };
    },

    itemTextWidth() {
      var width = this.q.screen.width / 3;
      return width;
    },
  },

  methods: {
    // mainScrollArea
    scrollUp() {
      var scrollArea = this.$refs.mainScrollArea as any;
      var currentPos = scrollArea.getScrollPosition().top;
      scrollArea.setScrollPosition('vertical', currentPos - 25);
    },

    scrollDown() {
      var scrollArea = this.$refs.mainScrollArea as any;
      var currentPos = scrollArea.getScrollPosition().top;
      scrollArea.setScrollPosition('vertical', currentPos + 25);
    },

    showScroll() {
      var scrollArea = this.$refs.mainScrollArea as any;
      var scrollPercent = scrollArea.getScrollPercentage().top;
      var scrollState = scrollArea.getScroll();
      if (scrollState.verticalSize == scrollState.verticalContainerSize) {
        this.scrollShow.top = false;
        this.scrollShow.bottom = false;
      } else if (scrollPercent == 1) {
        this.scrollShow.top = true;
        this.scrollShow.bottom = false;
      } else if (scrollPercent == 0) {
        this.scrollShow.top = false;
        this.scrollShow.bottom = true;
      } else {
        this.scrollShow.top = true;
        this.scrollShow.bottom = true;
      }
    },

    hideScroll() {
      this.scrollShow.top = false;
      this.scrollShow.bottom = false;
    },

    log(something: any) {
      console.log(something);
    },

    // get Home folder
    getHomeFolder() {
      this.loading = true;
      api
        .get('/files/home', this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.navbarIndex.homeFolderId = response.data.id;
            this.initialFetch = true;
            this.initialFetchSuccessful = true;
            this.loading = false;
            this.selectedItems = [];
            this.allSelected = false;
            this.resetFilterState();
          } else {
            this.initialFetch = true;
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.initialFetch = true;
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    ///////////////////////////////////////////////////
    /////////// FILTER  //////////////////////////////
    ///////////////////////////////////////////////////

    resetFilterState() {
      this.filterState.type = 0;
      this.filterState.modified = 0;
      this.filterState.name = 0;
      this.filterState.size = 0;
    },

    /**
     * Sort content of current folder context
     * Label isn't important → Only for Q-Select.
     *
     * value mapping:
     *
     * 1 - sort by type
     *
     * 2 - sort by name (alphabetically)
     *
     * 3 - sort by created time
     *
     * 4 - sort by modified time
     *
     * 5 - sort by size
     *
     * 6 - sort by shared status
     *
     * @param   type - object: → name: string, value: number
     */
    sortRawFolderContent(type: { label: string; value: number }) {
      var type_val = type.value;
      if (type_val == 1) {
        if (this.filterState.type == 1) {
          // reversed type (type is sorted alphabetically, just to group)
          this.rawFolderContent.children
            .sort((a: FolderEntryType) => (a.type != 'folder' ? 1 : 0))
            .reverse();
          this.resetFilterState();
          this.filterState.type = 2;
        } else {
          // by type
          this.rawFolderContent.children.sort((a: FolderEntryType) =>
            a.type != 'folder' ? 1 : 0
          );
          this.resetFilterState();
          this.filterState.type = 1;
        }
      } else if (type_val == 2) {
        if (this.filterState.name == 1) {
          // reversed alphabetically
          this.rawFolderContent.children
            .sort((a: FolderEntryType, b: FolderEntryType) =>
              a.name.localeCompare(b.name)
            )
            .reverse();
          this.resetFilterState();

          this.filterState.name = 2;
        } else {
          // alphabetically
          this.rawFolderContent.children.sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.name.localeCompare(b.name)
          );
          this.resetFilterState();

          this.filterState.name = 1;
        }
      } else if (type_val == 3) {
        if (this.filterState.created == 1) {
          // reversed created (item which was created first is shown first)
          this.rawFolderContent.children
            .sort((a: FolderEntryType, b: FolderEntryType) =>
              a.created_iso.localeCompare(b.created_iso)
            )
            .reverse();
          this.resetFilterState();
          this.filterState.created = 2;
        } else {
          // created (item which was created last is shown first)
          this.rawFolderContent.children
            .sort((a: FolderEntryType, b: FolderEntryType) =>
              a.created_iso.localeCompare(b.created_iso)
            )
            .reverse();
          this.resetFilterState();
          this.filterState.created = 1;
        }
        this.resetFilterState();
      } else if (type_val == 4) {
        if (this.filterState.modified == 1) {
          // by modified time reversed (oldest file is first)
          this.rawFolderContent.children.sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.modified_iso.localeCompare(b.modified_iso)
          );
          this.resetFilterState();

          this.filterState.modified = 2;
        } else {
          // by modified time (newest file is first)
          this.rawFolderContent.children
            .sort((a: FolderEntryType, b: FolderEntryType) =>
              a.modified_iso.localeCompare(b.modified_iso)
            )
            .reverse();
          this.resetFilterState();

          this.filterState.modified = 1;
        }
      } else if (type_val == 5) {
        if (this.filterState.size == 1) {
          // size, smallest first (folders are always 0, so first here)
          this.rawFolderContent.children
            .sort(
              (a: FolderEntryType, b: FolderEntryType) =>
                a.size_bytes - b.size_bytes
            )
            .reverse();
          this.resetFilterState();

          this.filterState.size = 2;
        } else {
          // size, largest first
          this.rawFolderContent.children.sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.size_bytes - b.size_bytes
          );
          this.resetFilterState();

          this.filterState.size = 1;
        }
      } else if (type_val == 6) {
        if (this.filterState.shared == 1) {
          // shared reverse (not shared first)
          this.rawFolderContent.children.sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.shared === b.shared ? 0 : a.shared ? 1 : -1
          );
          this.resetFilterState();
          this.filterState.shared = 2;
        } else {
          // shared (shared items first)
          this.rawFolderContent.children.sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.shared === b.shared ? 0 : a.shared ? -1 : 1
          );
          this.resetFilterState();
          this.filterState.shared = 1;
        }
      }
    },

    ///////////////////////////////////////////////////
    /////////// FILE UPLOAD //////////////////////////
    ///////////////////////////////////////////////////

    // cancel the upload of an file
    cancelRequest(progress: UploadProgressEntryType) {
      progress.abort.cancel();
      progress.transferredPercent = 1;
      progress.transferred = 'ERROR';
      progress.status = 'ok';
    },

    // picking files via the pick files selector and adding it to the uploadMap
    appendFiles(files: File[]) {
      for (var file of files) {
        var fileName = file.name;

        var returnVal = this.findValidName(fileName, 'file');

        while (returnVal[0] != 0) {
          returnVal = this.findValidName(returnVal[1], 'file');
        }

        var uploadMapObject: UploadDialogEntryType = {
          name: returnVal[1],
          content: file,
          type: 'file',
        };

        this.uploadFilesDialogUploadMap.push(uploadMapObject);

        this.uploadFilesDialogFiles = null;
      }
    },

    // get the real FileObject of an file
    async getFile(fileEntry: FileSystemFileEntry) {
      return new Promise((resolve, reject) => fileEntry.file(resolve, reject));
    },

    transferedPercentLabel(num: number) {
      if (num > 0.99) {
        return '100%';
      } else {
        return Math.round(num * 100) + '%';
      }
    },

    // run (recursively) trough a folder, mapping files and directories with IDs
    // view uploadFiles comment for more Info
    async traverseFolder(
      folder: FileSystemDirectoryEntry,
      returnArray: TraverseFolderMapType[],
      parentId: number
    ) {
      // remember the parent id, because we increment it if we find
      // a folder, which would brick the ids of files coming after
      await new Promise(async (resolve) => {
        var rememberParent = parentId;
        var directoryReader = folder.createReader();
        directoryReader.readEntries(async (entries: FileSystemEntry[]) => {
          for (var entry of entries) {
            this.uniqueFolderUploadId += 1;

            if (
              entry.isDirectory &&
              entry instanceof FileSystemDirectoryEntry
            ) {
              // handle folders

              // increment the parentid, which will result in a unique
              // id for each folder
              var uniqueFolderId = (parentId += 1);
              var folderStructure: TraverseFolderMapType = {
                type: 'folder',
                id: this.uniqueFolderUploadId,
                name: entry.name,
                folder_id: uniqueFolderId,
                parent_id: rememberParent,
              };
              returnArray.push(folderStructure);
              // recursively call this function again to check for content
              // in this folder
              await this.traverseFolder(entry, returnArray, uniqueFolderId);
            } else if (entry.isFile && entry instanceof FileSystemFileEntry) {
              // handle files
              let fileEntity: TraverseFolderMapType = {
                type: 'file',
                id: this.uniqueFolderUploadId,
                name: entry.name,
                entry: entry,
                parent_id: rememberParent,
              };
              returnArray.push(fileEntity);
            }
          }
          resolve(true);
        });
      });
    },

    // upload Files and Folders to parentFolderId
    // takes an uploadMap, which is an array of files/folders to be uploaded
    // if it is an folder, the folder is traversed and all child-elements are uploaded as well
    // because the data that is sent is FormData (flat array data)
    // an id is added to each file and folder, which maps them correctly to their parent element
    // folders have folderids (their own id) and parentids (the folderid of the parent)
    // files only have parentids (the folderid of the parent)
    // on top of that each folder and file has a unique id as well, which is needed to map the form-data correctly
    // e.g. 1_name : hello.txt, 1_parentid = xyz, etc.
    async uploadFiles(
      uploadMap: UploadDialogEntryType[],
      parentFolderId: string
    ) {
      this.progressPanel = true;
      this.progressSticky = true;
      var copyOfUploadMap = uploadMap;
      copyOfUploadMap.forEach(async (item) => {
        if (item.type == 'folder') {
          let source = this.$axios.CancelToken.source();

          var folderProgress: UploadProgressEntryType = reactive({
            name: item.name,
            typeIcon: 'folder',
            status: 'loading',
            statusColor: 'bg-blue',
            message: '',
            abort: source,
            size: '0B',
            transferred: '0B',
            transferredPercent: 0,
          });

          this.progressPanelProgressMap.push(folderProgress);

          // create the first structure
          // parent_id 0 means that this is the main folder being uploaded to
          // folder_id is only available on folders
          // if an item is a child of folder with folder_id x the parent_id will be x
          // id is a unique id to differentiate formdata
          var folderId = 1;

          var folder: TraverseFolderMapType = {
            type: 'folder',
            id: this.uniqueFolderUploadId,
            name: item.name,
            folder_id: folderId,
            parent_id: 0,
          };

          var folderDirectory = [] as TraverseFolderMapType[];
          folderDirectory.push(folder);

          // get all items in the folder and create a structure with ids
          // fills the folderDirectory as a flat array
          await this.traverseFolder(
            item.content as FileSystemDirectoryEntry,
            folderDirectory,
            folderId
          );

          var folderSizeByte = 0;
          var folderEntries = 0;

          // append the formData
          let form_data = new FormData();
          form_data.append('currentfolder', parentFolderId);
          for (var thing of folderDirectory) {
            if (thing.type == 'folder') {
              form_data.append(thing.id + '_type', 'folder');
              form_data.append(thing.id + '_name', thing.name);
              form_data.append(
                thing.id + '_folderid',
                (thing.folder_id as number).toString()
              );
              form_data.append(
                thing.id + '_parentid',
                thing.parent_id.toString()
              );
            } else {
              let file = (await this.getFile(
                thing.entry as FileSystemFileEntry
              )) as File;
              form_data.append(thing.id + '_type', 'file');
              form_data.append(thing.id + '_name', thing.name);
              form_data.append(thing.id + '_content', file as Blob);
              form_data.append(thing.id + '_size', file.size.toString());
              form_data.append(
                thing.id + '_parentid',
                thing.parent_id.toString()
              );
              folderSizeByte += file.size;
            }
            folderEntries += 1;
          }
          // don't upload folders larger than 500MiB
          if (folderSizeByte > 524288000) {
            folderProgress.status = 'error';
            folderProgress.statusColor = 'bg-red';
            folderProgress.transferredPercent = 0.0;
            folderProgress.message = 'Folder too large (>500MiB).';
            this.notify(
              'negative',
              'Folder exceeds the maximum upload limit of 500MiB.'
            );
            return;
          }
          // dont upload folders that contain too many children
          if (folderEntries > 1000) {
            folderProgress.status = 'error';
            folderProgress.statusColor = 'bg-red';
            folderProgress.transferredPercent = 0.0;
            folderProgress.message = 'Folder contains too many items (>1000).';
            this.notify(
              'negative',
              'Folder exceeds the maximum entry limit of 1000 Files.'
            );
            return;
          }
          folderProgress.size = this.fileSizeIEC(folderSizeByte);

          let config = {
            withCredentials: true,
            onUploadProgress: (progressEvent: ProgressEvent) => {
              folderProgress.transferred = this.fileSizeIEC(
                progressEvent.loaded
              );
              folderProgress.transferredPercent = (progressEvent.loaded /
                folderSizeByte) as number;
            },
            cancelToken: source.token,
            headers: {
              'X-CSRFToken': this.q.cookies.get('csrftoken'),
              'Content-Type': 'multipart/form-data',
            },
          };

          var response = await api
            .post('/files/upload/folder', form_data, config as any)
            .catch((error) => {
              folderProgress.status = 'error';
              folderProgress.statusColor = 'bg-red';
              folderProgress.transferredPercent = 0.0;
              if (error.response) {
                folderProgress.message = error.response.data.error;
              } else {
                folderProgress.message = error.message;
              }
            });
          if (response !== undefined) {
            folderProgress.status = 'ok';
            folderProgress.transferredPercent = 1.0;
            folderProgress.statusColor = 'bg-green';
            this.refreshFolder();
          }
        } else if (item.type == 'file' && item.content instanceof File) {
          let form_data = new FormData();
          var file = item.content;
          var itemSize = file.size;

          form_data.append('name', item.name);
          form_data.append('parent_id', parentFolderId);
          form_data.append('file', file);
          form_data.append('size', itemSize.toString());

          let source = this.$axios.CancelToken.source();

          var fileProgress: UploadProgressEntryType = reactive({
            name: item.name,
            typeIcon: 'file_present',
            status: 'loading',
            statusColor: 'bg-blue',
            message: '',
            abort: source,
            size: this.fileSizeIEC(itemSize),
            transferred: '0B',
            transferredPercent: 0,
          });
          this.progressPanelProgressMap.push(fileProgress);

          // don't upload files larger than 500MiB
          if (itemSize > 524288000) {
            fileProgress.status = 'error';
            fileProgress.statusColor = 'bg-red';
            fileProgress.transferredPercent = 0.0;
            fileProgress.message = 'File too large (>500MiB).';
            this.notify(
              'negative',
              'File exceeds the maximum upload limit of 500MiB.'
            );
            return;
          }
          // upload file
          let config = {
            withCredentials: true,
            onUploadProgress: (progressEvent: ProgressEvent) => {
              fileProgress.transferred = this.fileSizeIEC(progressEvent.loaded);
              fileProgress.transferredPercent = progressEvent.loaded / itemSize;
            },
            cancelToken: source.token,
            headers: {
              'X-CSRFToken': this.q.cookies.get('csrftoken'),
              'Content-Type': 'multipart/form-data',
            },
          };
          var response = await api
            .post('/files/upload/file', form_data, config as any)
            .catch((error) => {
              fileProgress.status = 'error';
              fileProgress.statusColor = 'bg-red';
              fileProgress.transferredPercent = 0.0;
              if (error.response) {
                fileProgress.message = error;
              } else {
                fileProgress.message = error.message;
              }
            });
          if (response !== undefined) {
            fileProgress.status = 'ok';
            fileProgress.statusColor = 'bg-green';
            fileProgress.transferredPercent = 1.0;
            this.refreshFolder();
          }
        }
      });
    },

    // find a valid name for a file being uploaded in the current folder and uploadMap context
    // if a filename is doubled, add a parenthesis with a number e.g. test(1)
    // number is counted up if multiple double names
    findValidName(name: string, type: string): [number, string] {
      // check existance of name, return 0 if everything is Ok
      if (
        this.checkNameExistFolderContext(name) == false &&
        this.checkNameExistUploadContext(name, '') == false
      ) {
        return [0, name];
      }

      var returnName = '';

      if (type == 'file') {
        var paranthesisNumberRegex = /\(\d+\)/;

        // get the file name without the extension
        var nameWithoutExtension;
        var extension = '';
        // check if and where the dot is
        // if there is a dot and it is not the first char,
        // recognize everything after the dot as the extension
        if (name.indexOf('.') > -1 && name.charAt(0) != '.') {
          extension = name.slice(((name.lastIndexOf('.') - 1) >>> 0) + 1);
          nameWithoutExtension = name.split(extension)[0];
        } else {
          nameWithoutExtension = name;
        }

        let paranthesisNumber =
          paranthesisNumberRegex.exec(nameWithoutExtension);

        // check if there is a number inside a paranthesis at the end of the filename
        // like helloworld(1).txt would match this
        if (paranthesisNumber != null) {
          // get the number
          let numberRegex = /\d+/;
          // parse it and add one
          let num =
            parseInt(
              (numberRegex.exec(paranthesisNumber[0]) as RegExpExecArray)[0]
            ) + 1;
          // put everything back together
          nameWithoutExtension = nameWithoutExtension.replace(
            paranthesisNumber[0],
            '(' + num + ')'
          );
          returnName = nameWithoutExtension + extension;
          return [1, returnName];
        } else {
          // add a paranthesis with a number
          returnName = nameWithoutExtension + '(1)' + extension;
          return [1, returnName];
        }
      } else {
        // if its a folder, don't need to check extensions otherwise everything same as above
        var paranthesisNumberRegex = /\(\d+\)/;
        let paranthesisNumber = paranthesisNumberRegex.exec(name);

        if (paranthesisNumber != null) {
          let numberRegex = /\d+/;
          let num =
            parseInt(
              (numberRegex.exec(paranthesisNumber[0]) as RegExpExecArray)[0]
            ) + 1;
          returnName = name.replace(paranthesisNumber[0], '(' + num + ')');
          return [1, returnName];
        } else {
          returnName = name + '(1)';
          return [1, returnName];
        }
      }
    },

    // upload files by drag & dropping them on a folder object
    // this adds all items to be uploaded to a map and calls
    // the uploadfile function instantly
    onFolderDrop(ev: InputEvent, itemid: string) {
      var uploadMap = [];
      for (var item of (ev.dataTransfer as DataTransfer)
        .items as unknown as DataTransferItem[]) {
        if (item.kind == 'file') {
          if (item.webkitGetAsEntry()?.isFile) {
            const validFile = item.getAsFile() as File;

            var uploadFileObject = {
              name: validFile.name,
              content: validFile,
              type: 'file',
            };

            uploadMap.push(uploadFileObject);
          } else if (item.webkitGetAsEntry()?.isDirectory) {
            const folder = item.webkitGetAsEntry() as FileSystemEntry;

            var uploadFolderObject = {
              name: folder.name,
              content: folder,
              type: 'folder',
            };

            uploadMap.push(uploadFolderObject);
          }
        }
      }

      this.uploadFiles(uploadMap, itemid);
    },

    // drag & drop when dropping files or folders on the
    // background of the scrollarea or the upload Dialog Area
    // only adds items to a map to showcase them, user has to
    // press the actual upload buttom to upload these files
    async uploadFilesDialogAreaDrop(ev: DragEvent) {
      this.uploadFilesDialogAreaDragover = false;
      for (var item of (ev.dataTransfer as DataTransfer)
        .items as unknown as DataTransferItem[]) {
        if (item.kind == 'file') {
          if ((item.webkitGetAsEntry() as FileSystemEntry).isFile) {
            const validFile = item.getAsFile();

            if (validFile == null) {
              return;
            }

            var returnVal = this.findValidName(validFile.name, 'file');

            while (returnVal[0] != 0) {
              returnVal = this.findValidName(returnVal[1] as string, 'file');
            }

            var uploadMapFile = {
              name: returnVal[1] as string,
              content: validFile as File,
              type: 'file',
            };

            this.uploadFilesDialogUploadMap.push(uploadMapFile);
          } else if ((item.webkitGetAsEntry() as FileSystemEntry).isDirectory) {
            const folder = item.webkitGetAsEntry() as FileSystemEntry;

            var returnVal = this.findValidName(folder.name, 'folder');

            while (returnVal[0] != 0) {
              returnVal = this.findValidName(returnVal[1] as string, 'folder');
            }

            var uploadMapFolder = {
              name: returnVal[1] as string,
              content: folder,
              type: 'folder',
            };

            this.uploadFilesDialogUploadMap.push(uploadMapFolder);
          }
        }
      }
    },

    async folderUploadDrop(ev: InputEvent, folderId: string) {
      var uploadMap: {
        name: string;
        content: File | FileSystemEntry;
        type: string;
      }[] = [];
      for (var item of ev.dataTransfer
        ?.items as unknown as DataTransferItem[]) {
        if (item.kind == 'file') {
          if (item.webkitGetAsEntry()?.isFile) {
            const validFile = item.getAsFile() as File;
            var uploadFileObject = {
              name: validFile?.name,
              content: validFile,
              type: 'file',
            };
            uploadMap.push(uploadFileObject);
          } else if (item.webkitGetAsEntry()?.isDirectory) {
            const folder = item.webkitGetAsEntry() as FileSystemEntry;
            var uploadFolderObject = {
              name: folder.name,
              content: folder,
              type: 'folder',
            };
            uploadMap.push(uploadFolderObject);
          }
        }
      }

      this.uploadFiles(uploadMap, folderId);
    },

    ///////////////////////////////////////////////////
    /////////// GENERAL METHODS ///////////////////////
    ///////////////////////////////////////////////////

    // clear selected items
    clearSelectedItems() {
      this.selectedItems.forEach(function (item) {
        item.selected = false;
      });
      this.selectedItems = [];
    },

    // check if a name exists in current folder context (rawFoldercontent.children)
    checkNameExistFolderContext(name: string) {
      return this.rawFolderContent.children.some(
        (el: FolderEntryType) => el.name == name
      );
    },

    // check if a name exists in current upload context (uploadFilesDialogUploadMap)
    checkNameExistUploadContext(new_name: string, existing_name: string) {
      if (new_name == existing_name) {
        return false;
      } else {
        return this.uploadFilesDialogUploadMap.some(
          (el) => el.name == new_name
        );
      }
    },

    // copy a text to clipboard
    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      this.notify('positive', 'Copied to clipboard.');
    },

    // used to set q page height
    styleFn(offset: number, height: number) {
      let pageheight = height - offset;
      return 'height: ' + pageheight + 'px';
    },

    // universal notification popup
    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: false,
      });
    },

    // universal function to refetch the current folder when any change is made
    // contentOnly → if false, also clears anything else that might get bugged (100% clean refresh)
    // if true actually only refreshes the content of the folder
    refreshFolder(contentOnly = false) {
      this.loading = true;
      api
        .get('/files/folder/' + this.rawFolderContent.id, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.loading = false;
            if (contentOnly == false) {
              this.allAvailableFolders = [];
              this.selectedItems = [];
              this.allSelected = false;
              this.resetFilterState();
            }
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    fileSizeIEC(bytes: number) {
      if (Math.abs(bytes) < 1024) {
        return bytes + ' B';
      }

      const units = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
      let u = -1;
      const r = 10 ** 2;

      do {
        bytes /= 1024;
        ++u;
      } while (
        Math.round(Math.abs(bytes) * r) / r >= 1024 &&
        u < units.length - 1
      );

      return bytes.toFixed(2) + ' ' + units[u];
    },

    // zip download caller
    downloadAsZip(folderid: string) {
      window
        ?.open(
          'https://api.kurtn3x.xyz/files/download/folder/' + folderid,
          '_blank'
        )
        ?.focus();
    },

    // select all items
    selectAllItems() {
      if (this.allSelected == true) {
        for (var item of this.rawFolderContent.children as FolderEntryType[]) {
          if (!this.selectedItems.includes(item)) {
            this.selectedItems.push(item);
            item.selected = true;
          }
        }
      } else {
        for (var item of this.rawFolderContent.children as FolderEntryType[]) {
          item.selected = false;
        }

        this.selectedItems = [];
      }
    },

    ///////////////////////////////////////////////////
    /////////// ADD / REMOVE OBJECTS //////////////////
    ///////////////////////////////////////////////////

    // create Folder in move dialog, for better use this doesn't refetch
    // allAvailableFolders, but instead appends to the existing object
    createFolderMoveDialog(propNode: any) {
      if (propNode.temporary_label.length < 1) {
        this.notify('negative', 'Name must be at least 1 character long.');
        return;
      }
      if (/\/|\x00/.test(propNode.temporary_label)) {
        this.notify('negative', 'No slash or null char.');
        return;
      }

      this.loading = true;

      var parentId = propNode.id;

      var data = {
        parent_id: parentId,
        name: propNode.temporary_label,
      };

      api
        .post('/files/create/folder', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            propNode.temporary_show_input = false;
            propNode.temporary_label = '';
            this.notify('positive', 'Created');
            this.loading = false;
            this.fetchAllAvailableFolders();
            this.refreshFolder(true);

            this.resetFilterState();
            // if (this.allAvailableFolders[0].id == parentId ){
            //   this.allAvailableFolders[0].children.push({

            //   })
            // }

            // function findNode() {
            //   return;
            // }
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    // create folder
    createFolder() {
      if (this.newFolder.name.length < 1) {
        this.notify('negative', 'Name must be at least 1 character long.');
        return;
      }
      if (/\/|\x00/.test(this.newFolder.name)) {
        this.notify('negative', 'No slash or null char.');
        return;
      }

      if (this.checkNameExistFolderContext(this.newFolder.name) == true) {
        this.notify('negative', 'Name already exists.');
        return;
      }

      this.loading = true;

      var data = {
        parent_id: this.rawFolderContent.id,
        name: this.newFolder.name,
      };

      api
        .post('/files/create/folder', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.newFolder.name = '';
            this.newFolder.show = false;
            this.notify('positive', 'Created');
            this.loading = false;
            this.refreshFolder();
            this.resetFilterState();
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    createFile() {
      if (this.newFile.name.length < 1) {
        this.notify('negative', 'Name must be at least 1 character long.');
        return;
      }
      if (/\/|\x00/.test(this.newFile.name)) {
        this.notify('negative', 'No slash or null char.');
        return;
      }

      if (this.checkNameExistFolderContext(this.newFile.name) == true) {
        this.notify('negative', 'Name already exists.');
        return;
      }

      this.loading = true;
      var parts = [
        new Blob(['you construct a file...'], { type: 'text/plain' }),
        ' Same way as you do with blob',
        new Uint16Array([33]),
      ];
      var file = new File([''], this.newFile.name);

      let form_data = new FormData();
      form_data.append('file', file);
      form_data.append('parent_id', this.rawFolderContent.id);
      form_data.append('name', this.newFile.name);
      form_data.append('mime', this.newFile.mime);
      form_data.append('size', '0');
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };
      api
        .post('/files/create/file', form_data, config)
        .then((response) => {
          if (response.status == 200) {
            this.createFileDialog = false;
            this.notify('positive', 'Created');
            this.loading = false;
            this.refreshFolder();
            this.resetFilterState();
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    // delete objects
    deleteObj(id: string, type: string) {
      this.loading = true;
      api
        .delete('/files/delete/' + type + '/' + id, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Deleted');
            this.loading = false;
            this.refreshFolder();
            this.resetFilterState();
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    // deleting all selected items
    deleteSelection() {
      for (var item of this.selectedItems) {
        this.deleteObj(item.id, item.type);
      }
      this.selectedItems = [];
      this.allSelected = false;
      for (var item of this.rawFolderContent.children as FolderEntryType[]) {
        item.selected = false;
      }
    },

    ///////////////////////////////////////////////////
    /////////// MOVE ITEM(S) //////////////////////////
    ///////////////////////////////////////////////////

    // fetch information of all available folders
    // used when opening the move item dialog
    // this fetches all folders in a defined hierarchy
    // automatically appends the home folder id to moveItemsExpanded so this folder is already expanded by default
    fetchAllAvailableFolders() {
      this.moveItemsExpanded = [];
      this.allAvailableFolders = [];
      api
        .get('/files/list_all_available_folders', this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.allAvailableFolders = response.data;
            this.moveItemsExpanded.push(response.data[0].id);
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

    // when moving an item or items via the dialog, show the path of the selected folder
    // this first flattens out the allAvailableFolders map and than looks trough the flat array
    moveItemsUpdateSelectedLabel() {
      function flatten(arr: any[]): any[] {
        let children: any[] = [];
        const flatArr = arr.map((m) => {
          if (m.children && m.children.length) {
            children = [...children, ...m.children];
          }
          return m;
        });

        return flatArr.concat(
          children.length ? flatten(children) : children
        ) as any[];
      }

      var flat = flatten(this.allAvailableFolders);
      this.moveItemsSelectedPath = flat.find(
        (o) => o.id == this.moveItemsSelectedId
      ).name;
    },

    // moving all selected items to a new folder
    moveSelection() {
      for (var item of this.selectedItems) {
        if (item.id != this.moveItemsSelectedId) {
          this.updateItemParent(item.id, this.moveItemsSelectedId, item.type);
        } else {
          this.notify('negative', "Can't move a folder into itself.");
        }
      }
      this.selectedItems = [];
      this.allSelected = false;
      this.moveSelectedItemsDialog = false;
      for (var item of this.rawFolderContent.children as FolderEntryType[]) {
        item.selected = false;
      }
    },

    // update parent of an item, used by above moveSelection method
    // and when updating the parent of a single item
    updateItemParent(moveItemId: string, moveToId: string, type: string) {
      var data = {
        item_id: moveItemId,
        parent_id: moveToId,
      };
      this.loading = true;
      api
        .put('/files/update/' + type, data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Updated');
            this.refreshFolder();
            this.resetFilterState();
            this.loading = false;
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    ///////////////////////////////////////////////////
    /////////// TOOLBAR NAVIGATION METHODS ////////////
    ///////////////////////////////////////////////////

    // handle navbar folder click
    getFolderNavbar(item: { name: string; id: string }, identifier: number) {
      // identifier: 0=home, 1=menu, 2=navbar
      if (identifier == 0) {
        // home folder
        // → clear the arrays
        this.navbarIndex.menuItems = [];
        this.navbarIndex.navbarItems = [];
        this.getHomeFolder();
      } else if (identifier == 1) {
        // menu items
        this.navbarIndex.lastMovedItemId = '';
        this.navbarIndex.navbarItems = [];
        const index = this.navbarIndex.menuItems.findIndex(
          (i) => i.id === item.id
        );
        this.navbarIndex.menuItems.length = index + 1;
        this.getFolderId(item.id, false);
      } else {
        // navbar items
        const index = this.navbarIndex.navbarItems.findIndex(
          (i) => i.id === item.id
        );
        this.navbarIndex.navbarItems.length = index + 1;
        this.getFolderId(item.id, false);
      }
    },

    // go back navbar button
    navGoBack() {
      this.loading = true;
      api
        .get(
          '/files/folder/' + this.rawFolderContent.parentid,
          this.axiosConfig
        )
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.navbarIndex.lastMovedItemId = '';
            this.navbarIndex.navbarItems.pop();
            this.selectedItems = [];
            this.allSelected = false;
            this.loading = false;
            this.resetFilterState();
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    ///////////////////////////////////////////////////
    /////////// SCROLLBAR METHODS /////////////////////
    ///////////////////////////////////////////////////

    // used to focus input when newfolder.show
    focusInput() {
      (this.$refs.newItemInput as InstanceType<typeof QInput>).focus();
    },

    // download a private-storage file
    openInNewTab(item: FolderEntryType) {
      this.mediaPreview = true;
      this.mediaItem = item;
    },

    // get Folder content with folderid
    // used when clicking on a folder in the scrollarea
    getFolderId(folderid: string, navbarAdd: boolean) {
      this.loading = true;
      api
        .get('/files/folder/' + folderid, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;

            // push the data to the navbarindex map
            if (navbarAdd == true) {
              this.navbarIndex.navbarItems.push({
                name: response.data.name,
                id: response.data.id,
              });
            }

            this.loading = false;
            this.selectedItems = [];
            this.allSelected = false;
            this.resetFilterState();
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    ///////////////////////////////////////////////////
    ///////////  METHODS //////////////////////////////
    ///////////////////////////////////////////////////

    // create new permalink
    createPermalink() {
      this.loading = true;
      var data = {
        perm_link_name: 'wasd',
        perm_link_type: 'wasd',
        id: 'wasd',
      };
      api
        .post('/files/create/permalink', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'OK.');
            this.loading = false;
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.loading = false;
        });
    },

    ///////////////////////////////////////////////////
    /////////// DRAG & DROP METHODS ///////////////////
    ///////////////////////////////////////////////////

    // drag and drop update parent folder
    // used when dropping a scrollarea-item on a folder
    changeParentDragNDrop(itemProps: (string | number)[], folderid: string) {
      var itemtype = itemProps[0];
      var itemid = itemProps[1];
      var data = {
        item_id: itemid,
        parent_id: folderid,
      };
      if (folderid != itemid) {
        this.loading = true;
        api
          .put('/files/update/' + itemtype, data, this.axiosConfig)
          .then((response) => {
            if (response.status == 200) {
              this.notify('positive', 'Updated');
              this.refreshFolder();
              this.resetFilterState();

              this.loading = false;
              this.selectedItems = [];
              this.allSelected = false;
            } else {
              this.notify('negative', response.data.error);
              this.loading = false;
            }
          })
          .catch((error) => {
            if (error.response) {
              this.notify('negative', error.response.data.error);
            } else {
              this.notify('negative', error.message);
            }
            this.loading = false;
          });
      }
    },
  },
});
</script>

<style scoped lang="scss">
.item_text {
  max-width: var(--max-width);
}
</style>
