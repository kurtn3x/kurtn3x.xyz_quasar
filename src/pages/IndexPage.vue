<template>
  <div
    v-if="!auth_store.authenticated"
    class="disable-select"
    :class="settings_store.darkmode ? 'text-offwhite' : 'text-dark'"
  >
    <h1 class="text-center">Please log in to access the site.</h1>
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
    };
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
