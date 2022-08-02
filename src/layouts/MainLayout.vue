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
          color="amber"
          text-color="dark"
          dropdown-icon="change_history"
          icon="person"
          @click="login = true"
        >
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <q-dialog v-model="login">
        <q-card>
          <q-tabs
            v-model="tab"
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

          <q-tab-panels v-model="tab" animated>
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
                      v-model="password"
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
          <div>Title</div>
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
import { ref } from 'vue';
import { Dark } from 'quasar';
import { useStore } from 'stores/store.ts';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default {
  setup() {
    const $q = useQuasar();
    const $store = useStore();
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    Dark.set(true);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },

      toogleDarkMode() {
        Dark.toggle();
      },

      mode: ref(true),
      login: ref(false),
      register: ref(false),
      tab: ref('login'),
      username: ref(''),
      password: ref(''),
      password2: ref(''),
      email: ref(''),
      isPwd: ref(true),
      isPwd2: ref(true),
    };
  },
  beforeCreate() {
    api.get('/auth/csrf_cookie', { withCredentials: true });
  },
  methods: {
    submitLogin() {
      const formData = {
        username: this.username,
        password: this.password,
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
            this.$q.notify({
              type: 'positive',
              message: 'This is a "positive" type notification.',
            });
          } else {
            console.log(error);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },

    submitRegister(data) {
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
            this.$q.notify({
              type: 'positive',
              message: 'Successfully registered',
            });
          } else {
            console.log('error');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
};
</script>

<style scoped>
.pw_icon:hover {
  color: whitesmoke;
}
</style>
