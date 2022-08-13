<template>
  <ParticlesBG />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticlesBG from './components/ParticlesBG.vue';
import ParticlesText from './components/ParticlesText.vue';
import 'https://cdn.jsdelivr.net/npm/pathseg@1.2.0/pathseg.min.js';

export default defineComponent({
  name: 'App',
  components: { ParticlesBG },
});
</script>
