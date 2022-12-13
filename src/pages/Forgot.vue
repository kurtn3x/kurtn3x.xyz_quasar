<template>
  <q-page class="bg">
    <div
      style="font-family: 'SourceCodePro', Helvetica, Arial"
      class="row justify-center text-h4 text-green q-mt-xl fade-in-text"
      v-if="requestSuccessful"
    >
      Request successful! Check your E-Mail.
    </div>
    <div
      style="font-family: 'SourceCodePro', Helvetica, Arial"
      class="row justify-center fade-in-text"
      v-if="!requestSuccessful"
    >
      <q-card flat style="background: transparent; min-width: 400px">
        <p class="text-weight-bolder text-center text-primary text-h6 q-mt-xl">
          Request your Account Data
        </p>
        <q-card-section>
          <q-form ref="forgotform" @submit.prevent="submitForget">
            <q-input
              dense
              square
              filled
              v-model="email"
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
              v-model="requestPassword"
            />
            <p></p>
            <q-toggle
              checked-icon="check"
              color="green"
              unchecked-icon="clear"
              label="Request username"
              v-model="requestUsername"
            />
            <q-card-actions class="q-mt-md">
              <q-btn
                rounded
                size="md"
                color="green"
                class="full-width"
                label="Request"
                @click="submitForget"
                :loading="loading"
              />
              <div v-if="error" class="text-red text-h6 text-center q-mt-lg">
                {{ errorMessage }}
              </div>
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { useSettingsStore } from 'stores/settings';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'ForgotView',

  setup() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
    const q = useQuasar();

    return {
      loading: ref(false),
      show: ref(false),
      userStore,
      settingsStore,
      q,
      requestPassword: ref(false),
      requestUsername: ref(false),
      email: ref(''),

      error: ref(false),
      errorMessage: ref('Error'),
      requestSuccessful: ref(false),
    };
  },

  methods: {
    submitForget() {
      this.loading = true;
      const formData = {
        email: this.email,
      };

      if (this.requestPassword) {
        api
          .post('auth/password_reset', formData, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.loading = false;
              this.error = false;
              this.requestSuccessful = true;
            } else {
              this.loading = false;
              var msg = 'Error: ' + response.data.error;
              this.errorMessage = msg;
              this.error = true;
              this.requestSuccessful = false;
            }
          })
          .catch((error) => {
            this.loading = false;
            this.errorMessage = error;
            this.error = true;
            this.requestSuccessful = false;
          });
      }

      if (this.requestUsername) {
        api
          .post('auth/username_request', formData, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.loading = false;
              this.error = false;
              this.requestSuccessful = true;
            } else {
              this.loading = false;
              var msg = 'Error: ' + response.data.error;
              this.errorMessage = msg;
              this.error = true;
              this.requestSuccessful = false;
            }
          })
          .catch((error) => {
            this.loading = false;
            this.errorMessage = error;
            this.error = true;
            this.requestSuccessful = false;
          });
      }
    },
  },
});
</script>

<style scoped lang="scss">
@font-face {
  font-family: 'SourceCodePro';
  src: local('SourceCodePro'),
    url(../css//SourceCodePro-VariableFont_wght.ttf) format('truetype');
}

.fade-in-text {
  animation: fadeIn 3s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.bg {
  position: relative;
  overflow: hidden;
  width: inherit;
  height: 500%;
  background: linear-gradient(#000729 1%, rgb(255, 188, 188, 0.6) 200%);
}
</style>
