<template>
  <Particles
    id="tsparticles"
    :options="{
      // HERE

      detectRetina: false,
      fpsLimit: 60,
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
            distance: 40,
            duration: 2,
            opacity: 8,
            size: 6,
            speed: 3,
          },
        },
      },
      particles: {
        color: {
          value: '#ff0000',
          animation: {
            enable: true,
            speed: 20,
            sync: true,
          },
        },
        lineLinked: {
          blink: false,
          color: 'random',
          consent: false,
          distance: 30,
          enable: true,
          opacity: 1.0,
          width: 0.5,
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
          enable: false,
          outMode: 'bounce',
          random: true,
          speed: 0.5,
          straight: false,
        },
        number: {
          density: {
            enable: false,
            area: 2000,
          },
          limit: 0,
          value: 200,
        },
        opacity: {
          animation: {
            enable: true,
            minimumValue: 0.05,
            speed: 2,
            sync: false,
          },
          random: false,
          value: 1,
        },
        shape: {
          type: 'circle',
        },
        size: {
          animation: {
            enable: false,
            minimumValue: 0.1,
            speed: 40,
            sync: false,
          },
          random: true,
          value: 1,
        },
      },
      polygon: {
        draw: {
          enable: false,
          lineColor: 'rgba(255,255,255,1.0)',
          lineWidth: 1.0,
        },
        enable: true,
        move: {
          radius: 20,
        },

        inlineArrangement: 'equidistant',
        scale: 1.0,
        type: 'inline',
        url: './src/components/test2.svg',
      },

      // HERE
    }"
    :particlesInit="particlesInit"
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { loadFull } from 'tsparticles';
import { Engine, Opacity } from 'tsparticles-engine';
import { loadPolygonPath } from 'tsparticles-path-polygon';
import { loadPolygonMaskPlugin } from 'tsparticles-plugin-polygon-mask';

export default defineComponent({
  name: 'ParticlesBG',
  data() {
    return {
      particlesInit: async (engine: Engine) => {
        await loadPolygonMaskPlugin(engine);
        await loadFull(engine);
      },
    };
  },
});
</script>

<style></style>
