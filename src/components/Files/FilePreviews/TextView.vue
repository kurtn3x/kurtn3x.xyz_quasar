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
      <div class="text-h6">Text-Editor</div>
      <q-space />
      <q-separator vertical color="white" />
      <q-btn
        :icon="darkmode ? 'dark_mode' : 'light_mode'"
        flat
        @click="darkmode = !darkmode"
      />
    </div>
    <q-input
      v-model="text"
      type="textarea"
      outlined
      autogrow
      :input-style="'min-height:' + height"
      color="light-blue-6"
      :input-class="darkmode ? 'bg-dark text-white' : 'bg-white text-dark'"
      :class="darkmode ? 'bg-dark' : 'bg-white'"
      :dark="darkmode"
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

const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};
var darkmode = ref(localStore.darkmodeState);

const height = computed(() => {
  return q.screen.height - 160 + 'px;';
});

const props = defineProps({
  item: Object,
});

var text = ref('');

function log() {
  console.log(error.value);
  console.log(loading.value);
}

var loading = ref(true);
var error = ref(false);

api
  .get('/files/file-content/' + props.item.id, axiosConfig)
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
