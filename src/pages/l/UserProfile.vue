<template>
  <div class="q-ma-md">
    <q-card
      class="gt-sm"
      bordered
      style="background-color: transparent; max-height: 500px"
    >
      <q-parallax :src="this.user.background" style="height: 200px" />

      <q-avatar
        round="round"
        size="150px"
        text-color="white"
        style="top: -1.17em; left: 0.1em; z-index: 101"
        class="justify-center"
      >
        <img :src="this.user.avatar" />
      </q-avatar>
      <div style="position: relative; top: -25em; height: 200px">
        <q-card-section
          style="
            left: 13em;
            top: 2.6em;
            background-color: rgba(255, 255, 255, 0.5);
            max-width: 400px;
          "
          class="relative"
        >
          <div class="text-primary text-h4 q-mt-xs q-mb-xs text-weight-bolder">
            {{ this.myname }}
          </div>
          <div class="text-caption q-mt-sm text-dark">
            {{ this.user.first_name }} {{ this.user.last_name }}
          </div>
        </q-card-section>
        <q-card-actions
          vertical
          class="absolute-right q-ma-sm"
          style="background-color: rgba(255, 255, 255, 0.5)"
        >
          <q-btn size="lg" flat stretch color="red" icon="favorite" />
          <q-btn size="lg" flat stretch color="accent" icon="bookmark" />
          <q-btn size="lg" flat stretch color="primary" icon="share" />
        </q-card-actions>
      </div>
      <div style="position: relative; top: -25em" v-if="!small">
        <q-card-section>
          <div class="text-h6 q-mt-sm q-mb-xs">Description</div>
          <div class="text-body1 q-ml-xl">
            {{ this.user.bio }}
          </div>
        </q-card-section>
      </div>
    </q-card>

    <q-card class="lt-md" bordered style="background-color: transparent">
      <q-parallax :src="this.user.background" style="height: 200px" />

      <q-avatar
        round="round"
        size="150px"
        text-color="white"
        style="z-index: 99; top: 0.66em"
        class="absolute-center"
      >
        <img :src="this.user.avatar" />
      </q-avatar>
      <q-card-section>
        <div class="text-primary text-h5 text-center text-weight-bolder lt-md">
          <a>{{ this.user.username }}</a>
        </div>
        <div class="text-center text-caption q-mt-xs">
          <a>{{ this.user.first_name }} {{ this.user.last_name }} </a>
        </div>
      </q-card-section>
      <q-card-section style="padding: 0">
        <div class="text-h6 q-mb-xs q-ml-sm">Description</div>
        <div class="text-left text-body1 q-ml-xl q-mr-sm">
          {{ this.user.bio }}
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md row justify-center">
        <q-btn size="lg" flat stretch color="red" icon="favorite" />
        <q-btn size="lg" flat stretch color="accent" icon="bookmark" />
        <q-btn size="lg" flat stretch color="primary" icon="share" />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useQuasar, QSpinnerGears } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import { defaultUser, serializeUser } from 'src/models';

export default {
  name: 'SettingsView',

  setup() {
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    const q = useQuasar();

    return {
      user: userStore.user,
      theme: ref('default'),
      tab: ref('start'),
      settingsStore,
      q,
      userStore,
      loading: ref(false),
      myname: ref(''),
    };
  },

  created() {
    if (!this.user.feched) {
      this.myname = this.$route.params.id;
    }
  },

  computed: {
    darkmode() {
      return this.settingsStore.darkmode;
    },
    small() {
      if (this.q.screen.width < 1024) {
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
  },
};
</script>
