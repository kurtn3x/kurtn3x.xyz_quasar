<template>
  <q-layout view="hHh LpR fff">
    <!-- HEADER -->
    <q-header reveal height-hint="98" class="bg-layout-bg text-layout-text">
      <q-toolbar class="q-pa-none" v-if="localStore.isAuthenticated">
        <q-btn
          flat
          stretch
          icon="menu"
          class="text-body1 text-weight-bold lt-md"
          size="md"
          @click="navDrawer = !navDrawer"
          style="width: 57px"
        />
        <q-btn
          flat
          stretch
          icon="menu"
          class="text-body1 text-weight-bold gt-sm"
          size="md"
          @click="miniState = !miniState"
          style="width: 57px"
        />
        <q-space />

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

      <q-toolbar class="q-pa-none q-ma-none" v-if="!localStore.isAuthenticated">
        <q-btn unelevated stretch icon="home" size="md" to="/" />
        <q-fab
          unelevated
          icon="palette"
          color="layout-bg"
          text-color="layout-text"
          active-icon="expand_more"
          direction="down"
          padding="none"
          square
          style="height: 50px; width: 56px"
          class="gt-xs"
        >
          <q-fab-action
            style="background: #3b4fb5 !important"
            color="layout-text"
            outline
            square
            @click="setTheme('default')"
          />
          <q-fab-action
            style="background: #ee4d2e !important"
            outline
            square
            color="layout-text"
            @click="setTheme('cool-orange')"
          />
          <q-fab-action
            style="background: #1db992 !important"
            outline
            square
            color="layout-text"
            @click="setTheme('nice-green')"
          />
          <q-fab-action
            style="background: #bfbc06 !important"
            outline
            square
            color="layout-text"
            @click="setTheme('olive-green')"
          />
          <q-fab-action
            style="background: #008fff !important"
            outline
            square
            color="layout-text"
            @click="setTheme('epic-blue')"
          />
          <q-fab-action
            style="background: #1d1d1d !important"
            outline
            square
            color="layout-text"
            @click="setTheme('dark')"
          />
          <q-fab-action
            color="layout-text"
            style="background: #f8f0e3 !important"
            outline
            square
            @click="setTheme('light')"
          />
        </q-fab>

        <q-btn
          unelevated
          @click="darkmodeChanged"
          :icon="darkmodeToogle ? 'light_mode' : 'dark_mode'"
          size="md"
          class="bg-layout-bg text-layout-text gt-xs"
          style="height: 50px; width: 56px"
        />

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
      <q-list padding class="q-pa-none">
        <q-fab
          unelevated
          icon="palette"
          color="layout-bg"
          text-color="layout-text"
          active-icon="expand_less"
          direction="up"
          padding="none"
          square
          style="width: 57px; height: 40px"
        >
          <q-fab-action
            style="background: #3b4fb5 !important"
            color="layout-text"
            outline
            square
            @click="setTheme('default')"
          />
          <q-fab-action
            style="background: #ee4d2e !important"
            outline
            square
            color="layout-text"
            @click="setTheme('cool-orange')"
          />
          <q-fab-action
            style="background: #1db992 !important"
            outline
            square
            color="layout-text"
            @click="setTheme('nice-green')"
          />
          <q-fab-action
            style="background: #bfbc06 !important"
            outline
            square
            color="layout-text"
            @click="setTheme('olive-green')"
          />
          <q-fab-action
            style="background: #008fff !important"
            outline
            square
            color="layout-text"
            @click="setTheme('epic-blue')"
          />
          <q-fab-action
            style="background: #1d1d1d !important"
            outline
            square
            color="layout-text"
            @click="setTheme('dark')"
          />
          <q-fab-action
            color="layout-text"
            style="background: #f8f0e3 !important"
            outline
            square
            @click="setTheme('light')"
          />
        </q-fab>

        <q-btn
          unelevated
          @click="darkmodeChanged"
          :icon="darkmodeToogle ? 'light_mode' : 'dark_mode'"
          size="md"
          class="bg-layout-bg text-layout-text q-mt-sm"
          style="width: 57px; height: 40px"
        />
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
