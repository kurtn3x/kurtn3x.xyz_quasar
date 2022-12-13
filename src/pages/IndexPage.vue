<template>
  <q-page class="bg">
    <div
      class="row non-selectable text-white"
      v-if="!mobile"
      style="
        position: absolute;
        top: 35%;
        left: 50%;
        -moz-transform: translateX(-50%) translateY(-50%);
        -webkit-transform: translateX(-50%) translateY(-50%);
        transform: translateX(-50%) translateY(-50%);
      "
    >
      <VueWriter
        class="text-h4"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
        :array="['login / register to continue']"
        :iterations="1"
        :typeSpeed="65"
      >
      </VueWriter>
      <div
        class="blink text-h4"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
      >
        _
      </div>
    </div>
    <div
      class="row non-selectable text-white justify-center q-mt-xl"
      v-if="mobile"
    >
      <VueWriter
        class="text-h6"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
        :array="['login / register to continue']"
        :iterations="1"
        :typeSpeed="65"
      >
      </VueWriter>
      <div
        class="blink text-h6"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
      >
        _
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import VueWriter from 'vue-writer';
import { useUserStore } from 'stores/user';

export default defineComponent({
  name: 'IndexPage',
  components: { VueWriter },

  setup() {
    const userStore = useUserStore();
    const q = useQuasar();

    return {
      show: ref(false),
      userStore,
      q,
      text_animation: ref(true),
    };
  },
  computed: {
    mobile() {
      if (this.q.screen.width < 1024) {
        return true;
      } else {
        return false;
      }
    },
  },

  created() {
    if (this.userStore.authenticated) {
      this.$router.push('/dashboard/home');
    } else {
      this.show = true;
    }
  },
});
</script>

<style scoped lang="scss">
@font-face {
  font-family: 'SourceCodePro';
  src: local('SourceCodePro'),
    url(../css//SourceCodePro-VariableFont_wght.ttf) format('truetype');
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

.bg {
  position: relative;
  overflow: hidden;
  width: inherit;
  height: 500%;
  background: linear-gradient(#000729 1%, rgb(255, 188, 188, 0.6) 200%);
}
</style>
