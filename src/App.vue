<template>
  <router-view
    v-if="prefetch"
    class="font"
    :key="$route.fullPath"
    :class="
      darkmode
        ? 'bg-background-dark text-light'
        : 'bg-background-light text-dark'
    "
  />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';

export default defineComponent({
  name: 'App',
  setup() {
    const q = useQuasar();
    const localStore = useLocalStore();

    // setup localStore
    if (localStore.darkmodeState == null) {
      localStore.darkmode = true;
    }
    q.dark.set(localStore.darkmodeState);

    localStore.$subscribe((mutation, state) => {
      LocalStorage.set('header', state.headerInfo);
    });

    localStore.$subscribe((mutation, state) => {
      LocalStorage.set('authenticated', state.authenticated);
    });

    localStore.$subscribe((mutation, state) => {
      LocalStorage.set('darkmode', state.darkmode);
    });

    localStore.$subscribe((mutation, state) => {
      LocalStorage.set('theme', state.theme);
    });

    return { q, localStore };
  },

  data() {
    return {
      prefetch: false,
    };
  },

  async created() {
    if (this.localStore.themeState == null) {
      document.body.setAttribute('data-theme', 'theme-violet');
      this.localStore.theme = 'theme-violet';
    } else {
      document.body.setAttribute('data-theme', this.localStore.theme);
    }

    api.get('/auth/csrf_cookie', { withCredentials: true }).catch();
    let config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': this.q.cookies.get('csrftoken'),
      },
    };

    await api
      .get('/auth/authenticated', config)
      .then((response) => {
        if (response.status == 200) {
          this.localStore.setAuthState(true);
          this.prefetch = true;
        } else {
          this.localStore.setAuthState(false);
          this.prefetch = true;
        }
      })
      .catch((error) => {
        this.localStore.setAuthState(false);
        this.prefetch = true;
      });
  },

  computed: {
    darkmode() {
      return this.localStore.darkmode;
    },
  },

  watch: {
    darkmode(valChanged) {
      this.q.dark.set(valChanged);
    },
  },
});
</script>
