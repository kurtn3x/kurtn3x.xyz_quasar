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
      <q-editor
        v-model="editorData"
        :dense="$q.screen.lt.md"
        :toolbar="[
          [
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              list: 'only-icons',
              options: ['left', 'center', 'right', 'justify'],
            },
            {
              label: $q.lang.editor.align,
              icon: $q.iconSet.editor.align,
              fixedLabel: true,
              options: ['left', 'center', 'right', 'justify'],
            },
          ],
          ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
          ['token', 'hr', 'link', 'custom_btn'],
          ['print', 'fullscreen'],
          [
            {
              label: $q.lang.editor.formatting,
              icon: $q.iconSet.editor.formatting,
              list: 'no-icons',
              options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code'],
            },
            {
              label: $q.lang.editor.fontSize,
              icon: $q.iconSet.editor.fontSize,
              fixedLabel: true,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'size-1',
                'size-2',
                'size-3',
                'size-4',
                'size-5',
                'size-6',
                'size-7',
              ],
            },
            {
              label: $q.lang.editor.defaultFont,
              icon: $q.iconSet.editor.font,
              fixedIcon: true,
              list: 'no-icons',
              options: [
                'default_font',
                'arial',
                'arial_black',
                'comic_sans',
                'courier_new',
                'impact',
                'lucida_grande',
                'times_new_roman',
                'verdana',
              ],
            },
            'removeFormat',
          ],
          ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

          ['undo', 'redo'],
          ['viewsource'],
        ]"
        :fonts="{
          arial: 'Arial',
          arial_black: 'Arial Black',
          comic_sans: 'Comic Sans MS',
          courier_new: 'Courier New',
          impact: 'Impact',
          lucida_grande: 'Lucida Grande',
          times_new_roman: 'Times New Roman',
          verdana: 'Verdana',
        }"
      />
    </div>
    <q-btn label="WWWW" @click="printtxt" />
    <q-separator />
    <div class="row">
      <q-space />
      <div
        class="q-mr-md q-mt-md"
        :class="localStoretore.darkmode ? 'text-light' : 'text-dark'"
        id="word-counter"
      ></div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'PublicDocEditorView',

  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axiosConfig,
      localStore,
      localStoretore,
      q,
      // permanent editor data
      editorData: '',

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
    this.getDoc();
  },
  methods: {
    printtxt() {
      console.log(this.editorData);
    },
    async getDoc() {
      await api
        .get('/files/public/document/' + this.docId, this.axiosConfig)
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
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
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
            this.notify('negative', '' + response.data.error);
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
        .put('/files/update/document', data, this.axiosConfig)
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
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
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
        .put('/files/update/document', data, this.axiosConfig)
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
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
          this.loading = false;
          console.log(error);
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
