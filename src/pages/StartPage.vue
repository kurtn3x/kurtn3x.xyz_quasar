<template>
  <div
    class="disable-select"
    :class="settings_store.darkmode ? 'text-offwhite' : 'text-dark'"
  >
    <h1 class="text-center">Welcome!</h1>
  </div>
  <div v-if="auth_store.authenticated" v-bind="getMe">
    <h1>{{ first_name }}</h1>
    <h1>{{ last_name }}</h1>
    <h1>{{ username }}</h1>
    <h1>{{ id }}</h1>
    <h1>{{ user }}</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from 'stores/authenticated';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { store } from 'quasar/wrappers';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const auth_store = useAuthStore();
    const settings_store = useSettingsStore();
    const q = useQuasar();

    return {
      auth_store,
      settings_store,
      q,
      username: ref(''),
      id: ref(''),
      first_name: ref(''),
      last_name: ref(''),
      phone: ref(''),
      user: ref(''),
    };
  },
  created() {
    this.getMe();
  },
  watch: {
    'store.authenticated'() {
      this.getMe();
    },
  },
  methods: {
    getMe() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/profile/user', config)
        .then((response) => {
          if (response.status == 200) {
            this.username = response.data.username;
            this.id = response.data.profile.id;
            this.first_name = response.data.profile.first_name;
            this.last_name = response.data.profile.last_name;
            this.phone = response.data.profile.phone;
            this.user = response.data.profile.user;
          } else {
            this.username = '';
            this.id = '';
            this.first_name = '';
            this.last_name = '';
            this.phone = '';
            this.user = '';
          }
        })
        .catch((error) => {
          (this.username = ''),
            (this.id = ''),
            (this.first_name = ''),
            (this.last_name = ''),
            (this.phone = ''),
            (this.user = '');
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
