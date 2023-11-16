<template>
  <div class="row justify-center q-mt-lg" v-if="loading">
    <q-spinner color="primary" size="10em" />
  </div>
  <vue-pdf-embed :source="base64" v-if="!loading" />
</template>

<script setup>
import VuePdfEmbed from 'vue-pdf-embed';
import { defineProps, ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const props = defineProps({
  id: String,
});

const q = useQuasar();
const axiosConfig = {
  responseType: 'arraybuffer',
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};

var base64 = '';
var loading = ref(true);

api
  .get('/files/content/file/' + props.id, axiosConfig)
  .then((response) => {
    base64 = Buffer.from(response.data, 'binary').toString('base64');
    loading.value = false;
    console.log(base64);
  })
  .catch((error) => {
    console.log(error);
    loading.value = false;
  });
</script>
