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
    <div class="bg-light-blue-8 row text-white" style="height: 40px">
      <q-btn
        icon="save"
        label="Save"
        flat
        stretch
        class="bg-green text-white"
        @click="updateContent"
      />
      <q-separator vertical color="white" />
      <q-space />
      <div class="text-h6">Rich-Text-Editor</div>
      <q-space />
      <q-separator vertical color="white" />
      <q-btn
        :icon="darkmode ? 'dark_mode' : 'light_mode'"
        flat
        @click="darkmode = !darkmode"
      />
    </div>

    <q-editor
      v-model="text"
      :toolbar="[
        [
          {
            label: $q.lang.editor.align,
            icon: $q.iconSet.editor.align,
            fixedLabel: true,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify'],
          },
        ],
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'hr', 'link', 'custom_btn'],
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
        ],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],

        ['undo', 'redo'],
        ['viewsource', 'print'],
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
      :dark="darkmode"
      :class="darkmode ? 'text-white' : 'text-dark'"
      class="col column"
      max-height="600px"
      @keydown.ctrl.s.prevent.stop="updateContent"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { apiGet, apiPut } from 'src/apiWrapper';
import { defineProps, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});
var item = ref(props.item);

const q = useQuasar();
const localStore = useLocalStore();
var loading = ref(true);
var error = ref(false);
const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};
var darkmode = ref(localStore.darkmodeState);
var text = ref('');
getFileContent();

watch(
  () => item.value.id,
  () => {
    getFileContent();
  }
);

function getFileContent() {
  apiGet(
    '/files/file-content/' +
      item.value.id +
      (props.password != '' ? '?password=' + props.password : ''),
    axiosConfig
  ).then((apiData) => {
    if (apiData.error == false) {
      text.value = apiData.data.content;
      loading.value = false;
      error.value = false;
    } else {
      loading.value = false;
      error.value = true;
    }
  });
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
        if ('size' in apiData.data) {
          item.value.size = apiData.data.size;
        }
        if ('sizeBytes' in apiData.data) {
          item.value.sizeBytes = apiData.data.sizeBytes;
        }
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
</script>
