<template>
  <div class="disable-select text-primary">
    <h1 class="text-center">login / register to continue.</h1>
    <ParticlesText ref="textAnimation" v-if="!mobile" />
    <div class="row justify-center">
      <q-toggle
        v-if="!mobile"
        v-model="text_animation"
        checked-icon="check"
        color="primary"
        unchecked-icon="clear"
        label="Text Animation"
        @click="toogleTextAnimation(text_animation)"
        size="xl"
        class="text-h4"
        style="position: absolute; bottom: 10%"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import ParticlesText from 'components/ParticlesText.vue';

export default defineComponent({
  name: 'IndexPage',
  components: { ParticlesText },

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
  created() {
    if (this.userStore.authenticated) {
      this.$router.push('/dashboard/home');
    }
  },
  methods: {
    toogleTextAnimation(val) {
      this.$refs.textAnimation.toogle_active(val);
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
