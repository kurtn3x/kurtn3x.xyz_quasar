<template>
  <div>
    <video-player
      preload="auto"
      controls
      :options="videoOptions"
      :muted="true"
      :responsive="true"
      :fluid="true"
    />
  </div>
</template>

<script setup>
import { VideoPlayer } from '@videojs-player/vue';
import 'video.js/dist/video-js.css';
import { defineProps } from 'vue';

const props = defineProps({
  propItem: Object,
});

var videoOptions = {
  experimentalSvgIcons: true,
  autoplay: true,
  controls: true,
  enableDocumentPictureInPicture: true,
  volume: 0.0,
  controlBar: {
    pictureInPictureToggle: true,
  },
  sources: [
    {
      src: 'https://api.kurtn3x.xyz/files/download/file/' + props.propItem.id,
      type: props.propItem.mime,
    },
  ],
};

console.log(props.propItem);
</script>
