<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <q-page> </q-page>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'VideoView',
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
      source: ref(''),
      axiosConfig,
      localStore,
      q,
      initialFetch: ref(true),
      initialFetchSuccessful: ref(true),
      loading: ref(false),
      videoOptions: {
        autoplay: true,
        controls: true,
        sources: [
          {
            src: 'https://api.kurtn3x.xyz/files/download/04059cd5-fa17-4069-a677-64c7c052107b',
            type: 'video/mp4',
          },
        ],
      },
    };
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
  },
});
</script>
