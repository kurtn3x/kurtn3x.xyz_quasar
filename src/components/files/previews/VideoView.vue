<template>
  <div
    class="q-mt-lg row justify-center"
    v-if="loading"
  >
    <q-spinner
      color="light-blue-6"
      size="10em"
      style="height: 200px; width: 200px"
    />
  </div>
  <div
    class="row justify-center q-mt-lg text-red text-h6"
    v-if="error && !loading"
  >
    Error loading video
  </div>
  <div v-show="!loading && !error">
    <video-player
      preload="auto"
      controls
      playsinline
      :options="videoOptions"
      :muted="true"
      :responsive="true"
      :fluid="true"
      @loadedmetadata="handleMetadata"
      class="vjs-theme-forest"
      @error="errorPlayer"
    />
  </div>
</template>

<script setup>
import { VideoPlayer } from '@videojs-player/vue';
import 'video.js/dist/video-js.css';
import { defineProps, ref, watch } from 'vue';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});
var loading = ref(true);
var error = ref(false);

var args = '';
if (props.password != '') {
  args += '?password=' + props.password + '&attachment=0';
} else {
  args += '?attachment=0';
}

var src = ref(
  'https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args
);

var videoOptions = ref({
  autoplay: true,
  controls: true,
  enableDocumentPictureInPicture: true,
  volume: 0.0,
  controlBar: {
    pictureInPictureToggle: true,
  },
  sources: [
    {
      src: src,
      type: props.item.mime,
    },
  ],
});

watch(
  () => props.item,
  (newVal) => {
    src.value =
      'https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args;
    videoOptions.value.sources[0].src = src.value;
  },
  { immediate: true }
);

// functions
const handleMetadata = () => {
  // go out of loading if metadata has been loaded
  loading.value = false;
};

function errorPlayer() {
  loading.value = false;
  error.value = true;
}
</script>

<style>
.vjs-theme-forest {
  --vjs-theme-forest--primary: #03a9f4 !important;
  --vjs-theme-forest--secondary: #fff;
}
.vjs-theme-forest.vjs-big-play-button:focus,
.vjs-theme-forest:hover .vjs-big-play-button {
  background-color: transparent;
  background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='88' fill='%236fb04e'%3E%3Cpath fill-rule='evenodd' d='M44 88C19.738 88 0 68.262 0 44S19.738 0 44 0s44 19.738 44 44-19.738 44-44 44zm0-85C21.393 3 3 21.393 3 44c0 22.608 18.393 41 41 41s41-18.392 41-41C85 21.393 66.607 3 44 3zm16.063 43.898L39.629 60.741a3.496 3.496 0 01-3.604.194 3.492 3.492 0 01-1.859-3.092V30.158c0-1.299.712-2.483 1.859-3.092a3.487 3.487 0 013.604.194l20.433 13.843a3.497 3.497 0 01.001 5.795zm-1.683-3.311L37.946 29.744a.49.49 0 00-.276-.09.51.51 0 00-.239.062.483.483 0 00-.265.442v27.685c0 .262.166.389.265.442.1.053.299.118.515-.028L58.38 44.414A.489.489 0 0058.6 44a.49.49 0 00-.22-.413z'/%3E%3C/svg%3E");
}
.vjs-theme-forest .vjs-big-play-button {
  width: 88px;
  height: 88px;
  background: none;
  background-repeat: no-repeat;
  background-position: 50%;
  background: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='88' fill='%23fff'%3E%3Cpath fill-rule='evenodd' d='M44 88C19.738 88 0 68.262 0 44S19.738 0 44 0s44 19.738 44 44-19.738 44-44 44zm0-85C21.393 3 3 21.393 3 44c0 22.608 18.393 41 41 41s41-18.392 41-41C85 21.393 66.607 3 44 3zm16.063 43.898L39.629 60.741a3.496 3.496 0 01-3.604.194 3.492 3.492 0 01-1.859-3.092V30.158c0-1.299.712-2.483 1.859-3.092a3.487 3.487 0 013.604.194l20.433 13.843a3.497 3.497 0 01.001 5.795zm-1.683-3.311L37.946 29.744a.49.49 0 00-.276-.09.51.51 0 00-.239.062.483.483 0 00-.265.442v27.685c0 .262.166.389.265.442.1.053.299.118.515-.028L58.38 44.414A.489.489 0 0058.6 44a.49.49 0 00-.22-.413z'/%3E%3C/svg%3E");
  border: none;
  top: 50%;
  left: 50%;
  margin-top: -44px;
  margin-left: -44px;
  color: purple;
}
.vjs-theme-forest .vjs-big-play-button .vjs-icon-placeholder {
  display: none;
}
.vjs-theme-forest .vjs-button > .vjs-icon-placeholder:before {
  line-height: 1.55;
}
.vjs-theme-forest .vjs-control:not(.vjs-disabled):not(.vjs-time-control):hover {
  color: var(--vjs-theme-forest--primary);
  text-shadow: var(--vjs-theme-forest--secondary) 1px 0 10px;
}
.vjs-theme-forest .vjs-control-bar {
  background: #03a8f46b;
  padding-left: 1em;
  padding-right: 1em;
}
.vjs-theme-forest .vjs-play-control {
  font-size: 0.8em;
}
.vjs-theme-forest .vjs-play-control .vjs-icon-placeholder:before {
  background-color: var(--vjs-theme-forest--secondary);
  height: 1.5em;
  width: 1.5em;
  margin-top: 0.2em;
  border-radius: 1em;
  color: var(--vjs-theme-forest--primary);
}
.vjs-theme-forest .vjs-play-control:hover .vjs-icon-placeholder:before {
  background-color: var(--vjs-theme-forest--primary);
  color: var(--vjs-theme-forest--secondary);
}
.vjs-theme-forest .vjs-mute-control {
  display: none;
}
.vjs-theme-forest .vjs-volume-panel {
  margin-left: 0.5em;
  margin-right: 0.5em;
  padding-top: 0.3em;
}
.vjs-theme-forest .vjs-volume-bar.vjs-slider-horizontal,
.vjs-theme-forest .vjs-volume-panel,
.vjs-theme-forest
  .vjs-volume-panel.vjs-volume-panel-horizontal.vjs-slider-active,
.vjs-theme-forest .vjs-volume-panel.vjs-volume-panel-horizontal:hover,
.vjs-theme-forest
  .vjs-volume-panel:active
  .vjs-volume-control.vjs-volume-horizontal,
.vjs-theme-forest .vjs-volume-panel:hover,
.vjs-theme-forest
  .vjs-volume-panel:hover
  .vjs-volume-control.vjs-volume-horizontal {
  width: 3em;
}
.vjs-theme-forest .vjs-volume-level:before {
  font-size: 1em;
}
.vjs-theme-forest .vjs-volume-panel .vjs-volume-control {
  opacity: 1;
  width: 100%;
  height: 100%;
}
.vjs-theme-forest .vjs-volume-bar {
  background-color: transparent;
  margin: 0;
}
.vjs-theme-forest .vjs-slider-horizontal .vjs-volume-level {
  height: 100%;
}
.vjs-theme-forest .vjs-volume-bar.vjs-slider-horizontal {
  margin-top: 0;
  margin-bottom: 0;
  height: 100%;
}
.vjs-theme-forest .vjs-volume-bar:before {
  content: '';
  z-index: 0;
  width: 0;
  height: 0;
  position: absolute;
  top: 0;
  left: 0;
  border-left: 3em solid transparent;
  border-bottom: 2em solid var(--vjs-theme-forest--primary);
  border-right: 0 solid transparent;
  border-top: 0 solid transparent;
}
.vjs-theme-forest .vjs-volume-level {
  overflow: hidden;
  background-color: transparent;
}
.vjs-theme-forest .vjs-volume-level:before {
  content: '';
  z-index: 1;
  width: 0;
  height: 0;
  position: absolute;
  top: 0;
  left: 0;
  border-left: 3em solid transparent;
  border-bottom: 2em solid var(--vjs-theme-forest--secondary);
  border-right: 0 solid transparent;
  border-top: 0 solid transparent;
}
.vjs-theme-forest .vjs-progress-control:hover .vjs-progress-holder {
  font-size: 1em;
}
.vjs-theme-forest .vjs-play-progress:before {
  display: none;
}
.vjs-theme-forest .vjs-progress-holder {
  border-radius: 0.2em;
  height: 0.5em;
  margin: 0;
}
.vjs-theme-forest .vjs-load-progress,
.vjs-theme-forest .vjs-load-progress div,
.vjs-theme-forest .vjs-play-progress {
  border-radius: 0.2em;
}
</style>
