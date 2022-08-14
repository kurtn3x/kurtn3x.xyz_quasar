<template>
  <Particles
    id="tsparticles"
    :class="active ? '' : 'hidden'"
    :options="{
      // HERE

      fpsLimit: 60,
      interactivity: {
        detect_on: 'canvas',
        events: {
          onclick: { enable: true, mode: 'repulse' },

          resize: true,
        },
        modes: {
          bubble: { distance: 200, duration: 2, opacity: 0, size: 0, speed: 3 },
          grab: { distance: 400, line_linked: { opacity: 1 } },
          push: { particles_nb: 4 },
          remove: { particles_nb: 2 },
          repulse: { distance: 400, duration: 0.4 },
        },
      },
      particles: {
        color: { value: '#ffffff' },
        move: {
          attract: { enable: false, rotateX: 600, rotateY: 600 },
          bounce: false,
          direction: 'none',
          enable: true,
          out_mode: 'out',
          random: true,
          speed: 0.3,
          straight: false,
        },
        number: {
          density: { enable: true, value_area: 800 },
          value: 600,
        },
        opacity: {
          anim: { enable: true, opacity_min: 0.3, speed: 5, sync: false },
          random: {
            enable: true,
            minimumValue: 0.3,
          },
          value: 0.6,
        },
        shape: {
          type: 'circle',
        },
        size: {
          anim: { enable: false, size_min: 0.3, speed: 4, sync: false },
          random: false,
          value: 1,
        },
      },
      retina_detect: true,
      // HERE
    }"
    :particlesInit="particlesInit2"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';
import { loadLightInteraction } from 'tsparticles-interaction-light';

export default defineComponent({
  name: 'ParticlesBG',
  data() {
    return {
      active: ref(true),
      container: ref(''),
      particlesInit2: async (engine: Engine) => {
        loadLightInteraction(engine);
        await loadFull(engine);
      },
    };
  },
  methods: {
    toogle_active(background_val: boolean) {
      this.active = background_val;
    },
  },
});
</script>

<style></style>
