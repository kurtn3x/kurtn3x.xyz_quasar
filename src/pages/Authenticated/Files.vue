<template>
  <div
    v-if="initialFetch.loading"
    class="absolute-center"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div v-if="!initialFetch.loading && initialFetch.error">
    <ErrorPage :error-message="initialFetch.errorMessage" />
  </div>
  <div v-if="!initialFetch.loading && !initialFetch.error">
    <FilePreviewDialog
      :prop-item="filePreviewDialogItem"
      :active="showFilePreviewDialog"
      @close="showFilePreviewDialog = false"
    />
    <CreateFileDialog
      :active="showCreateFileDialog"
      @close="showCreateFileDialog = false"
      @create="
        (newFile) => {
          createFile(newFile);
        }
      "
    />
    <MoveSelectedItemsDialog
      :prop-item="selectedItems"
      :active="showMoveSelectedItemsDialog"
      @close="showMoveSelectedItemsDialog = false"
      @move="
        (newParentId) => {
          moveSelection(newParentId);
        }
      "
    />

    <DeleteSelectedItemsDialog
      :prop-item="selectedItems"
      :active="showDeleteSelectedItemsDialog"
      @close="showDeleteSelectedItemsDialog = false"
      @delete-items="deleteSelectedItems"
    />

    <UploadFilesDialog
      :prop-item="rawFolderContent"
      :active="showUploadFilesDialog"
      :initial-event="uploadFilesDialogInitialEvent"
      @close="showUploadFilesDialog = false"
      @upload="(params: [UploadDialogEntryType[], string]) => {
        uploadFiles(...params);
      }
      "
    />

    <!-- filterDialog -->
    <q-page-sticky
      v-if="filterDialog"
      position="top"
      style="z-index: 100"
    >
      <q-card
        bordered
        flat
        style="width: 350px"
      >
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
              <q-icon
                v-if="filterSearch === ''"
                name="search"
              />
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

    <q-page
      class="column"
      :style-fn="styleFn"
    >
      <div
        :class="q.screen.gt.xs ? 'q-mt-sm' : 'q-mt-xs'"
        @dragover.stop.prevent=""
        @drop.prevent=""
      >
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
            :style="'width:' + (screenWidth - 65) + 'px;'"
            class="row"
            :class="q.screen.gt.xs ? 'q-ml-sm' : ''"
            ref="navbar"
          >
            <q-item
              clickable
              flat
              class="rounded-borders text-primary text-weight-bold text-h5 q-ml-sm"
              @click="getFolderNavbar({ name: '', id: '' }, 0)"
              @drop.prevent.self.stop="(ev: InputEvent) => {
                if (ev.dataTransfer!.items.length > 0) {
                  if (ev.dataTransfer!.items[0].type == 'id') {
                      moveSelection(navbarIndex.homeFolderId)
                  }
                }
                (ev.target as HTMLElement).classList.remove('dragover')
              }"
              @dragenter.prevent.stop="(ev: DragEvent) => {
                if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
                  if (ev.dataTransfer.items[0].type == 'id' && ev.target)
                    (ev.target as HTMLElement).classList.add('dragover')
                }
              }"
              @dragleave.prevent.stop="(ev: DragEvent) => {
                if (ev.target) {
                  (ev.target as HTMLElement).classList.remove('dragover')
                }
              }"
              @dragover.prevent.self.stop
              style="display: inline-block"
            >
              <q-icon
                color="primary"
                name="home"
                class="full-width full-height no-pointer-events"
              />
            </q-item>
            <a
              class="text-weight-bolder text-primary"
              v-if="navbarIndex.menuItems.length != 0"
            >
              /
            </a>
            <q-item
              clickable
              flat
              class="rounded-borders text-primary text-weight-bold text-h5"
              v-if="navbarIndex.menuItems.length > 0"
              style="display: inline-block"
              @dragover="navbarOverflowMenuHover = true"
              @dragstop="navbarOverflowMenuHover = false"
            >
              <a class="no-pointer-events">...</a>
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
                  <template
                    v-for="item in navbarIndex.menuItems"
                    :key="item"
                  >
                    <q-item
                      clickable
                      class="text-primary text-weight-bold text-h6"
                      @click="getFolderNavbar(item, 1)"
                      @drop.prevent.self.stop="(ev: InputEvent) => {
                        if (ev.dataTransfer!.items.length > 0) {
                          if (ev.dataTransfer!.items[0].type == 'id') {
                              moveSelection(item.id)
                          }
                        }
                        (ev.target as HTMLElement).classList.remove('dragover')
                      }"
                      @dragenter.prevent.stop="(ev: DragEvent) => {
                        if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
                          if (ev.dataTransfer.items[0].type == 'id' && ev.target)
                            (ev.target as HTMLElement).classList.add('dragover')
                        }
                      }"
                      @dragleave.prevent.stop="(ev: DragEvent) => {
                        if (ev.target) {
                          (ev.target as HTMLElement).classList.remove('dragover')
                        }
                      }"
                      @dragover.prevent.self.stop
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
            <template
              v-for="item in navbarIndex.navbarItems"
              :key="item"
            >
              <a class="text-weight-bolder text-primary">/</a>
              <q-item
                clickable
                flat
                class="rounded-borders text-primary text-weight-bold text-h5 items-center"
                @click="getFolderNavbar(item, 2)"
                @drop.prevent.self.stop="(ev: InputEvent) => {
                  if (ev.dataTransfer!.items.length > 0) {
                    if (ev.dataTransfer!.items[0].type == 'id') {
                        moveSelection(item.id)
                    }
                  }
                  (ev.target as HTMLElement).classList.remove('dragover')
                }"
                @dragenter.prevent.stop="(ev: DragEvent) => {
                  if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
                    if (ev.dataTransfer.items[0].type == 'id' && ev.target)
                      (ev.target as HTMLElement).classList.add('dragover')
                  }
                }"
                @dragleave.prevent.stop="(ev: DragEvent) => {
                  if (ev.target) {
                    (ev.target as HTMLElement).classList.remove('dragover')
                  }
                }"
                @dragover.prevent.self.stop
                style="display: inline-block"
              >
                <q-item-section>
                  <a
                    class="no-pointer-events ellipsis"
                    :style="'max-width:' + (screenWidth - 215) + 'px;'"
                  >
                    {{ item.name }}
                  </a>
                </q-item-section>
              </q-item>
            </template>
          </div>
        </q-toolbar>

        <q-toolbar class="q-mt-sm">
          <q-checkbox
            v-model="allSelected"
            color="green"
            :class="q.screen.gt.xs ? 'q-ml-sm' : ''"
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
              style="height: 40px; width: 40px; z-index: 3"
            >
              <q-fab-action
                outline
                class="text-body1 bg-light-green"
                text-color="white"
                icon="note_add"
                label="New File"
                @click="showCreateFileDialog = true"
                style="width: 180px; z-index: 3"
              />
              <q-fab-action
                outline
                class="text-body1 bg-light-green"
                text-color="white"
                icon="create_new_folder"
                label="New Folder"
                @click="newFolder.show = true"
                style="width: 180px; z-index: 3"
              />
              <q-fab-action
                push
                @click="showUploadFilesDialog = true"
                icon="file_upload"
                label="Upload Files"
                class="text-body1 bg-light-green"
                text-color="white"
                style="width: 180px; z-index: 3"
                outline
              />
            </q-fab>
            <!-- <q-btn
              push
              dense
              icon="add"
              class="bg-primary text-white"
              @click="addItemToNavbar"
              style="height: 40px; width: 65px"
            /> -->
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
                <q-icon
                  v-if="filterSearch === ''"
                  name="search"
                />
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
            <div
              style="width: 130px"
              class="q-ml-md q-mr-sm"
            >
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
                style="height: 40px; width: 140px; z-index: 3"
              >
                <q-fab-action
                  class="text-body1 bg-blue"
                  text-color="white"
                  outline
                  label="Move"
                  icon="trending_flat"
                  @click="showMoveSelectedItemsDialog = true"
                  style="width: 150px; z-index: 3"
                />
                <q-fab-action
                  class="text-body1 bg-red"
                  text-color="white"
                  outline
                  icon="close"
                  label="Delete"
                  @click="showDeleteSelectedItemsDialog = true"
                  style="width: 150px; z-index: 3"
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
              style="z-index: 3"
            >
              <q-fab-action
                class="text-body1 bg-light-green"
                text-color="white"
                outline
                icon="note_add"
                label="New File"
                @click="showCreateFileDialog = true"
                style="width: 180px; z-index: 3"
                padding="sm"
              />

              <q-fab-action
                class="text-body1 bg-light-green"
                text-color="white"
                outline
                icon="create_new_folder"
                label="New Folder"
                @click="newFolder.show = true"
                style="width: 180px; z-index: 3"
                padding="sm"
              />

              <q-fab-action
                @click="showUploadFilesDialog = true"
                icon="file_upload"
                label="Upload Files"
                class="text-body1 bg-light-green"
                text-color="white"
                style="width: 180px; z-index: 3"
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
                <q-icon
                  v-if="filterSearch === ''"
                  name="search"
                />
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

            <div
              class="q-ml-md q-mr-sm"
              style="width: 80px"
            >
              <q-fab
                push
                icon="check_box"
                :label="selectedItems.length"
                active-icon=" expand_more"
                direction="down"
                color="cyan-14"
                v-if="selectedItems.length > 0"
                padding="none"
                style="height: 40px; width: 80px; z-index: 3"
              >
                <q-fab-action
                  class="text-body1 bg-blue"
                  text-color="white"
                  outline
                  label="Move"
                  icon="trending_flat"
                  @click="showMoveSelectedItemsDialog = true"
                  style="width: 110px; z-index: 3"
                />
                <q-fab-action
                  class="text-body1 bg-red"
                  text-color="white"
                  outline
                  icon="close"
                  label="Delete"
                  @click="showDeleteSelectedItemsDialog = true"
                  style="width: 110px; z-index: 3"
                />
              </q-fab>
            </div>
          </div>
        </q-toolbar>

        <!-- column descriptions/sorting on large screens only -->
        <div class="row gt-xs q-ml-md">
          <q-item-section
            avatar
            class="q-ml-lg"
          />
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

          <q-item-section
            side
            class="q-mr-md"
          >
            <div style="width: 50px" />
          </q-item-section>
        </div>

        <q-separator
          size="2px"
          color="primary"
          inset
        />
      </div>

      <div
        class="col column"
        ref="mainScrollArea"
        :class="[
          scrollAreaDragover ? 'bg-teal-5' : '',
          mobile ? 'scroll' : 'scrollmobile',
        ]"
        @drop.prevent.stop="(ev: DragEvent) => {
          if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
            if (ev.dataTransfer.items[0].kind == 'file') {
              uploadFilesDialogInitialEvent = ev;
              showUploadFilesDialog = true;
              scrollAreaDragover = false;
            }
          }
        }"
        @dragover.prevent="(ev: DragEvent) => {
          if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
            if (ev.dataTransfer.items[0].kind == 'file') {
              scrollAreaDragover = true;
            }
          }
        }"
        @dragenter.self="(ev: DragEvent) => {
          if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
            if (ev.dataTransfer.items[0].kind == 'file') {
              scrollAreaDragover = true;
            }
          }
        }"
        @dragleave.prevent="(ev: DragEvent) => {
          if (ev.dataTransfer && ev.dataTransfer.items.length > 0) {
            if (ev.dataTransfer.items[0].kind == 'file') {
              scrollAreaDragover = false;
            }
          }
        }"
      >
        <div class="col column selectoContainer">
          <div class="row justify-center q-mt-xs">
            <div
              class="full-width bg-transparent fixed"
              style="height: 15px; z-index: 2"
              @dragenter.self="scrollUp(true)"
              @dragleave.self="scrollUp(false)"
              @dragover.prevent
              @drop.prevent.stop="scrollUp(false)"
            />
          </div>
          <div style="height: 15px" />
          <div
            class="col"
            :class="q.screen.gt.xs ? 'q-ml-md q-mr-md' : ''"
            @scroll="onScrollerScroll"
          >
            <div v-if="newFolder.show">
              <q-item
                class="full-width rounded-borders"
                style="background-color: rgba(60, 177, 60, 0.801)"
              >
                <q-item-section
                  avatar
                  top
                  class="no-pointer-events"
                >
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
                  ></q-input>
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
              <q-separator
                size="2px"
                color="light-green"
              />
            </div>
            <template
              v-for="(item, index) in rawFolderContent.children"
              :key="item.id"
            >
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
                    :id="index"
                    @click="getFolderId(item.id, true)"
                    class="rounded-borders full-width selecto-target"
                    :class="[
                      item.dragOver ? 'dragover' : '',
                      item.selected ? 'selected' : '',
                    ]"
                    :draggable="true"
                    @dragstart="startDrag($event, item)"
                    @drop.prevent.self.stop="(ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        // real file from filesystem
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          onFolderDrop(ev, item.id);
                        }
                        // FileItem
                        if (ev.dataTransfer!.items[0].type == 'id') {
                          if (ev.dataTransfer!.getData('id') != item.id && selectedItems.indexOf(item) == -1) {
                            moveSelection(item.id)
                          }
                        }
                      }
                      item.dragOver = false;
                    }"
                    @dragenter.prevent.stop="(ev: InputEvent) => {
                      if (ev.dataTransfer!.items.length > 0) {
                        // real file from filesystem
                        if (ev.dataTransfer!.items[0].kind == 'file') {
                          item.dragOver = true;
                        }
                        // FileItem
                        if (ev.dataTransfer!.items[0].type == 'id') {
                          if (ev.dataTransfer!.getData('id') != item.id && selectedItems.indexOf(item) == -1) {
                            item.dragOver = true;
                          }
                        }
                      }
                    }"
                    @dragleave.prevent.stop="item.dragOver = false"
                    @dragover.prevent.self.stop
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
                        :prop-item="item"
                        @move-item="
                          () => {
                            clearSelectedItems();
                            showMoveSelectedItemsDialog = true;
                            selectedItems.push(item);
                          }
                        "
                        @delete-item="
                          () => {
                            deleteItem(item.type, item.id);
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
                    <q-item-section
                      avatar
                      top
                      style="pointer-events: none"
                    >
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
                        class="itemText ellipsis"
                        :style="'--max-width: ' + itemTextWidth + 'px;'"
                      >
                        <q-icon
                          name="share"
                          v-if="item.shared"
                        />
                        {{ item.name }}
                      </q-item-label>
                    </q-item-section>

                    <q-item-section
                      class="text-caption gt-xs"
                      style="pointer-events: none"
                    >
                      -
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
                        :loading="loading"
                        @click.prevent.stop
                        round
                      >
                        <q-menu>
                          <RightClickMenu
                            :prop-item="item"
                            @move-item="
                              () => {
                                clearSelectedItems();
                                showMoveSelectedItemsDialog = true;
                                selectedItems.push(item);
                              }
                            "
                            @delete-item="
                              () => {
                                deleteItem(item.type, item.id);
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
                    @click="
                      showFilePreviewDialog = true;
                      filePreviewDialogItem = item;
                    "
                    :id="index"
                    class="rounded-borders full-width selecto-target"
                    :class="item.selected ? 'selected' : ''"
                    :draggable="true"
                    @dragstart="startDrag($event, item)"
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
                        :prop-item="item"
                        @move-item="
                          () => {
                            clearSelectedItems();
                            showMoveSelectedItemsDialog = true;
                            selectedItems.push(item);
                          }
                        "
                        @delete-item="
                          () => {
                            deleteItem(item.type, item.id);
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
                    <q-item-section
                      avatar
                      top
                    >
                      <q-avatar
                        :icon="getIcon(item.mime)"
                        color="transparent"
                        text-color="primary"
                        size="4.5em"
                        style="height: 40px"
                      />
                    </q-item-section>

                    <q-item-section
                      :style="'min-width:' + itemTextWidth + 'px;'"
                    >
                      <q-item-label
                        class="itemText ellipsis"
                        :style="'width: ' + itemTextWidth + 'px;'"
                      >
                        <q-icon
                          name="share"
                          v-if="item.shared"
                        />
                        {{ item.name }}
                      </q-item-label>
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
                            :prop-item="item"
                            @move-item="
                              () => {
                                clearSelectedItems();
                                showMoveSelectedItemsDialog = true;
                                selectedItems.push(item);
                              }
                            "
                            @delete-item="
                              () => {
                                deleteItem(item.type, item.id);
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
            <div style="height: 15px" />
          </div>
          <div class="row justify-center">
            <div
              class="full-width bg-transparent bg-transparent fixed-bottom"
              style="height: 15px"
              @dragenter.self="scrollDown(true)"
              @dragleave.self="scrollDown(false)"
              @dragover.prevent
              @drop.prevent.stop="scrollDown(false)"
            />
          </div>
        </div>
      </div>

      <VueSelecto
        ref="selecto"
        dragContainer=".selectoContainer"
        :selectableTargets="['.selecto-target']"
        :selectByClick="false"
        :selectFromInside="false"
        :continueSelect="false"
        :toggleContinueSelect="'shift'"
        :keyContainer="window"
        :hitRate="0"
        @select="onSelect"
        @scroll="onScroll"
        :scrollOptions="scrollOptions as any"
        v-if="!mobile"
      />

      <q-page-sticky
        position="bottom-right"
        style="z-index: 100"
      >
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
        <q-card
          bordered
          style="width: 325px"
          v-if="progressSticky"
        >
          <q-item
            class="bg-layout-bg text-layout-text row justify-center items-center"
            clickable
            dense
            @click="progressPanel = !progressPanel"
          >
            <q-icon
              color="layout-text"
              name="analytics"
            />
            <a class="text-layout-text q-ml-sm text-weight-bold">
              Upload Progress
            </a>
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
              <q-icon
                name="hourglass_bottom"
                size="18px"
                class="q-ml-xs"
              />
            </div>
            <div class="q-ml-md text-green">
              {{
                progressPanelProgressMap.filter((obj) => obj.status == 'ok')
                  .length
              }}
              <q-icon
                name="done"
                size="18px"
                class="q-ml-xs"
              />
            </div>
            <div class="q-ml-md text-red">
              {{
                progressPanelProgressMap.filter((obj) => obj.status == 'error')
                  .length
              }}
              <q-icon
                name="warning"
                size="18px"
                class="q-ml-xs"
              />
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
            <q-separator
              size="2px"
              color="layout-bg"
            />
            <div class="q-ma-sm">
              <q-scroll-area
                class="row"
                style="height: 305px"
              >
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
                          <q-icon
                            :name="progress.typeIcon"
                            size="sm"
                          />
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

                        <q-item-section
                          side
                          class="q-ml-md"
                        >
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
                    <q-separator
                      color="white"
                      size="2px"
                    />
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
// w
import type { Ref } from 'vue';
import type {
  TraverseFolderMapType,
  UploadProgressEntryType,
  FolderEntryType,
  UploadDialogEntryType,
  NavbarIndexType,
  RawFolderContentType,
} from 'src/types/index';
import { defineComponent, ref, reactive } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar, scroll } from 'quasar';
import { getIcon } from 'src/components/Files/lib/mimeMap';
import { apiGet, apiPut, apiPost, apiDelete } from 'src/components/apiWrapper';
import { folderData } from 'src/testdata/folder';
import { VueSelecto } from 'vue3-selecto';

import RightClickMenu from 'src/components/Files/RightClickMenu.vue';
import FilePreviewDialog from 'src/components/Files/Dialogs/FilePreviewDialog.vue';
import CreateFileDialog from 'src/components/Files/Dialogs/CreateFileDialog.vue';
import MoveSelectedItemsDialog from 'src/components/Files/Dialogs/MoveSelectedItemsDialog.vue';
import DeleteSelectedItemsDialog from 'src/components/Files/Dialogs/DeleteSelectedItemsDialog.vue';
import UploadFilesDialog from 'src/components/Files/Dialogs/UploadFilesDialog.vue';
import ErrorPage from 'src/components/ErrorPage.vue';

export default defineComponent({
  name: 'FilesView',

  components: {
    RightClickMenu,
    FilePreviewDialog,
    CreateFileDialog,
    MoveSelectedItemsDialog,
    DeleteSelectedItemsDialog,
    UploadFilesDialog,
    ErrorPage,
    VueSelecto,
  },

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

    const mainScrollArea = ref(null);

    var mobile = q.platform.is.mobile;
    if (mobile == undefined) {
      mobile = false;
    }

    return {
      // general
      axiosConfig,
      localStore,
      q,
      window: window,
      mobile,
      setVerticalScrollPosition,
      getIcon,

      // loading / initial load
      loading: ref(false),
      initialFetch: ref({
        loading: true,
        error: false,
        errorMessage: '',
      }),

      // raw content including children of current folder
      rawFolderContent: ref(folderData) as Ref<RawFolderContentType>,

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
          label: 'Modified',
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
      mainScrollArea,
      scrollAreaDragover: ref(false),
      scrollIntervalBottom: {},
      scrollIntervalTop: {},
      scrollOptions: ref({
        container: mainScrollArea,
        throttleTime: 30,
        threshold: 0,
      }),
      // new folder handler
      newFolder: ref({
        show: false,
        name: '',
      }),

      // Dialogs
      showCreateFileDialog: ref(false),
      showMoveSelectedItemsDialog: ref(false),
      showDeleteSelectedItemsDialog: ref(false),
      showUploadFilesDialog: ref(false),
      uploadFilesDialogInitialEvent: ref(undefined) as Ref<
        undefined | DragEvent
      >,
      // media preview
      showFilePreviewDialog: ref(false),
      filePreviewDialogItem: ref({}) as Ref<FolderEntryType>,
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

    screenWidth() {
      return this.q.screen.width;
    },

    itemTextWidth() {
      var width = this.q.screen.width / 2.5;
      return width;
    },
  },

  methods: {
    blabla(event) {
      console.log(event);
    },
    onScroll(e) {
      (this.mainScrollArea as any).scrollBy(
        e.direction[0] * 10,
        e.direction[1] * 10
      );
    },
    onScrollerScroll() {
      this.$refs.selecto.checkScroll();
    },

    startDrag(event: any, item: FolderEntryType) {
      if (this.selectedItems.indexOf(item) == -1) {
        item.selected = true;
        this.selectedItems.push(item);
      }
      event.dataTransfer.dropEffect = 'move';
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('id', item.id);
      event.dataTransfer.setData('type', item.type);

      // set drag image
      var elem = document.createElement('div');
      elem.id = 'drag-ghost';
      elem.innerHTML =
        this.selectedItems.length +
        ' Item' +
        (this.selectedItems.length == 1 ? '' : 's');
      elem.style.position = 'absolute';
      elem.style.top = '-1000px';
      elem.classList.add('text-body1');
      elem.classList.add('q-pa-sm');
      elem.classList.add('bg-layout-bg');
      elem.classList.add('text-layout-text');
      elem.classList.add('text-weight-bold');
      document.body.appendChild(elem);
      event.dataTransfer.setDragImage(elem, 0, 0);
    },

    onSelect(e: any) {
      e.added.forEach((el: any) => {
        var item = this.rawFolderContent.children[el.id];
        if (this.selectedItems.indexOf(item) == -1) {
          item.selected = true;
          this.selectedItems.push(item);
        }
      });
      e.removed.forEach((el: any) => {
        var item = this.rawFolderContent.children[el.id];
        item.selected = false;
        var index = this.selectedItems.indexOf(item);
        if (index > -1) {
          this.selectedItems.splice(index, 1);
        }
      });
    },

    addItemToNavbar() {
      var length = 100;
      let result = '';
      const characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
        counter += 1;
      }
      this.navbarIndex.navbarItems.push({ name: result, id: result });
    },

    // mainScrollArea
    scrollUp(active: boolean) {
      if (active == true) {
        (this.scrollIntervalTop as any) = setInterval(
          () => ((this.mainScrollArea as any).scrollTop -= 5),
          10
        );
      } else {
        clearInterval(this.scrollIntervalTop as any);
      }
    },

    scrollDown(active: boolean) {
      if (active == true) {
        (this.scrollIntervalBottom as any) = setInterval(
          () => ((this.mainScrollArea as any).scrollTop += 5),
          10
        );
      } else {
        clearInterval(this.scrollIntervalBottom as any);
      }
    },

    // get Home folder
    getHomeFolder() {
      this.loading = true;
      apiGet('/files/folder/home', this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.rawFolderContent = apiData.data as RawFolderContentType;
          this.navbarIndex.homeFolderId = (
            apiData.data as RawFolderContentType
          ).id;
          this.navbarIndex.menuItems = [];
          this.navbarIndex.navbarItems = [];
          this.initialFetch.error = false;
        } else {
          this.notify('negative', apiData.errorMessage);
          this.initialFetch.error = true;
          this.initialFetch.errorMessage = apiData.errorMessage;
        }
        this.initialFetch.loading = false;
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
      var typeVal = type.value;
      if (typeVal == 1) {
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
      } else if (typeVal == 2) {
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
      } else if (typeVal == 3) {
        if (this.filterState.created == 1) {
          // reversed created (item which was created first is shown first)
          this.rawFolderContent.children
            .sort((a: FolderEntryType, b: FolderEntryType) =>
              a.createdTimeIso.localeCompare(b.createdTimeIso)
            )
            .reverse();
          this.resetFilterState();
          this.filterState.created = 2;
        } else {
          // created (item which was created last is shown first)
          this.rawFolderContent.children
            .sort((a: FolderEntryType, b: FolderEntryType) =>
              a.createdTimeIso.localeCompare(b.createdTimeIso)
            )
            .reverse();
          this.resetFilterState();
          this.filterState.created = 1;
        }
        this.resetFilterState();
      } else if (typeVal == 4) {
        if (this.filterState.modified == 1) {
          // by modified time reversed (oldest file is first)
          this.rawFolderContent.children.sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.modifiedTimeIso.localeCompare(b.modifiedTimeIso)
          );
          this.resetFilterState();

          this.filterState.modified = 2;
        } else {
          // by modified time (newest file is first)
          this.rawFolderContent.children
            .sort((a: FolderEntryType, b: FolderEntryType) =>
              a.modifiedTimeIso.localeCompare(b.modifiedTimeIso)
            )
            .reverse();
          this.resetFilterState();

          this.filterState.modified = 1;
        }
      } else if (typeVal == 5) {
        if (this.filterState.size == 1) {
          // size, smallest first (folders are always 0, so first here)
          this.rawFolderContent.children
            .sort(
              (a: FolderEntryType, b: FolderEntryType) =>
                a.sizeBytes - b.sizeBytes
            )
            .reverse();
          this.resetFilterState();

          this.filterState.size = 2;
        } else {
          // size, largest first
          this.rawFolderContent.children.sort(
            (a: FolderEntryType, b: FolderEntryType) =>
              a.sizeBytes - b.sizeBytes
          );
          this.resetFilterState();

          this.filterState.size = 1;
        }
      } else if (typeVal == 6) {
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

              // increment the parentId, which will result in a unique
              // id for each folder
              var uniqueFolderId = (parentId += 1);
              var folderStructure: TraverseFolderMapType = {
                type: 'folder',
                id: this.uniqueFolderUploadId,
                name: entry.name,
                folderId: uniqueFolderId,
                parentId: rememberParent,
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
                parentId: rememberParent,
              };
              returnArray.push(fileEntity);
            }
          }
          resolve(true);
        });
      });
    },

    // upload Files and Folders to parentFolderId
    // takes an uploadFileList, which is an array of files/folders to be uploaded
    // if it is an folder, the folder is traversed and all child-elements are uploaded as well
    // because the data that is sent is FormData (flat array data)
    // an id is added to each file and folder, which maps them correctly to their parent element
    // folders have folderIds (their own id) and parentIds (the folderId of the parent)
    // files only have parentIds (the folderId of the parent)
    // on top of that each folder and file has a unique id as well, which is needed to map the form-data correctly
    // e.g. 1_name : hello.txt, 1_parent_id = xyz, etc.
    async uploadFiles(
      uploadFileList: UploadDialogEntryType[],
      parentFolderId: string
    ) {
      this.progressPanel = true;
      this.progressSticky = true;
      var copyOfuploadFileList = uploadFileList;
      copyOfuploadFileList.forEach(async (item) => {
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
            folderId: folderId,
            parentId: 0,
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
          let formData = new FormData();
          formData.append('current_folder', parentFolderId);
          for (var thing of folderDirectory) {
            if (thing.type == 'folder') {
              formData.append(thing.id + '_type', 'folder');
              formData.append(thing.id + '_name', thing.name);
              formData.append(
                thing.id + '_folder_id',
                (thing.folderId as number).toString()
              );
              formData.append(
                thing.id + '_parent_id',
                thing.parentId.toString()
              );
            } else {
              // getFile
              async function getFile(fileEntry: FileSystemFileEntry) {
                return new Promise((resolve, reject) =>
                  fileEntry.file(resolve, reject)
                ) as Promise<File>;
              }
              let file: File = await getFile(
                thing.entry as FileSystemFileEntry
              );
              formData.append(thing.id + '_type', 'file');
              formData.append(thing.id + '_name', thing.name);
              formData.append(thing.id + '_content', file);
              formData.append(thing.id + '_size_bytes', file.size.toString());
              formData.append(
                thing.id + '_parent_id',
                thing.parentId.toString()
              );
              folderSizeByte += file.size;
            }
            folderEntries += 1;
          }
          // don't upload folders if the total size is larger than 500MiB
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
          if (folderEntries > 500) {
            folderProgress.status = 'error';
            folderProgress.statusColor = 'bg-red';
            folderProgress.transferredPercent = 0.0;
            folderProgress.message = 'Folder contains too many items (>500).';
            this.notify(
              'negative',
              'Folder exceeds the maximum entry limit of 500 Files.'
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

          await apiPost('files/upload/folder', formData, config).then(
            (apiData) => {
              if (apiData.error == false) {
                folderProgress.status = 'ok';
                folderProgress.transferredPercent = 1.0;
                folderProgress.statusColor = 'bg-green';
                this.refreshFolder();
              } else {
                folderProgress.status = 'error';
                folderProgress.statusColor = 'bg-red';
                folderProgress.transferredPercent = 0.0;
                folderProgress.message = apiData.errorMessage;
              }
            }
          );
        } else if (item.type == 'file' && item.content instanceof File) {
          let formData = new FormData();
          var file = item.content;
          var itemSize = file.size;

          formData.append('name', item.name);
          formData.append('parent_id', parentFolderId);
          formData.append('file', file);
          formData.append('size_bytes', itemSize.toString());

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
          await apiPost('files/file', formData, config).then((apiData) => {
            if (apiData.error == false) {
              fileProgress.status = 'ok';
              fileProgress.statusColor = 'bg-green';
              fileProgress.transferredPercent = 1.0;
              this.refreshFolder();
            } else {
              fileProgress.status = 'error';
              fileProgress.statusColor = 'bg-red';
              fileProgress.transferredPercent = 0.0;
              fileProgress.message = apiData.errorMessage;
            }
          });
        }
      });
    },

    /**
     * Upload files from the computer filesystem per drag & drop to this folder
     * Instantly uploads the dropped files.
     * @param {InputEvent} ev The event that triggered this function.
     * @param {string} itemId The ID of the folder this file is uploaded to.
     */
    onFolderDrop(ev: InputEvent, itemId: string) {
      if (ev.dataTransfer!.items.length > 0) {
        if (ev.dataTransfer!.items[0].kind != 'file') {
          return;
        }
        var uploadList = [];
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

              uploadList.push(uploadFileObject);
            } else if (item.webkitGetAsEntry()?.isDirectory) {
              const folder = item.webkitGetAsEntry() as FileSystemEntry;

              var uploadFolderObject = {
                name: folder.name,
                content: folder,
                type: 'folder',
              };

              uploadList.push(uploadFolderObject);
            }
          }
        }
        this.uploadFiles(uploadList, itemId);
      }
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

    checkNameExistFolderContext(name: string, folder: RawFolderContentType) {
      return folder.children.some((el: FolderEntryType) => el.name == name);
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
    refreshFolder() {
      this.loading = true;
      apiGet(
        '/files/folder/' + this.rawFolderContent.id,
        this.axiosConfig
      ).then((apiData) => {
        if (apiData.error == false) {
          this.rawFolderContent = apiData.data as RawFolderContentType;
          this.selectedItems = [];
          this.allSelected = false;
          this.resetFilterState();
        } else {
          this.notify('negative', apiData.errorMessage);
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
    // create folder
    createFolder() {
      if (this.newFolder.name.length < 1) {
        this.notify('negative', 'Name must be at least 1 character long.');
        return;
      }
      if (/\/|\x00/.test(this.newFolder.name)) {
        this.notify('negative', 'Name contains invalid characters.');
        return;
      }

      if (
        this.checkNameExistFolderContext(
          this.newFolder.name,
          this.rawFolderContent
        ) == true
      ) {
        this.notify('negative', 'Item with same name exists in this path.');
        return;
      }

      var data = {
        parentId: this.rawFolderContent.id,
        name: this.newFolder.name,
      };

      this.loading = true;
      apiPost('/files/folder', data, this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.newFolder.name = '';
          this.newFolder.show = false;
          this.notify('positive', 'Created');
          this.refreshFolder();
          this.resetFilterState();
        } else {
          this.notify('negative', apiData.errorMessage);
        }
        this.loading = false;
      });
    },

    // create an empty file
    createFile(newFile: { name: string; mime: string }) {
      if (newFile.name.length < 1) {
        this.notify('negative', 'Name must be at least 1 character long.');
        return;
      }
      if (/\/|\x00/.test(newFile.name)) {
        this.notify('negative', 'Name contains invalid characters.');
        return;
      }

      if (
        this.checkNameExistFolderContext(newFile.name, this.rawFolderContent) ==
        true
      ) {
        this.notify('negative', 'Item with same name exists in this path.');
        return;
      }

      this.loading = true;
      var file = new File([''], newFile.name);

      let formData = new FormData();
      formData.append('file', file);
      formData.append('parent_id', this.rawFolderContent.id);
      formData.append('name', newFile.name);
      formData.append('mime', newFile.mime);
      formData.append('size_bytes', '0');
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };

      this.loading = true;
      apiPost('/files/file', formData, config).then((apiData) => {
        if (apiData.error == false) {
          this.showCreateFileDialog = false;
          this.notify('positive', 'Created');
          this.refreshFolder();
          this.resetFilterState();
        } else {
          this.notify('negative', apiData.errorMessage);
        }
        this.loading = false;
      });
    },

    /**
     * Delete all items from this.selectedItems
     */
    deleteSelectedItems() {
      for (var item of this.selectedItems) {
        this.deleteItem(item.type, item.id);
      }
      this.selectedItems = [];
      this.allSelected = false;
      for (var item of this.rawFolderContent.children as FolderEntryType[]) {
        item.selected = false;
      }
    },

    /**
     * Delete an item.
     * @param itemType type of the item (folder/file)
     * @param itemId ID of the item
     */
    deleteItem(itemType: string, itemId: string) {
      this.loading = true;
      apiDelete('/files/' + itemType + '/' + itemId, this.axiosConfig).then(
        (apiData) => {
          if (apiData.error == false) {
            this.notify('positive', 'Deleted');
            this.refreshFolder();
            this.resetFilterState();
          } else {
            this.notify('negative', apiData.errorMessage);
          }
          this.loading = false;
        }
      );
    },

    /**
     * Handles folder navigation via the navbar.
     * @param item Name/ID of the folder in the navbar.
     * @param identifier In which part of the navbar this item is located. (0=home folder, 1=menu items, 2=navbar items)
     */
    getFolderNavbar(item: { name: string; id: string }, identifier: number) {
      // identifier: 0=home, 1=menu, 2=navbar
      if (identifier == 0) {
        // get home folder
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

    /**
     * Get the content of a folder by ID.
     * @param folderId The id of the folder.
     * @param navbarAdd If the folder should be appended to the top navigation bar.
     */
    getFolderId(folderId: string, navbarAdd: boolean) {
      this.loading = true;
      apiGet('/files/folder/' + folderId, this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.rawFolderContent = apiData.data as RawFolderContentType;
          if (navbarAdd == true) {
            this.navbarIndex.navbarItems.push({
              name: this.rawFolderContent.name,
              id: this.rawFolderContent.id,
            });
          }
          this.selectedItems = [];
          this.allSelected = false;
          this.resetFilterState();
        } else {
          this.notify('negative', apiData.errorMessage);
        }
        this.loading = false;
      });
    },

    /**
     * Moves all items from this.selectedItems to a new folder.
     * @param newParentId The ID of the folder these items are moved to.
     */
    moveSelection(newParentId: string) {
      for (var item of this.selectedItems) {
        this.updateParent(item.type, item.id, newParentId);
      }
      this.showMoveSelectedItemsDialog = false;
      for (var item of this.rawFolderContent.children as FolderEntryType[]) {
        item.selected = false;
      }
      this.selectedItems = [];
    },

    /**
     * Update the parent folder of an item.
     * @param itemType A List that contains the item type (folder/file) in index1 and the itemid in index2
     * @param newParentId The ID of the folder this item is moved to.
     */
    updateParent(itemType: string, itemId: string, newParentId: string) {
      var data = {
        parentId: newParentId,
      };
      if (newParentId != itemId) {
        this.loading = true;
        apiPut(
          '/files/' + itemType + '/' + itemId,
          data,
          this.axiosConfig
        ).then((apiData) => {
          if (apiData.error == false) {
            this.notify('positive', 'Updated');
            this.refreshFolder();
            this.resetFilterState();
            this.selectedItems = [];
            this.allSelected = false;
          } else {
            this.notify('negative', apiData.errorMessage);
          }
          this.loading = false;
        });
      }
    },
  },
});
</script>

<style scoped lang="scss">
.itemText {
  max-width: var(--max-width);
}

.scroll {
  overflow: auto;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  scrollbar-width: auto;
  scrollbar-gutter: stable both-edges;
}

.scrollmobile {
  overflow: auto;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  scrollbar-width: auto;
}

.selected {
  background: #2196f3 !important;
  color: #fff;
}

.dragover {
  background: #304ffe !important;
  color: #fff;
}
</style>
