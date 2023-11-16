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
  mime: String,
  id: String,
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
      src: 'https://api.kurtn3x.xyz/files/content/file/' + props.id,
      type: props.mime,
    },
  ],
};

console.log(props.id);
</script>
