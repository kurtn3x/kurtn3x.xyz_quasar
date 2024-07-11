<template>
  <q-page class="bg row justify-center items-center" :class="theme">
    <ParticlesIndex />

    <div class="column fade-in-text" :class="mobile ? 'q-pa-xs' : 'q-pa-lg'">
      <div class="row">
        <q-card
          style="max-width: 400px"
          :style="'width:' + cardWidth + 'px;'"
          dark
          class="no-shadow bg-transparent"
        >
          <div
            class="text3d-primary text-weight-bolder text-h3 text-center q-mt-lg non-selectable"
          >
            Login
          </div>
          <q-card-section align="center" class="q-mr-sm q-ml-sm">
            <q-form @submit="submitLogin">
              <q-input
                v-model="loginData.username"
                outlined
                label="Username"
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                class="q-mt-lg text-white"
                color="layout-text"
                label-color="layout-text"
                bg-color="layout-bg"
                no-error-icon
                dark
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="layout-text" />
                </template>
              </q-input>
              <q-input
                outlined
                input-style="font-size: 18px;"
                input-class="text-body1 text-layout-text"
                v-model="loginData.password"
                label="Password"
                :type="isPwd ? 'password' : 'text'"
                class="q-mt-lg text-layout-text"
                label-color="layout-text"
                bg-color="layout-bg"
                color="layout-text"
                no-error-icon
                dark
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="layout-text" />
                </template>
                <template v-slot:append>
                  <q-icon
                    color="layout-text"
                    class="pw_icon"
                    :name="isPwd ? 'visibility' : 'visibility_off'"
                    @click="isPwd = !isPwd"
                  />
                </template>
              </q-input>
              <q-btn
                rounded
                size="lg"
                class="full-width q-mt-lg layout-btn bg-green text-white"
                label="Sign In"
                :loading="loading"
                type="submit"
              />
            </q-form>
          </q-card-section>
          <div style="height: 20px">
            <div
              v-if="loginError"
              ref="errorText"
              class="text-red text-body1 text-center shake q-ml-sm q-mr-sm"
              v-on:animationend="
                ($event) => ($event.target as any).classList.remove('shake')
              "
            >
              {{ loginErrorMessage }}
            </div>
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import ParticlesIndex from 'components/ParticlesIndex.vue';
import { getThemeBackground } from 'components/themes';
import { apiGet, apiPost } from 'src/apiWrapper';

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
      localStore,
      q,
      error: ref(false),
      loading: ref(false),
      loginData: ref({
        username: '',
        password: '',
      }),
      loginError: ref(false),
      loginErrorMessage: ref(''),
      isPwd: ref(true),
    };
  },

  created() {
    if (this.localStore.isAuthenticated) {
      this.$router.push('/dashboard/home');
    }
  },

  computed: {
    cardWidth() {
      return this.q.screen.width - 25;
    },
    mobile() {
      if (this.q.screen.width < 1024) {
        return true;
      } else {
        return false;
      }
    },

    darkmode() {
      return this.localStore.darkmodeState;
    },

    theme() {
      var t = getThemeBackground(this.localStore.theme);
      return t;
    },
  },

  methods: {
    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
      });
    },

    submitLogin() {
      this.loading = true;
      apiPost('/auth/login', this.loginData, this.axiosConfig).then(
        (apiData) => {
          if (apiData.error == false) {
            this.localStore.loginUser(apiData.data);
            this.loginError = false;
            this.loading = false;
            this.$router.push('/');
            this.notify('positive', 'Logged in.');
            apiGet('/auth/csrf_cookie', { withCredentials: true }).then(
              (apiData) => {
                if (apiData.error == false) {
                  this.axiosConfig = {
                    withCredentials: true,
                    headers: {
                      'X-CSRFToken': this.q.cookies.get('csrftoken'),
                    },
                  };
                } else {
                  this.notify(
                    'negative',
                    'Failed fetching CSRF-Cookie. Reload the site.'
                  );
                }
              }
            );
          } else {
            this.loginError = true;
            this.loginErrorMessage = apiData.errorMessage;
            this.loading = false;
            this.localStore.setAuthState(false);
            this.$nextTick(() => {
              (this.$refs.errorText as HTMLElement).classList.add('shake');
              console.log(this.$refs.errorText);
            });
          }
        }
      );
    },
  },
});
</script>

<style scoped lang="scss">
.shake {
  animation: horizontal-shaking 0.4s 3;
}

@keyframes horizontal-shaking {
  0% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(5px);
  }
  50% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
  100% {
    transform: translateX(0);
  }
}
.fade-in-text {
  animation: fadeIn 2s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

.layout-btn {
  transition: all 0.15s ease-in-out;
  &:hover {
    transform: scale(1.05);
  }
}
</style>
