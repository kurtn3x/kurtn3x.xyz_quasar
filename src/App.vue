<template>
  <router-view v-if="prefetch" class="font" :key="$route.fullPath" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { apiGet } from 'src/components/apiWrapper';
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

    await apiGet('/auth/csrf_cookie', { withCredentials: true });

    let config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': this.q.cookies.get('csrftoken'),
      },
    };

    await apiGet('/auth/authenticated', config).then((apiData) => {
      if (apiData.error == false) {
        this.localStore.setAuthState(
          (apiData.data as any).isAuthenticated as boolean
        );
        this.prefetch = true;
      } else {
        this.localStore.setAuthState(false);
        this.prefetch = true;
      }
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
