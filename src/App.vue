<template>
  <ParticlesText ref="textAnimation" v-if="!mobile" />
  <router-view
    @text_animation="toogleTextAnimation"
    @background_animation="toogleBackgroundAnimation"
  />
  <ParticlesBG ref="backgroundAnimation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ParticlesBG from './components/ParticlesBG.vue';
import ParticlesText from './components/ParticlesText.vue';
import 'https://cdn.jsdelivr.net/npm/pathseg@1.2.0/pathseg.min.js';
import { useQuasar } from 'quasar';
import { ref } from 'vue';

export default defineComponent({
  name: 'App',
  components: { ParticlesText, ParticlesBG },
  setup() {
    const $q = useQuasar();
    $q.dark.set(true);
    return {
      mobile: $q.platform.is.mobile,
    };
  },
  methods: {
    toogleTextAnimation(text_val: boolean) {
      this.$refs.textAnimation.toogle_active(text_val);
    },
    toogleBackgroundAnimation(bg_val: boolean) {
      this.$refs.backgroundAnimation.toogle_active(bg_val);
    },
  },
});
</script>
