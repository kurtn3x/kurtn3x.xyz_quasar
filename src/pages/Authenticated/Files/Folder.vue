<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
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
            icon="expand_more"
            :label="selectedItems.length + ' Items'"
            class="bg-blue text-white q-ml-sm text-body2"
            unelevated
          >
            <q-menu anchor="bottom middle" self="top middle">
              <q-card flat style="max-width: 200px; max-height: 250px">
                <template v-for="item in selectedItems" :key="item">
                  <div class="ellipsis text-body1 q-ma-sm">
                    <q-icon
                      :name="item.type == 'folder' ? 'folder' : 'file_present'"
                    />
                    <a class="q-ml-sm"> {{ item.name }} </a>
                  </div>
                </template>
              </q-card>
            </q-menu>
          </q-btn>
        </div>
        <q-separator class="q-mt-sm" />
        <q-card-actions align="center" class="row q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            flat
            icon="close"
            label="Cancel"
            class="bg-red text-white col"
          />
          <q-btn
            v-close-popup
            flat
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
      <q-card bordered style="width: 350px">
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
        <div class="q-ma-md" v-if="allAvailableFolders.length != 0">
          <div class="row">
            <q-input
              :color="darkmode ? 'white' : 'black'"
              v-model="moveItemsFilter"
              dense
              outlined
              label="Search"
              class="text-primary text-body1 col"
              style="height: 50px; max-width: 300px"
            />
            <q-btn
              icon="expand_more"
              :label="selectedItems.length + 'Items'"
              class="bg-blue text-white q-ml-sm text-body2 col"
              unelevated
              style="height: 40px"
            >
              <q-menu anchor="bottom middle" self="top middle">
                <q-card flat style="max-width: 200px; max-height: 250px">
                  <template v-for="item in selectedItems" :key="item">
                    <div class="ellipsis text-body1 q-ma-sm">
                      <q-icon
                        :name="
                          item.type == 'folder' ? 'folder' : 'file_present'
                        "
                      />
                      <a class="q-ml-sm"> {{ item.name }} </a>
                    </div>
                  </template>
                </q-card>
              </q-menu>
            </q-btn>
          </div>
          <q-scroll-area style="height: 325px">
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
            />
          </q-scroll-area>
          <div class="q-mt-md">
            <a class="text-weight-bolder">New Folder: </a>
            {{ moveItemsSelectedPath }}
          </div>
        </div>
        <q-separator class="q-mt-sm" />

        <q-card-actions align="center" class="row q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            flat
            icon="close"
            label="Cancel"
            class="bg-red text-white col"
          />
          <q-btn
            v-close-popup
            flat
            class="bg-green text-white col"
            icon="done"
            size="md"
            label="Move"
            @click="moveSelection"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- filterDialog -->
    <q-page-sticky v-if="filterDialog" position="top" style="z-index: 100">
      <q-card bordered style="width: 350px">
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

          <q-select
            :color="darkmode ? 'white' : 'black'"
            outlined
            v-model="filterSortBy"
            :options="filterSortByOptions"
            label="Sort by..."
            class="q-mt-md"
            dense
            popup-content-style="z-index: 101"
            @update:model-value="sortRawFolderContent"
          />
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

    <!-- itemInformationDialog -->
    <q-dialog v-model="itemInformationDialog">
      <q-card bordered style="width: 350px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm">{{
            itemInformationData.name
          }}</q-toolbar-title>
          <q-tooltip class="text-body1 bg-layout-bg text-layout-text">
            {{ itemInformationData.name }}
          </q-tooltip>
        </q-toolbar>
        <div class="q-ma-md">
          <div>
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder q-mr-sm">Type:</div>
              {{ itemInformationData.type }}
            </div>

            <div
              class="text-body1 q-mt-md row"
              v-if="itemInformationData.type == 'file'"
            >
              <div class="text-weight-bolder q-mr-sm">Mime:</div>
              <div class="ellipsis">
                {{ (itemInformationData as FileItemType).mime }}
                <q-tooltip
                  class="text-body1"
                  :class="
                    darkmode ? 'bg-dark text-white' : 'bg-white text-dark'
                  "
                >
                  {{ (itemInformationData as FileItemType).mime }}
                </q-tooltip>
              </div>
            </div>
            <div
              class="text-body1 q-mt-md row"
              v-if="itemInformationData.type == 'file'"
            >
              <div class="text-weight-bolder q-mr-sm">Size:</div>
              <div>{{ (itemInformationData as FileItemType).size }}</div>
            </div>
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder q-mr-sm">Created:</div>
              <div>{{ itemInformationData.created }}</div>
            </div>
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder q-mr-sm">Modified:</div>
              <div>{{ itemInformationData.modified }}</div>
            </div>
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder q-mr-sm">Folder:</div>
              <div class="ellipsis">
                {{ itemInformationData.path }}
                <q-tooltip
                  class="text-body1"
                  :class="
                    darkmode ? 'bg-dark text-white' : 'bg-white text-dark'
                  "
                >
                  {{ itemInformationData.path }}
                </q-tooltip>
              </div>
            </div>
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder q-mr-sm">Sharing Enabled:</div>
              <div>{{ itemInformationData.shared }}</div>
            </div>
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder q-mr-sm">Sharing Allow Read:</div>
              <div>{{ itemInformationData.shared_allow_all_read }}</div>
            </div>
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder q-mr-sm">Sharing Allow Write:</div>
              <div>
                {{ itemInformationData.shared_allow_all_write }}
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-mt-sm" />

        <q-card-actions align="center" class="q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            flat
            class="bg-green text-white col"
            icon="done"
            size="md"
            label="OK"
            style="max-width: 130px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
                        <q-item-label class="ellipsis" style="width: 170px">
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
                            icon="close"
                            class="bg-red text-white"
                            unelevated
                            size="xs"
                            round
                            @click="
                              file.edit = false;
                              file.temp = '';
                            "
                          />

                          <q-btn
                            icon="done"
                            class="bg-green text-white"
                            unelevated
                            size="xs"
                            round
                            @click="
                              if (!/\/|\x00/.test(file.temp as string)) {
                                if (
                                  checkNameExistFolderContext(
                                    file.temp as string,
                                    'file'
                                  ) == false &&
                                  checkNameExistUploadContext(
                                    file.temp as string,
                                    'file'
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
                        </template>
                      </q-input>
                    </div>
                  </q-card>
                </template>
              </q-list>
            </q-scroll-area>
          </div>
          <div class="row justify-between q-mt-xs">
            <div class="row">
              <q-file
                unelevated
                dense
                v-model="uploadFilesDialogFiles"
                display-value=""
                label-slot
                @update:model-value="appendFiles"
                style="max-width: 75px"
                color="white"
                class="bg-blue text-white rounded-borders q-mr-md"
                label-color="white"
              >
                <template v-slot:label>
                  <q-icon name="add" size="24px" class="q-ml-sm" />
                  <q-icon name="description" size="24px" class="q-ml-sm" />
                </template>
              </q-file>
              <q-file
                unelevated
                dense
                v-model="uploadFilesDialogFiles"
                display-value=""
                label-slot
                @update:model-value="appendFiles"
                style="max-width: 75px"
                color="white"
                class="bg-blue text-white rounded-borders"
                label-color="white"
              >
                <template v-slot:label>
                  <q-icon name="add" size="24px" class="q-ml-sm" />
                  <q-icon name="folder" size="24px" class="q-ml-sm" />
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
                unelevated
                v-if="uploadFilesDialogUploadMap.length > 0"
              />
            </div>
          </div>
        </div>

        <q-separator class="q-mt-sm" />

        <q-card-actions align="evenly" class="q-mt-sm q-mb-sm row">
          <q-btn
            v-close-popup
            flat
            icon="close"
            label="Close"
            class="bg-red text-white col-4"
            style="height: 45px"
            @click="uploadFilesDialogUploadMap = []"
          />
          <q-btn
            v-close-popup
            flat
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
      <div class="q-mt-md" @dragover.stop.prevent="" @drop.prevent="">
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
                changeParentDragNDrop($event, navbarIndex.home_folder_id)
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
            <a v-if="navbarIndex.menu_items.length != 0">/</a>
            <q-item
              clickable
              flat
              class="rounded-borders text-primary text-weight-bold text-h5"
              v-if="navbarIndex.menu_items.length > 0"
              style="display: inline-block"
              @dragover="navbarOverflowMenuHover = true"
              @dragstop="navbarOverflowMenuHover = false"
            >
              <a class="no-pointer-events"> ... </a>
              <q-menu
                v-model="navbarOverflowMenuHover"
                @mouseleave="navbarOverflowMenuHover = false"
              >
                <q-list bordered seperator>
                  <template v-for="item in navbarIndex.menu_items" :key="item">
                    <q-item
                      clickable
                      flat
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
                      <a class="no-pointer-events">
                        {{ item.name }}
                      </a>
                    </q-item>
                  </template>
                </q-list>
              </q-menu>
            </q-item>
            <template v-for="item in navbarIndex.navbar_items" :key="item">
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
              unelevated
              icon="add"
              direction="down"
              class="q-ml-md"
              color="light-green"
              square
              padding="none"
              style="height: 40px; width: 50px; z-index: 1"
            >
              <q-fab-action
                class="text-body1 bg-light-green"
                text-color="white"
                outline
                icon="create_new_folder"
                label="New Folder"
                @click="
                  newObjShow = true;
                  newObj.type = 'folder';
                "
                square
                style="width: 180px"
              />
              <q-fab-action
                @click="
                  newObjShow = true;
                  newObj.type = 'file';
                "
                icon="note_add"
                label="New File"
                class="text-body1 bg-light-green"
                text-color="white"
                outline
                square
                style="width: 180px"
              />
              <q-fab-action
                @click="uploadFilesDialog = true"
                icon="file_upload"
                label="Upload Files"
                class="text-body1 bg-light-green"
                text-color="white"
                square
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
                  unelevated
                  dense
                  icon="search add"
                  class="bg-primary text-white"
                  @click="filterDialog = !filterDialog"
                  style="height: 40px; width: 65px"
                />
              </template>
            </q-input>

            <q-space />
            <div style="width: 130px" class="q-ml-md q-mr-sm">
              <q-fab
                unelevated
                icon="check_box"
                active-icon="expand_more"
                direction="down"
                color="cyan-14"
                square
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
                  square
                  style="width: 150px"
                />
                <q-fab-action
                  class="text-body1 bg-red"
                  text-color="white"
                  outline
                  icon="close"
                  label="Delete"
                  @click="deleteItemsDialog = true"
                  square
                  style="width: 150px"
                />
              </q-fab>
            </div>
          </div>

          <!-- toolbar on small screens -->
          <div class="row lt-sm full-width">
            <q-space />
            <q-input
              :color="darkmode ? 'white' : 'black'"
              v-model="filterSearch"
              input-class="text-left"
              label="Search"
              class="text-body1 col q-ml-md"
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
                  unelevated
                  dense
                  icon="search add"
                  class="bg-primary text-white"
                  @click="filterDialog = !filterDialog"
                  style="height: 40px; width: 65px"
                />
              </template>
            </q-input>
            <div class="q-ml-md q-mr-sm" style="width: 80px">
              <q-fab
                unelevated
                icon="check_box"
                :label="selectedItems.length"
                active-icon=" expand_more"
                direction="down"
                color="cyan-14"
                square
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
                  square
                  style="width: 110px"
                />
                <q-fab-action
                  class="text-body1 bg-red"
                  text-color="white"
                  outline
                  icon="close"
                  label="Delete"
                  @click="deleteItemsDialog = true"
                  square
                  style="width: 110px"
                />
              </q-fab>
            </div>
          </div>
        </q-toolbar>
        <q-item clickable class="rounded-borders full-width">
          <q-item-section avatar>
            <q-checkbox color="green" />
          </q-item-section>
          <q-item-section avatar top style="pointer-events: none">
            <q-avatar
              color="transparent"
              text-color="primary"
              size="4.5em"
              style="height: 40px"
            />
          </q-item-section>
          <q-item-section style="pointer-events: none" class="row">
          </q-item-section>
          <q-item-section style="pointer-events: none"> </q-item-section>
          <q-item-section style="pointer-events: none">size</q-item-section>
          <q-item-section class="text-caption" style="pointer-events: none">
            mod
          </q-item-section>

          <q-item-section side> </q-item-section>
        </q-item>

        <q-separator size="2px" color="primary" class="q-mt-xs" />
      </div>
      <q-scroll-area class="col">
        <div
          :style="scrollAreaHeight"
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
          <div v-if="newObjShow">
            <q-item class="full-width rounded-borders bg-green-9">
              <q-item-section avatar top class="no-pointer-events">
                <q-avatar
                  :icon="newObj.type == 'folder' ? 'folder' : 'file_present'"
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
                  v-model="newObj.name"
                  :label="'New ' + newObj.type + ' Name'"
                  class="text-body1 q-ml-md"
                  input-class="text-body2"
                  clearable
                  @keyup.enter="createObj"
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
                    @click="createObj"
                  />
                  <q-btn
                    icon="close"
                    class="q-ml-md bg-red text-white"
                    round
                    flat
                    @click="
                      newObjShow = false;
                      newObj.name = '';
                      newObj.type = '';
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
                    (item as FileFolderType).drag_over ? 'bg-indigo-11' : '',
                    item.selected ? 'bg-cyan-14 text-layout-text' : '',
                  ]"
                  @v-drag-enter="
                    (ev: string[]) => {
                      if (ev[1] != item.id) {
                        (item as FileFolderType).drag_over = true;
                      }
                    }
                  "
                  @v-drag-leave="(item as FileFolderType).drag_over = false"
                  @v-drag-over="
                    (ev: string[]) => {
                      if (ev[1] != item.id) {
                        (item as FileFolderType).drag_over = true;
                      }
                    }
                  "
                  @v-drag-drop="changeParentDragNDrop($event, item.id)"
                  @drop.prevent.self.stop="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          onFolderDrop(ev, item.id);
                          (item as FileFolderType).drag_over = false;
                        }
                      }
                    }
                  "
                  @dragover.prevent.self.stop="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          (item as FileFolderType).drag_over = true;
                        }
                      }
                    }
                  "
                  @dragenter.prevent="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          (item as FileFolderType).drag_over = true;
                        }
                      }
                    }
                  "
                  @dragleave.prevent="
                    (ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          (item as FileFolderType).drag_over = false;
                        }
                      }
                    }
                  "
                >
                  <q-popup-proxy
                    context-menu
                    :breakpoint="0"
                    @before-show="item.selected = true"
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
                      @showInformation="
                        itemInformationDialog = true;
                        itemInformationData = item;
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
                  <q-item-section style="pointer-events: none" class="row">
                    <q-item-label
                      class="item_text ellipsis"
                      :style="itemTextWidth"
                    >
                      <q-icon name="share" v-if="item.shared" />
                      {{ item.name }}</q-item-label
                    >
                  </q-item-section>
                  <q-item-section style="pointer-events: none">
                  </q-item-section>
                  <q-item-section style="pointer-events: none"></q-item-section>
                  <q-item-section style="pointer-events: none"></q-item-section>
                  <q-item-section
                    class="text-caption"
                    style="pointer-events: none"
                  >
                    {{ item.modified }}
                  </q-item-section>

                  <q-item-section side>
                    <q-btn
                      icon="more_vert"
                      class="cursor-pointer full-width"
                      flat
                      :loading="loading"
                      stretch
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
                          @showInformation="
                            itemInformationDialog = true;
                            itemInformationData = item;
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
                  @click="openInNewTab(item.id)"
                  :class="item.selected ? 'bg-cyan-14 text-layout-text' : ''"
                >
                  <q-popup-proxy
                    context-menu
                    :breakpoint="0"
                    @before-show="item.selected = true"
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
                      @showInformation="
                        itemInformationDialog = true;
                        itemInformationData = item;
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
                      :icon="getIcon((item as FileItemType).mime as string)"
                      color="transparent"
                      text-color="primary"
                      size="4.5em"
                      style="height: 40px"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label
                      class="item_text ellipsis"
                      :style="itemTextWidth"
                    >
                      <q-icon name="share" v-if="item.shared" />
                      {{ item.name }}</q-item-label
                    >
                  </q-item-section>
                  <q-item-section style="pointer-events: none"></q-item-section>
                  <q-item-section style="pointer-events: none"></q-item-section>
                  <q-item-section
                    class="text-caption gt-xs lt-md"
                    style="pointer-events: none"
                  >
                    {{ (item as FileItemType).size }}
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
                      class="full-width"
                      flat
                      :loading="loading"
                      stretch
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
                          @showInformation="
                            itemInformationDialog = true;
                            itemInformationData = item;
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
        </div>
      </q-scroll-area>

      <!-- Bottom Right Upload Progress -->

      <q-page-sticky
        class="lt-sm"
        position="bottom"
        :offset="[0, 15]"
        style="z-index: 101"
      >
        <q-fab
          unelevated
          icon="add"
          direction="up"
          class="q-mr-md"
          color="light-green"
          padding="md"
          style="z-index: 1"
        >
          <q-fab-action
            class="text-body1 bg-light-green"
            text-color="white"
            outline
            icon="create_new_folder"
            label="New Folder"
            @click="
              newObjShow = true;
              newObj.type = 'folder';
            "
            square
            style="width: 180px"
          />
          <q-fab-action
            @click="
              newObjShow = true;
              newObj.type = 'file';
            "
            icon="note_add"
            label="New File"
            class="text-body1 bg-light-green"
            text-color="white"
            outline
            square
            style="width: 180px"
          />
          <q-fab-action
            @click="uploadFilesDialog = true"
            icon="file_upload"
            label="Upload Files"
            class="text-body1 bg-light-green"
            text-color="white"
            square
            style="width: 180px"
            outline
          />
        </q-fab>
      </q-page-sticky>

      <q-page-sticky position="bottom-right" style="z-index: 100">
        <q-btn
          icon="analytics"
          class="bg-layout-bg text-layout-text"
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
          <q-card
            style="height: 350px"
            class="q-pa-none q-ma-none"
            v-if="progressPanel"
          >
            <div class="row text-body1 q-ma-sm">
              <div class="text-blue">
                {{
                  progressPanelProgressMap.filter(
                    (obj) => obj.status == 'loading'
                  ).length
                }}
                <q-icon name="hourglass_bottom" size="18px" class="q-ml-xs" />
              </div>
              <div class="q-ml-md text-red">
                {{
                  progressPanelProgressMap.filter(
                    (obj) => obj.status == 'error'
                  ).length
                }}
                <q-icon name="warning" size="18px" class="q-ml-xs" />
              </div>
              <div class="q-ml-md text-green">
                {{
                  progressPanelProgressMap.filter((obj) => obj.status == 'ok')
                    .length
                }}
                <q-icon name="done" size="18px" class="q-ml-xs" />
              </div>
              <q-space />
              <q-btn
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
                        :class="progress.color"
                        style="height: 10px"
                      >
                        <q-item-section avatar>
                          <q-icon :name="progress.icon" size="sm" />
                          <div
                            class="q-ml-md text-body1 ellipsis"
                            style="width: 100px"
                          >
                            {{ progress.name }}

                            <q-tooltip
                              class="text-body1"
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
                            :value="progress.transferred_percent_num"
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
                                  progress.error
                                    ? 'Error'
                                    : progress.transferred_percent_label
                                "
                              />
                            </div>
                            <q-tooltip
                              :class="progress.error ? 'bg-red-8' : 'bg-blue-8'"
                            >
                              <q-badge
                                class="text-body1 row justify-evenly bg-blue-8"
                                style="width: 200px"
                                v-if="!progress.error"
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
                                v-if="progress.error"
                              >
                                <div>
                                  {{ progress.error }}
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
import { defineComponent, ref, reactive, computed } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar, scroll, QInput } from 'quasar';
import { api } from 'boot/axios';
import { draggable, selected } from 'components/draggable.js';
import { droppable } from 'components/droppable.js';
import RightClickMenu from 'components/RightClickMenu.vue';
import { FOLDER } from './testdata/folder.js';
import { minFolder } from './testdata/all_available_folders.js';

import type { Ref } from 'vue';
import {
  TraverseFolderMapType,
  UploadProgressEntryType,
  getIcon,
  FileFolderType,
  FileItemType,
  UploadDialogEntryType,
  NavbarIndexType,
  AllAvailableFoldersType,
  RawFolderContentType,
} from 'src/types/index';

export default defineComponent({
  name: 'FilesView',
  directives: {
    draggable,
    droppable,
  },

  components: { RightClickMenu },

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
      home_folder_id: '',
      // holds all items in the navbar
      navbar_items: [],
      // holds items in the menu if navbar is too big
      menu_items: [],
      last_moved_item_id: '',
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
      scrollAreaDragover: ref(false),

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

      // options
      filterDialog: ref(false),
      filterSearch: ref(''),
      filterSortBy: ref('Type'),
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

      itemInformationDialog: ref(false),
      itemInformationData: ref({}) as Ref<FileItemType | FileFolderType>,

      // selection handlers
      selectedItems: ref([]) as Ref<(FileItemType | FileFolderType)[]>,
      allSelected: ref(false),

      // move items
      allAvailableFolders: ref(minFolder) as Ref<AllAvailableFoldersType[]>,
      // dialog for moving selections
      moveSelectedItemsDialog: ref(false),
      moveSingleItem: ref(false),

      moveItemsExpanded: ref(['']),
      moveItemsFilter: ref(''),
      moveItemsSelectedPath: ref(''),
      moveItemsSelectedId: ref(''),

      // delete items
      deleteItemsDialog: ref(false),

      // delete folder
      folderToDeleteUUID: ref(''),
      folderDeleteDialog: ref(false),

      // new doc/folder handlers
      newObj: ref({
        name: '',
        type: '',
      }),
      newObjShow: ref(false),
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
        if (l > t && this.navbarIndex.navbar_items.length > 1) {
          console.log('i');
          // → handle overflowing navbar

          // check if the last element of the navbar isn't the last moved item
          // this is used to prevent an infinite loop
          var l = this.navbarIndex.navbar_items.length;
          var x = this.navbarIndex.navbar_items[l - 1];
          if (x.id != this.navbarIndex.last_moved_item_id) {
            // grab the first item of the navbar and push it to the menu list
            var removed = this.navbarIndex.navbar_items.shift() as {
              name: string;
              id: string;
            };
            this.navbarIndex.menu_items.push(removed);
            // set the moved element as the last moved element
            this.navbarIndex.last_moved_item_id = removed.id;
          }
        } else {
          // if the width of the item is smaller than the actual place for it
          // we may be able to clear items of the list which is created when content overflows
          if (this.navbarIndex.menu_items.length > 0) {
            // grab the last item of menu_items array
            var l = this.navbarIndex.menu_items.length;
            var x = this.navbarIndex.menu_items[l - 1];
            // check if that isn't the item that was moved in a previous run → prevent inf loop
            if (x.id != this.navbarIndex.last_moved_item_id) {
              // remove that item from the menu_items array and add it to the navbar Items
              var removed = this.navbarIndex.menu_items.shift() as {
                name: string;
                id: string;
              };
              this.navbarIndex.navbar_items.push(removed);
              this.navbarIndex.last_moved_item_id = removed.id;
            }
          }
        }
      });
    },
  },

  computed: {
    pathNames() {
      return this.navbarIndex.navbar_items.length;
    },

    darkmode() {
      return this.localStore.darkmode;
    },

    scrollAreaHeight() {
      var height = this.q.screen.height - 230;
      return { height: height + 'px' };
    },

    navBarWidth() {
      var width = this.q.screen.width - 65;
      return { width: width + 'px' };
    },

    itemTextWidth() {
      var width = this.q.screen.width / 3;
      return { '--max-width': width + 'px' };
    },
  },

  methods: {
    // get Home folder content on initial page load
    getHomeFolder() {
      this.loading = true;
      api
        .get('/files/home', this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.navbarIndex.home_folder_id = response.data.id;

            this.initialFetch = true;
            this.initialFetchSuccessful = true;
            this.loading = false;
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
            console.log(error);
          }
          this.loading = false;
        });
    },

    ///////////////////////////////////////////////////
    /////////// FILTER  //////////////////////////////
    ///////////////////////////////////////////////////

    sortRawFolderContent(type: { name: string; value: number }) {
      var type_val = type.value;
      if (type_val == 1) {
        // by type
        this.rawFolderContent.children.sort(
          (a: FileItemType | FileFolderType) => (a.type != 'folder' ? 1 : 0)
        );
      } else if (type_val == 2) {
        // alphabetically
        this.rawFolderContent.children.sort(
          (
            a: FileItemType | FileFolderType,
            b: FileItemType | FileFolderType
          ) => a.name.localeCompare(b.name)
        );
      } else if (type_val == 3) {
        // created time
        this.rawFolderContent.children
          .sort(
            (
              a: FileItemType | FileFolderType,
              b: FileItemType | FileFolderType
            ) => a.created_iso.localeCompare(b.created_iso)
          )
          .reverse();
      } else if (type_val == 4) {
        // last changed time
        this.rawFolderContent.children
          .sort(
            (
              a: FileItemType | FileFolderType,
              b: FileItemType | FileFolderType
            ) => a.modified_iso.localeCompare(b.modified_iso)
          )
          .reverse();
      } else if (type_val == 5) {
        // size
        this.rawFolderContent.children.sort(
          (
            a: FileItemType | FileFolderType,
            b: FileItemType | FileFolderType
          ) => (b as FileItemType).size_bytes - (a as FileItemType).size_bytes
        );
      } else if (type_val == 6) {
        // this.rawFolderContent.children
        //   .sort(
        //     (
        //       a: FileItemType | FileFolderType,
        //       b: FileItemType | FileFolderType
        //     ) => a.modified.localeCompare(b.shared)
        //   )
        //   .reverse();
      }
    },

    ///////////////////////////////////////////////////
    /////////// FILE UPLOAD //////////////////////////
    ///////////////////////////////////////////////////

    // cancel the upload of an file
    cancelRequest(progress: UploadProgressEntryType) {
      progress.abort.cancel();
      progress.transferred_percent_num = 1;
      progress.transferred = 'ERROR';
      progress.status = 'ok';
    },

    // picking files via the pick files selector and adding it to the uploadMap
    appendFiles(file: File) {
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
    },

    // get the real FileObject of an file
    async getFile(fileEntry: FileSystemFileEntry) {
      return new Promise((resolve, reject) => fileEntry.file(resolve, reject));
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
      for (var item of copyOfUploadMap) {
        if (item.type == 'folder') {
          let source = this.$axios.CancelToken.source();

          var folderProgress: UploadProgressEntryType = reactive({
            name: item.name,
            icon: 'folder',
            color: 'bg-blue',
            status: '',
            error: '',
            abort: source,
            size: '0B',
            transferred: '0B',
            transferred_percent_num: 0,
            transferred_percent_label: computed(
              () =>
                (folderProgress.transferred_percent_num < 0.99
                  ? Math.round(folderProgress.transferred_percent_num * 100)
                  : 100) + '%'
            ),
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
              form_data.append(thing.id + '_mime', file.type);
              folderSizeByte += file.size;
            }
          }
          folderProgress.size = this.fileSizeIEC(folderSizeByte);
          folderProgress.status = 'loading';

          let config = {
            withCredentials: true,
            onUploadProgress: (progressEvent: ProgressEvent) => {
              folderProgress.transferred = this.fileSizeIEC(
                progressEvent.loaded
              );
              folderProgress.transferred_percent_num = (progressEvent.loaded /
                folderSizeByte) as number;
            },
            cancelToken: source.token,
            headers: {
              'X-CSRFToken': this.q.cookies.get('csrftoken'),
              'Content-Type': 'multipart/form-data',
            },
          };

          var response = await api
            .post('/files/upload/folder', form_data, config)
            .catch((error) => {
              folderProgress.status = 'error';
              folderProgress.color = 'bg-red';
              folderProgress.transferred_percent_num = 0.0;
              folderProgress.error = error;
            });
          if (response !== undefined) {
            folderProgress.status = 'ok';
            folderProgress.transferred_percent_num = 1.0;
            folderProgress.color = 'bg-green';
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
          form_data.append('mime', file.type);

          let source = this.$axios.CancelToken.source();

          var fileProgress: UploadProgressEntryType = reactive({
            name: item.name,
            icon: 'file_present',
            color: 'bg-blue',
            status: 'loading',
            error: '',
            abort: source,
            size: this.fileSizeIEC(itemSize),
            transferred: '0B',
            transferred_percent_num: 0,
            transferred_percent_label: computed(
              () =>
                (fileProgress.transferred_percent_num < 0.99
                  ? Math.round(fileProgress.transferred_percent_num * 100)
                  : 100) + '%'
            ),
          });
          this.progressPanelProgressMap.push(fileProgress);
          // upload file
          let config = {
            withCredentials: true,
            onUploadProgress: (progressEvent: ProgressEvent) => {
              fileProgress.transferred = this.fileSizeIEC(progressEvent.loaded);
              fileProgress.transferred_percent_num =
                progressEvent.loaded / itemSize;
            },
            cancelToken: source.token,
            headers: {
              'X-CSRFToken': this.q.cookies.get('csrftoken'),
              'Content-Type': 'multipart/form-data',
            },
          };
          var response = await api
            .post('/files/upload/file', form_data, config)
            .catch((error) => {
              fileProgress.status = 'error';
              fileProgress.color = 'bg-red';
              fileProgress.transferred_percent_num = 0.0;
              fileProgress.error = error;
            });
          if (response !== undefined) {
            fileProgress.status = 'ok';
            fileProgress.transferred_percent_num = 1.0;
            fileProgress.color = 'bg-green';
            this.refreshFolder();
          }
        }
      }
    },

    // find a valid name for a file being uploaded in the current folder and uploadMap context
    // if a filename is doubled, add a parenthesis with a number e.g. test(1)
    // number is counted up if multiple double names
    findValidName(name: string, type: string): [number, string] {
      // check existance of name, return 0 if everything is Ok
      if (
        this.checkNameExistFolderContext(name, type) == false &&
        this.checkNameExistUploadContext(name, type) == false
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
      console.log('x');
      this.selectedItems.forEach(function (item) {
        item.selected = false;
      });
      this.selectedItems = [];
    },

    // check if a name of type exists in current folder context (rawFoldercontent.children)
    checkNameExistFolderContext(name: string, type: string) {
      return this.rawFolderContent.children.some(
        (el: FileItemType | FileFolderType) =>
          el.name == name && el.type == type
      );
    },

    // check if a name of type exists in current upload context (uploadFilesDialogUploadMap)
    checkNameExistUploadContext(name: string, type: string) {
      return this.uploadFilesDialogUploadMap.some(
        (el) => el.name == name && el.type == type
      );
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
        multiLine: true,
      });
    },

    // universal function to refetch the current folder when any change is made
    refreshFolder() {
      this.loading = true;
      api
        .get('/files/folder/' + this.rawFolderContent.id, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.rawFolderContent = response.data;
            this.loading = false;
            this.allAvailableFolders = [];
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
            console.log(error);
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
        for (var item of this.rawFolderContent.children as (
          | FileItemType
          | FileFolderType
        )[]) {
          if (!this.selectedItems.includes(item)) {
            this.selectedItems.push(item);
            item.selected = true;
          }
        }
      } else {
        for (var item of this.rawFolderContent.children as (
          | FileItemType
          | FileFolderType
        )[]) {
          item.selected = false;
        }

        this.selectedItems = [];
      }
    },

    // sort the content of the current folder
    sortFolderContent() {
      console.log(this.filterSortBy);
    },

    ///////////////////////////////////////////////////
    /////////// ADD / REMOVE OBJECTS //////////////////
    ///////////////////////////////////////////////////

    // create files / folders from add button
    createObj() {
      if (this.newObj.name.length < 1) {
        this.notify('negative', 'Please type something.');
        return;
      }
      if (/\/|\x00/.test(this.newObj.name)) {
        this.notify('negative', 'No slash or null char.');
        return;
      }

      if (
        this.checkNameExistFolderContext(this.newObj.name, this.newObj.type) ==
        true
      ) {
        this.notify('negative', 'Name already exists.');
        return;
      }

      this.loading = true;

      var data = {
        parent_id: this.rawFolderContent.id,
        name: this.newObj.name,
      };

      api
        .post('/files/create/' + this.newObj.type, data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.newObj.name = '';
            this.newObjShow = false;
            this.notify('positive', 'Created');
            this.loading = false;
            this.refreshFolder();
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
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
      for (var item of this.rawFolderContent.children as (
        | FileItemType
        | FileFolderType
      )[]) {
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
            console.log(error);
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
      ).path;
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
      for (var item of this.rawFolderContent.children as (
        | FileItemType
        | FileFolderType
      )[]) {
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
            console.log(error);
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
        this.navbarIndex.menu_items = [];
        this.navbarIndex.navbar_items = [];
        this.getHomeFolder();
      } else if (identifier == 1) {
        // menu items
        this.navbarIndex.last_moved_item_id = '';
        this.navbarIndex.navbar_items = [];
        const index = this.navbarIndex.menu_items.findIndex(
          (i) => i.id === item.id
        );
        this.navbarIndex.menu_items.length = index + 1;
        this.getFolderId(item.id, false);
      } else {
        // navbar items
        const index = this.navbarIndex.navbar_items.findIndex(
          (i) => i.id === item.id
        );
        this.navbarIndex.navbar_items.length = index + 1;
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
            this.navbarIndex.last_moved_item_id = '';
            this.navbarIndex.navbar_items.pop();
            this.selectedItems = [];
            this.allSelected = false;
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
            console.log(error);
          }
          this.loading = false;
        });
    },

    ///////////////////////////////////////////////////
    /////////// SCROLLBAR METHODS /////////////////////
    ///////////////////////////////////////////////////

    // used to focus input when newObjShow
    focusInput() {
      (this.$refs.newItemInput as InstanceType<typeof QInput>).focus();
    },

    // download a private-storage file
    openInNewTab(id: string) {
      window
        ?.open('https://api.kurtn3x.xyz/files/content/file/' + id, '_blank')
        ?.focus();
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
              this.navbarIndex.navbar_items.push({
                name: response.data.name,
                id: response.data.id,
              });
            }

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
            console.log(error);
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
            console.log(error);
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
              console.log(error);
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
