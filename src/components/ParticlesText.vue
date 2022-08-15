<template>
  <Particles
    v-if="active"
    :class="active ? '' : 'hidden'"
    id="tsparticlestext"
    :options="{
      // HERE
      fpsLimit: 30,

      detectRetina: false,
      interactivity: {
        detectsOn: 'window',
        events: {
          onHover: {
            enable: true,
            mode: 'bubble',
          },
          resize: true,
        },
        modes: {
          bubble: {
            distance: 200,
            duration: 1,
            opacity: 1,
            size: 10,
            speed: 10,
          },
        },
      },
      particles: {
        color: {
          value: ['#4285f4', '#34A853', '#FBBC05', '#EA4335'],
        },
        lineLinked: {
          blink: false,
          color: 'random',
          consent: false,
          distance: 50,
          enable: true,
          opacity: 1.0,
          width: 1.0,
        },
        move: {
          attract: {
            enable: false,
            rotate: {
              x: 600,
              y: 1200,
            },
          },
          bounce: false,
          direction: 'none',
          enable: true,
          outMode: 'bounce',
          random: true,
          speed: 0.5,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 100000,
          },
          limit: 0,
          value: 1,
        },
        opacity: {
          value: 1.0,
        },
        shape: {
          type: 'circle',
        },
        size: {
          random: false,
          value: 0.1,
        },
      },
      polygon: {
        draw: {
          enable: true,
          lineColor: 'rgba(128,128,128, 0.2)',
          lineWidth: 1.0,
        },
        enable: true,
        move: {
          radius: 10,
        },
        inlineArrangement: 'equidistant',
        scale: 1.2,
        type: 'inline',
        url: './assets/name.svg',
        // url: './src/assets/name.svg',
      },
      // HERE
    }"
    :particlesInit="particlesInit"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';
import { loadPolygonMaskPlugin } from 'tsparticles-plugin-polygon-mask';

export default defineComponent({
  name: 'ParticlesText',
  setup() {
    return {
      active: ref(true),
      particlesInit: async (engine: Engine) => {
        await loadFull(engine);
        await loadPolygonMaskPlugin(engine);
      },
    };
  },
  methods: {
    toogle_active(text_val: boolean) {
      this.active = text_val;
    },
  },
});
</script>
