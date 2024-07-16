<template>
  <div
    class="absolute-full flex flex-center text-h6 bg-transparent text-red"
    v-if="error"
  >
    Could not load image
  </div>
  <div
    v-if="loading"
    class="q-ma-md row justify-center items-center"
    style="height: 375px"
  >
    <q-spinner size="10em" />
  </div>
  <q-img :src="src" fit="scale-down" v-if="!loading && !error">
    <template v-slot:error>
      <div
        class="absolute-full flex flex-center text-h6 bg-transparent text-red"
      >
        Could not load image
      </div>
    </template>
  </q-img>
</template>

<script setup>
import { defineProps, ref } from 'vue';
import { apiGet } from 'src/components/apiWrapper';
import { useQuasar } from 'quasar';
const q = useQuasar();

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});

var error = ref(false);
var loading = ref(true);

const axiosConfig = {
  withCredentials: true,
  responseType: 'blob',
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
    'X-FILE-PASSWORD': props.password,
  },
};

var src = ref('');

apiGet(
  '/files/download/file/' + props.item.id + '/?attachment=0',
  axiosConfig
).then((apiData) => {
  if (apiData.error == false) {
    var reader = new window.FileReader();
    reader.readAsDataURL(apiData.data);
    reader.onload = function () {
      src.value = reader.result;
    };
    console.log(src.value);
    loading.value = false;
    error.value = false;
  } else {
    loading.value = false;
    error.value = true;
  }
});
</script>
