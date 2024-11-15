<template>
  <q-page
    class="bg row justify-center items-center"
    :class="theme"
  >
    <ParticlesIndex />
    <div class="column fade-in-text q-ma-xs">
      <div v-if="!registerSuccessful">
        <q-card
          style="max-width: 400px"
          :style="'width:' + cardWidth + 'px;'"
          dark
          class="bg-transparent no-shadow"
        >
          <div
            class="text3d-primary text-weight-bolder text-h3 text-center q-mt-lg non-selectable"
          >
            Register
          </div>
          <q-card-section
            align="center"
            class="q-mr-sm q-ml-sm q-pb-none"
          >
            <q-form @submit="submitRegister">
              <q-input
                v-model="registerDataRequired.username"
                label="Username"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                :rules="[
                  (val) => (val && val.length > 3) || 'At least 4 characters',
                  (val) =>
                    (val && val.length < 17) || 'Not more than 16 characters',
                  (val) =>
                    /^[a-z0-9]+$/i.test(val) ||
                    'Only alphanumeric characters allowed.',
                  (val) => /^\S+$/.test(val) || 'No spaces allowed.',
                ]"
                class="q-mt-lg"
                ref="usernameInput"
                color="layout-text"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidUsername"
              >
                <template v-slot:prepend>
                  <q-icon
                    color="layout-text"
                    name="person"
                  />
                </template>

                <template v-slot:append>
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.usernameError"
                    class="bg-white text-red q-ml-md"
                    @click.prevent.stop
                  >
                    <q-tooltip
                      :class="
                        darkmode ? 'bg-dark text-white' : 'bg-white text-dark'
                      "
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">
                        <a class="text-red">4-16</a>
                        Characters.
                        <a class="text-red">Latin Alphabet & Numbers.</a>
                      </div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.usernameError"
                    color="green"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>

              <q-input
                v-model="registerDataRequired.email"
                type="email"
                label="Email"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                :rules="[
                  (val) =>
                    /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                      val
                    ) || 'Not a valid E-Mail',
                ]"
                class="q-mt-sm"
                ref="emailInput"
                color="layout-text"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidEmail"
              >
                <template v-slot:prepend>
                  <q-icon
                    color="layout-text"
                    name="email"
                  />
                </template>
                <template v-slot:append>
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.emailError"
                    class="bg-white text-red q-ml-md"
                  >
                    <q-tooltip
                      :class="
                        darkmode ? 'bg-dark text-white' : 'bg-white text-dark'
                      "
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">
                        A
                        <a class="text-red">valid</a>
                        email address.
                      </div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.emailError"
                    color="green"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>
              <q-input
                v-model="registerDataRequired.password"
                label="Password"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                color="layout-text"
                :rules="[
                  (val) => (val && val.length > 7) || 'At least 8 characters',
                  (val) =>
                    (val && val.length < 101) || 'Not more than 100 characters',
                ]"
                :type="isPwd ? 'password' : 'text'"
                class="q-mt-sm"
                ref="passwordInput"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidPassword"
              >
                <template v-slot:prepend>
                  <q-icon
                    color="layout-text"
                    name="lock"
                  />
                </template>
                <template v-slot:append>
                  <q-icon
                    color="layout-text"
                    class="pw_icon"
                    :name="isPwd ? 'visibility' : 'visibility_off'"
                    @click="isPwd = !isPwd"
                  />
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.passwordError"
                    class="bg-white text-red q-ml-md"
                  >
                    <q-tooltip
                      :class="
                        darkmode ? 'bg-dark text-white' : 'bg-white text-dark'
                      "
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">
                        Password with
                        <a class="text-red">8-100</a>
                        characters.
                      </div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.passwordError"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>

              <q-input
                v-model="registerDataRequired.passwordConfirm"
                label="Confirm Password"
                outlined
                input-style="font-size: 18px"
                input-class="text-body1 text-layout-text"
                bg-color="layout-bg"
                label-color="layout-text"
                :rules="[
                  (val) =>
                    val == registerDataRequired.password ||
                    'Passwords do not match',
                ]"
                :type="isPwd2 ? 'password' : 'text'"
                class="q-mt-sm"
                ref="passwordConfirmInput"
                color="layout-text"
                no-error-icon
                dark
                lazy-rules="ondemand"
                @blur="isValidPasswordConfirm"
              >
                <template v-slot:prepend>
                  <q-icon
                    color="layout-text"
                    name="lock"
                  />
                </template>
                <template v-slot:append>
                  <q-icon
                    color="layout-text"
                    class="pw_icon"
                    :name="isPwd2 ? 'visibility' : 'visibility_off'"
                    @click="isPwd2 = !isPwd2"
                  />
                  <q-btn
                    icon="warning"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.passwordConfirmError"
                    class="bg-white text-red q-ml-md"
                  >
                    <q-tooltip
                      :class="
                        darkmode ? 'bg-dark text-white' : 'bg-white text-dark'
                      "
                      anchor="center end"
                      self="center left"
                      style="width: 150px"
                    >
                      <div class="text-body2 text-center">
                        Passwords must match.
                      </div>
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    icon="done"
                    size="sm"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.passwordConfirmError"
                    color="green"
                    class="no-pointer-events bg-white text-green q-ml-md"
                  />
                </template>
              </q-input>
              <q-item class="items-center q-pa-none q-mt-md">
                <q-btn
                  icon="refresh"
                  class="bg-green text-layout-text q-mr-xs"
                  outline
                  style="height: 55px"
                  @click="getCaptcha"
                >
                  <q-tooltip
                    :class="
                      darkmode ? 'bg-dark text-white' : 'bg-white text-dark'
                    "
                    class="text-body2"
                  >
                    Refresh Captcha
                  </q-tooltip>
                </q-btn>
                <q-img
                  :src="captchaData.img"
                  spinner-color="red"
                  width="150px"
                  height="55px"
                >
                  <div
                    class="fit"
                    v-if="captchaData.loading"
                  >
                    <q-spinner
                      color="blue"
                      size="2em"
                    />
                  </div>
                  <div
                    class="text-red text-body2"
                    v-if="captchaData.error"
                  >
                    Failed to load Captcha.
                  </div>
                </q-img>
                <q-input
                  v-model="captchaData.value"
                  label="Captcha"
                  outlined
                  input-style="font-size: 18px"
                  input-class="text-body1 text-layout-text"
                  bg-color="layout-bg"
                  label-color="layout-text"
                  ref="captchaInput"
                  color="layout-text"
                  no-error-icon
                  dark
                  class="q-ml-md"
                  mask="AAAAA"
                  style="max-width: 130px"
                />
              </q-item>
              <q-btn
                size="xl"
                class="full-width q-mt-lg layout-btn bg-green text-white"
                label="Register"
                rounded
                :loading="loading"
                unelevated
                type="submit"
              />
              <div
                style="height: 40px"
                class="q-mt-md"
              >
                <div
                  class="text-center text-red text-h6 shake"
                  ref="errorText"
                  v-on:animationend="
                    ($event: any) => {
                        $event.target.classList.remove('shake')
                    }
                  "
                  v-if="serverError"
                >
                  {{ errorMessage }}
                </div>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </div>

      <div
        v-if="registerSuccessful"
        class="absolute-center fade-in-text"
      >
        <q-card
          bordered
          dark
          style="max-width: 400px"
          :style="'width:' + cardWidth + 'px;'"
          class="no-shadow bg-layout-bg text-h6 text-center text-layout-text fade-in-text"
        >
          <div class="q-ma-md">
            Successfully registered!
            <br />
            Your Account still has to be activated by an Administrator.
          </div>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts">
import { ref } from 'vue';
import { useQuasar, QInput } from 'quasar';
import { apiPost, apiGet } from 'src/components/apiWrapper';
import { useLocalStore } from 'stores/localStore';
import ParticlesIndex from 'components/Style/ParticlesIndex.vue';
import { getThemeBackground } from 'components/Style/themes';

export default {
  name: 'RegisterView',
  components: { ParticlesIndex },

  setup() {
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };
    const registerDataRequired = ref({
      username: '',
      password: '',
      passwordConfirm: '',
      email: '',
    });

    const captchaData = ref({
      img: '',
      id: '',
      value: '',
      loading: true,
      error: false,
    });

    const localStore = useLocalStore();

    return {
      localStore,
      axiosConfig,
      q,
      isPwd: ref(true),
      isPwd2: ref(true),
      registerSuccessful: ref(false),
      loading: ref(false),
      serverError: ref(false),
      errorMessage: ref(''),

      registerDataRequired,

      errorMap: ref({
        usernameError: ref(false),
        emailError: ref(false),
        passwordError: ref(false),
        passwordConfirmError: ref(false),
      }),

      checkErrorRequired: ref(true),
      captchaData,
    };
  },

  created() {
    if (this.localStore.isAuthenticated) {
      this.$router.push('/dashboard/home');
    }
    this.getCaptcha();
  },

  computed: {
    cardWidth() {
      return this.q.screen.width - 25;
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
    async isValidUsername() {
      this.$nextTick(async () => {
        var val = await (
          this.$refs.usernameInput as InstanceType<typeof QInput>
        ).validate();
        this.errorMap.usernameError = val;
        this.testRequiredInformation();
      });
    },

    async isValidEmail() {
      this.$nextTick(async () => {
        var val = await (
          this.$refs.emailInput as InstanceType<typeof QInput>
        ).validate();
        this.errorMap.emailError = val;
        this.testRequiredInformation();
      });
    },
    async isValidPassword() {
      this.$nextTick(async () => {
        var val = await (
          this.$refs.passwordInput as InstanceType<typeof QInput>
        ).validate();
        this.errorMap.passwordError = val;
        this.testRequiredInformation();
      });
    },
    async isValidPasswordConfirm() {
      this.$nextTick(async () => {
        var val = await (
          this.$refs.passwordConfirmInput as InstanceType<typeof QInput>
        ).validate();
        this.errorMap.passwordConfirmError = val;
        this.testRequiredInformation();
      });
    },

    testRequiredInformation() {
      var final =
        this.errorMap.usernameError &&
        this.errorMap.emailError &&
        this.errorMap.passwordError &&
        this.errorMap.passwordConfirmError;
      this.checkErrorRequired = !final;
    },

    getCaptcha() {
      this.captchaData.value = '';
      this.captchaData.loading = true;
      apiGet('/auth/captcha', this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          Object.assign(this.captchaData, apiData.data);
          this.captchaData.loading = false;
        } else {
          this.loading = false;
          this.captchaData.error = true;
          this.captchaData.loading = false;
          this.errorMessage = apiData.errorMessage;
        }
      });
    },

    submitRegister() {
      if (this.checkErrorRequired) {
        this.$nextTick(() => {
          (this.$refs.errorText as HTMLElement).classList.add('shake');
        });
      } else {
        this.loading = true;
        const registerData = {
          ...this.registerDataRequired,
          captchaId: this.captchaData.id,
          captchaValue: this.captchaData.value,
        };
        apiPost('/auth/register', registerData, this.axiosConfig).then(
          (apiData) => {
            if (apiData.error == false) {
              this.registerSuccessful = true;
              this.loading = false;
            } else {
              this.loading = false;
              this.serverError = true;
              this.errorMessage = apiData.errorMessage;
              this.$nextTick(() => {
                (this.$refs.errorText as HTMLElement).classList.add('shake');
              });
              this.getCaptcha();
            }
          }
        );
      }
    },
  },
};
</script>

<style lang="scss">
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
