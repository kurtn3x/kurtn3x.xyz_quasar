<template>
  <div class="absolute-center" v-if="!loaded">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="!fetched && loaded">Something went wrong.</div>
  <div v-if="fetched && loaded">
    <q-toolbar class="q-mt-sm">
      <q-btn to="/dashboard/files" icon="arrow_back" flat>
        <q-tooltip>Go back</q-tooltip>
      </q-btn>
      <q-btn-dropdown icon="download" flat class="q-ml-md">
        <div>
          <q-btn
            flat
            class="bg-green text-white"
            icon="download"
            label="Download as File"
            @click="downloadCode()"
            style="width: 210px"
          ></q-btn>
        </div>
        <q-btn
          flat
          icon="content_copy"
          label="Copy to clipboard"
          @click="copyToClipboard()"
          style="width: 210px"
          class="bg-blue text-white"
        ></q-btn>
      </q-btn-dropdown>
      <q-btn
        class="bg-green text-white q-ml-md"
        icon="save"
        label="Save"
        @click="saveCodeFile()"
      ></q-btn>
      <q-space />
      <q-toolbar-title style="overflow: hidden"
        >{{ respData.code.name }}
      </q-toolbar-title>
      <q-btn icon="info" flat round class="q-ml-md">
        <q-menu>
          <q-card bordered>
            <div class="q-ma-sm text-body 1">
              <a class="text-weight-bolder"> Filename: </a>
              {{ respData.code.name }}
            </div>
            <div class="q-ma-sm text-body 1">
              <a class="text-weight-bolder"> Modified: </a>
              {{ respData.code.modified }}
            </div>
            <div class="q-ma-sm text-body 1">
              <a class="text-weight-bolder"> Created: </a>
              {{ respData.code.created }}
            </div>
            <div class="q-ma-sm text-body 1">
              <a class="text-weight-bolder"> Path: </a>
              {{ respData.code.path }}
            </div>
            <div class="q-ma-sm text-body 1">
              <a class="text-weight-bolder"> Owner: </a> {{ respData.owner }}
            </div>
            <div class="q-ma-sm text-body 1">
              <a class="text-weight-bolder"> Permissions: </a>
              {{ respData.permissions }}
            </div>
          </q-card>
        </q-menu>
      </q-btn>
      <q-space />
      <q-btn-dropdown icon="settings" flat>
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
            label="Theme"
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
        </q-card>
      </q-btn-dropdown>
    </q-toolbar>
    <q-separator size="3px" class="q-mt-sm" />
    <div class="q-ma-sm">
      <q-splitter
        v-model="splitterModel"
        :style="{ height: editorHeight + 'px' }"
        v-if="lang == 'markdown'"
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
        v-if="lang != 'markdown'"
        @keydown.ctrl.s.prevent.stop="saveCodeFile"
      />
    </div>
    <q-toolbar class="q-mt-md">
      <q-space />
      <a>Lines: {{ state.lines }}</a>
      <a class="q-ml-md">Characters: {{ state.length }} </a>
      <a class="q-ml-md"> Cursor: {{ state.cursor }} </a>
      <a class="q-ml-md">Selected Characters: {{ state.selected }} </a>
    </q-toolbar>
  </div>
  <q-separator class="q-mt-md" />
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
    const code = ref('');

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
      loaded: ref(false),
      splitterModel: ref(50),
      userStore,
      fetched: ref(false),
      settingsStore,
      q,
      disabled: ref(false),
      tabsize: ref(4),
      handleStateUpdate,
      state,
      code,
      handleReady,
      theme,
      fetchedLang: ref('python'),
      lang: ref('python'),
      langmap,
      thememap,
      respData: ref({
        code: { name: '', modified: '', created: '', path: '' },
        path: '',
        parentid: '',
      }),
    };
  },
  created() {
    if (!this.userStore.authenticated) {
      this.$router.push('/');
      this.notify(
        'negative',
        'You are not allowed to access this page without being logged in.'
      );
    } else {
      this.getCodeFile();
    }
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

      for (var [key, val] of this.langmap) {
        if (this.lang == key) {
          temp.push(val);
        }
      }

      return temp;
    },

    editorHeight() {
      var height = this.q.screen.height - 275;
      return height;
    },
  },

  methods: {
    downloadCode(){
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(this.code));
      element.setAttribute('download', this.respData.code.name);

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
      const axios_config = {
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

      var name = this.respData.code.name;
      if (this.lang != this.fetchedLang) {
        name = name.replace(/\.[^/.]+$/, '');
        name += this.codeSuff(this.lang);
        data.name = name;
      }

      api
        .put('/files/update/code', data, axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Saved.');
            this.fetchedLang = this.lang;
            this.respData.code.name = name;
          } else {
            this.notify('negative', 'ERROR :/');
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          console.log(error);
        });
    },

    getCodeFile() {
      var id = this.$route.params.id;
      const axios_config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/files/code/' + id, axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.respData = response.data;
            this.code = response.data.code.code;
            this.lang = response.data.code.language;
            this.fetchedLang = response.data.code.language;
            this.fetched = true;
            this.loaded = true;
          } else {
            // this.loading = false;
            // this.allowed = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          console.log(error);
        });
    },
  },
});
</script>
