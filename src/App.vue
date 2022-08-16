<template>
  <router-view v-if="prefetch" />
</template>

<script>
import { defineComponent } from 'vue';
import 'https://cdn.jsdelivr.net/npm/pathseg@1.2.0/pathseg.min.js';
import { useQuasar } from 'quasar';
import { ref } from 'vue';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/authenticated';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'App',

  setup() {
    const q = useQuasar();
    const auth_store = useAuthStore();
    const settings_store = useSettingsStore();
    q.dark.set(true);
    return { q, auth_store, settings_store };
  },

  data() {
    return {
      prefetch: false,
    };
  },

  beforeCreate() {
    api.get('/auth/csrf_cookie', { withCredentials: true }).catch();
    let config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': this.q.cookies.get('csrftoken'),
      },
    };
    api
      .get('/auth/authenticated', config)
      .then((response) => {
        if (response.status == 200) {
          this.auth_store.authenticated = true;
          this.prefetch = true;
        } else {
          this.auth_store.authenticated = false;
          this.prefetch = true;
        }
      })
      .catch((error) => {
        console.log(
          'Encountered Error while fetching auth-state. This may be intentional.'
        );
        this.auth_store.authenticated = false;
        this.prefetch = true;
      });
  },

  computed: {
    darkmode() {
      return this.settings_store.darkmode;
    },
  },

  watch: {
    darkmode(valChanged) {
      this.q.dark.set(valChanged);
    },
  },
});
</script>
