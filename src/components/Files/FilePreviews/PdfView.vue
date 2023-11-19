<template>
  <div class="absolute-full flex flex-center bg-transparent" v-if="loading">
    <q-spinner color="primary" size="10em" />
  </div>
  <div class="row justify-center q-mt-lg text-red text-h6" v-if="error">
    Error loading pdf
  </div>
  <div v-if="!loading && !error">
    <q-scroll-area
      :style="'height:' + height + 'px;'"
      :thumb-style="thumbStyle"
      :bar-style="barStyle"
    >
      <vue-pdf-embed :source="base64" />
    </q-scroll-area>
  </div>
</template>

<script setup>
import VuePdfEmbed from 'vue-pdf-embed';
import { defineProps, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { pdf } from './samples';

const props = defineProps({
  item: Object,
});
const q = useQuasar();

const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};

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

const height = computed(() => {
  return q.screen.height - 115;
});

// var base64 = ref('data:application/pdf;base64,' + pdf);
var base64 = ref('');
var loading = ref(false);
var error = ref(false);

api
  .get('/files/file-content/' + props.item.id, axiosConfig)
  .then((response) => {
    base64.value = 'data:application/pdf;base64,' + response.data.content;
    loading.value = false;
    error.value = false;
  })
  .catch((e) => {
    loading.value = false;
    error.value = true;
  });
</script>
