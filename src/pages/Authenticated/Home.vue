<template>
  <q-page class="bg">
    <div class="text-center text-h3 text-primary q-mt-lg">Dashboard</div>
    <div class="disable-select row justify-center q-mt-xl">
      <VueWriter
        class="text-h4 text-white"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
        :array="['Welcome ' + this.userStore.headerinfo.username]"
        :typeSpeed="75"
        :delay="4000"
      >
      </VueWriter>
      <div
        class="blink text-h4 text-white"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
      >
        _
      </div>
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

.blink {
  animation: blink-animation 1s steps(5, start) infinite;
  -webkit-animation: blink-animation 1s steps(5, start) infinite;
}
@keyframes blink-animation {
  to {
    visibility: hidden;
  }
}
@-webkit-keyframes blink-animation {
  to {
    visibility: hidden;
  }
}
</style>
