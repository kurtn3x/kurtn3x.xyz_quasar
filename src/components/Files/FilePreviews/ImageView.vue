<template>
  <q-img :src="src" fit="scale-down">
    <template v-slot:error>
      <div
        class="absolute-full flex flex-center text-h6 bg-transparent text-red"
      >
        Cannot load image
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

var src = ref(
  'https://api.kurtn3x.xyz/files/content/file/' +
    props.item.id +
    (props.password != '' ? '?password=' + props.password : '')
);
</script>
