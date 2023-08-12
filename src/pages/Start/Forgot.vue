<template>
  <q-page class="bg" :class="theme">
    <q-popup-proxy context-menu :breakpoint="0">
      <RightClickLayoutMenu />
    </q-popup-proxy>
    <ParticlesIndex />

    <div
      class="row justify-center text-h4 text-green absolute-center fade-in-text"
      v-if="requestSuccessful"
    >
      Request successful! Check your E-Mail.
    </div>
    <div
      class="row justify-center fade-in-text absolute-center"
      v-if="!requestSuccessful"
    >
      <q-card flat style="background: transparent; min-width: 400px">
        <p class="text3d-primary text-center text-h5">
          Request your Account Data
        </p>
        <q-card-section>
          <q-form
            ref="forgotform"
            @submit.prevent="submitForget"
            class="text-white"
          >
            <q-input
              dark
              outlined
              :color="darkmode ? 'black' : 'white'"
              v-model="email"
              type="email"
              input-class="text-body1 text-white"
              label="Your Email"
              lazy-rules
              no-error-icon
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
            <!-- <q-toggle
              checked-icon="check"
              color="green"
              unchecked-icon="clear"
              label="Request username"
              v-model="requestUsername"
            /> -->
            <q-card-actions class="q-mt-md">
              <q-btn
                size="lg"
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
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { api } from 'boot/axios';
import ParticlesIndex from 'components/ParticlesIndex.vue';
import RightClickLayoutMenu from 'src/components/RightClickLayoutMenu.vue';

export default defineComponent({
  name: 'ForgotView',
  components: { ParticlesIndex, RightClickLayoutMenu },

  setup() {
    const localStore = uselocalStore();
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axiosConfig,
      loading: ref(false),
      show: ref(false),
      localStore,
      q,
      requestPassword: ref(false),
      requestUsername: ref(false),
      email: ref(''),

      error: ref(false),
      errorMessage: ref('Error'),
      requestSuccessful: ref(false),
    };
  },

  computed: {
    mobile() {
      if (this.q.screen.width < 1024) {
        return true;
      } else {
        return false;
      }
    },

    theme() {
      if (this.localStore.theme == 'default') {
        return 'bg-default';
      } else if (this.localStore.theme == 'cool-orange') {
        return 'bg-cool-orange';
      } else if (this.localStore.theme == 'nice-green') {
        return 'bg-nice-green';
      } else if (this.localStore.theme == 'olive-green') {
        return 'bg-olive-green';
      } else if (this.localStore.theme == 'epic-blue') {
        return 'bg-epic-blue';
      } else if (this.localStore.theme == 'orange') {
        return 'bg-orange';
      } else if (this.localStore.theme == 'light') {
        return 'bg-lightp';
      } else if (this.localStore.theme == 'dark') {
        return 'bg-darkp';
      } else {
        return 'bg-default';
      }
    },
  },

  methods: {
    submitForget() {
      this.loading = true;
      const formData = {
        email: this.email,
      };

      if (this.requestPassword) {
        api
          .post('auth/password_reset', formData, this.axiosConfig)
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
            this.errorMessage = error.response.data.error;
            this.error = true;
            this.requestSuccessful = false;
          });
      }

      // if (this.requestUsername) {
      //   api
      //     .post('auth/username_request', formData, this.axiosConfig)
      //     .then((response) => {
      //       if (response.status == 200) {
      //         this.loading = false;
      //         this.error = false;
      //         this.requestSuccessful = true;
      //       } else {
      //         this.loading = false;
      //         var msg = 'Error: ' + response.data.error;
      //         this.errorMessage = msg;
      //         this.error = true;
      //         this.requestSuccessful = false;
      //       }
      //     })
      //     .catch((error) => {
      //       this.loading = false;
      //       this.errorMessage = error;
      //       this.error = true;
      //       this.requestSuccessful = false;
      //     });
      // }
      this.loading = false;
    },
  },
});
</script>

<style scoped lang="scss">
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
}

.bg-default {
  background: linear-gradient(#3b4fb5 1%, rgb(255, 188, 188) 200%);
}

.bg-epic-blue {
  background: linear-gradient(
    0deg,
    rgba(5, 9, 100, 1) 35%,
    rgba(0, 143, 255, 1) 150%
  );
}

.bg-cool-orange {
  background: radial-gradient(
    circle,
    rgb(125, 16, 80) 15%,
    rgb(135, 7, 24) 54%,
    rgb(238, 78, 46) 100%
  );
}

.bg-nice-green {
  background: linear-gradient(
    90deg,
    rgba(10, 172, 71, 1) 0%,
    rgba(29, 185, 146, 1) 35%,
    rgba(21, 87, 150, 1) 100%
  );
}

.bg-olive-green {
  background: radial-gradient(
    circle,
    rgba(191, 188, 6, 1) 5%,
    rgba(29, 89, 2, 1) 100%
  );
}

.bg-darkp {
  background: linear-gradient(#1d1d1d 1%, rgb(255, 188, 188, 0.6) 200%);
}

.bg-lightp {
  background: linear-gradient(
    0deg,
    rgba(29, 29, 29, 1) 1%,
    rgba(114, 114, 114, 1) 52%,
    #f8f0e3 100%
  );
}
</style>
