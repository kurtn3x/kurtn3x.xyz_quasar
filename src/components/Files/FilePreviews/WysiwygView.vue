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

  <div v-if="!loading && !error">
    <div class="bg-light-blue-8 row text-white">
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
      :height="height"
      :content-style="'height:' + height"
      dense
      :class="darkmode ? 'text-white' : 'text-dark'"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { defineProps } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';

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

const height = computed(() => {
  return q.screen.height - 200 + 'px;';
});

const props = defineProps({
  item: Object,
});

var text = ref('');

api
  .get('/files/file-content/' + props.item.id, axiosConfig)
  .then((response) => {
    text.value = response.data.content;
    loading.value = false;
    error.value = false;
  })
  .catch((e) => {
    loading.value = false;
    error.value = true;
  });

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
    .catch((e) => {
      q.notify({
        type: 'negative',
        message: 'Something went wrong.',
        progress: true,
        multiLine: true,
      });
    });
}
</script>
