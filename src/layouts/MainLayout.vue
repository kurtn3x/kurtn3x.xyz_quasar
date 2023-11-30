<template>
  <q-layout view="hHh LpR fff">
    <!-- HEADER -->
    <q-header reveal height-hint="98" class="bg-layout-bg text-layout-text">
      <q-toolbar class="q-pa-none" v-if="localStore.isAuthenticated">
        <q-btn
          flat
          stretch
          icon="menu"
          class="text-body1 text-weight-bold"
          size="md"
          @click="
            miniState = !miniState;
            navDrawer = true;
          "
          style="width: 57px"
        />
        <q-space />

        <q-btn stretch flat class="button_hover q-ml-sm">
          <q-avatar class="q-mr-sm" size="26px" rounded>
            <img :src="headerInfo.avatar" />
          </q-avatar>
          <a class="text-body2 q-mr-sm text-weight-bold">{{
            headerInfo.username
          }}</a>
          <q-icon name="arrow_drop_down" size="sm" />
          <q-menu class="q-mr-xs" dark>
            <q-card
              class="q-pa-sm bg-layout-bg"
              bordered
              dark
              style="max-width: 280px"
            >
              <div class="no-wrap">
                <q-btn
                  outline
                  class="full-width q-mt-xs bg-layout-bg text-layout-text"
                  :to="myprofileroute"
                  align="left"
                  style="font-size: 13px"
                >
                  <q-avatar rounded size="20px">
                    <img :src="headerInfo.avatar" />
                  </q-avatar>
                  <div class="q-ml-md ellipsis">My Profile</div>
                </q-btn>

                <q-btn
                  outline
                  to="/dashboard/settings/profile"
                  icon="person"
                  label="Profile Settings"
                  style="font-size: 13px"
                  class="full-width q-mt-sm bg-layout-bg text-layout-text"
                  align="left"
                />

                <q-btn
                  outline
                  to="/dashboard/settings/account"
                  icon="admin_panel_settings"
                  label="Account Settings"
                  style="font-size: 13px"
                  class="full-width q-mt-sm q-mb-xs bg-layout-bg text-layout-text"
                  align="left"
                />
              </div>
              <q-separator color="layout-text" class="q-mb-sm q-mt-xs" />
              <div class="row">
                <q-btn
                  style="background: #3b4fb5 !important"
                  outline
                  @click="setTheme('default')"
                  class="q-mr-xs"
                />
                <q-btn
                  style="background: #ee4d2e !important"
                  outline
                  @click="setTheme('cool-orange')"
                  class="q-mr-xs"
                />
                <q-btn
                  style="background: #1db992 !important"
                  outline
                  @click.="setTheme('nice-green')"
                  class="q-mr-xs"
                />
                <q-btn
                  style="background: #bfbc06 !important"
                  outline
                  @click="setTheme('olive-green')"
                  class="q-mr-xs"
                />
                <q-btn
                  style="background: #008fff !important"
                  outline
                  @click="setTheme('epic-blue')"
                  class="q-mr-xs"
                />
                <q-btn
                  style="background: #52616b !important"
                  outline
                  @click="setTheme('dark')"
                  class="q-mr-xs"
                />
                <q-btn
                  style="background: #b7c8d4 !important"
                  outline
                  @click="setTheme('light')"
                  class="q-mr-xs"
                />
              </div>
              <q-separator color="layout-text" class="q-mb-sm q-mt-sm" />
              <div class="row justify-between">
                <q-btn
                  @click="darkmodeChanged"
                  outline
                  round
                  class="bg-layout-bg text-layout-text"
                  :icon="darkmodeToogle ? 'light_mode' : 'dark_mode'"
                  style="width: 35px; height: 35px"
                  size="sm"
                />
                <q-btn
                  outline
                  icon="logout"
                  class="bg-layout-bg text-layout-text"
                  label="Logout"
                  v-close-popup
                  @click="logout"
                  style="font-size: 13px; width: 130px"
                  align="left"
                />
              </div>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <q-toolbar class="q-pa-none q-ma-none" v-if="!localStore.isAuthenticated">
        <q-btn unelevated stretch icon="home" size="md" to="/" />
        <q-btn
          icon="palette"
          class="bg-layout-bg text-layout-text"
          unelevated
          stretch
        >
          <q-menu
            anchor="bottom middle"
            self="top middle"
            class="bg-transparent no-shadow"
          >
            <div class="column" style="height: 400px; width: 35px">
              <q-btn
                style="background: #3b4fb5 !important"
                color="layout-text"
                outline
                @click="setTheme('default')"
                class="q-mt-sm"
              />
              <q-btn
                style="background: #ee4d2e !important"
                outline
                color="layout-text"
                @click="setTheme('cool-orange')"
                class="q-mt-sm"
              />
              <q-btn
                style="background: #1db992 !important"
                outline
                color="layout-text"
                @click.="setTheme('nice-green')"
                class="q-mt-sm"
              />
              <q-btn
                style="background: #bfbc06 !important"
                outline
                color="layout-text"
                @click="setTheme('olive-green')"
                class="q-mt-sm"
              />
              <q-btn
                style="background: #008fff !important"
                outline
                color="layout-text"
                @click="setTheme('epic-blue')"
                class="q-mt-sm"
              />
              <q-btn
                style="background: #52616b !important"
                outline
                color="layout-text"
                @click="setTheme('dark')"
                class="q-mt-sm"
              />
              <q-btn
                color="layout-text"
                style="background: #b7c8d4 !important"
                outline
                @click="setTheme('light')"
                class="q-mt-sm"
              />
            </div>
          </q-menu>
        </q-btn>

        <q-space />
        <q-btn
          stretch
          unelevated
          icon="login"
          label="Login"
          class="text-body1 text-weight-bold"
          size="md"
          to="/login"
          style="width: 140px"
        />

        <q-btn
          stretch
          flat
          icon="add"
          label="Register"
          to="/register"
          class="text-body1 text-weight-bold q-ml-xs"
          size="md"
          style="width: 140px"
        />
      </q-toolbar>
    </q-header>

    <!-- NAV DRAWER -->
    <q-drawer
      dark
      v-model="navDrawer"
      mini-to-overlay
      side="left"
      :mini="miniState"
      class="bg-layout-bg text-layout-text column justify-between"
      v-if="localStore.isAuthenticated"
    >
      <q-list padding class="q-pa-none">
        <q-item
          clickable
          v-ripple
          class="text-body1 text-layout-text"
          to="/dashboard/home"
          style="height: 55px"
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>

          <q-item-section> Home </q-item-section>
        </q-item>
        <q-separator color="layout-text" />

        <q-item
          clickable
          v-ripple
          class="text-body1 text-layout-text"
          to="/dashboard/files"
          style="height: 55px"
        >
          <q-item-section avatar>
            <q-icon name="folder" />
          </q-item-section>

          <q-item-section> My Files </q-item-section>
        </q-item>
        <q-separator color="layout-text" />

        <q-item
          clickable
          v-ripple
          class="text-body1 text-layout-text"
          to="/dashboard/vpn"
          style="height: 55px"
        >
          <q-item-section avatar>
            <q-icon name="cloud" />
          </q-item-section>
          <q-item-section> VPN </q-item-section>
        </q-item>
        <q-separator color="layout-text" />

        <q-item
          clickable
          v-ripple
          class="text-body1 text-layout-text"
          to="/dashboard/torrent"
          style="height: 55px"
        >
          <q-item-section avatar>
            <q-icon name="cloud_download" />
          </q-item-section>
          <q-item-section> Torrents </q-item-section>
        </q-item>
        <q-separator color="layout-text" />
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- FOOTER  -->
  </q-layout>
</template>

<script lang="ts">
import { ref } from 'vue';
import { LocalStorage } from 'quasar';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';
import { defaultHeaderInformation } from 'src/types/defaults';

export default {
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    var navDrawer = ref(true);
    var miniState = ref(true);

    // if screen is too small, put the left side drawer into hidden mode
    if (q.screen.width < 1024) {
      navDrawer.value = false;
      miniState.value = false;
    }

    const darkmodeToogle = ref(localStore.darkmodeState);
    const headerInfo = ref(localStore.headerInfo);

    return {
      navDrawer,
      miniState,
      darkmodeToogle,
      localStore,
      q,
      headerInfo,
    };
  },

  created() {
    if (this.localStore.isAuthenticated) {
      this.getHeaderInfo();
    } else {
      this.headerInfo = defaultHeaderInformation();
      this.localStore.deleteAll();
    }
  },

  computed: {
    myprofileroute() {
      return '/user/' + this.headerInfo.username;
    },

    darkmode() {
      return this.localStore.darkmodeState;
    },

    headerInfoStore() {
      return this.localStore.headerInfo;
    },
    screenWidth() {
      return this.q.screen.width;
    },
  },

  watch: {
    headerInfoStore(newVal) {
      this.headerInfo = newVal;
    },

    darkmode(newVal) {
      this.darkmodeToogle = newVal;
    },

    screenWidth(newVal) {
      if (newVal < 1024) {
        this.navDrawer = false;
        this.miniState = false;
      } else {
        this.navDrawer = true;
        this.miniState = true;
      }
    },
  },

  methods: {
    setTheme(theme: string) {
      document.body.setAttribute('data-theme', theme);
      this.localStore.theme = theme;
    },

    darkmodeChanged() {
      this.localStore.darkmode = !this.darkmodeToogle;
    },

    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    logout() {
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .post('/auth/logout', '', axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.localStore.deleteAll();
            this.notify('positive', 'Logged out!');
            LocalStorage.remove('header');
            window.location.replace('https://kurtn3x.xyz');
          }
        })
        .catch((error) => {
          console.log(error);
          this.notify('negative', 'API ERROR.');
          this.localStore.deleteAll();
        });
    },

    getHeaderInfo() {
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/profile/headerinfo', axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.headerInfo = response.data;
            this.localStore.loginUser(response.data);
          } else {
            this.notify(
              'negative',
              'Something went wrong when fetching the user.'
            );
            this.localStore.deleteAll();
          }
        })
        .catch((error) => {
          console.log(error);
          this.notify('negative', 'API ERROR.');
          this.localStore.deleteAll();
        });
    },
  },
};
</script>
