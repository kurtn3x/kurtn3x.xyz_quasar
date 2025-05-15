<template>
  <q-page
    class="bg row justify-center items-center"
    :class="theme"
  >
    <ParticlesIndex />
    <div class="absolute-bottom-right q-mb-md q-mr-md">
      <div class="text-right">
        <router-link
          to="/privacy"
          class="q-ml-md text-white"
        >
          Privacy Policy
        </router-link>
      </div>
    </div>
    <div class="q-mb-xl">
      <div
        class="text-center non-selectable text-white text-h4 q-mb-xl text3d-primary"
      >
        <a v-if="!localStore.isAuthenticated">Welcome!</a>
        <a v-if="localStore.isAuthenticated">Welcome, {{ username }}!</a>
      </div>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import ParticlesIndex from 'components/Style/ParticlesIndex.vue';
import { getThemeBackground } from 'components/Style/themes';

export default defineComponent({
  name: 'IndexPage',
  components: { ParticlesIndex },

  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    const darkmodeToogle = ref(localStore.darkmodeState);

    return {
      darkmodeToogle,
      localStore,
      q,
      username: ref(''),
    };
  },
  computed: {
    darkmode() {
      return this.localStore.darkmode;
    },

    theme() {
      var t = getThemeBackground(this.localStore.theme);
      return t;
    },
  },

  watch: {
    darkmode(newVal) {
      this.darkmodeToogle = newVal;
    },
  },
  created() {
    if (this.localStore.isAuthenticated) {
      this.$router.push('/dashboard/home');
      this.username = this.localStore.username;
    }
  },

  methods: {
    setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      this.localStore.theme = theme;
    },

    darkmodeChanged() {
      this.localStore.darkmode = this.darkmodeToogle;
    },
  },
});
</script>
