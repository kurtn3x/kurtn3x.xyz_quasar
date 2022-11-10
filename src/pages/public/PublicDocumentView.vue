<template>
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
    <q-bar style="height: 50px; background-color: #00a4ef" class="text-light">
      <q-btn to="/dashboard/files" icon="arrow_back" flat class="text-white">
        <q-tooltip>Go back</q-tooltip>
      </q-btn>
      <q-icon name="feed" />
      <div class="q-ml-md">DOCUMENT EDITOR</div>
      <q-space />

      <div class="q-ml-md">File: {{ docName }}</div>
      <div class="q-ml-xl">Folder: {{ docParent }}</div>
      <q-space />

      <q-btn
        stretch
        flat
        label="Print (to PDF)"
        icon="print"
        @click="printDocument()"
        class="text-h6"
      />

      <q-btn
        stretch
        flat
        label="Edit File Settings"
        icon="edit"
        @click="
          editSettingsDialog = !editSettingsDialog;
          fetchAllAvailableFolders();
          updatedDocName = this.docName;
          updatedDocParent = this.docParent;
          this.availParents.push(this.docParent);
        "
        class="text-h6"
      />
      <q-btn
        stretch
        flat
        label="Save"
        icon="save"
        @click="saveDocumentText()"
        class="text-h6"
      />
    </q-bar>
    <div
      id="editor"
      style="
        size: 7in 9.25in;
        margin: 0mm 16mm 0mm 16mm;
        border-left: 1px solid;
        border-right: 1px solid;
      "
    >
      <ckeditor
        :editor="myeditor"
        v-model="editorData"
        :config="editorConfig"
        @ready="onReady"
      ></ckeditor>
    </div>
    <q-btn label="WWWW" @click="printtxt" />
    <q-separator />
    <div class="row">
      <q-space />
      <div
        class="q-mr-md q-mt-md"
        :class="settingsStore.darkmode ? 'text-light' : 'text-dark'"
        id="word-counter"
      ></div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import CKEditor from '@ckeditor/ckeditor5-vue';
import DecoupledEditor from 'ckeditor-custom';

export default defineComponent({
  name: 'DocEditorView',
  components: {
    ckeditor: CKEditor.component,
  },

  setup() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
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
      settingsStore,
      q,
      myeditor: DecoupledEditor,
      // permanent editor data
      editorData: '',
      editorConfig: {
        width: 300,
        toolbar: [
          'heading',
          'Alignment',
          '|',
          'fontColor',
          'fontFamily',
          'fontSize',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          '|',
          'bulletedList',
          'numberedList',
          'toDoList',
          '|',
          'Outdent',
          'Indent',
          '|',
          'link',
          'uploadImage',
          'insertImage',
          'insertMedia',
          'Blockquote',
          'insertTable',
          'code',
          'codeBlock',
          'specialCharacters',
          '|',
          'undo',
          'redo',
          '|',
          'horizontalLine',
          'findAndReplace',
          'pageBreak',
        ],
      },

      // permanent doc name
      docName: ref(''),
      // permanent doc parent path
      docParent: ref(''),
      // available parents from fetchallparents
      availParents: ref([]),
      // permanent doc id
      docId: 0,
      // edit dialog
      editSettingsDialog: ref(false),
      // raw data from fetchallparents
      allAvailableFolders: {},
      // update
      updatedDocName: ref(''),
      updatedDocParent: ref(''),
      dataSet: ref(false),

      parentId: ref(''),
    };
  },
  async created() {
    this.docId = this.$route.params.id;
  },
  methods: {
    printtxt() {
      console.log(this.editorData);
    },
    printDocument() {
      var wnd = window.open('about:blank', '', '_blank');
      console.log(this.editorData);
      wnd.document.write('<br>');
      wnd.document.write(this.editorData);
      wnd.document.write(
        "<head><style type='text/css' media='print'> @page {size: auto; margin-top: 0; margin-bottom:0; margin-left: 16mm; margin-right:16mm; } </style> </head>"
      );
      wnd.print();
    },
    async getDoc() {
      await api
        .get('/files/public/document/' + this.docId, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.editorData = response.data.document.text;
            this.docName = response.data.document.name;
            this.docParent = response.data.path;
            this.parentId = response.data.parentid;
            response.data.document.text;
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

    fetchAllAvailableFolders() {
      api
        .get('/files/list_all_available_folders', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.allAvailableFolders = response.data;
            for (var availableFolder of response.data.folders) {
              if (this.availParents.indexOf(availableFolder.path) === -1) {
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
            this.notify('positive', 'Saved');
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
    async onReady(editor) {
      const wordCountPlugin = editor.plugins.get('WordCount');
      const wordCountWrapper = document.getElementById('word-counter');
      wordCountWrapper.appendChild(wordCountPlugin.wordCountContainer);

      await this.getDoc();
      editor.setData(this.editorData);

      // Insert the toolbar before the editable area.
      const container = document.getElementById('editor');
      container.parentNode.insertBefore(
        editor.ui.view.toolbar.element,
        container
      );
      window.editor = editor;

      // Set a custom container for the toolbar.
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

.ck-editor__editable {
  width: 20cm;
  overflow-wrap: break-word;
  font-size: 21px;
}
</style>
