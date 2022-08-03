<template>
  <ParticlesBG />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticlesBG from './components/ParticlesBG.vue';

export default defineComponent({
  name: 'App',
  components: { ParticlesBG },
});
</script>
