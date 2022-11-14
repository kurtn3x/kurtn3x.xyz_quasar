<template>
  <div v-if="!fetched">Something went wrong.</div>
  <div v-if="fetched && !allowed">Not allowed.</div>
  <div v-if="fetched && allowed">
    <q-toolbar class="q-mt-sm">
      <q-btn to="/dashboard/files" icon="arrow_back" flat>
        <q-tooltip>Go back</q-tooltip>
      </q-btn>
      <q-space />
      <a class="text-h6"> {{ respData.code.name }}</a>
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
              <a class="text-weight-bolder"> Path: </a> {{ respData.code.path }}
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
            v-if="write_allowed"
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
            v-if="write_allowed"
          />
        </q-card>
      </q-btn-dropdown>
    </q-toolbar>
    <q-separator size="3px" class="q-mt-sm" />
    <div class="q-ma-sm">
      <codemirror
        v-model="code"
        :disabled="!this.write_allowed"
        placeholder="Code goes here..."
        :style="{ height: editorHeight + 'px' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="tabsize"
        :extensions="extensions"
        @update="handleStateUpdate"
        @ready="handleReady"
      />
    </div>
    <q-toolbar class="q-mt-md">
      <q-space />
      <q-btn
        v-if="write_allowed"
        size="lg"
        class="bg-green text-white"
        icon="save"
        label="Save"
        @click="saveCodeFile()"
      ></q-btn>
      <q-space />
      <a>Lines: {{ state.lines }}</a>
      <a class="q-ml-md">Characters: {{ state.length }} </a>
      <a class="q-ml-md"> Cursor: {{ state.cursor }} </a>
      <a class="q-ml-md">Selected Characters: {{ state.selected }} </a>
    </q-toolbar>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, shallowRef, reactive } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { ViewUpdate } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { langmap } from './langmap';
import { thememap } from './thememap';
import { useSettingsStore } from 'stores/settings';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user';

export default defineComponent({
  components: {
    Codemirror,
  },
  setup() {
    const code = ref('');

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload: any) => {
      view.value = payload.view;
    };

    const state = reactive({
      lines: null as null | number,
      cursor: null as null | number,
      selected: null as null | number,
      length: null as null | number,
    });

    const handleStateUpdate = (viewUpdate: ViewUpdate) => {
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

    const userStore = useUserStore();

    return {
      userStore,
      write_allowed: ref(false),
      allowed: ref(false),
      fetched: ref(false),
      settingsStore,
      q,
      disabled: ref(false),
      tabsize: ref(4),
      handleStateUpdate,
      state,
      code,
      handleReady,
      log: console.log,
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

      for (var [key, val] of this.langmap) {
        if (this.lang == key) {
          temp.push(val);
        }
      }

      return temp;
    },

    editorHeight() {
      var height = this.q.screen.height - 260;
      return height;
    },
  },

  methods: {
    codeSuff(lang: string) {
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
    notify(type: string, message: string) {
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
      var data: any = {
        item_id: id,
        lang: this.lang,
        code: this.code,
      };

      var name: any = this.respData.code.name;
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
            this.allowed = true;
            if (
              response.data.permissions == 'owner' ||
              (response.data.permissions.includes('write') &&
                this.userStore.authenticated)
            ) {
              this.write_allowed = true;
            }
            console.log(this.write_allowed);
          } else {
            this.fetched = false;
            this.allowed = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          console.log(error);
          this.fetched = false;
          this.allowed = false;
        });
    },
  },
});
</script>
