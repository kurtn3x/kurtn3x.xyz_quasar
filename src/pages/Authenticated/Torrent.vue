<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful"></div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'TorrentView',
  setup() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
    const q = useQuasar();

    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axios_config,
      userStore,
      settingsStore,
      q,
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),
      loading: ref(false),
      vpnConnections: ref(''),
    };
  },

  created() {
    this.getVPNConnections();
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

    getVPNConnections() {
      this.loading = true;
      api
        .get('/vpn_torrent/list/vpn', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.vpnConnections = response.data.clients;
            this.initialFetch = true;
            this.initialFetchSuccessful = true;
            this.loading = false;
          } else {
            this.initialFetch = true;
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.initialFetch = true;
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
          this.loading = false;
        });
    },
  },
});
</script>

<style scoped>
.disable-select {
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}
</style>
