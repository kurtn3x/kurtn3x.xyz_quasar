<template>
  <div class="col-12 col-md-6 flex content-center">
    <q-card
      class="justify-center"
      v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '50%' }"
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
              Register
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
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
              (val) => (val && val.length > 3) || 'At least 4 characters',
              (val) =>
                (val && val.length < 16) || 'Not more than 16 characters',
            ]"
          />
          <q-input
            filled
            v-model="email"
            label="Your Email *"
            hint="Email"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
              (val) => (val && val.length > 3) || 'At least 4 characters',
              (val) =>
                /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                  val
                ) || 'Not a valid E-Mail',
            ]"
          />
          <q-input
            filled
            v-model="password"
            label="Your password *"
            hint="Password"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
              (val) => (val && val.length > 3) || 'At least 6 characters',
              (val) => /(?=.*[a-z])/.test(val) || 'At least 1 lowercase letter',
              (val) => /(?=.*[A-Z])/.test(val) || 'At least 1 uppercase letter',
              (val) => /(?=.*[0-9])/.test(val) || 'At least 1 number',
            ]"
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
          <q-input
            filled
            v-model="password2"
            label="Confirm password *"
            hint="Confirm Password"
            lazy-rules
            :rules="[(val) => val == password || 'Passwords do not match']"
            :type="isPwd2 ? 'password' : 'text'"
          >
            <template v-slot:append>
              <q-icon
                :name="isPwd2 ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd2 = !isPwd2"
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
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue';

let $q;

export default {
  name: 'RegisterView',
  setup() {
    return {
      username: ref(''),
      password: ref(''),
      password2: ref(''),
      email: ref(''),
      isPwd: ref(true),
      isPwd2: ref(true),
    };
  },
};
</script>

<style scoped></style>
