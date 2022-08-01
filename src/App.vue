<template>
  <Particles
    id="particles-js"
    :options="{
      fpsLimit: 60,
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            value_area: 1000,
          },
        },
        color: {
          value: ['#344455', '#ffffff'],
        },
        shape: {
          type: 'edge',
          stroke: {
            width: 0,
            color: '#000000',
          },
          polygon: {
            nb_sides: 5,
          },
        },
        opacity: {
          value: 0.4,
          random: false,
          anim: {
            enable: false,
            speed: 1,
            opacity_min: 0.1,
            sync: false,
          },
        },
        size: {
          value: 6,
          random: true,
          anim: {
            enable: false,
            speed: 40,
            size_min: 0.1,
            sync: false,
          },
        },
        line_linked: {
          enable: true,
          distance: 50,
          color: '#fff',
          opacity: 0.5,
          width: 1,
        },
        move: {
          enable: true,
          speed: 3,
          direction: 'none',
          random: false,
          straight: false,
          out_mode: 'out',
          bounce: true,
          attract: {
            enable: false,
            rotateX: 600,
            rotateY: 1200,
          },
        },
      },
      retina_detect: true,
    }"
    :particlesInit="particlesInit"
  />
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';

export default defineComponent({
  name: 'App',
  data() {
    return {
      mobile_view_bool: false,
      particlesInit: async (engine: Engine) => {
        await loadFull(engine);
      },
    };
  },
});
</script>
