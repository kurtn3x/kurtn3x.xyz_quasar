<template>
  <q-img :src="src" fit="scale-down" :height="height + 'px'">
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
import { ref, computed } from 'vue';
import { defineProps } from 'vue';
import { image } from './samples';
import { api } from 'boot/axios';
import { useQuasar } from 'quasar';
const q = useQuasar();

const height = computed(() => {
  return q.screen.height - 115;
});

const props = defineProps({
  item: Object,
});

// var src = image;
var src = 'https://api.kurtn3x.xyz/files/content/file/' + props.item.id;
</script>
