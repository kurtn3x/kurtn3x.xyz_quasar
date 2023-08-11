<template>
  <!-- Vue quill with plugins -->
  <q-dialog v-model="editSettingsDialog" @hide="availParents = []">
    <q-card>
      <div class="text-h6 q-ma-md text-primary">UPDATE DOCUMENT</div>
      <q-input
        dense
        standout
        v-model="updatedDocName"
        label="Name"
        input-class="text-center"
        class="full-width text-primary q-ma-md"
      />
      <q-select
        v-model="updatedDocParent"
        :options="availParents"
        label="Parent Folder"
        class="q-ma-md"
      />
      <q-btn
        label="Update"
        class="cursor-pointer full-width text-green"
        flat
        @click="saveDocumentInfo"
        :loading="loading"
        size="lg"
        v-close-popup
      />
    </q-card>
  </q-dialog>

  <q-page>
    <q-bar style="height: 50px; background-color: #00a4ef" class="text-white">
      <q-btn to="/dashboard/files" icon="arrow_back" flat class="text-white">
        <q-tooltip>Go back</q-tooltip>
      </q-btn>
      <q-icon name="feed" />
      <div class="q-ml-md">DOCUMENT EDITOR</div>
      <q-space />

      <div class="q-ml-md">File: {{ docName }}</div>
      <div class="q-ml-xl">Folder: {{ docParent }}</div>

      <q-space />

      <q-btn-dropdown icon="settings" flat>
        <q-card
          bordered
          style="min-width: 150px; max-width: 190px"
          class="items-start"
        >
          <q-btn
            flat
            label="Edit File"
            icon="edit"
            @click="
              editSettingsDialog = !editSettingsDialog;
              fetchAllAvailableFolders();
              updatedDocName = this.docName;
              updatedDocParent = this.docParent;
              this.availParents.push(this.docParent);
            "
            class="full-width"
            outlined
            dense
          />
          <q-separator />
          <q-btn
            flat
            label="Save"
            icon="save"
            @click="saveDocumentText()"
            class="full-width"
            outlined
            dense
          />

          <q-separator />
          <q-toggle
            v-model="autosave"
            label="Autosave"
            color="green"
            class="full-width"
            outlined
          />
        </q-card>
      </q-btn-dropdown>
    </q-bar>
    <editor :init="init" v-model="editorData" id="myTextarea" />
    <div :style="bottom_part_color" style="height: 30px">
      <div v-if="autosave" class="row">
        <q-space />
        <a class="q-mr-md"> Autosave Status: </a>
        <q-icon v-if="saved" name="done" class="text-green q-mr-md" size="24px">
          <q-tooltip anchor="center start" self="center right">
            This state was saved.
          </q-tooltip>
        </q-icon>
        <q-spinner
          v-if="!saved"
          color="primary"
          size="24px"
          :thickness="10"
          class="q-mr-md"
        />
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import { useRoute } from 'vue-router';
import 'tinymce/tinymce';
import 'tinymce/icons/default/icons';
import 'tinymce/themes/silver/theme';
import 'tinymce/models/dom/model';
import 'tinymce/plugins/lists/plugin';
import 'tinymce/plugins/link/plugin';
import 'tinymce/plugins/image/plugin';
import 'tinymce/plugins/table/plugin';
import 'tinymce/plugins/code/plugin';
import 'tinymce/plugins/help/plugin';
import 'tinymce/plugins/wordcount/plugin';
import 'tinymce/plugins/searchreplace/plugin';
import 'tinymce/plugins/image/plugin';
import 'tinymce/plugins/autoresize/plugin';
import 'tinymce/plugins/preview/plugin';
import 'tinymce/plugins/fullscreen/plugin';

import 'tinymce/skins/ui/oxide-dark/skin.css';

import Editor from '@tinymce/tinymce-vue';

export default defineComponent({
  name: 'DocEditorView',
  components: { editor: Editor },

  setup() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
    const q = useQuasar();

    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    var docId = useRoute().params.id;
    var editorData = ref('');
    var docData = ref({
      document: {
        name: '',
        modified: '',
        text: '',
        path: '',
        created: '',
      },
      path: '',
      parentid: '',
    });
    var loading = true;
    var saved = ref(false);

    // callback functions for custom tinymce buttons
    // save
    const saveFile = async (editor) => {
      editorData.value = await editor.getContent();
      var data = {
        item_id: docId,
        text: editorData,
      };
      api.put('/files/update/document', data, axiosConfig).then((response) => {
        if (response.status == 200) {
          q.notify({
            message: 'Saved.',
            color: 'green',
          });
        }
      });
    };

    // tinymce skins
    var skinurl = 'https://media.kurtn3x.xyz/skins/ui/oxide-dark/';
    var contenturl =
      'https://media.kurtn3x.xyz/skins/content/dark/content.min.css';

    if (!settingsStore.darkmode) {
      contenturl =
        'https://media.kurtn3x.xyz/skins/content/default/content.min.css';
      skinurl = 'https://media.kurtn3x.xyz/skins/ui/oxide/';
    }

    var height = q.screen.height - 190;

    const init = {
      selector: '#myTextarea',
      skin_url: skinurl,
      content_css: contenturl,
      height: height,
      menu: {
        file: {
          title: 'File',
          items: 'save | export print ',
        },
      },
      toolbar:
        'undo redo | styles | forecolor backcolor | bold italic underline | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | link image | print preview media fullscreen | ',

      promotion: false,
      plugins:
        'fullscreen preview code link lists table help wordcount searchreplace image',
      init_instance_callback: async function (editor) {
        editor.addShortcut('ctrl+s', 'Custom Ctrl+S', 'custom_ctrl_s');
        editor.addCommand('custom_ctrl_s', function () {
          saveFile(editor);
        });
        // get initial document data
        await api
          .get('/files/document/' + docId, axiosConfig)
          .then((response) => {
            if (response.status == 200) {
              editor.setContent(response.data.document.text);
              docData.value = response.data;
            } else {
            }
          })
          .catch();
      },
      setup: (editor) => {
        editor.ui.registry.addMenuItem('save', {
          icon: 'save',
          text: 'Save',
          shortcut: 'CTRL+S',
          onAction: (_) => saveFile(editor),
        });
      },
    };

    return {
      saved,
      savedData: ref(''),
      autosave: ref(true),
      init,
      editor: null,
      axiosConfig,
      userStore,
      settingsStore,
      q,
      loading,
      docName,
      docParent,
      parentId,
      // available parents from fetchallparents
      availParents: ref([]),
      // permanent doc id
      docId,
      editorData,
      // edit dialog
      editSettingsDialog: ref(false),
      // raw data from fetchallparents
      allAvailableFolders: {},
      // update
      updatedDocName: ref(''),
      updatedDocParent: ref(''),
    };
  },
  computed: {
    editorHeight() {
      var height = this.q.screen.height - 150;
      return height;
    },
    bottom_part_color() {
      if (this.settingsStore.darkmode) {
        return 'background-color: #222f3e';
      } else {
        return 'background-color: #fff';
      }
    },
  },
  mounted() {
    this.loading = false;
  },

  watch: {
    // autosaver
    async editorData(newcontent) {
      this.saved = false;
      // save the changed data into a variable
      this.savedData = newcontent;

      // sleep for some seconds
      await new Promise((r) => setTimeout(r, 3000));

      // check if the saved data is still the data of the current run
      // this means the data hasnt been changed in the last 2 seconds
      if (this.savedData == newcontent && this.autosave) {
        // save
        var editorData = await tinymce.activeEditor.getContent();
        var data = {
          item_id: this.docId,
          text: editorData,
        };
        api
          .put('/files/update/document', data, this.axiosConfig)
          .then((response) => {
            if (response.status == 200) {
              this.saved = true;
            }
          });
      }
    },
  },

  methods: {
    printText() {
      console.log(this.saved);
    },
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    fetchAllAvailableFolders() {
      api
        .get('/files/list_all_available_folders', this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.allAvailableFolders = response.data;
            for (var availableFolder of response.data.folders) {
              if (this.availParents.indexOf(availableFolder.path) === -1) {
                this.availParents.push(availableFolder.path);
              }
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
            console.log(error);
          }
          this.loading = false;
        });
    },
    saveDocumentInfo() {
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
        item_id: this.docId,
        new_parent_id: update_id,
        name: this.updatedDocName,
      };
      api
        .put('/files/update/document', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.docName = this.updatedDocName;
            this.docParent = this.updatedDocParent;
            this.notify('positive', 'Updated');
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
    saveDocumentText() {
      this.loading = true;
      var data = {
        item_id: this.docId,
        text: this.editorData,
      };
      api
        .put('/files/update/document', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Saved');
            this.loading = false;
            this.initialDialog = false;
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

.tox-notification {
  display: none !important;
}

.tox-notifications-container {
  visibility: hidden;
}
</style>
