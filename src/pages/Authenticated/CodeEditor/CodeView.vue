<template>
  <div class="absolute-center" v-if="!fetched">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="!allowed && !fetched">Something went wrong.</div>
  <div v-if="!allowed && fetched">
    <q-dialog v-model="showCodeInfo">
      <q-card bordered class="text-body1" style="min-width: 350px">
        <div class="text-center text-h6 q-mt-sm">File Info</div>
        <q-separator size="2px" />
        <div class="q-ma-md">
          <div style="line-break: anywhere" class="q-mt-sm">
            <a class="text-weight-bolder"> Filename: </a>
            {{ codeData.name }}
          </div>
          <div style="line-break: anywhere" class="q-mt-sm">
            <a class="text-weight-bolder"> Modified: </a>
            {{ codeData.modified }}
          </div>
          <div style="line-break: anywhere" class="q-mt-sm">
            <a class="text-weight-bolder"> Created: </a>
            {{ codeData.created }}
          </div>
          <div style="line-break: anywhere" class="q-mt-sm">
            <a class="text-weight-bolder"> Path: </a>
            {{ codeData.path }}
          </div>
        </div>
      </q-card>
    </q-dialog>
    <div class="q-ma-sm" style="margin-top: 55px">
      <q-splitter
        v-model="splitterModel"
        :style="{ height: editorHeight + 'px' }"
        v-if="
          lang == 'markdown' && markdownPreview && !fullScreenMarkdownPreview
        "
      >
        <template v-slot:before>
          <codemirror
            v-model="code"
            placeholder="Code goes here..."
            :style="{ height: editorHeight + 'px' }"
            :autofocus="true"
            :indent-with-tab="true"
            :tab-size="tabsize"
            :extensions="extensions"
            @update="handleStateUpdate"
            @ready="handleReady"
            @keydown.ctrl.s.prevent.stop="saveCodeFile"
          />
        </template>

        <template v-slot:after>
          <Markdown :source="code" />
        </template>
      </q-splitter>

      <q-card bordered flat>
        <Markdown
          :source="code"
          v-if="
            lang == 'markdown' && markdownPreview && fullScreenMarkdownPreview
          "
          class="q-ma-md"
        />
      </q-card>

      <codemirror
        v-model="code"
        placeholder="Code goes here..."
        :style="{ height: editorHeight + 'px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="tabsize"
        :extensions="extensions"
        @update="handleStateUpdate"
        @ready="handleReady"
        v-if="lang != 'markdown' || (lang == 'markdown' && !markdownPreview)"
        @keydown.ctrl.s.prevent.stop="saveCodeFile"
      />
    </div>
    <q-toolbar class="q-mt-sm" v-if="!fullScreenMarkdownPreview">
      <q-space />
      <a>Lines: {{ state.lines }}</a>
      <a class="q-ml-md">Characters: {{ state.length }} </a>
      <a class="q-ml-md"> Cursor: {{ state.cursor }} </a>
      <a class="q-ml-md">Selected Characters: {{ state.selected }} </a>
    </q-toolbar>

    <q-page-sticky expand position="top">
      <q-toolbar class="bg-grey-8 text-white" style="z-index: -1; height: 50px">
        <q-btn-dropdown
          auto-close
          icon="download"
          color="green"
          style="height: 40px"
        >
          <div>
            <q-btn
              outline
              icon="download"
              label="Download as File"
              @click="downloadCode()"
              style="width: 220px; height: 40px"
            ></q-btn>
          </div>
          <q-separator size="2px" />
          <q-btn
            outline
            icon="content_copy"
            label="Copy to clipboard"
            @click="copyToClipboard()"
            style="width: 220px; height: 40px"
          ></q-btn>
        </q-btn-dropdown>
        <q-btn
          class="bg-green text-white q-ml-md"
          icon="save"
          label="Save"
          @click="saveCodeFile()"
          style="height: 40px"
        ></q-btn>

        <q-space />
        <a
          class="text-h5 q-ml-lg"
          style="overflow: hidden; text-overflow: ellipsis"
        >
          {{ codeData.name }}
        </a>
        <q-btn
          icon="info"
          flat
          round
          class="q-mr-lg"
          @click="showCodeInfo = true"
        />

        <q-space />
        <q-btn-dropdown icon="settings" color="blue" style="height: 40px">
          <q-card bordered style="min-width: 190px; max-width: 190px">
            <q-select
              class="full-width"
              v-model="tabsize"
              :options="[1, 2, 3, 4, 5, 6]"
              label="Tab Spaces"
              outlined
              style="width: 100px"
              dense
            />
            <q-separator />
            <q-select
              class="full-width"
              v-model="theme"
              :options="Array.from(thememap.keys())"
              label="Editor Theme"
              outlined
              style="width: 150px"
              dense
            />
            <q-separator />
            <q-select
              class="full-width"
              v-model="lang"
              :options="Array.from(langmap.keys())"
              label="Language"
              outlined
              dense
            />
            <q-separator />
            <q-checkbox
              v-model="markdownPreview"
              label="Preview Markdown"
              v-if="lang == 'markdown'"
            />
            <q-separator />

            <q-checkbox
              v-model="fullScreenMarkdownPreview"
              label="Preview Markdown Fullscreen"
              v-if="lang == 'markdown' && markdownPreview"
            />
          </q-card>
        </q-btn-dropdown>
      </q-toolbar>
    </q-page-sticky>
  </div>
</template>

<script lang="js">
import { defineComponent, ref, shallowRef, reactive } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { basicSetup } from 'codemirror';
import { langmap } from './langmap';
import { thememap } from './thememap';
import { useSettingsStore } from 'stores/settings';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user';
import  Markdown from 'vue3-markdown-it';
import 'highlight.js/styles/github-dark.css';

export default defineComponent({
  components: {
    Codemirror,
    Markdown,
  },
  setup() {
    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    const state = reactive({
      lines: null ,
      cursor: null ,
      selected: null ,
      length: null ,
    });

    const userStore = useUserStore();

    const handleStateUpdate = (viewUpdate) => {
      const ranges = viewUpdate.state.selection.ranges;
      state.selected = ranges.reduce(
        (plus, range) => plus + range.to - range.from,
        0
      );
      state.cursor = ranges[0].anchor;
      state.length = viewUpdate.state.doc.length;
      state.lines = viewUpdate.state.doc.lines;
    };

    const settingsStore = useSettingsStore();
    if (settingsStore.darkmode) {
      var theme = ref('oneDark');
    } else {
      var theme = ref('default');
    }

    const q = useQuasar();

    return {
      fetched: ref(false),
      allowed: ref(false),
      q,
      userStore,

      settingsStore,
      // codemirror settings & functions
      tabsize: ref(4),
      theme,
      state,
      handleReady,
      handleStateUpdate,
      fullScreenMarkdownPreview: ref(false),

      markdownPreview: ref(false),

      // markdown lang settings
      splitterModel: ref(50),

      showCodeInfo: ref(false),

      code: ref(''),
      fetchedLang: ref('python'),
      lang: ref('python'),
      langmap,
      thememap,
      codeData: ref(
        {
          id: 'id',
          name: 'name',
          modified: 'modified',
          created: 'created',
          language: 'language',
          code: 'code',
          permissions: 'permissions',
          owner: 'owner',
          ownerid: 'ownerid',
          parentid: 'parentid',
          path: 'path'
        }
      ),
    };
  },
  created() {
      this.getCodeFile();
  },

  computed: {

    extensions() {
      var temp = [basicSetup];

      for (var [key, val] of this.thememap) {
        if (this.theme == key) {
          if (val != '') {
            temp.push(val);
          }
        }
      }

      if (this.lang != 'None'){
      for (var [key, val] of this.langmap) {
        if (this.lang == key) {
          temp.push(val);
        }
      }
    }
      return temp;
    },

    editorHeight() {
      var height = this.q.screen.height - 225;
      return height;
    },
  },

  methods: {
    downloadCode(){
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.code));
      element.setAttribute('download', this.codeData.name);

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    copyToClipboard() {
      navigator.clipboard.writeText(this.code);
      this.notify('positive', 'Copied to clipboard.');
    },
    codeSuff(lang) {
      if (lang == 'javascript') {
        return '.js';
      } else if (lang == 'html') {
        return '.html';
      } else if (lang == 'cpp') {
        return '.cpp';
      } else if (lang == 'python') {
        return '.py';
      } else if (lang == 'json') {
        return '.json';
      } else if (lang == 'markdown') {
        return '.md';
      } else {
        return '.js';
      }
    },
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    saveCodeFile() {
      var id = this.$route.params.id;
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      var data = {
        item_id: id,
        lang: this.lang,
        code: this.code,
      };

      var name = this.codeData.name;
      if (this.lang != this.fetchedLang) {
        name = name.replace(/\.[^/.]+$/, '');
        name += this.codeSuff(this.lang);
        data.name = name;
      }

      api
        .put('/files/update/code', data, axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Saved.');
            this.fetchedLang = this.lang;
            this.codeData.name = name;
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

    getCodeFile() {
      var id = this.$route.params.id;
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/files/code/' + id, axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.codeData = response.data;
            this.code = response.data.code;
            this.lang = response.data.language;
            this.fetchedLang = response.data.language;
            this.allowed = true;
            this.fetched = true;
          } else {

            this.fetched = true;
            this.allowed = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
          this.fetched = true;
          this.allowed= false;
        });
    },
  },
});
</script>
