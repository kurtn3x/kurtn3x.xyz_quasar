<template>
  <q-layout view="hHh LpR fff">
    <q-header
      reveal
      height-hint="98"
      elevated
      class="bg-primary text-layout-text"
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
        <q-separator vertical v-if="authenticated" />
        <q-btn stretch flat icon="home" to="/" />

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
              <div class="column">
                <div class="text-h6 q-mb-md">Settings</div>
                <q-input
                  hint="Your Status message"
                  filled
                  dense
                  v-model="status"
                  lazy-rules
                  :rules="[(val) => val.length < 15 || 'Maximum 15 Characters']"
                >
                  <template v-slot:prepend>
                    <q-icon name="add_reaction" class="button_hover">
                      <q-menu>
                        <EmojiPicker :native="true" @select="onSelectEmoji" />
                      </q-menu>
                      <q-tooltip> Add a emoji to status</q-tooltip>
                    </q-icon>
                  </template>
                  <template v-slot:after>
                    <q-icon
                      name="send"
                      class="button_hover"
                      @click="updateHeaderStatus"
                    >
                      <q-tooltip> Update Status</q-tooltip>
                    </q-icon>
                  </template>
                  <template v-slot:append>
                    <q-icon
                      v-if="done"
                      name="check"
                      class="text-green"
                      @click="updateHeaderStatus"
                    >
                      <q-tooltip class="text-green">
                        Updated the status</q-tooltip
                      >
                    </q-icon>
                  </template>
                </q-input>
              </div>

              <q-separator vertical inset class="q-mx-lg" />

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
        <q-space v-if="!authenticated" />
        <q-btn
          stretch
          flat
          icon="login"
          label="Login"
          @click="
            login_popup = true;
            login_tab = 'login';
          "
          v-if="!authenticated"
        />
        <q-btn
          stretch
          flat
          icon="add"
          label="Register"
          @click="
            login_popup = true;
            login_tab = 'register';
          "
          v-if="!authenticated"
        />
      </q-toolbar>
    </q-header>

    <!-- LEFT DRAWER  this fucker doesnt take global text color classes-->
    <q-drawer
      v-model="leftDrawer"
      side="left"
      behavior="default"
      :mini="leftDrawerMini"
      @mouseover="leftDrawerMini = false"
      @mouseout="leftDrawerMini = true"
      mini-to-overlay
      bordered
      :breakpoint="600"
      :width="217"
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

          <q-item
            clickable
            v-ripple
            class="text-primary text-weight-bold"
            to="/dashboard/notes"
          >
            <q-item-section avatar>
              <q-icon name="edit_note" />
            </q-item-section>

            <q-item-section> Drafts </q-item-section>
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
      <q-dialog v-model="forgot_popup">
        <q-card bordered>
          <p class="text-weight-bolder q-pt-md q-pl-md text-primary">
            Request your Account Data
          </p>
          <q-card-section>
            <q-form
              class="q-gutter-md text-grey"
              ref="forgotform"
              @submit.prevent="submitForget"
            >
              <q-input
                dense
                square
                filled
                v-model="email_forgot"
                type="email"
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
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Request password reset link"
                v-model="request_password"
                :class="darkmode ? 'text-grey-2' : 'text-grey-8'"
              />
              <p></p>
              <q-toggle
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Request username"
                v-model="request_username"
                :class="darkmode ? 'text-grey-2' : 'text-grey-8'"
              />
              <p
                v-if="request_username && request_password"
                class="text-center text-red"
              >
                Will be sent in seperate E-Mails
                <q-tooltip class="bg-red">
                  <strong
                    >For security reasons we will send the password reset link
                    and your username in 2 seperate E-Mails.
                  </strong>
                </q-tooltip>
              </p>
              <q-card-actions>
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
      </q-dialog>

      <q-dialog v-model="login_popup">
        <q-card>
          <q-tabs
            v-model="login_tab"
            dense
            :class="darkmode ? 'text-grey-2' : 'text-grey-8'"
            align="justify"
            active-color="primary"
            indicator-color="primary"
          >
            <q-tab name="login" label="Login" />
            <q-tab name="register" label="Register" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="login_tab" animated>
            <q-tab-panel name="login">
              <q-card square class="no-shadow" style="width: 100%">
                <p class="text-weight-bolder text-primary">
                  Login to your account
                </p>
                <q-card-section>
                  <q-form
                    class="q-gutter-md text-grey"
                    ref="loginform"
                    @submit.prevent="submitLogin"
                  >
                    <q-input
                      dense
                      square
                      filled
                      v-model="username"
                      type="username"
                      label="Username"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                    <q-input
                      dense
                      square
                      filled
                      v-model="login_password"
                      label="Password"
                      :type="isPwd ? 'password' : 'text'"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd ? 'lock' : 'lock_open'"
                          @click="isPwd = !isPwd"
                        />
                      </template>
                    </q-input>
                    <q-card-actions>
                      <q-btn
                        rounded
                        size="md"
                        color="green"
                        class="full-width"
                        label="Sign In"
                        type="submit"
                        :loading="loading"
                      />
                    </q-card-actions>
                    <q-card-section class="q-pa-none">
                      <q-btn
                        class="full-width"
                        :class="darkmode ? 'text-grey-2' : 'text-grey-8'"
                        flat
                        size="md"
                        @click="forgot_popup = !forgot_popup"
                      >
                        Forgot something?
                      </q-btn>
                    </q-card-section>
                  </q-form>
                </q-card-section>
              </q-card>
            </q-tab-panel>

            <q-tab-panel name="register">
              <q-card square class="no-shadow" style="width: 100%">
                <p class="text-weight-bolder text-primary">
                  Register a new Account
                </p>
                <q-card-section>
                  <q-form class="q-gutter-md" @submit.prevent="submitRegister">
                    <q-input
                      dense
                      square
                      filled
                      v-model="username"
                      label="Username"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 3) || 'At least 4 characters',
                        (val) =>
                          (val && val.length < 50) ||
                          'Not more than 16 characters',
                        (val) =>
                          /^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/.test(
                            val
                          ) || 'Only alphanumeric characters allowed.',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>

                    <q-input
                      dense
                      square
                      filled
                      v-model="email"
                      type="email"
                      label="Email"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 3) || 'At least 4 characters',
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
                    <q-input
                      dense
                      square
                      filled
                      v-model="password"
                      label="Password"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 7) || 'At least 8 characters',
                        (val) =>
                          (val && val.length < 100) ||
                          'Not more than 100 characters',
                        (val) =>
                          /(?=.*[a-z])/.test(val) ||
                          'At least 1 lowercase letter',
                        (val) =>
                          /(?=.*[A-Z])/.test(val) ||
                          'At least 1 uppercase letter',
                        (val) => /(?=.*[0-9])/.test(val) || 'At least 1 number',
                      ]"
                      :type="isPwd ? 'password' : 'text'"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd ? 'lock' : 'lock_open'"
                          @click="isPwd = !isPwd"
                        />
                      </template>
                    </q-input>

                    <q-input
                      dense
                      square
                      filled
                      v-model="password2"
                      label="Confirm Password"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) => val == password || 'Passwords do not match',
                      ]"
                      :type="isPwd2 ? 'password' : 'text'"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd2 ? 'lock' : 'lock_open'"
                          @click="isPwd2 = !isPwd2"
                        />
                      </template>
                    </q-input>

                    <q-card-actions>
                      <q-btn
                        rounded
                        size="md"
                        color="green"
                        class="full-width text-white"
                        label="Register"
                        type="submit"
                        :loading="loading"
                      />
                    </q-card-actions>
                  </q-form>
                </q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-dialog>
      <ParticlesBG ref="backgroundAnimation" />
      <router-view />
    </q-page-container>

    <q-footer reveal elevated class="bg-primary text-layout-text">
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
            <q-menu
              menu-anchor="bottom middle"
              menu-self="bottom middle"
              :menu-offset="[0, -40]"
              fit
              v-model="theme_menu"
            >
              <q-list bordered>
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
              </q-list>
            </q-menu>
          </q-item>
          <q-list>
            <q-item>
              <q-item-section>
                <q-toggle
                  v-model="darkmode_model"
                  checked-icon="check"
                  color="green"
                  unchecked-icon="clear"
                  label="Dark Mode"
                  @click="darkmodeChanged"
                />
              </q-item-section>
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
import { Dark, LocalStorage } from 'quasar';
import { useQuasar, QSpinnerGears } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import ParticlesBG from 'components/ParticlesBG.vue';
import EmojiPicker from 'vue3-emoji-picker';
import '../../node_modules/vue3-emoji-picker/dist/style.css';
import {
  defaultHeaderInformation,
  serializeHeaderInformation,
} from 'src/models';

export default {
  components: { ParticlesBG, EmojiPicker },

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
    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      toggleLeftDrawer() {
        leftDrawer.value = !leftDrawer.value;
      },
      axios_config,

      // layout & styling
      settingsStore,
      darkmode_model: ref(settingsStore.darkmode_state),
      userStore,
      q,
      background_animation: ref(false),
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
      status: ref(userStore.headerinfo.status),
      done: ref(false),
    };
  },

  created() {
    if (this.userStore.authenticated) {
      this.getHeaderInfo();
    }
  },

  computed: {
    darkmode() {
      return this.settingsStore.darkmode_state;
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
      this.settingsStore.darkmode = this.darkmode_model;
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

    onSelectEmoji(emoji) {
      this.status += emoji.i;
    },

    updateHeaderStatus() {
      var data = {
        status: this.status,
      };
      api
        .put('profile/update_status', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.userStore.setStatus(this.status);
            this.done = true;
          } else {
            var msg = 'Error: ' + response.data.error;
            this.notify('negative', msg);
          }
        })
        .catch((error) => {
          console.log(error);
          this.notify('negative', 'Something went wrong with the API :/');
        });
    },
    submitForget() {
      this.loading = true;
      const formData = {
        email: this.email_forgot,
      };

      if (this.request_password) {
        api
          .post('auth/password_reset', formData, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.loading = false;
              this.forgot_popup = false;
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
            this.$router.push('/');
            this.notify('positive', 'Logged out!!');
            LocalStorage.remove('header');
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
          } else {
            this.notify(
              'negative',
              'Something went wrong when fetching the user.'
            );
            this.userStore.setAuthState(false);
          }
        })
        .catch((error) => {
          console.log(error);
          this.notify('negative', 'API ERROR.');
          this.userStore.setAuthState(false);
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

    submitRegister() {
      this.loading = true;
      const formData = {
        username: this.username,
        password: this.password,
        re_password: this.password2,
        email: this.email,
      };

      api
        .post('/auth/register', formData, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.loading = false;
            this.q.notify({
              icon: 'mail',
              type: 'positive',
              message:
                'Successfully registered. Now validate your account with the link we e-mailed you!',
              progress: true,
              multiLine: true,
            });
            this.login_tab = 'login';
            this.password = '';
            this.password2 = '';
            this.login_password = '';
            this.email = '';
          } else {
            this.loading = false;
            var msg = response.data.error;
            this.notify('negative', msg);
          }
        })
        .catch((error) => {
          this.loading = false;
          var msg = 'Error (Server Error): ' + error;
          this.notify('negative', msg);
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
