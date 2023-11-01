<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <div class="q-ma-md">
      <video-player
        preload="auto"
        controls
        :options="videoOptions"
        :muted="true"
        :responsive="true"
        :fluid="true"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { VideoPlayer } from '@videojs-player/vue';
import 'video.js/dist/video-js.css';
import { useRoute } from 'vue-router';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'VideoView',
  components: {
    VideoPlayer,
  },
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axiosConfig,
      localStore,
      q,
      initialFetch: ref(true),
      initialFetchSuccessful: ref(false),
      loading: ref(false),
      videoOptions: {
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
            src: '',
            type: 'video/mp4',
          },
        ],
      },
    };
  },

  created() {
    this.getVideo();
  },

  methods: {
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    getVideo() {
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      this.fileId = this.$route.params.id;

      var url = '/files/file/' + this.fileId;

      api
        .get(url, axiosConfig)
        .then((response) => {
          console.log(response);
          if (response.status == 200) {
            this.initialFetchSuccessful = true;
            this.initialFetch = true;
            this.videoOptions.sources[0].src =
              'https://api.kurtn3x.xyz/files/content/file/' + this.fileId;
            this.videoOptions.sources[0].type = response.data.mime;
          } else {
            this.initialFetch = true;
            this.initialFetchSuccessful = true;
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.videoOptions.sources[0].src =
            'https://api.kurtn3x.xyz/files/content/file/' + this.fileId;
          this.$nextTick(() => {
            this.initialFetch = true;
            this.initialFetchSuccessful = true;
          });
        });
    },
  },
});
</script>
