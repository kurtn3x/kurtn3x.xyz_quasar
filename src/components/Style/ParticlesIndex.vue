<template>
  <vue-particles id="tsparticles" :options="options" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
declare module '@tsparticles/vue3';

export default defineComponent({
  name: 'ParticlesIndex',
  setup() {
    const options = {
      fpsLimit: 60,
      particles: {
        color: { value: '#f8f0e3' },
        move: {
          attract: { enable: false, rotateX: 600, rotateY: 600 },
          bounce: false,
          direction: 'none',
          enable: true,
          out_mode: 'out',
          random: false,
          speed: 0.4,
          straight: true,
        },
        number: {
          density: { enable: true, value_area: 2000 },
          value: 300,
        },
        opacity: {
          anim: { enable: true, opacity_min: 0.3, speed: 5, sync: false },
          random: {
            enable: true,
            minimumValue: 0.4,
          },
          value: 0.7,
        },
        shape: {
          type: 'circle',
        },
        size: {
          anim: {
            enable: false,
          },
          random: false,
          value: 1,
        },
      },
      retina_detect: true,
    };
    return { options };
  },
});
</script>
