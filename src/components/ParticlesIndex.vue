<template>
  <Particles
    id="tsparticles_index"
    :class="active ? '' : 'hidden'"
    :options="{
      fpsLimit: 60,
      particles: {
        color: { value: '#f8f0e3' },
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
          density: { enable: true, value_area: 1000 },
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
          anim: { enable: false, size_min: 0.6, speed: 4, sync: false },
          random: false,
          value: 1,
        },
      },
      retina_detect: true,
    }"
    :particlesInit="particlesInit2"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine';
import { loadLightInteraction } from 'tsparticles-interaction-light';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'ParticlesIndex',
  setup() {
    var particlesContainer;
    var settingsStore = useSettingsStore();
    var active = ref(settingsStore.backgroundAnimationState);

    return {
      active,
      particlesContainer,
    };
  },

  data() {
    return {
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
    toogleActive(background_val: boolean) {
      this.active = background_val;
    },
  },
});
</script>

<style></style>
