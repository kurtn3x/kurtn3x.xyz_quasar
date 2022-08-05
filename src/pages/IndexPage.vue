<template>
  <h1>wwww</h1>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',
});
</script>

<style scoped>
#myVideo {
  position: absolute;
  right: 0;
  bottom: 0;
  min-width: 110%;
  min-height: 110%;
}

.video-container {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
  width: 300%; /* enlarge beyond browser width */
  left: -100%; /* center */
}

iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

@media (min-aspect-ratio: 16/9) {
  .video-container iframe {
    /* height = 100 * (9 / 16) = 56.25 */
    height: 56.25vw;
  }
}

@media (max-aspect-ratio: 16/9) {
  .video-container iframe {
    /* width = 100 / (9 / 16) = 177.777777 */
    width: 177.78vh;
  }
}
</style>
