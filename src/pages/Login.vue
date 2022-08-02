<template>
  <div class="row">
    <div class="col-12 col-md-6 flex content-center">
      <q-card
        class="fixed-center"
        v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '30%' }"
      >
        <q-card-section>
          <q-avatar size="103px" class="absolute-center shadow-10">
            <img src="~assets/avatar.svg" alt="avatar" />
          </q-avatar>
        </q-card-section>
        <q-card-section>
          <div class="q-pt-lg">
            <div class="col text-h6 ellipsis flex justify-center">
              <h2 class="text-h2 text-uppercase q-my-none text-weight-regular">
                Login
              </h2>
            </div>
          </div>
        </q-card-section>
        <q-card-section>
          <q-form class="q-gutter-md" @submit.prevent="submitForm">
            <q-input
              filled
              v-model="username"
              label="Your username *"
              hint="Username"
            />
            <q-input
              filled
              v-model="password"
              label="Your password *"
              hint="Password"
              lazy-rules
              :type="isPwd ? 'password' : 'text'"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <div>
              <q-btn
                class="full-width"
                color="primary"
                text-color="dark"
                label="Login"
                type="submit"
                rounded
              ></q-btn>
              <div class="text-center q-mt-sm q-gutter-lg">
                <router-link class="text-amber" to="/login"
                  >Sign Up</router-link
                >
                <router-link class="text-amber" to="/login"
                  >Forgot your</router-link
                >
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'LoginView',
  setup() {
    return {
      username: ref(''),
      password: ref(''),
      isPwd: ref(true),
    };
  },
};
</script>

<style scoped>
.wave {
  position: fixed;
  height: 100%;
  left: 0;
  bottom: 0;
  z-index: -1;
}
</style>
