<template>
  <q-layout view="hHh LpR fff">
    <q-header reveal bordered class="bg-primary text-dark" height-hint="98">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="q-mr-sm"
          @click="toggleLeftDrawer"
        />
        <q-separator dark vertical inset />
        <q-btn stretch flat label="Home" to="/" />

        <q-space />

        <q-btn
          v-if="!authenticated"
          stretch
          flat
          icon="person"
          @click="login_popup = true"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawer"
      side="left"
      overlay
      bordered
      mini
      mini-to-overlay
      :width="200"
      :breakpoint="500"
    >
      <!-- drawer content       @click.capture="drawerClick" -->
    </q-drawer>

    <!-- fix  -->

    <q-drawer
      v-if="authenticated"
      v-model="rightDrawer"
      :mini="miniState"
      :width="200"
      :breakpoint="500"
      bordered
      overlay
      side="right"
      tabindex="111111111111111111111111111111111111111"
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

      <!-- http://jsfiddle.net/shomz/yFy5n/5/ -->
      <q-btn
        dense
        round
        unelevated
        color="primary"
        :icon="miniState ? 'chevron_left' : 'chevron_right'"
        @click="miniState = !miniState"
        size="sm"
        v-bind:class="miniState ? 'drawer_btn_desk' : 'drawer_btn_desk_moved'"
        v-if="!mobile"
      />

      <!-- mobile  -->
      <q-btn
        round
        text-color="dark"
        color="primary"
        icon="chevron_right"
        @click="rightDrawer = !rightDrawer"
        size="md"
        class="drawer_btn_mob"
        v-if="mobile"
      />
    </q-drawer>

    <q-page-container>
      <q-dialog v-model="forgot_popup">
        <q-card>
          <p class="text-weight-bolder text-grey">Request your Account Data</p>

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
                clearable
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
              />
              <p></p>
              <q-toggle
                checked-icon="check"
                color="green"
                unchecked-icon="clear"
                label="Request username"
                v-model="request_username"
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
                  outline
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
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="login" label="Login" />
            <q-tab name="register" label="Register" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="login_tab" animated>
            <q-tab-panel name="login">
              <q-card square class="no-shadow" style="width: 100%">
                <p class="text-weight-bolder text-grey">
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
                      clearable
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
                      clearable
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
                        outline
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
                        class="text-grey-6 full-width"
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
                <p class="text-weight-bolder text-grey">
                  Register a new Account
                </p>
                <q-card-section>
                  <q-form class="q-gutter-md" @submit.prevent="submitRegister">
                    <q-input
                      dense
                      square
                      filled
                      clearable
                      v-model="username"
                      label="Username"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 3) || 'At least 4 characters',
                        (val) =>
                          (val && val.length < 16) ||
                          'Not more than 16 characters',
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
                      clearable
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
                      clearable
                      v-model="password"
                      label="Password"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 7) || 'At least 8 characters',
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
                      clearable
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
                        outline
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

      <router-view />
      <div
        v-if="authenticated && mobile"
        class="fixed-right drawer_btn_mob_moved"
      >
        <!-- mobile  -->
        <q-btn
          round
          size="md"
          color="primary"
          text-color="dark"
          icon="chevron_left"
          @click="rightDrawer = !rightDrawer"
        />
      </div>
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>{{ authenticated }}</div>
          <div>{{ mobile }}</div>
          <div>{{ this.store.test }}</div>
        </q-toolbar-title>
        <q-btn @click="this.store.test = !this.store.test"> Test </q-btn>
        <q-toggle
          v-model="darkmode"
          checked-icon="check"
          color="green"
          unchecked-icon="clear"
          label="Dark Mode"
          @click="toogleDarkMode"
        />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref, computed } from 'vue';
import { Dark } from 'quasar';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/authenticated.ts';
export default {
  computed: {
    authenticated() {
      return this.store.auth_state;
    },
    mobile() {
      return this.q.platform.is.mobile;
    },
  },
  setup() {
    const store = useAuthStore();
    const leftDrawer = ref(false);
    const miniState = ref(true);
    const q = useQuasar();
    Dark.set(true);

    if (q.platform.is.mobile) {
      var rightDrawer = ref(false);
    } else {
      var rightDrawer = ref(true);
    }

    return {
      toggleLeftDrawer() {
        leftDrawer.value = !leftDrawer.value;
      },

      toogleDarkMode() {
        Dark.toggle();
      },

      // layout & styling
      store,
      q,
      rightDrawer,
      leftDrawer,
      miniState,
      darkmode: ref(true),

      // login / register form stuff
      login_popup: ref(false),
      forgot_popup: ref(false),

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
      loading: ref(false),
    };
  },
  beforeCreate() {
    api.get('/auth/csrf_cookie', { withCredentials: true }).catch();
    let config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': this.q.cookies.get('csrftoken'),
      },
    };
    api
      .get('/auth/authenticated', config)
      .then((response) => {
        if (response.status == 200) {
          this.store.authenticated = true;
        } else {
          this.store.authenticated = false;
        }
      })
      .catch((error) => {
        this.store.authenticated = false;
      });
  },
  methods: {
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        position: 'top',
        progress: true,
        multiLine: true,
      });
    },
    submitForget() {
      this.loading = true;
      const formData = {
        email: this.email_forgot,
      };
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };

      if (this.request_password) {
        api
          .post('auth/password_reset/', formData, config)
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
          .post('auth/username_request', formData, config)
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

    submitLogin() {
      this.loading = true;
      const formData = {
        username: this.username,
        password: this.login_password,
      };
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };

      api
        .post('/auth/login', formData, config)
        .then((response) => {
          if (response.status == 200) {
            this.loading = false;
            this.store.authenticated = true;
            this.username = '';
            this.password = '';
            this.password2 = '';
            this.login_password = '';
            this.email = '';
            this.notify('positive', 'Logged in');
            this.login_popup = false;
          } else {
            this.loading = false;
            var msg = 'Error: ' + response.data.error;
            this.notify('negative', msg);
          }
        })
        .catch((error) => {
          this.loading = false;
          var msg = 'Error (Server Error): ' + error;
          this.notify('negative', msg);
          this.store.authenticated = false;
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
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };

      api
        .post('/auth/register', formData, config)
        .then((response) => {
          if (response.status == 200) {
            this.loading = false;
            this.q.notify({
              icon: 'mail',
              type: 'positive',
              message:
                'Successfully registered. Now validate your account with the link we e-mailed you!',
              position: 'top',
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
            this.store.authenticated = false;
            this.$router.go('/');
          }
        })
        .catch();
    },
  },
};
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
</style>
