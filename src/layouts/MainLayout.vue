<template>
  <q-layout view="hHh LpR fff">
    <q-header
      reveal
      height-hint="98"
      elevated
      class="bg-layout-bg text-layout-text"
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
          v-if="authenticated"
        />
        <q-space v-if="authenticated" />
        <q-input
          dark
          dense
          standout
          v-model="search"
          input-class="text-left"
          v-if="authenticated"
        >
          <template v-slot:append>
            <q-icon v-if="search === ''" name="search" />
            <q-icon
              v-else
              name="clear"
              class="cursor-pointer"
              @click="search = ''"
            />
          </template>
        </q-input>

        <q-btn stretch flat v-if="authenticated" class="button_hover">
          <q-avatar size="34px">
            <img :src="this.headerinfo.avatar" />
          </q-avatar>
          <div class="q-ml-md" v-if="!mobile">
            {{ this.headerinfo.username }}
          </div>
          <q-menu @hide="this.done = false">
            <div class="row no-wrap q-pa-md">
              <div class="column items-center">
                <q-avatar size="72px">
                  <img :src="this.headerinfo.avatar" />
                </q-avatar>

                <div class="text-subtitle1 q-mt-md q-mb-xs">
                  {{ this.headerinfo.username }}
                </div>

                <q-btn
                  color="primary"
                  label="Logout"
                  push
                  stretch
                  size="sm"
                  v-close-popup
                  text-color="layout-text"
                  @click="logout"
                />
              </div>
            </div>
          </q-menu>
        </q-btn>
        <q-space v-if="!authenticated && fetched" />
        <q-btn
          stretch
          flat
          icon="login"
          label="Login"
          @click="rightDrawer = !rightDrawer"
          v-if="!authenticated && fetched"
        />
        <q-btn
          stretch
          flat
          icon="add"
          label="Register"
          to="/register"
          v-if="!authenticated && fetched"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="rightDrawer"
      side="right"
      elevated
      overlay
      :width="250"
      behavior="desktop"
      class="bg-layout-bg text-layout-text"
    >
      <div v-if="!authenticated">
        <q-toolbar class="q-ma-none q-pa-none">
          <q-btn icon="remove" size="md" flat @click="rightDrawer = false" />
        </q-toolbar>
        <q-separator />
        <q-card style="background: transparent" class="q-ma-md q-mt-xl" flat>
          <p class="text-weight-bolder text-h6 text-center q-mt-md">
            Login to your account
          </p>

          <q-input
            filled
            dense
            input-class="text-body1"
            v-model="username"
            type="username"
            label="Username"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          >
            <template v-slot:prepend>
              <q-icon name="person" />
            </template>
          </q-input>
          <q-input
            filled
            dense
            input-class="text-body1"
            v-model="login_password"
            label="Password"
            :type="isPwd ? 'password' : 'text'"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
            class="q-mt-md"
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
            @click="submitLogin"
          />
        </q-card>
        <div class="text-center text-body1 q-mt-lg">
          <router-link to="/register" class="text-layout-text"
            >New here? Register</router-link
          >
        </div>
      </div>
    </q-drawer>

    <q-drawer
      v-model="leftDrawer"
      side="left"
      behavior="default"
      :mini="leftDrawerMini"
      @mouseover="leftDrawerMini = false"
      @mouseout="leftDrawerMini = true"
      @hide="leftDrawerMini = false"
      mini-to-overlay
      bordered
      :breakpoint="600"
      :width="220"
      v-if="authenticated"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item
            clickable
            v-ripple
            to="/dashboard/home"
            class="text-primary text-weight-bold"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>

            <q-item-section> Home </q-item-section>
          </q-item>
          <q-item
            clickable
            v-ripple
            :to="myprofileroute"
            class="text-primary text-weight-bold"
          >
            <q-item-section avatar>
              <q-icon name="account_circle" />
            </q-item-section>

            <q-item-section> My Profile </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            class="text-primary text-weight-bold"
            to="/dashboard/files"
          >
            <q-item-section avatar>
              <q-icon name="cloud" />
            </q-item-section>

            <q-item-section> My Files </q-item-section>
          </q-item>

          <q-space />

          <q-item
            clickable
            v-ripple
            to="/dashboard/settings"
            class="text-primary text-weight-bold"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>

            <q-item-section> Settings </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            @click="logout"
            class="text-primary text-weight-bold"
          >
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>
            <q-item-section> Logout </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- fix  -->

    <q-page-container>
      <!-- <q-dialog v-model="forgot_popup">
        <q-card dark bordered style="width: 17%; min-width: 250px">
          <p
            class="text-weight-bolder text-center text-primary text-h6 q-mt-lg"
          >
            Request your Account Data
          </p>
          <q-card-section>
            <q-form ref="forgotform" @submit.prevent="submitForget">
              <q-input
                dense
                square
                filled
                v-model="email_forgot"
                type="email"
                input-class="text-body1"
                label="Your Email"
                lazy-rules
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                  (val) => (val && val.length > 3) || 'At least 4 characters',
                  (val) =>
                    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                      val
                    ) || 'Not a valid E-Mail',
                ]"
              >
                <template v-slot:prepend>
                  <q-icon name="email" />
                </template>
              </q-input>

              <q-toggle
                class="q-mt-sm"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Request password reset link"
                v-model="request_password"
              />
              <p></p>
              <q-toggle
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Request username"
                v-model="request_username"
              />
              <q-card-actions class="q-mt-md">
                <q-btn
                  rounded
                  size="md"
                  color="green"
                  class="full-width"
                  label="Request"
                  type="submit"
                  :loading="loading"
                />
              </q-card-actions>
            </q-form>
          </q-card-section>
        </q-card>
      </q-dialog> -->
      <router-view />
    </q-page-container>

    <q-footer reveal elevated class="bg-layout-bg text-layout-text">
      <q-toolbar>
        <q-toolbar-title>
          <div>Under developement.</div>
        </q-toolbar-title>
        <q-btn-dropdown icon="settings" flat>
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
                  style="background: #0eb1d2"
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

            <q-item v-if="currentRoute == '/' || currentRoute == '/register'">
              <q-toggle
                v-model="backgroundAnimationToogle"
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Background Animation"
                @click="toogleBackgroundAnimation"
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
    const miniState = ref(true);
    const q = useQuasar();
    if (q.screen.width < 600) {
      var leftDrawer = ref(false);
    } else {
      var leftDrawer = ref(true);
    }
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
      toggleLeftDrawer() {
        leftDrawer.value = !leftDrawer.value;
      },
      currentRoute,
      axios_config,

      // layout & styling
      settingsStore,
      userStore,
      q,
      backgroundAnimationToogle,
      darkmodeToogle,
      // login / register form stuff
      login_popup: ref(false),
      forgot_popup: ref(false),

      leftDrawerMini: ref(true),
      leftDrawer,
      search: ref(''),
      miniState,
      loading: ref(false),
      headerinfo: userStore.headerinfo,
      theme_menu: ref(false),

      login_tab: ref('login'),
      username: ref(''),
      password: ref(''),
      password2: ref(''),
      login_password: ref(''),
      email: ref(''),
      email_forgot: ref(''),
      request_username: ref(false),
      request_password: ref(false),
      isPwd: ref(true),
      isPwd2: ref(true),
      saved_username: ref(''),
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
    myprofileroute() {
      return '/user/' + this.headerinfo.username;
    },
    authenticated() {
      return this.userStore.authenticated;
    },
    headerinfoStore() {
      return this.userStore.headerinfo;
    },
    currentRouteName() {
      return this.$route.name;
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
    },
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    submitForget() {
      this.loading = true;
      const formData = {
        email: this.email_forgot,
      };

      if (!this.request_password && !this.request_username) {
        this.loading = false;
        this.forgot_popup = false;
        this.email_forgot = '';
      }

      if (this.request_password) {
        api
          .post('auth/password_reset', formData, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.loading = false;
              this.forgot_popup = false;
              this.request_password = false;
              this.email_forgot = '';
              this.notify('positive', 'Password-Request-Email has been sent.');
            } else {
              this.loading = false;
              var msg = 'Error: ' + response.data.error;
              this.notify('negative', msg);
            }
          })
          .catch((error) => {
            this.loading = false;
            var msg = 'Please enter a valid E-Mail Adress.';
            this.notify('negative', msg);
          });
      }

      if (this.request_username) {
        api
          .post('auth/username_request', formData, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.loading = false;
              this.forgot_popup = false;
              this.email_forgot = '';
              this.request_username = false;
              this.notify('positive', 'Username-Request-Email has been sent.');
            } else {
              this.loading = false;
              var msg = 'Error: ' + response.data.error;
              this.notify('negative', msg);
            }
          })
          .catch((error) => {
            this.loading = false;
            var msg = 'Please enter a valid E-Mail Adress.';
            this.notify('negative', msg);
          });
      }
    },

    logout() {
      api
        .post('/auth/logout', '', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.userStore.setAuthState(false);
            this.userStore.setHeaderInfo(defaultHeaderInformation());
            this.notify('positive', 'Logged out!!');
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

    submitLogin() {
      this.loading = true;
      const formData = {
        username: this.username,
        password: this.login_password,
      };
      api
        .post('/auth/login', formData, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.headerinfo = serializeHeaderInformation(response.data);
            this.userStore.setHeaderInfo(this.headerinfo);
            this.userStore.setAuthState(true);
            this.loading = false;
            this.username = '';
            this.password = '';
            this.password2 = '';
            this.login_password = '';
            this.email = '';
            this.login_popup = false;
            this.$router.push('/dashboard/home');
            this.loading = false;
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
              this.saved_username = this.username;
              this.q.notify({
                message:
                  'Please click the activation link we sent you first to activate this account or request a new one.',
                type: 'info',
                spinner: QSpinnerGears,
                timeout: 8000,
                progress: true,
                actions: [
                  { size: 'xs' },
                  {
                    label: 'Request new verification link',
                    type: 'info',
                    class: 'full-width',
                    handler: () => {
                      const formData = {
                        username: this.saved_username,
                      };
                      api
                        .post(
                          '/auth/activation-email_request',
                          formData,
                          this.axios_config
                        )
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
                  },
                ],
              });
            } else {
              this.loading = false;
              this.userStore.setAuthState(false);
              var msg = 'Error: ' + response.data.error;
              this.notify('negative', msg);
            }
          }
        })
        .catch((error) => {
          this.loading = false;
          var msg = 'Error (Server Error): ' + error;
          this.notify('negative', msg);
          this.userStore.setAuthState(false);
        });
    },
  },
};
</script>

<style scoped>
.pw_icon:hover {
  color: whitesmoke;
}

.button_hover:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
