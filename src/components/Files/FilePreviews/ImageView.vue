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

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});

var error = ref(false);
var loading = ref(true);

var args = '';
if (props.password != '') {
  args += '?password=' + props.password + '&attachment=0';
} else {
  args += '?attachment=0';
}
var src = ref(
  'https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args
);
</script>
