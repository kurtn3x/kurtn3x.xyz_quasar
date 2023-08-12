<template>
  <q-page class="bg row justify-center items-center" :class="theme">
    <ParticlesIndex />
    <div class="absolute-bottom-right q-mb-md q-mr-md">
      <div class="text-right">
        <router-link to="/about" class="text-white">About</router-link>
        <router-link to="/privacy" class="q-ml-md text-white"
          >Privacy Policy</router-link
        >
      </div>
      <q-card class="row bg-transparent q-mt-sm" flat bordered>
        <q-item
          clickable
          @click="setTheme('default')"
          style="background: #3b4fb5"
        />
        <q-item
          clickable
          @click="setTheme('cool-orange')"
          style="background: #ee4d2e"
        />
        <q-item
          clickable
          @click="setTheme('nice-green')"
          style="background: #1db992"
        />
        <q-item
          clickable
          @click="setTheme('olive-green')"
          style="background: #bfbc06"
        />
        <q-item
          clickable
          @click="setTheme('epic-blue')"
          style="background: #008fff"
        />
        <q-item
          clickable
          @click="setTheme('dark')"
          style="background: #1d1d1d"
        />
        <q-item
          clickable
          @click="setTheme('light')"
          style="background: #f8f0e3"
        />
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="text-center non-selectable text-white text-h4 q-mb-xl">
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
import ParticlesIndex from 'components/ParticlesIndex.vue';

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
      if (this.localStore.theme == 'default') {
        return 'bg-default';
      } else if (this.localStore.theme == 'cool-orange') {
        return 'bg-cool-orange';
      } else if (this.localStore.theme == 'nice-green') {
        return 'bg-nice-green';
      } else if (this.localStore.theme == 'olive-green') {
        return 'bg-olive-green';
      } else if (this.localStore.theme == 'epic-blue') {
        return 'bg-epic-blue';
      } else if (this.localStore.theme == 'orange') {
        return 'bg-orange';
      } else if (this.localStore.theme == 'light') {
        return 'bg-lightp';
      } else if (this.localStore.theme == 'dark') {
        return 'bg-darkp';
      } else {
        return 'bg-default';
      }
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

<style scoped lang="scss">
.bg {
  position: relative;
  overflow: hidden;
  width: inherit;
  height: 1000%;
}

.bg-default {
  background: linear-gradient(#3b4fb5 1%, rgb(255, 188, 188) 200%);
}

.bg-cool-orange {
  background: radial-gradient(
    circle,
    rgb(125, 16, 80) 15%,
    rgb(135, 7, 24) 54%,
    rgb(238, 78, 46) 100%
  );
}

.bg-nice-green {
  background: linear-gradient(
    90deg,
    rgba(10, 172, 71, 1) 0%,
    rgba(29, 185, 146, 1) 35%,
    rgba(21, 87, 150, 1) 100%
  );
}

.bg-olive-green {
  background: radial-gradient(
    circle,
    rgba(191, 188, 6, 1) 5%,
    rgba(29, 89, 2, 1) 100%
  );
}

.bg-epic-blue {
  background: linear-gradient(
    0deg,
    rgba(5, 9, 100, 1) 35%,
    rgba(0, 143, 255, 1) 150%
  );
}

.bg-darkp {
  background: linear-gradient(#1d1d1d 1%, rgb(255, 188, 188, 0.6) 200%);
}

.bg-lightp {
  background: linear-gradient(
    0deg,
    rgba(29, 29, 29, 1) 1%,
    rgba(114, 114, 114, 1) 52%,
    #f8f0e3 100%
  );
}
</style>
