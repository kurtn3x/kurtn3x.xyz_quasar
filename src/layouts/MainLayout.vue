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
            <q-card class="bg-layout-bg" bordered dark style="width: 240px">
              <div class="q-ma-xs q-mt-sm">
                <div class="row justify-center">
                  <q-btn
                    flat
                    class="bg-layout-bg q-mb-xs text-layout-text"
                    :to="myprofileroute"
                    align="center"
                    style="font-size: 14px; width: 215px"
                  >
                    <q-avatar rounded size="20px">
                      <img :src="headerInfo.avatar" />
                    </q-avatar>
                    <div class="q-ml-md ellipsis">My Profile</div>
                  </q-btn>
                </div>

                <q-separator color="layout-text" inset />
                <div class="row justify-center">
                  <q-btn
                    flat
                    to="/dashboard/settings/profile"
                    icon="person"
                    label="Profile Settings"
                    style="font-size: 14px; width: 215px"
                    class="bg-layout-bg text-layout-text q-mb-xs q-mt-xs"
                    align="center"
                  />
                </div>
                <q-separator color="layout-text" inset />
                <div class="row justify-center">
                  <q-btn
                    flat
                    to="/dashboard/settings/account"
                    icon="admin_panel_settings"
                    label="Account Settings"
                    style="font-size: 14px; width: 215px"
                    class="bg-layout-bg text-layout-text q-mt-xs"
                    align="center"
                  />
                </div>
              </div>

              <q-separator inset color="layout-text" />
              <div class="row q-ma-xs q-mb-sm">
                <q-btn-dropdown
                  icon="settings"
                  class="bg-transparent text-layout-text"
                  flat
                  content-class="bg-layout-bg no-shadow"
                  menu-anchor="bottom middle"
                  menu-self="top middle"
                >
                  <q-card class="bg-transparent no-shadow" flat bordered dark>
                    <div>
                      <q-btn
                        flat
                        class="full-width bg-layout-bg text-layout-text"
                        :label="darkmodeToogle ? 'Light' : 'Dark'"
                        @click="darkmodeChanged"
                        :icon="darkmodeToogle ? 'light_mode' : 'dark_mode'"
                      />
                    </div>
                    <q-separator color="layout-text" />

                    <div class="row justify-evenly" style="width: 155px">
                      <template v-for="theme in themes" :key="theme.name">
                        <q-btn
                          outline
                          color="layout-text"
                          @click="setTheme(theme.name)"
                          :class="theme.preview"
                          style="width: 32px"
                          class="q-mt-xs q-mb-xs"
                        />
                      </template>
                    </div>
                  </q-card>
                </q-btn-dropdown>
                <q-space />

                <q-separator vertical inset color="layout-text" />
                <q-space />
                <q-btn
                  flat
                  icon="logout"
                  class="bg-layout-bg text-layout-text"
                  label="Logout"
                  v-close-popup
                  @click="logout"
                  style="font-size: 14px; width: 130px"
                  align="center"
                />
              </div>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <q-toolbar class="q-pa-none q-ma-none" v-if="!localStore.isAuthenticated">
        <q-btn unelevated stretch icon="home" size="md" to="/" />
        <q-btn
          icon="settings"
          class="bg-transparent text-layout-text"
          unelevated
          stretch
        >
          <q-menu class="bg-layout-bg no-shadow">
            <q-card class="bg-transparent no-shadow" flat bordered dark>
              <div>
                <q-btn
                  flat
                  class="full-width bg-layout-bg text-layout-text"
                  :label="darkmodeToogle ? 'Light' : 'Dark'"
                  @click="darkmodeChanged"
                  :icon="darkmodeToogle ? 'light_mode' : 'dark_mode'"
                />
              </div>
              <q-separator color="layout-text" />

              <div class="row justify-evenly" style="width: 155px">
                <template v-for="theme in themes" :key="theme.name">
                  <q-btn
                    outline
                    color="layout-text"
                    @click="setTheme(theme.name)"
                    :class="theme.preview"
                    style="width: 32px"
                    class="q-mt-xs q-mb-xs"
                  />
                </template>
              </div>
            </q-card>
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
import { themes } from 'components/themes';

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
      themes,
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
