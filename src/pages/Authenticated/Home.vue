<template>
  <q-page class="bg">
    <div class="text-center text-h4 text-primary q-mt-lg">Dashboard</div>
    <div class="disable-select row justify-center q-mt-xl">
      <VueWriter
        class="text-h6 text-white"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
        :array="['Welcome ' + this.userStore.headerinfo.username]"
        :iterations="1"
        :typeSpeed="65"
      >
      </VueWriter>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import VueWriter from 'vue-writer';

export default defineComponent({
  name: 'HomeView',
  components: { VueWriter },
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

.bg {
  position: relative;
  overflow: hidden;
  width: inherit;
  height: 500%;
  background: linear-gradient(#000729 1%, rgb(255, 188, 188, 0.6) 200%);
}
</style>
