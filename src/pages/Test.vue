<template>
  <div class="disable-select text-primary">
    <q-btn label="TEST" size="xl" @click="runTest" />
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar, QSpinnerGears } from 'quasar';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const userStore = useUserStore();
    const settings_store = useSettingsStore();
    const q = useQuasar();

    return {
      userStore,
      settings_store,
      q,
      text_animation: ref(true),
    };
  },
  computed: {
    mobile() {
      if (this.q.screen.width < 600) {
        return true;
      } else {
        return false;
      }
    },
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
    runTest() {
      this.q.notify({
        message:
          'Please click the activation link we sent you first to activate this account or request a new one.',
        type: 'info',
        spinner: QSpinnerGears,
        timeout: 8000,
        progress: true,
        actions: [
          {},
          {
            label: 'Request new link',
            type: 'info',
            size: 'md',
            class: 'full-width',
          },
        ],
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
