<template>
  <div class="disable-select">
    <h1 class="text-center text-primary">Welcome!</h1>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { store } from 'quasar/wrappers';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'HomeView',
  setup() {
    const userStore = useUserStore();
    const settings_store = useSettingsStore();
    const q = useQuasar();

    return {
      userStore,
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
