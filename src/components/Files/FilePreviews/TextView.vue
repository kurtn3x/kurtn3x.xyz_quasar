<template>
  <q-input v-model="text" type="textarea" outlined />
</template>

<script setup>
import { ref } from 'vue';
import { api } from 'boot/axios';
import { defineProps } from 'vue';

const props = defineProps({
  id: String,
});
var text = ref('' + props.id);
console.log(props.id);
</script>
