<template>
  <router-view
    v-if="prefetch"
    :class="
      darkmode
        ? 'bg-background-dark text-light'
        : 'bg-background-light text-dark'
    "
  />
</template>

<script>
import { defineComponent } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import { useUserStore } from './stores/user';
export default defineComponent({
  name: 'App',

  setup() {
    const q = useQuasar();
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    if (settingsStore.darkmode_state == null) {
      settingsStore.darkmode = true;
    }

    q.dark.set(settingsStore.darkmode_state);

    userStore.$subscribe((mutation, state) => {
      LocalStorage.set('user', state.user);
    });

    settingsStore.$subscribe((mutation, state) => {
      LocalStorage.set('darkmode', state.darkmode);
    });

    settingsStore.$subscribe((mutation, state) => {
      LocalStorage.set('theme', state.theme);
    });
    return { q, userStore, settingsStore };
  },

  data() {
    return {
      prefetch: false,
    };
  },

  beforeCreate() {
    if (this.settingsStore.theme_state == null) {
      document.body.setAttribute('data-theme', 'default');
      this.settingsStore.theme = 'default';
    } else {
      document.body.setAttribute('data-theme', this.settingsStore.theme);
    }

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
          this.userStore.setAuthState(true);
          this.prefetch = true;
        } else {
          this.userStore.setAuthState(false);
          this.prefetch = true;
        }
      })
      .catch((error) => {
        this.userStore.setAuthState(false);
        this.prefetch = true;
      });
  },

  computed: {
    darkmode() {
      return this.settingsStore.darkmode;
    },
  },

  watch: {
    darkmode(valChanged) {
      this.q.dark.set(valChanged);
    },
  },
});
</script>
