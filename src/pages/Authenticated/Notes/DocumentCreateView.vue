<template>
  <q-dialog v-model="editSettingsDialog" persistent @hide="availParents = []">
    <q-card>
      <div class="text-h6 q-ma-md text-primary">UPDATE DOCUMENT</div>
      <q-input
        dark
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
        label="Create"
        class="cursor-pointer full-width text-green"
        flat
        @click="saveDocumentInfo"
        :loading="loading"
        size="lg"
      />
    </q-card>
  </q-dialog>
  <q-dialog v-model="initialDialog" persistent>
    <q-card>
      <div class="text-h6 q-ma-md text-primary">CREATE A NEW DOCUMENT</div>
      <q-input
        dark
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
        label="Create"
        class="cursor-pointer full-width text-green"
        flat
        @click="createDocument"
        :loading="loading"
        size="lg"
      />
    </q-card>
  </q-dialog>

  <q-page>
    <q-bar style="height: 50px; background-color: #00a4ef" class="text-light">
      <q-icon name="feed" />
      <div class="q-ml-md">DOCUMENT EDITOR</div>
      <q-space />

      <div class="q-ml-md">File: {{ docName }}</div>
      <div class="q-ml-xl">Folder: {{ docParent }}</div>
      <q-space />

      <q-btn
        stretch
        flat
        label="Edit File Settings"
        icon="edit"
        @click="pdf_viewer_maximized = !pdf_viewer_maximized"
        class="text-h6"
      />
      <q-btn
        stretch
        flat
        label="Save"
        icon="save"
        @click="show_file_editor = !show_file_editor"
        class="text-h6"
      />
    </q-bar>
    <ckeditor
      :editor="myeditor"
      v-model="editorData"
      :config="editorConfig"
      @ready="onReady"
    ></ckeditor>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import CKEditor from '@ckeditor/ckeditor5-vue';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

export default defineComponent({
  name: 'NotesView',
  components: {
    ckeditor: CKEditor.component,
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
      axios_config,
      userStore,
      settings_store,
      q,
      myeditor: DecoupledEditor,
      editorData: '<p>Content of the editor.</p>',
      editorConfig: {},
      // permanent
      docName: ref(''),
      docParent: ref(''),
      availParents: ref([]),
      initialDialog: ref(true),
      currentParent: ref(0),
      allAvailableFolders: ref({}),

      // update
      updatedDocName: ref(''),
      updatedDocParent: ref(''),
    };
  },
  created() {
    this.currentParent = this.$route.params.current_folder_id;
    this.fetchAllAvailableFolders();
  },
  methods: {
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
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
        current_folder_id: update_id,
        name: this.updatedDocName,
      };
      api
        .put('/files/update/document', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.docName = this.updatedDocName;
            this.docParent = this.updatedDocParent;
            this.notify('positive', 'Updated');
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

    saveDocumentText() {
      this.loading = true;
      var data = {
        item_id: this.docId,
        text: this.editorData,
      };
      api
        .put('/files/update/document', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Created');
            this.loading = false;
            this.initialDialog = false;
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
              this.availParents.push(availableFolder.path);
              if (availableFolder.id == this.currentParent) {
                this.docParent = availableFolder.path;
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
            this.initialDialog = false;
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
    onReady(editor) {
      // Insert the toolbar before the editable area.
      editor.ui
        .getEditableElement()
        .parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.getEditableElement()
        );
      const view = editor.editing.view;
      const viewDocument = view.document;
      // handle tab keys
      viewDocument.on('keydown', (evt, data) => {
        if (data.keyCode == 9 && viewDocument.isFocused) {
          // with white space setting to pre
          // editor.execute('input', { text: '\t' });
          editor.execute('input', { text: '    ' });

          evt.stop(); // Prevent executing the default handler.
          data.preventDefault();
          view.scrollToTheSelection();
        }
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
</style>
