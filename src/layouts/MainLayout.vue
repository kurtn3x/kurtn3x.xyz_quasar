<template>
  <q-layout view="hHh LpR fff">
    <q-header
      reveal
      height-hint="98"
      elevated
      class="bg-layout-bg text-layout-text"
      style="font-family: 'SourceCodePro', Helvetica, Arial"
    >
      <div v-if="authenticated">
        <q-toolbar class="q-pa-none">
          <q-item clickable v-ripple to="/dashboard/home">
            <q-item-section>
              <q-icon name="home" size="md" />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/dashboard/files">
            <q-item-section>
              <q-icon name="cloud" size="md" />
            </q-item-section>
          </q-item>
          <q-space />
          <q-btn
            stretch
            flat
            class="button_hover"
            @click="rightDrawer = !rightDrawer"
          >
            <q-icon
              :name="rightDrawer ? 'chevron_right' : 'chevron_left'"
              class="q-mr-xs"
            />
            <a class="text-body1">{{ headerinfo.username }}</a>
            <q-avatar size="28px" rounded class="q-ml-md">
              <img :src="this.headerinfo.avatar" />
            </q-avatar>
          </q-btn>
        </q-toolbar>
      </div>

      <div
        v-if="!authenticated"
        style="font-family: 'SourceCodePro', Helvetica, Arial"
      >
        <q-toolbar class="q-pa-none">
          <q-btn stretch flat icon="home" to="/" />
          <q-space />
          <q-btn
            stretch
            flat
            icon="login"
            label="Login"
            @click="rightDrawer = !rightDrawer"
          />
          <q-btn stretch flat icon="add" label="Register" to="/register" />
        </q-toolbar>
      </div>
    </q-header>

    <q-drawer
      v-model="rightDrawer"
      side="right"
      elevated
      overlay
      :width="300"
      behavior="desktop"
      style="font-family: 'SourceCodePro', Helvetica, Arial"
      :persistent="true"
    >
      <q-btn
        icon="arrow_forward_ios"
        size="md"
        flat
        @click="rightDrawer = false"
        class="full-width"
        style="height: 50px"
      />
      <q-separator />

      <div v-if="authenticated">
        <q-btn :to="myprofileroute" flat class="full-width">
          <div class="row justify-center q-mt-md">
            <q-avatar size="128px" rounded>
              <img :src="this.headerinfo.avatar" />
            </q-avatar>
          </div>

          <div
            class="text-center q-mt-md text-h5 q-mb-md"
            style="min-width: 200px"
          >
            {{ headerinfo.username }}
          </div>
        </q-btn>
        <q-separator />
        <q-list padding class="full-height q-pa-none">
          <q-item
            clickable
            v-ripple
            class="text-body1"
            to="/dashboard/home"
            style="height: 65px"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>

            <q-item-section> Home </q-item-section>
          </q-item>
          <q-separator />

          <q-item
            clickable
            v-ripple
            class="text-body1"
            to="/dashboard/files"
            style="height: 65px"
          >
            <q-item-section avatar>
              <q-icon name="cloud" />
            </q-item-section>

            <q-item-section> My Files </q-item-section>
          </q-item>
          <q-separator />
          <div class="absolute-bottom">
            <q-separator />

            <q-item
              clickable
              v-ripple
              to="/dashboard/settings"
              class="text-body1"
              style="height: 65px"
            >
              <q-item-section avatar>
                <q-icon name="settings" />
              </q-item-section>

              <q-item-section> Settings </q-item-section>
            </q-item>
            <q-separator />

            <q-item
              clickable
              v-ripple
              @click="logout"
              class="text-body1"
              style="height: 65px"
            >
              <q-item-section avatar>
                <q-icon name="logout" />
              </q-item-section>
              <q-item-section> Logout </q-item-section>
            </q-item>
            <q-separator />
          </div>
        </q-list>
      </div>

      <div
        v-if="!authenticated"
        style="
          font-family: 'SourceCodePro', Helvetica, Arial;
          top: 20%;
          position: absolute;
        "
      >
        <q-card style="background: transparent" class="q-ma-md" flat>
          <p
            class="text-weight-bolder text-h5 text-center q-mt-md"
            style="text-decoration: underline"
          >
            Login
          </p>
          <q-form @submit="submitLogin">
            <q-input
              v-model="loginUsername"
              type="username"
              label="Username"
              outlined
              input-style="font-size: 18px; font-family: 'SourceCodePro', Helvetica, Arial"
              input-class="text-body1"
              class="q-mt-lg"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>
            </q-input>
            <q-input
              outlined
              input-style="font-size: 18px; font-family: 'SourceCodePro', Helvetica, Arial"
              input-class="text-body1"
              v-model="loginPassword"
              label="Password"
              :type="isPwd ? 'password' : 'text'"
              class="q-mt-md text-layout-text"
            >
              <template v-slot:prepend>
                <q-icon
                  class="pw_icon"
                  :name="isPwd ? 'lock' : 'lock_open'"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <q-btn
              size="lg"
              class="full-width q-mt-md"
              label="Sign In"
              :loading="loading"
              outline
              type="submit"
            />
          </q-form>
          <div
            v-if="loginError"
            class="text-red text-body1 q-mt-md shake text-center"
          >
            {{ loginErrorMessage }}
          </div>
          <div
            v-if="loginEmailNotVerifiedError"
            class="text-center q-mt-md shake"
          >
            <q-item
              clickable
              @click="requestEmailVerification"
              class="text-red text-body2"
              >Email not verified. Click here to request a new link.</q-item
            >
          </div>
        </q-card>
        <div class="text-center text-body1 q-mt-lg">
          <router-link
            to="/register"
            :class="darkmode ? 'text-light' : 'text-dark'"
            >New here? Register</router-link
          >
        </div>
        <div class="text-center text-body1 q-mt-lg">
          <router-link
            to="/forgot"
            :class="darkmode ? 'text-light' : 'text-dark'"
            >Forgot something?</router-link
          >
        </div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer reveal elevated class="bg-layout-bg text-layout-text">
      <q-toolbar class="q-pr-none">
        <q-toolbar-title>
          <div>Under developement.</div>
        </q-toolbar-title>
        <q-btn-dropdown icon="settings" flat stretch>
          <q-item clickable>
            <q-item-section avatar>
              <q-icon
                :name="theme_menu ? 'arrow_drop_up' : 'arrow_drop_down'"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>Themes</q-item-label>
            </q-item-section>
            <q-menu :menu-offset="[0, -40]" fit v-model="theme_menu">
              <q-list bordered style="width: 200px">
                <q-item
                  clickable
                  @click="setTheme('default')"
                  style="background: #000729"
                />
                <q-item
                  clickable
                  @click="setTheme('classic')"
                  style="background: #cdcdcd"
                />
                <q-item
                  clickable
                  @click="setTheme('orange')"
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
                  style="background: #f5f5f5"
                />
              </q-list>
            </q-menu>
          </q-item>
          <q-list style="width: 200px">
            <q-item>
              <q-item-section>
                <q-toggle
                  v-model="darkmodeToogle"
                  checked-icon="check"
                  color="green"
                  unchecked-icon="clear"
                  label="Dark Mode"
                  @click="darkmodeChanged"
                />
              </q-item-section>
            </q-item>

            <!-- <q-item>
              <q-toggle
                v-model="backgroundAnimationToogle"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Background Animation"
                @click="toogleBackgroundAnimation"
              />
            </q-item> -->
          </q-list>
        </q-btn-dropdown>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue';
import { Dark, LocalStorage } from 'quasar';
import { useQuasar, QSpinnerGears } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import {
  defaultHeaderInformation,
  serializeHeaderInformation,
} from 'src/models';
import { useRoute } from 'vue-router';

export default {
  setup() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
    const q = useQuasar();

    var axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    const route = useRoute();
    const currentRoute = computed(() => route.path);

    const backgroundAnimationToogle = ref(
      settingsStore.backgroundAnimationState
    );
    const darkmodeToogle = ref(settingsStore.darkmodeState);

    return {
      fetched: ref(false),
      rightDrawer: ref(false),

      currentRoute,
      axios_config,

      // layout & styling
      settingsStore,
      userStore,
      q,
      backgroundAnimationToogle,
      darkmodeToogle,

      loading: ref(false),
      headerinfo: userStore.headerinfo,
      theme_menu: ref(false),

      loginUsername: ref(''),
      loginPassword: ref(''),
      loginError: ref(false),
      loginErrorMessage: ref(''),
      loginEmailNotVerifiedError: ref(false),
      isPwd: ref(true),
      savedUsername: ref(''),
      done: ref(false),
    };
  },

  created() {
    if (this.userStore.authenticated) {
      this.getHeaderInfo();
    } else {
      this.headerinfo = '';
      this.userStore.setHeaderInfo(defaultHeaderInformation());
      this.fetched = true;
    }
  },

  computed: {
    myprofileroute() {
      return '/user/' + this.headerinfo.username;
    },
    darkmode() {
      return this.settingsStore.darkmodeState;
    },
    mobile() {
      if (this.q.screen.width < 600) {
        return true;
      } else {
        return false;
      }
    },

    authenticated() {
      return this.userStore.authenticated;
    },
    headerinfoStore() {
      return this.userStore.headerinfo;
    },
  },

  watch: {
    headerinfoStore(valChanged) {
      this.headerinfo = valChanged;
    },
  },

  methods: {
    setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      this.settingsStore.theme = theme;
    },

    darkmodeChanged() {
      this.settingsStore.darkmode = this.darkmodeToogle;
    },

    toogleBackgroundAnimation() {
      this.settingsStore.backgroundAnimation = this.backgroundAnimationToogle;
      this.$refs.backgroundAnimation.toogleActive(
        this.backgroundAnimationToogle
      );
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
      api
        .post('/auth/logout', '', this.axios_config)
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
      api
        .get('/profile/headerinfo', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.headerinfo = serializeHeaderInformation(response.data);
            this.userStore.setHeaderInfo(this.headerinfo);
            this.userStore.setAuthState(true);
            this.status = this.headerinfo.status;
            this.fetched = true;
          } else {
            this.notify(
              'negative',
              'Something went wrong when fetching the user.'
            );
            this.userStore.setAuthState(false);
            this.fetched = true;
          }
        })
        .catch((error) => {
          console.log(error);
          this.notify('negative', 'API ERROR.');
          this.userStore.setAuthState(false);
          this.fetched = true;
        });
    },

    requestEmailVerification() {
      const formData = {
        username: this.savedUsername,
      };
      api
        .post('/auth/activation-email_request', formData, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
          } else {
            var msg = 'Error: ' + response.data.error;
            this.notify('negative', msg);
          }
        })
        .catch((error) => {
          var msg = 'Error (Server Error): ' + error;
          this.notify('negative', msg);
        });
    },

    submitLogin() {
      this.loading = true;

      const formData = {
        username: this.loginUsername,
        password: this.loginPassword,
      };

      api
        .post('/auth/login', formData, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.rightDrawer = false;
            this.headerinfo = serializeHeaderInformation(response.data);
            this.userStore.setHeaderInfo(this.headerinfo);
            this.userStore.setAuthState(true);
            this.loginError = false;
            this.loginEmailNotVerifiedError = false;
            this.loading = false;
            this.$router.push('/dashboard/home');
            this.notify('positive', 'Logged in');

            api
              .get('/auth/csrf_cookie', { withCredentials: true })
              .then(() => {
                this.axios_config = {
                  withCredentials: true,
                  headers: {
                    'X-CSRFToken': this.q.cookies.get('csrftoken'),
                  },
                };
              })
              .catch();
          } else {
            // means that email hasnt been verified yet
            if (response.status == 244) {
              this.userStore.setAuthState(false);
              this.loading = false;
              this.savedUsername = this.username;
              this.loginEmailNotVerifiedError = true;
              this.loginError = false;
            } else {
              this.loginEmailNotVerifiedError = false;
              this.loginError = true;
              this.loading = false;
              this.userStore.setAuthState(false);
              this.loginErrorMessage = response.data.error;
            }
          }
        })
        .catch((error) => {
          this.loginEmailNotVerifiedError = false;
          this.loginError = true;
          this.loading = false;
          this.userStore.setAuthState(false);
          this.loginErrorMessage = error;
        });
    },
  },
};
</script>

<style scoped>
.button_hover:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.shake {
  animation: horizontal-shaking 0.4s 3;
}

@keyframes horizontal-shaking {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}
@font-face {
  font-family: 'SourceCodePro';
  src: local('SourceCodePro'), url(../css//SourceCodePro.ttf) format('truetype');
}
</style>
