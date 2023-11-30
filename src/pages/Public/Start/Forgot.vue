<template>
  <q-page class="bg" :class="theme">
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
      <div class="column fade-in-text" :class="mobile ? 'q-pa-xs' : 'q-pa-lg'">
        <div class="row">
          <q-card
            style="max-width: 400px"
            :style="'width:' + cardWidth + 'px;'"
            dark
            class="no-shadow bg-transparent"
          >
            <div
              class="text3d-primary text-weight-bolder text-h5 text-center q-mt-lg non-selectable"
            >
              Request your Account Data
            </div>
            <q-card-section align="center" class="q-mr-sm q-ml-sm">
              <q-form @submit="submitForget">
                <q-input
                  dark
                  outlined
                  v-model="email"
                  type="email"
                  label="Disabled"
                  lazy-rules
                  no-error-icon
                  input-style="font-size: 18px"
                  input-class="text-body1 text-layout-text"
                  class="q-mt-lg text-white"
                  color="layout-text"
                  label-color="layout-text"
                  bg-color="layout-bg"
                  disable
                >
                  <template v-slot:prepend>
                    <q-icon name="email" />
                  </template>
                </q-input>

                <q-btn
                  rounded
                  size="lg"
                  class="full-width q-mt-lg layout-btn bg-green text-white"
                  label="Request"
                  :loading="loading"
                  unelevated
                  type="submit"
                />
              </q-form>
            </q-card-section>
            <div style="height: 20px">
              <div
                v-if="error"
                ref="errorText"
                class="text-red text-body1 text-center shake q-ml-sm q-mr-sm"
                v-on:animationend="
                ($event) => ($event.target as any).classList.remove('shake')
              "
              >
                {{ errorMessage }}
              </div>
            </div>
          </q-card>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { api } from 'boot/axios';
import ParticlesIndex from 'components/ParticlesIndex.vue';

export default defineComponent({
  name: 'ForgotView',
  components: { ParticlesIndex },

  setup() {
    const localStore = useLocalStore();
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

    cardWidth() {
      return this.q.screen.width - 25;
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
</style>
