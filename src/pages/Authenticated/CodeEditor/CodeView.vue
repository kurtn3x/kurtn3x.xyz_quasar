<template>
  <q-toolbar class="text-primary q-mt-sm">
    <q-btn flat round dense icon="menu" />
    <q-space />
    <q-select
      v-model="tabsize"
      :options="[1, 2, 3, 4, 5, 6]"
      label="Tab "
      outlined
      style="width: 100px"
      dense
    />
    <q-select
      class="q-ml-lg"
      v-model="theme"
      :options="Array.from(thememap.keys())"
      label="Theme"
      outlined
      style="width: 150px"
      dense
    />
    <q-select
      class="q-ml-lg"
      v-model="lang"
      :options="Array.from(langmap.keys())"
      label="Language"
      outlined
      style="width: 150px"
      dense
    />
  </q-toolbar>
  <q-separator color="primary" size="3px" class="q-mt-sm" />
  <div class="q-ma-sm">
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
    />
  </div>
  <q-toolbar>
    <a>Lines: {{ state.lines }}</a>
    <a class="q-ml-md">Characters: {{ state.length }} </a>
    <a class="q-ml-md"> Cursor: {{ state.cursor }} </a>
    <a class="q-ml-md">Selected Characters: {{ state.selected }} </a>
  </q-toolbar>
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

    return {
      settingsStore,
      q,
      disabled: ref(false),
      tabsize: ref(2),
      handleStateUpdate,
      state,
      code,
      handleReady,
      log: console.log,
      theme,
      lang: ref('python'),
      langmap,
      thememap,
      codeId: ref(''),
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
      var height = this.q.screen.height - 300;
      console.log(height);
      return height;
    },
  },

  methods: {
    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
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
            this.code = response.data.code.code;
            this.lang = response.data.code.language;
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
