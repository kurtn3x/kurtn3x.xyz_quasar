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
    <div
      class="bg-layout-bg row text-layout-text full-width"
      style="height: 40px"
    >
      <q-btn
        icon="save"
        label="Save"
        flat
        stretch
        class="bg-green text-white"
        @click="updateContent"
        v-if="localStore.isAuthenticated"
      />
      <q-separator
        vertical
        color="layout-text"
        v-if="localStore.isAuthenticated"
      />
      <q-space />
      <q-separator vertical color="layout-text" />
      <q-btn icon="info" flat stretch>
        <q-menu anchor="bottom middle" self="top middle">
          <div class="bg-light-blue-6 text-body1 text-center">
            <a class="q-ml-sm text-white"> Info </a>
          </div>
          <div class="q-ma-sm text-body1">
            <div class="q-ma-sm">
              <a class="text-weight-bold">Lines:</a> {{ state.lines }}
            </div>
            <div class="q-ma-sm">
              <a class="text-weight-bold">Characters:</a> {{ state.length }}
            </div>
          </div>
        </q-menu>
      </q-btn>
      <q-separator vertical color="layout-text" />
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
                  @update:model-value="updateSyntax"
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
      <q-separator vertical color="layout-text" />
      <q-btn
        :icon="darkmode ? 'dark_mode' : 'light_mode'"
        flat
        @click="darkmode = !darkmode"
      />
    </div>
    <q-card bordered class="col column">
      <q-resize-observer @resize="onResize" :debounce="250" />
      <q-scroll-area
        :class="darkmode ? 'bg-one-dark text-white' : 'bg-white text-dark'"
        :thumb-style="thumbStyle"
        :bar-style="barStyle"
        class="col column"
      >
        <codemirror
          v-model="text"
          class="col column"
          placeholder="Write something..."
          :autofocus="true"
          :indent-with-tab="true"
          :tab-size="tabsize"
          :extensions="extensions"
          @update="handleStateUpdate"
          @ready="handleReady"
          @keydown.ctrl.s.prevent.stop="updateContent"
        >
        </codemirror>
      </q-scroll-area>
    </q-card>
  </div>
</template>

<script setup>
import { apiPut, apiGet } from 'src/components/apiWrapper';
import {
  defineProps,
  reactive,
  shallowRef,
  ref,
  computed,
  watch,
  onMounted,
} from 'vue';
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

var item = ref(props.item);

watch(
  () => item.value.id,
  () => {
    getFileContent();
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

// set the initial config for python, javascript, markdown or json
const initialMime = item.value.mime;
if (['text/x-python', 'text/code-python'].indexOf(initialMime) > -1) {
  lang.value = 'python';
} else if (
  [
    'application/x-javascript',
    'application/javascript',
    'text/code-javascript',
  ].indexOf(initialMime) > -1
) {
  lang.value = 'javascript';
} else if (['text/markdown', 'text/code-markdown'].indexOf(initialMime) > -1) {
  lang.value = 'markdown';
} else if (['application/json', 'text/code-json'].indexOf(initialMime) > -1) {
  lang.value = 'json';
}

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

getFileContent();

onMounted(async () => {
  var els = document.getElementsByClassName('q-scrollarea__container');
  for (var el of els) {
    el.classList.add('column', 'col');
  }
});

// functions
function getFileContent() {
  var args = '';
  if (props.password != '') {
    args += '?password=' + props.password;
  }
  apiGet('/files/file-content/' + item.value.id + args, axiosConfig).then(
    (apiData) => {
      if (apiData.error == false) {
        text.value = apiData.data.content;
        loading.value = false;
        error.value = false;
      } else {
        loading.value = false;
        error.value = true;
      }
    }
  );
}

function updateContent() {
  var data = {
    content: text.value,
  };
  apiPut('/files/file-content/' + item.value.id, data, axiosConfig).then(
    (apiData) => {
      if (apiData.error == false) {
        q.notify({
          type: 'positive',
          message: 'Saved.',
          progress: true,
        });
        apiGet(
          '/files/file-content/' + item.value.id + '?only_size=1',
          axiosConfig
        ).then((apiData) => {
          if (apiData.error == false) {
            item.value.size = apiData.data.size;
            item.value.sizeBytes = apiData.data.sizeBytes;
          } else {
            q.notify({
              type: 'negative',
              message: apiData.errorMessage,
              progress: true,
            });
          }
        });
      } else {
        q.notify({
          type: 'negative',
          message: apiData.errorMessage,
          progress: true,
        });
      }
    }
  );
}

function updateSyntax(syntax) {
  var data = {
    itemId: item.value.id,
    mime: 'text/code-' + syntax,
  };
  apiPut('/files/file/' + item.value.id, data, axiosConfig).then((apiData) => {
    if (apiData.error == false) {
      q.notify({
        type: 'positive',
        message: 'Saved.',
        progress: true,
      });
      item.value.mime = data.mime;
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage,
        progress: true,
      });
    }
  });
}

function onResize() {
  var els = document.getElementsByClassName('q-scrollarea__container');
  for (var el of els) {
    el.classList.add('column', 'col');
  }
}
</script>

<style>
.bg-one-dark {
  background-color: #282c34;
}
</style>
