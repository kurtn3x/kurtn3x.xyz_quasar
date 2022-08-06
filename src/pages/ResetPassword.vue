<template>
  <div class="col-12 col-md-6 flex content-center">
    <q-card
      class="fixed-center"
      v-bind:style="$q.screen.lt.sm ? { width: '80%' } : { width: '50%' }"
    >
      <q-card-section>
        <h2
          class="text-h5 text-center text-uppercase q-my-none text-weight-regular"
        >
          Reset your password
        </h2>
      </q-card-section>
      <q-card-section>
        <q-form class="q-gutter-md" @submit.prevent="forgotReset">
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
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
              ,
              (val) => val == password || 'Passwords do not match',
            ]"
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
              label="Change password"
              type="submit"
              rounded
              :loading="loading"
            ></q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default {
  name: 'RestPasswordView',
  setup() {
    const q = useQuasar();

    return {
      q,
      loading: ref(false),
      password: ref(''),
      password2: ref(''),
      isPwd: ref(true),
      isPwd2: ref(true),
    };
  },
  methods: {
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
      });
    },
    forgotReset() {
      this.loading = true;
      var url = window.location;
      var token = new URLSearchParams(url.search).get('token');
      const formData = {
        password: this.password,
        token: token,
      };
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };

      api
        .post('auth/password_reset/confirm/', formData, config)
        .then((response) => {
          if (response.status == 200) {
            this.loading = false;
            this.notify(
              'positive',
              'Password has been reset, you can now log in.'
            );
            this.$router.push('/');
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
        });
    },
  },
};
</script>

<style scoped></style>
