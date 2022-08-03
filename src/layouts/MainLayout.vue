<template>
  <q-layout view="hHh lpR fff">
    <q-header reveal elevated class="bg-primary text-dark" height-hint="98">
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
          color="amber"
          text-color="dark"
          dropdown-icon="change_history"
          icon="person"
          @click="login_popup = true"
        >
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
      <!-- drawer content       @click.capture="drawerClick" -->
    </q-drawer>

    <!-- fix  -->

    <q-drawer
      v-if="!authenticated"
      v-model="rightDrawer"
      :mini="!rightDrawer || miniState"
      :width="200"
      :breakpoint="500"
      bordered
      overlay
      side="right"
      tabindex="111111111111111111111111111111111111111"
      @focus="drawerClick"
      @focusout="handleFocusOut"
    >
      <q-scroll-area class="fit">
        <q-list padding>
          <q-item
            clickable
            v-ripple
            @click="miniState = !miniState"
            tabindex="-999999999999999999999999"
          >
            <q-item-section avatar tabindex="-999999999999999999999999">
              <q-icon
                :name="miniState ? 'chevron_left' : 'chevron_right'"
                tabindex="-999999999999999999999999"
              />
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="inbox" />
            </q-item-section>

            <q-item-section> Inbox </q-item-section>
          </q-item>

          <q-item active clickable v-ripple>
            <q-item-section avatar>
              <q-icon name="star" />
            </q-item-section>

            <q-item-section> Star </q-item-section>
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
                        color="red-4"
                        class="full-width text-white"
                        label="Sign In"
                        type="submit"
                      />
                    </q-card-actions>
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
                          (val && val.length > 3) || 'At least 6 characters',
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
                        color="red-4"
                        class="full-width text-white"
                        label="Register"
                        type="submit"
                      />
                    </q-card-actions>
                  </q-form>
                </q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
        ></q-dialog
      >

      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>{{ authenticated }}</div>
          <div>{{ test }}</div>
        </q-toolbar-title>
        <q-toggle
          v-model="mode"
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
  },
  setup() {
    const store = useAuthStore();
    const leftDrawerOpen = ref(false);
    const miniState = ref(true);

    Dark.set(true);

    return {
      store,
      rightDrawer: ref(true),
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      miniState,

      drawerClick(e) {
        // if in "mini" state and user
        // click on drawer, we switch it to "normal" mode
        if (miniState.value) {
          miniState.value = false;

          // notice we have registered an event with capture flag;
          // we need to stop further propagation as this click is
          // intended for switching drawer to "normal" mode only
          e.stopPropagation();
        }
      },

      handleFocusOut(e) {
        if (!miniState.value) {
          miniState.value = true;
          e.stopPropagation();
        }
      },

      toogleDarkMode() {
        Dark.toggle();
      },

      test: ref(1),
      mode: ref(true),
      login_popup: ref(false),
      login_tab: ref('login'),
      username: ref(''),
      password: ref(''),
      password2: ref(''),
      login_password: ref(''),
      email: ref(''),
      isPwd: ref(true),
      isPwd2: ref(true),
    };
  },
  beforeCreate() {
    api.get('/auth/csrf_cookie', { withCredentials: true });
    let config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': this.$q.cookies.get('csrftoken'),
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
      .catch((this.store.authenticated = false));
  },
  methods: {
    notify(type, message) {
      this.$q.notify({
        type: type,
        message: message,
      });
    },

    submitLogin() {
      const formData = {
        username: this.username,
        password: this.login_password,
      };
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.$q.cookies.get('csrftoken'),
        },
      };

      api
        .post('/auth/login', formData, config)
        .then((response) => {
          if (response.status == 200) {
            this.store.authenticated = true;
            this.username = '';
            this.password = '';
            this.password2 = '';
            this.login_password = '';
            this.email = '';
            this.notify('positive', 'Logged in');
            this.login_popup = false;
          } else {
            var msg = 'Error: ' + response;
            this.notify('negative', msg);
          }
        })
        .catch((error) => {
          var msg = 'Error: ' + error;
          this.notify('negative', msg);
          this.store.authenticated = true;
        });
    },

    submitRegister() {
      const formData = {
        username: this.username,
        password: this.password,
        re_password: this.password2,
        email: this.email,
      };
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.$q.cookies.get('csrftoken'),
        },
      };

      api
        .post('/auth/register', formData, config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Registered');
            this.login_tab = 'login';
            this.password = '';
            this.password2 = '';
            this.login_password = '';
            this.email = '';
          } else {
            var msg = 'Error: ' + response;
            this.notify('negative', msg);
          }
        })
        .catch((error) => {
          var msg = 'Error: ' + error;
          this.notify('negative', msg);
        });
    },

    logout() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.$q.cookies.get('csrftoken'),
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
</style>
