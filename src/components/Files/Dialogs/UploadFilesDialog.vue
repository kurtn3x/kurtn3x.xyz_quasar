<template>
  <q-dialog v-model="showDialog" @hide="close" persistent>
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
              v-if="uploadFilesDialogUploadList.length == 0"
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
              <template v-for="file in uploadFilesDialogUploadList" :key="file">
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
                        :name="file.type == 'file' ? 'file_present' : 'folder'"
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
                          uploadFilesDialogUploadList =
                            uploadFilesDialogUploadList.filter(
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
                      :error="file.error"
                    >
                      <template v-slot:error>
                        <div class="text-caption text-weight-bold">
                          Name already exists.
                        </div>
                      </template>
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
                                  file.temp as string,
                                  rawFolderContent as RawFolderContentType
                                ) == false &&
                                checkNameExistUploadContext(
                                  file.temp as string,
                                  file.name
                                ) == false
                              ) {
                                file.name = file.temp as string;
                                file.edit = false;
                                file.error = false;
                              } else {
                                file.error = true;
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
              @click="uploadFilesDialogUploadList = []"
              icon="delete"
              size="xs"
              class="bg-red text-white"
              push
              v-if="uploadFilesDialogUploadList.length > 0"
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
          @click="close"
        />
        <q-btn
          v-close-popup
          push
          class="bg-green text-white col"
          icon="done"
          size="md"
          label="Upload"
          @click="uploadFiles"
          style="width: 210px; height: 45px"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import {
  FolderEntryType,
  UploadDialogEntryType,
  RawFolderContentType,
} from 'src/types/index';

export default defineComponent({
  name: 'DeleteItemsSelectedDialog',
  props: {
    active: Boolean,
    propItem: Object,
    initialEvent: DragEvent,
  },
  emits: ['close', 'upload'],
  setup(props) {
    return {
      rawFolderContent: ref(props.propItem),
      showDialog: ref(props.active),
      uploadFilesDialog: ref(false),
      uploadFilesDialogUploadList: ref([]) as Ref<UploadDialogEntryType[]>,
      uploadFilesDialogAreaDragover: ref(false),
      uploadFilesDialogFiles: ref(null),
    };
  },
  watch: {
    active(newVal, oldVal) {
      this.showDialog = newVal;
    },
    rawFolderContent(newVal, oldVal) {
      this.rawFolderContent = newVal;
    },
    initialEvent(newVal, oldVal) {
      if (newVal != undefined && newVal != oldVal) {
        this.uploadFilesDialogAreaDrop(newVal);
      }
    },
  },

  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
      this.uploadFilesDialogUploadList = [];
    },
    uploadFiles() {
      this.$emit('upload', [
        this.uploadFilesDialogUploadList,
        (this.rawFolderContent as RawFolderContentType).id,
      ]);
      this.uploadFilesDialogUploadList = [];
    },

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

        this.uploadFilesDialogUploadList.push(uploadMapObject);

        this.uploadFilesDialogFiles = null;
      }
    },

    findValidName(name: string, type: string): [number, string] {
      // check existance of name, return 0 if everything is Ok
      if (
        this.checkNameExistFolderContext(
          name,
          this.rawFolderContent as RawFolderContentType
        ) == false &&
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

    // drag & drop when dropping files or folders on the
    // background of the scrollarea or the upload Dialog Area
    // only adds items to a map to showcase them, user has to
    // press the actual upload button to upload these files
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

            this.uploadFilesDialogUploadList.push(uploadMapFile);
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

            this.uploadFilesDialogUploadList.push(uploadMapFolder);
          }
        }
      }
    },

    checkNameExistFolderContext(name: string, folder: RawFolderContentType) {
      return folder.children.some((el: FolderEntryType) => el.name == name);
    },

    // check if a name exists in current upload context (uploadFilesDialogUploadList)
    checkNameExistUploadContext(newName: string, existingName: string) {
      if (newName == existingName) {
        return false;
      } else {
        return this.uploadFilesDialogUploadList.some(
          (el) => el.name == newName
        );
      }
    },
  },
});
</script>
