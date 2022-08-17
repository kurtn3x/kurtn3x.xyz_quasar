<template>
  <q-layout view="hHh LpR fFf">
    <q-header
      reveal
      height-hint="98"
      bordered
      :class="
        darkmode ? 'bg-primarydark text-offwhite' : 'bg-primary text-dark'
      "
    >
      <q-toolbar class="q-pl-none q-pr-none">
        <q-btn
          flat
          stretch
          mini:leftDrawerMini
          @click="
            mobile
              ? (leftDrawer = !leftDrawer)
              : (leftDrawerMini = !leftDrawerMini)
          "
          :icon="leftDrawerMini ? 'menu' : 'menu_open'"
          label="Menu"
        />
        <q-separator vertical class="gt-xs" />

        <q-btn stretch flat label="Home" to="/l" icon="home" />
        <q-separator vertical class="gt-xs" />
        <q-space />

        <q-btn-dropdown stretch flat :icon="avatar_img" rounded>
          <div class="row no-wrap q-pa-md">
            <div class="column">
              <div class="text-h6 q-mb-md">Settings</div>
              <q-toggle v-model="mobileData" label="Use Mobile Data" />
              <q-toggle v-model="bluetooth" label="Bluetooth" />
            </div>

            <q-separator vertical inset class="q-mx-lg" />

            <div class="column items-center">
              <q-avatar size="72px">
                <img :src="avatar" />
              </q-avatar>

              <div class="text-subtitle1 q-mt-md q-mb-xs">{{ username }}</div>

              <q-btn
                color="primary"
                label="Logout"
                push
                size="sm"
                v-close-popup
                @click="logout"
              />
            </div>
          </div>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <!-- LEFT DRAWER -->
    <q-drawer
      v-model="leftDrawer"
      side="left"
      behavior="default"
      :mini="leftDrawerMini"
      bordered
      :breakpoint="600"
      :width="217"
      :class="
        darkmode ? 'bg-primarydark text-offwhite' : 'bg-primary text-dark'
      "
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item clickable v-ripple to="/l/profile">
            <q-item-section avatar>
              <q-icon name="account_circle" />
            </q-item-section>

            <q-item-section> My Profile </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="send" />
            </q-item-section>

            <q-item-section> Send </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="drafts" />
            </q-item-section>

            <q-item-section> Drafts </q-item-section>
          </q-item>

          <q-space />

          <q-item clickable v-ripple to="/l/settings">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>

            <q-item-section> Settings </q-item-section>
          </q-item>

          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section> Logout </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- fix  -->

    <q-drawer
      v-model="rightDrawer"
      :mini="miniState"
      :width="200"
      :breakpoint="600"
      bordered
      overlay
      side="right"
      class="text-offwhite"
      :class="darkmode ? 'bg-primarydark' : 'bg-primary'"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="account_circle" />
            </q-item-section>

            <q-item-section> My Profile </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="send" />
            </q-item-section>

            <q-item-section> Send </q-item-section>
          </q-item>

          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="drafts" />
            </q-item-section>

            <q-item-section> Drafts </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="logout">
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section> Logout </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <ParticlesBG ref="backgroundAnimation" />
      <router-view />
    </q-page-container>

    <q-footer
      bordered
      :class="
        darkmode ? 'bg-primarydark text-offwhite' : 'bg-primary text-dark'
      "
    >
      <!-- mobile  -->
      <q-toolbar>
        <q-toolbar-title>
          <div>Under developement.</div>
        </q-toolbar-title>
        <q-btn-dropdown icon="settings" flat>
          <q-list>
            <q-item>
              <q-toggle
                v-model="darkmode"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Dark Mode"
                @click="darkmodeChanged"
              />
            </q-item>
            <q-item>
              <q-toggle
                v-model="background_animation"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Background Animation"
                @click="toogleBackgroundAnimation(background_animation)"
              />
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue';
import { Dark } from 'quasar';
import { useQuasar, QSpinnerGears } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/authenticated.ts';
import { useSettingsStore } from 'stores/settings';
import router from 'src/router/index.ts';
import ParticlesBG from 'components/ParticlesBG.vue';

export default {
  components: {
    ParticlesBG,
  },

  setup() {
    const auth_store = useAuthStore();
    const settings_store = useSettingsStore();
    const miniState = ref(true);
    const q = useQuasar();
    var darkmode = ref(settings_store.darkmode_state);
    if (q.screen.width < 600) {
      var rightDrawer = ref(false);
      var leftDrawer = ref(false);
    } else {
      var rightDrawer = ref(false);
      var leftDrawer = ref(true);
    }

    return {
      background_animation: ref(false),
      leftDrawerMini: ref(true),
      leftDrawer,
      // layout & styling
      settings_store,
      auth_store,
      q,
      darkmode,
      rightDrawer,
      miniState,
      loading: ref(false),

      username: ref('SomeUser'),
      avatar: ref('https://media.kurtn3x.xyz/test/avatar.png'),
      avatar_img: ref('https://media.kurtn3x.xyz/test/avatar.png'),
    };
  },
  /*
  beforeCreate() {
    if (!this.auth_store.auth_state) {
      const q = useQuasar();
      this.$router.push('/');
      q.notify({
        type: 'info',
        message:
          'You tried accessing a page which requires authorization without being authorized. Redirecting to Start Page.',
        progress: true,
        multiLine: true,
      });
    }
  },
*/
  created() {
    this.getMe();
  },

  computed: {
    authenticated() {
      return true;
    },
    mobile() {
      if (this.q.screen.width < 600) {
        return true;
      } else {
        return false;
      }
    },
  },

  methods: {
    darkmodeChanged() {
      this.settings_store.darkmode = this.darkmode;
    },
    toogleBackgroundAnimation(bg_val) {
      this.$refs.backgroundAnimation.toogle_active(bg_val);
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
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .post('/auth/logout', '', config)
        .then((response) => {
          if (response.status == 200) {
            this.auth_store.authenticated = false;
            this.$router.push('/');
          }
        })
        .catch();
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
            this.username = response.data.username;
            this.avatar = response.data.avatar;
            this.avatar_img = 'img:' + response.data.avatar;
          } else {
            this.username = 'SomeUser';
            this.avatar = 'https://media.kurtn3x.xyz/test/avatar.png';
            this.avatar_img =
              'img:' + 'https://media.kurtn3x.xyz/test/avatar.png';
          }
        })
        .catch((error) => {
          this.username = 'SomeUser';
          this.avatar = 'https://media.kurtn3x.xyz/test/avatar.png';
          this.avatar_img =
            'img:' + 'https://media.kurtn3x.xyz/test/avatar.png';
        });
    },
  },
};

/*
<q-item :class="{ 'myclass': $q.dark.isActive }" ...
.myclass {
  .q-item.q-router-link--active {
     color: var(--q-color-primary);
     background-color: $blue-1 !important;
  }
}
*/
</script>

<style scoped>
.pw_icon:hover {
  color: whitesmoke;
}

.drawer_btn_desk {
  position: absolute;
  top: 15px;
  right: 46px;
  transition: all 0.1s linear;
}
.drawer_btn_desk_moved {
  position: absolute;
  top: 15px;
  right: 190px;
  transition: all 0.1s linear;
}

.drawer_btn_mob {
  position: fixed;
  top: 45%;
  right: 185px;
  transition: all 0.1s linear;
}
.drawer_btn_mob_moved {
  position: fixed;
  right: -14px;
  top: 45%;
  transition: all 0.1s linear;
}

.q-item.q-router-link--active {
  color: #1e70cecc;
}
</style>
