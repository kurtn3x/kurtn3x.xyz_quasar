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
        @mouseover="avatar_hover = true"
        @mouseleave="avatar_hover = false"
        style="top: -1.17em; left: 0.1em; z-index: 101"
        class="justify-center"
      >
        <img
          :src="this.user.avatar"
          :style="avatar_hover ? 'filter: brightness(50%);' : ''" />
        <q-file
          v-if="avatar_hover"
          v-model="image"
          borderless
          hide-bottom-space
          style="
            display: inline-block;
            position: absolute;
            z-index: 100;
            height: 120px;
            width: 120px;
          "
          @change="updateFile()"
          color="transparent"
          bg-color="transparent"
        >
          <q-icon
            name="attach_file"
            color="white"
            class="q-mr-xl"
            style="height: 120px"
            size="22px"
          /> </q-file
      ></q-avatar>
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
            {{ this.user.username }}
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
          <div class="text-h6 q-mt-sm q-mb-xs">Bio</div>
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
        <div class="text-h6 q-mb-xs q-ml-sm">Bio</div>
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
      splitterModel: ref(20),
      settingsStore,
      q,
      userStore,
      loading: ref(false),
      test_darkmode: ref(false),
      avatar_hover: ref(false),
      background_hover: ref(false),
    };
  },

  created() {
    if (!this.user.feched) {
      this.getMe();
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
    changeBackground() {
      console.log('bla');
    },
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },
    setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      this.settingsStore.theme = theme;
      if (this.test_darkmode) {
        this.settingsStore.darkmode = true;
      } else {
        this.settingsStore.darkmode = false;
      }
    },

    getMe() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/profile/user', config)
        .then((response) => {
          if (response.status == 200) {
            this.user = serializeUser(response.data);
            this.userStore.setUser(this.user);
          } else {
            this.user = defaultUser();
            this.notify('negative', 'Something went wrong with the API :/');
          }
        })
        .catch((error) => {
          this.user = defaultUser();
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },
  },
};
</script>
