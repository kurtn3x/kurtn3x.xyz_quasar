<template>
  <q-page class="q-pa-md">
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      header-nav
      animated
      flat
      vertical
    >
      <q-step
        :name="1"
        done-color="green"
        active-icon="manage_accounts"
        icon="manage_accounts"
        active-color="primary"
        title="Required Information"
        :done="step > 1"
        :error="checkErrorRequired"
        error-color="red"
      >
        <q-card
          class="no-shadow row justify-center"
          style="width: 100%; min-width: 275px"
          flat
          bordered
        >
          <q-card-section style="width: 69%; min-width: 275px">
            <div class="text-center text-h4 text-primary">
              Required Information
            </div>
            <q-input
              square
              filled
              v-model="registerDataRequired.username"
              label="Username"
              lazy-rules
              input-class="text-body1"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) => (val && val.length > 3) || 'At least 4 characters',
                (val) =>
                  (val && val.length < 17) || 'Not more than 16 characters',
                (val) =>
                  /^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/.test(
                    val
                  ) || 'Only alphanumeric characters allowed.',
              ]"
              class="q-mt-lg"
              ref="usernameInput"
              v-on:blur="isValidUsername"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>

              <template v-slot:after>
                <q-btn
                  icon="info"
                  flat
                  round
                  :tabindex="-1"
                  v-if="!errorMap.usernameError"
                  color="red"
                >
                  <q-menu anchor="bottom middle" self="top middle">
                    <div
                      class="q-ma-sm text-body2 text-center"
                      style="max-width: 250px"
                    >
                      <a class="text-red">Alphanumeric </a> username between
                      <a class="text-red">4-16 </a>characters
                    </div>
                  </q-menu>
                </q-btn>
                <q-btn
                  icon="done"
                  flat
                  round
                  :tabindex="-1"
                  v-if="errorMap.usernameError"
                  color="green"
                />
              </template>
            </q-input>

            <q-input
              square
              filled
              v-model="registerDataRequired.email"
              type="email"
              label="Email"
              input-class="text-body1"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) =>
                  /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                    val
                  ) || 'Not a valid E-Mail',
              ]"
              class="q-mt-md"
              ref="emailInput"
              v-on:blur="isValidEmail"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
              <template v-slot:after>
                <q-btn
                  icon="info"
                  flat
                  round
                  :tabindex="-1"
                  v-if="!errorMap.emailError"
                  color="red"
                >
                  <q-menu anchor="bottom middle" self="top middle">
                    <div
                      class="q-ma-sm text-body2 text-center"
                      style="max-width: 250px"
                    >
                      A valid email address.
                    </div>
                  </q-menu>
                </q-btn>
                <q-btn
                  icon="done"
                  flat
                  round
                  :tabindex="-1"
                  v-if="errorMap.emailError"
                  color="green"
                />
              </template>
            </q-input>
            <q-input
              square
              filled
              v-model="registerDataRequired.password"
              label="Password"
              input-class="text-body1"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) => (val && val.length > 7) || 'At least 8 characters',
                (val) =>
                  (val && val.length < 100) || 'Not more than 100 characters',
                (val) =>
                  /(?=.*[a-z])/.test(val) || 'At least 1 lowercase letter',
                (val) =>
                  /(?=.*[A-Z])/.test(val) || 'At least 1 uppercase letter',
              ]"
              :type="isPwd ? 'password' : 'text'"
              class="q-mt-md"
              ref="passwordInput"
              v-on:blur="isValidPassword"
            >
              <template v-slot:prepend>
                <q-icon
                  class="pw_icon"
                  :name="isPwd ? 'lock' : 'lock_open'"
                  @click="isPwd = !isPwd"
                />
              </template>
              <template v-slot:after>
                <q-btn
                  icon="info"
                  flat
                  round
                  :tabindex="-1"
                  v-if="!errorMap.passwordError"
                  color="red"
                >
                  <q-menu anchor="bottom middle" self="top middle">
                    <div
                      class="q-ma-sm text-body2 text-center"
                      style="max-width: 250px"
                    >
                      A Password with
                      <a class="text-red">8-100 </a> characters containing at
                      least
                      <a class="text-red"
                        >one lowercase and one uppercase letter</a
                      >.
                    </div>
                  </q-menu>
                </q-btn>
                <q-btn
                  icon="done"
                  flat
                  round
                  :tabindex="-1"
                  v-if="errorMap.passwordError"
                  color="green"
                />
              </template>
            </q-input>

            <q-input
              square
              filled
              v-model="registerDataRequired.password2"
              label="Confirm Password"
              input-class="text-body1"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) =>
                  val == registerDataRequired.password ||
                  'Passwords do not match',
              ]"
              :type="isPwd2 ? 'password' : 'text'"
              class="q-mt-md"
              ref="password2Input"
              v-on:blur="isValidPassword2"
            >
              <template v-slot:prepend>
                <q-icon
                  class="pw_icon"
                  :name="isPwd2 ? 'lock' : 'lock_open'"
                  @click="isPwd2 = !isPwd2"
                />
              </template>
              <template v-slot:after>
                <q-btn
                  icon="info"
                  flat
                  round
                  :tabindex="-1"
                  v-if="!errorMap.password2Error"
                  color="red"
                >
                  <q-menu anchor="bottom middle" self="top middle">
                    <div
                      class="q-ma-sm text-body2 text-center"
                      style="max-width: 250px"
                    >
                      Passwords must match.
                    </div>
                  </q-menu>
                </q-btn>
                <q-btn
                  icon="done"
                  flat
                  round
                  :tabindex="-1"
                  v-if="errorMap.password2Error"
                  color="green"
                />
              </template>
            </q-input>
          </q-card-section>
        </q-card>
      </q-step>

      <q-step
        :name="2"
        title="Optional Information"
        caption="Optional"
        done-color="green"
        active-icon="person"
        active-color="primary"
        icon="person"
        :done="step > 2"
        :error="checkErrorOptional"
        error-color="red"
      >
        <q-card
          class="no-shadow row justify-center"
          style="width: 100%; min-width: 275px"
          flat
          bordered
        >
          <q-card-section style="min-width: 275px">
            <div class="text-center text-h4 text-primary">
              Optional Profile Information
            </div>
            <q-input
              dense
              square
              filled
              v-model="registerDataOptional.name"
              type="name"
              label="Name"
              lazy-rules
              :rules="[
                (val) => val.length < 50 || 'Max Length = 50 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-xl"
              ref="nameInput"
            />
            <q-input
              dense
              square
              filled
              v-model="registerDataOptional.location"
              label="Location"
              lazy-rules
              :rules="[
                (val) => val.length < 50 || 'Max Length = 50 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-sm"
              ref="locationInput"
            />

            <q-input
              dense
              square
              filled
              v-model="registerDataOptional.status"
              label="Status"
              lazy-rules
              :rules="[
                (val) => val.length < 15 || 'Max Length = 15 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-sm"
              ref="statusInput"
            />

            <q-input
              type="textarea"
              dense
              square
              filled
              v-model="registerDataOptional.description"
              label="Description"
              lazy-rules
              :rules="[
                (val) => val.length < 255 || 'Max Length = 255 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-sm"
              ref="descriptionInput"
            />

            <q-file
              v-model="registerDataOptional.avatar"
              outlined
              label="Profile Picture"
              max-file-size="2048000"
              accept=".jpg, .png, .gif, .jpeg"
              @rejected="onRejected"
              style="max-width: 400px"
              counter
              class="q-mt-sm"
              @update:model-value="onAvatarSelect"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:before>
                <q-avatar>
                  <img :src="avatarPreview" />
                </q-avatar>
              </template>
            </q-file>

            <q-file
              v-model="registerDataOptional.background"
              outlined
              label="Background Picture"
              max-file-size="2048000"
              accept=".jpg, .png, .gif, .jpeg"
              @rejected="onRejected"
              style="max-width: 400px"
              counter
              class="q-mt-md"
              @update:model-value="onBackgroundSelect"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
              <template v-slot:before>
                <q-avatar>
                  <img :src="backgroundPreview" />
                </q-avatar>
              </template>
            </q-file>

            <div class="text-caption text-center q-mt-md">
              Allowed Images: .jpg, .png, .gif, .jpeg, less than 2mb
              <br />
              Recommended Profile Picture Aspect Ratio: Square <br />
              Recommended Background Picture: Any length, 200px height
            </div>
          </q-card-section>
        </q-card>
      </q-step>

      <q-step
        :name="3"
        title="Verify that you are not a bot"
        done-color="green"
        active-icon="smart_toy"
        active-color="primary"
        icon="smart_toy"
        :error="captchaVerified == false"
        :done="captchaVerified"
      >
        <q-card
          class="no-shadow"
          style="width: 100%; min-width: 275px"
          flat
          bordered
        >
          <div v-if="!captchaVerified">
            <div class="row justify-center q-mt-md">
              <section class="captcha-box">
                <VueClientRecaptcha
                  :value="captchaRegister"
                  @isValid="checkCaptchaRegister"
                  height="50"
                  width="200"
                >
                  <template #icon>
                    <div style="color: blue; font-size: large">Refresh</div>
                  </template>
                </VueClientRecaptcha>
              </section>
            </div>
            <div class="row justify-center q-mt-md">
              <q-input
                class="row justify-center"
                dense
                square
                filled
                v-model="captchaRegister"
                label="Captcha"
                :rules="[(val) => val.length == 5 || '5 characters.']"
                style="width: 200px"
              >
              </q-input>
            </div>
            <div class="row justify-center">
              <q-btn
                label="Verify"
                color="green"
                class="text-white"
                size="xl"
                @click="checkCaptcha"
              />
            </div>

            <div
              v-if="captchaError"
              class="text-center text-red text-body1 q-mt-md"
            >
              Wrong Captcha
            </div>
          </div>

          <div
            v-if="captchaVerified"
            class="text-center text-h4 text-green q-ma-md"
          >
            Verified
          </div>
        </q-card>
      </q-step>
      <q-step
        :name="4"
        title="Done!"
        done-color="green"
        active-icon="done"
        active-color="green"
        icon="done"
        v-if="captchaVerified"
      >
      </q-step>
    </q-stepper>
    <div v-if="captchaVerified">
      <div class="row justify-center">
        <q-btn size="xl" label="Register" class="text-white" color="green" />
      </div>
      <div
        v-if="checkErrorRequired || checkErrorOptional"
        class="q-mt-lg text-center text-red text-h6"
      >
        You still have some errors though, please fix them first!
      </div>
    </div>
    <q-page-sticky position="bottom" :offset="[50, 18]">
      <q-btn
        style="width: 140px"
        fab
        class="q-mr-sm"
        label="Previous Step"
        v-if="step > 1"
        color="red"
        @click="$refs.stepper.previous()"
      />
      <q-btn
        v-if="step < 4"
        style="width: 140px"
        label="Next Step"
        fab
        color="green"
        @click="$refs.stepper.next()"
        class="q-ml-sm"
      />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import VueClientRecaptcha from 'vue-client-recaptcha';
import { mdiConsoleLine } from '@quasar/extras/mdi-v6';

export default {
  name: 'RegisterView',
  components: { VueClientRecaptcha },

  setup() {
    const q = useQuasar();
    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    var captchaVal = ref(false);

    const checkCaptchaRegister = (val) => {
      captchaVal.value = val;
    };

    return {
      step: ref(1),
      axios_config,
      q,
      isPwd: ref(true),
      isPwd2: ref(true),
      registerSuccessful: ref(false),

      registerDataRequired: ref({
        username: ref(''),
        password: ref(''),
        password2: ref(''),
        email: ref(''),
      }),

      registerDataOptional: ref({
        name: ref(''),
        location: ref(''),
        status: ref(''),
        description: ref(''),
        avatar: ref(null),
        background: ref(null),
      }),

      errorMap: ref({
        usernameError: ref(null),
        emailError: ref(null),
        passwordError: ref(null),
        password2Error: ref(null),
        nameError: ref(null),
        statusError: ref(null),
        locationError: ref(null),
        descriptionError: ref(null),
      }),

      avatarPreview: ref('https://media.kurtn3x.xyz/default.png'),
      backgroundPreview: ref('https://media.kurtn3x.xyz/background.png'),
      checkErrorRequired: ref(true),
      checkErrorOptional: ref(false),

      // captcha
      captchaRegister: ref(''),
      checkCaptchaRegister,
      captchaVal,
      captchaVerified: ref(false),
      captchaError: ref(false),
    };
  },

  watch: {
    step() {
      if (this.step > 1) {
        this.testRequiredInformation();
      }
    },

    registerDataOptional: {
      async handler(val) {
        await this.testOptionalInformation();
      },
      deep: true,
    },
  },

  methods: {
    async isValidUsername() {
      this.$nextTick(async () => {
        var val = await this.$refs.usernameInput.validate();
        this.errorMap.usernameError = val;
      });
    },

    async isValidEmail() {
      this.$nextTick(async () => {
        var val = await this.$refs.emailInput.validate();
        this.errorMap.emailError = val;
      });
    },
    async isValidPassword() {
      this.$nextTick(async () => {
        var val = await this.$refs.passwordInput.validate();
        this.errorMap.passwordError = val;
      });
    },
    async isValidPassword2() {
      this.$nextTick(async () => {
        var val = await this.$refs.password2Input.validate();
        this.errorMap.password2Error = val;
      });
    },

    async isValidName() {
      var val = await this.$refs.nameInput.validate();
      this.errorMap.nameError = val;
      return val;
    },
    async isValidLocation() {
      var val = await this.$refs.locationInput.validate();
      this.errorMap.locationError = val;
      return val;
    },
    async isValidStatus() {
      var val = await this.$refs.statusInput.validate();
      this.errorMap.statusError = val;
      return val;
    },
    async isValidDescription() {
      var val = await this.$refs.descriptionInput.validate();
      this.errorMap.descriptionError = val;
      return val;
    },

    testRequiredInformation() {
      var final =
        this.errorMap.usernameError &&
        this.errorMap.emailError &&
        this.errorMap.passwordError &&
        this.errorMap.password2Error;
      this.checkErrorRequired = !final;
    },

    async testOptionalInformation() {
      var bool1 = await this.isValidLocation();
      var bool2 = await this.isValidName();
      var bool3 = await this.isValidStatus();
      var bool4 = await this.isValidDescription();
      var final = bool1 && bool2 && bool3 && bool4;
      this.checkErrorOptional = !final;
    },

    onAvatarSelect() {
      this.avatarPreview = URL.createObjectURL(
        this.registerDataOptional.avatar
      );
    },
    onBackgroundSelect() {
      this.backgroundPreview = URL.createObjectURL(
        this.registerDataOptional.background
      );
    },

    checkCaptcha() {
      this.captchaVerified = this.captchaVal;
      if (this.captchaVerified) {
        this.captchaError = false;
        this.step += 1;
      } else {
        this.captchaError = true;
      }
    },

    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    submitRegister() {
      this.loading = true;

      api
        .post('/auth/register', this.registerData, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
          } else {
            this.loading = false;
            var msg = response.data.error;
            this.notify('negative', msg);
          }
        })
        .catch((error) => {
          this.loading = false;
          var msg = 'Error (Server Error): ' + error;
          this.notify('negative', msg);
        });
    },

    onRejected() {
      this.notify('negative', 'Invalid Image');
    },
  },
};
</script>

<style>
@import url('/node_modules/vue-client-recaptcha/dist/style.css');
</style>
