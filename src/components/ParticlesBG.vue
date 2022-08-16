<template>
  <Particles
    id="tsparticles"
    :class="active ? '' : 'hidden'"
    :options="{
      // HERE
      themes: [
        {
          name: 'light',
          default: {
            value: false,
            mode: 'light',
          },
          options: {
            particles: {
              color: {
                value: ['#120912'],
              },
            },
          },
        },
      ],

      fpsLimit: 45,
      interactivity: {
        detect_on: 'canvas',
        events: {
          onclick: { enable: true, mode: 'repulse' },

          resize: true,
        },
        modes: {
          repulse: { distance: 200, duration: 6.0 },
        },
      },
      particles: {
        color: { value: '#f8f0e3' },
        move: {
          attract: { enable: false, rotateX: 600, rotateY: 600 },
          bounce: true,
          direction: 'none',
          enable: true,
          out_mode: 'out',
          random: true,
          speed: 0.3,
          straight: false,
        },
        number: {
          density: { enable: true, value_area: 800 },
          value: 500,
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
    :particlesLoaded="particlesLoaded"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';
import { loadLightInteraction } from 'tsparticles-interaction-light';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'ParticlesBG',
  setup() {
    var particlesContainer;
    const settings_store = useSettingsStore();
    return {
      particlesContainer,
      settings_store,
    };
  },
  computed: {
    darkmode() {
      return this.settings_store.darkmode;
    },
  },

  watch: {
    darkmode(valChanged) {
      if (this.particlesContainer) {
        if (!valChanged) {
          this.particlesContainer.loadTheme('light');
        } else {
          this.particlesContainer.loadTheme();
        }
      }
    },
  },
  data() {
    return {
      active: ref(false),
      particlesInit2: async (engine: Engine) => {
        loadLightInteraction(engine);
        await loadFull(engine);
      },
      particlesLoaded: async (container: any) => {
        this.particlesContainer = container;
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
