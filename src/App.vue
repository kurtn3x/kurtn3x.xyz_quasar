<template>
  <ParticlesBG />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticlesBG from './components/ParticlesBG.vue';

export default defineComponent({
  name: 'App',
  data() {
    return {
      mobile_view_bool: false,
    };
  },
  components: { ParticlesBG },
});
</script>
