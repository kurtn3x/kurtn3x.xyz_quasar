<template>
  <q-layout view="hHh LpR fff">
    <!-- HEADER -->
    <q-header reveal height-hint="98" class="bg-layout-bg text-layout-text">
      <q-toolbar class="q-pa-none" v-if="authenticated">
        <q-btn
          flat
          stretch
          icon="menu"
          class="text-body1 text-weight-bold"
          size="md"
          @click="navDrawer = !navDrawer"
          style="width: 57px"
        />
        <q-space />
        <q-btn
          @click="darkmodeChanged"
          :icon="darkmodeToogle ? 'light_mode' : 'dark_mode'"
          round
          outline
          size="sm"
          class="q-ml-sm text-layout-text"
        />
        <q-btn round outline size="sm" class="q-ml-sm text-layout-text">
          <q-menu
            anchor="bottom middle"
            self="top middle"
            style="overflow-x: hidden; width: 100px"
          >
            <q-list>
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
            </q-list>
          </q-menu>
        </q-btn>
        <q-btn stretch flat class="button_hover q-ml-sm">
          <q-avatar class="q-mr-sm q-ml-xs" size="26px" rounded>
            <img :src="headerInfo.avatar" />
          </q-avatar>
          <q-icon name="arrow_drop_down" size="sm" />
          <q-menu class="text-layout-text bg-layout-bg">
            <div class="row no-wrap q-pa-sm">
              <div class="column" style="width: 200px; height: 170px">
                <q-item
                  clickable
                  v-ripple
                  class="text-body2 text-layout-text"
                  to="/dashboard/settings/site"
                >
                  <q-item-section avatar>
                    <q-icon name="settings_applications" />
                  </q-item-section>

                  <q-item-section> Site Settings </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  class="text-body2 text-layout-text q-mt-sm"
                  to="/dashboard/settings/profile"
                >
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>

                  <q-item-section> Profile Settings </q-item-section>
                </q-item>

                <q-item
                  clickable
                  v-ripple
                  class="text-body2 text-layout-text q-mt-sm"
                  to="/dashboard/settings/account"
                >
                  <q-item-section avatar>
                    <q-icon name="admin_panel_settings" />
                  </q-item-section>

                  <q-item-section> Account Settings </q-item-section>
                </q-item>
              </div>

              <q-separator vertical inset class="q-mx-sm" color="layout-text" />

              <div class="column">
                <q-item
                  class="column items-center"
                  clickable
                  :to="myprofileroute"
                >
                  <q-avatar size="72px" rounded>
                    <img :src="headerInfo.avatar" />
                  </q-avatar>

                  <div
                    class="text-body1 text-weight-bold q-mt-sm text-layout-text"
                  >
                    {{ headerInfo.username }}
                  </div>
                </q-item>

                <q-btn
                  color="green"
                  class="q-mt-md text-white"
                  label="Logout"
                  unelevated
                  size="sm"
                  v-close-popup
                  @click="logout"
                />
              </div>
            </div>
          </q-menu>
        </q-btn>
      </q-toolbar>

      <q-toolbar class="q-pa-none" v-if="!authenticated">
        <q-btn stretch flat icon="home" size="md" to="/" />

        <q-btn
          @click="darkmodeChanged"
          :icon="darkmodeToogle ? 'light_mode' : 'dark_mode'"
          round
          outline
          size="sm"
          class="q-ml-sm"
        />
        <q-btn round outline size="sm" class="q-ml-sm">
          <q-menu
            anchor="bottom middle"
            self="top middle"
            style="overflow-x: hidden; width: 100px"
          >
            <q-list>
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
            </q-list>
          </q-menu>
        </q-btn>

        <q-space />
        <q-btn
          stretch
          flat
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
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      class="bg-layout-bg text-layout-text"
      v-if="authenticated"
    >
      <q-list padding class="q-pa-none">
        <q-item
          clickable
          v-ripple
          class="text-body1 text-layout-text"
          to="/dashboard/home"
          style="height: 65px"
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
          style="height: 65px"
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
          style="height: 65px"
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
          style="height: 65px"
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

<script>
import { ref } from 'vue';
import { LocalStorage } from 'quasar';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import {
  defaultHeaderInformation,
  serializeHeaderInformation,
} from 'src/models';

export default {
  setup() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
    const q = useQuasar();

    var navDrawer = ref(true);
    var miniState = ref(true);

    if (q.screen.width < 1024) {
      navDrawer.value = false;
      miniState.value = false;
    }

    const darkmodeToogle = ref(settingsStore.darkmodeState);
    const headerInfo = ref(userStore.headerInfo);

    return {
      navDrawer,
      miniState,
      darkmodeToogle,
      // layout & styling
      settingsStore,
      userStore,
      q,
      headerInfo,
    };
  },

  created() {
    if (this.userStore.authenticated) {
      this.getHeaderInfo();
    } else {
      this.headerInfo = '';
      this.userStore.setHeaderInfo(defaultHeaderInformation());
    }
  },

  computed: {
    myprofileroute() {
      return '/user/' + this.headerInfo.username;
    },
    darkmode() {
      return this.settingsStore.darkmodeState;
    },
    mobile() {
      if (this.q.screen.width < 650) {
        return true;
      } else {
        return false;
      }
    },

    authenticated() {
      return this.userStore.authenticated;
    },
    headerInfoStore() {
      return this.userStore.headerInfo;
    },
  },

  watch: {
    headerInfoStore(newVal) {
      this.headerInfo = newVal;
    },

    darkmode(newVal) {
      this.darkmodeToogle = newVal;
    },
  },

  methods: {
    setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      this.settingsStore.theme = theme;
    },

    darkmodeChanged() {
      this.settingsStore.darkmode = !this.darkmodeToogle;
    },

    notify(type, message) {
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
            this.userStore.setAuthState(false);
            this.userStore.setHeaderInfo(defaultHeaderInformation());
            this.notify('positive', 'Logged out!');
            LocalStorage.remove('header');
            LocalStorage.remove('user');
            window.location.replace('https://kurtn3x.xyz');
          }
        })
        .catch();
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
            this.headerInfo = serializeHeaderInformation(response.data);
            this.userStore.setHeaderInfo(this.headerInfo);
            this.userStore.setAuthState(true);
            this.status = this.headerInfo.status;
          } else {
            this.notify(
              'negative',
              'Something went wrong when fetching the user.'
            );
            this.userStore.setAuthState(false);
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR.');
          this.userStore.setAuthState(false);
        });
    },
  },
};
</script>
