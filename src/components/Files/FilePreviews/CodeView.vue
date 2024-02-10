<template>
  <div class="absolute-full flex flex-center bg-transparent" v-if="loading">
    <q-spinner color="primary" size="10em" />
  </div>
  <div
    v-if="!loading && error"
    class="row justify-center q-mt-lg text-red text-h6"
  >
    Couldn't load Text from File.
  </div>

  <div v-if="!loading && !error" class="col column">
    <div class="bg-light-blue-8 row text-white full-width" style="height: 40px">
      <q-btn
        icon="save"
        label="Save"
        flat
        stretch
        class="bg-green text-white"
        @click="save"
      />
      <q-separator vertical color="white" />
      <q-space />
      <q-separator vertical color="white" />
      <q-btn icon="info" flat stretch>
        <q-menu anchor="bottom middle" self="top middle">
          <div class="bg-light-blue-6 text-body1 text-center">
            <a class="q-ml-sm text-white"> Info </a>
          </div>
          <div class="q-ma-sm text-body1">
            <div>Lines: {{ state.lines }}</div>
            <div>Cursor: {{ state.cursor }}</div>
            <div>Characters: {{ state.length }}</div>
            <div>Selected: {{ state.selected }}</div>
          </div>
        </q-menu>
      </q-btn>
      <q-separator vertical color="white" />
      <q-btn icon="settings" flat stretch>
        <q-menu class="no-shadow" anchor="bottom middle" self="top middle">
          <q-card bordered>
            <q-item>
              <q-item-section>
                <q-item-label class="text-center text-body1 text-light-blue-6">
                  Syntax
                </q-item-label>
                <q-option-group
                  v-model="lang"
                  :options="langOptions"
                  color="light-blue-6"
                  class="q-mr-md q-mt-xs q-mb-xs"
                />
              </q-item-section>
            </q-item>
            <q-separator color="blue-5" />
            <q-item
              ><q-item-section>
                <q-item-label class="text-center text-body1 text-light-blue-6">
                  Tab Spaces
                </q-item-label>
                <div class="row q-mt-sm">
                  <q-btn
                    :disable="tabsize == 2"
                    label="2"
                    flat
                    class="col bg-blue-6 text-white q-mr-xs"
                    @click="tabsize = 2"
                  />
                  <q-btn
                    :disable="tabsize == 4"
                    label="4"
                    flat
                    class="col bg-blue-6 text-white q-ml-xs"
                    @click="tabsize = 4"
                  />
                </div>
              </q-item-section>
            </q-item>
          </q-card>
        </q-menu>
      </q-btn>
      <q-separator vertical color="white" />
      <q-btn
        :icon="darkmode ? 'dark_mode' : 'light_mode'"
        flat
        @click="darkmode = !darkmode"
      />
    </div>
    <q-card bordered class="col column">
      <q-scroll-area
        :class="darkmode ? 'bg-one-dark text-white' : 'bg-white text-dark'"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="col column"
        ref="scrollArea"
      >
        <codemirror
          v-model="text"
          placeholder="Code goes here..."
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="tabsize"
          :extensions="extensions"
          @update="handleStateUpdate"
          @ready="handleReady"
          @keydown.ctrl.s.prevent.stop="save"
        >
        </codemirror>
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script setup>
import { api } from 'boot/axios';
import { defineProps, reactive, shallowRef, ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { Codemirror } from 'vue-codemirror';
import 'highlight.js/styles/github-dark.css';
import { oneDark } from '@codemirror/theme-one-dark';
import { basicSetup } from 'codemirror';
import { python } from '@codemirror/lang-python';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { javascript } from '@codemirror/lang-javascript';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});

watch(
  () => props.item.id,
  () => {
    getFile();
  }
);
const q = useQuasar();
const localStore = useLocalStore();
const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};
var loading = ref(true);
var error = ref(false);

// lang options
const langmap = new Map();
langmap.set('python', python());
langmap.set('json', json());
langmap.set('markdown', markdown());
langmap.set('javascript', javascript());

const langOptions = [
  {
    label: 'None',
    value: '',
  },
  {
    label: 'Python',
    value: 'python',
  },
  {
    label: 'Json',
    value: 'json',
  },
  {
    label: 'Markdown',
    value: 'markdown',
  },
  {
    label: 'Javascript',
    value: 'javascript',
  },
];
// options / values
var lang = ref('');
var tabsize = ref(4);
var text = ref('');
var showInfo = ref(true);

// styling
var thumbStyle = {
  right: '4px',
  borderRadius: '5px',
  backgroundColor: '#0288d1',
  width: '5px',
  opacity: 0.75,
};
var barStyle = {
  right: '2px',
  borderRadius: '9px',
  backgroundColor: '#4fc3f7',
  width: '9px',
  opacity: 0.2,
};
var darkmode = ref(localStore.darkmodeState);

// codemirror options
const extensions = computed(() => {
  if (darkmode.value && lang.value == '') {
    return [basicSetup, oneDark];
  } else if (!darkmode.value && lang.value == '') {
    return [basicSetup];
  } else if (darkmode.value && lang.value != '') {
    return [basicSetup, oneDark, langmap.get(lang.value)];
  } else {
    return [basicSetup, langmap.get(lang.value)];
  }
});
const view = shallowRef();
const handleReady = (payload) => {
  view.value = payload.view;
};

const state = reactive({
  lines: null,
  cursor: null,
  selected: null,
  length: null,
});

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

getFile();

// functions
function getFile() {
  api
    .get(
      '/files/file-content/' +
        props.item.id +
        (props.password != '' ? '?password=' + props.password : ''),
      axiosConfig
    )
    .then((response) => {
      if (response.status == 200) {
        text.value = response.data.content;
        loading.value = false;
        error.value = false;
      } else {
        loading.value = false;
        error.value = true;
      }
    })
    .catch(() => {
      loading.value = false;
      error.value = true;
    });
}

function save() {
  var data = {
    item_id: props.item.id,
    content: text.value,
  };
  api
    .put('/files/update-content/file', data, axiosConfig)
    .then((response) => {
      if (response.status == 200) {
        q.notify({
          type: 'positive',
          message: 'Saved.',
          progress: true,
          multiLine: true,
        });
      } else {
        q.notify({
          type: 'negative',
          message: 'Something went wrong.',
          progress: true,
          multiLine: true,
        });
      }
    })
    .catch(() => {
      q.notify({
        type: 'negative',
        message: 'Something went wrong.',
        progress: true,
        multiLine: true,
      });
    });
}
</script>

<style>
.bg-one-dark {
  background-color: #282c34;
}
</style>
