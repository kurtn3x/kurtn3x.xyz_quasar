<template>
  <q-page class="q-pa-md bg">
    <div v-if="!registerSuccessful" class="fade-in-text">
      <q-stepper
        v-model="step"
        ref="stepper"
        color="primary"
        header-nav
        animated
        flat
        vertical
        style="
          background: transparent;
          font-family: 'SourceCodePro', Helvetica, Arial;
        "
        dark
      >
        <q-step
          :name="1"
          done-color="green"
          active-icon="manage_accounts"
          icon="manage_accounts"
          active-color="primary"
          title="Hi!"
          :done="step > 1"
        >
          <div class="q-ml-lg">
            <VueWriter
              class="text-h6"
              style="font-family: 'SourceCodePro', Helvetica, Arial"
              :array="[
                'Hi! To register you need to fill out the required information and solve the Captcha.',
              ]"
              :iterations="1"
              :typeSpeed="15"
            />
          </div>
        </q-step>
        <q-step
          :name="2"
          done-color="green"
          active-icon="manage_accounts"
          icon="manage_accounts"
          active-color="primary"
          title="Required Information"
          :done="step > 2"
          :error="checkErrorRequired"
          error-color="red"
          style="background: transparent"
        >
          <q-card
            class="no-shadow row justify-center"
            style="width: 100%; min-width: 275px; background: transparent"
            flat
            bordered
            dark
          >
            <q-card-section
              style="width: 69%; min-width: 275px; background: transparent"
            >
              <div class="text-center text-h4 text-primary">
                Required Information
              </div>
              <q-input
                dark
                filled
                v-model="registerDataRequired.username"
                label="Username"
                lazy-rules
                input-class="text-body1 "
                style="font-family: 'SourceCodePro', Helvetica, Arial"
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
                filled
                dark
                v-model="registerDataRequired.email"
                style="font-family: 'SourceCodePro', Helvetica, Arial"
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
                filled
                dark
                v-model="registerDataRequired.password"
                style="font-family: 'SourceCodePro', Helvetica, Arial"
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
                filled
                dark
                v-model="registerDataRequired.password2"
                style="font-family: 'SourceCodePro', Helvetica, Arial"
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
          :name="3"
          title="Optional Information"
          caption="Optional"
          done-color="green"
          active-icon="person"
          active-color="primary"
          icon="person"
          :done="true"
          :error="checkErrorOptional"
          error-color="red"
          style="background: transparent"
          color="white"
        >
          <q-card
            class="no-shadow row justify-center"
            style="width: 100%; min-width: 275px; background: transparent"
            flat
            bordered
            dark
          >
            <q-card-section style="min-width: 275px; background: transparent">
              <div class="text-center text-h4 text-primary">
                Optional Profile Setup
              </div>
              <q-input
                dark
                style="
                  font-family: 'SourceCodePro', Helvetica, Arial;
                  max-width: 600px;
                "
                dense
                filled
                v-model="registerDataOptional.name"
                type="name"
                label="Name"
                lazy-rules
                :rules="[
                  (val) => val.length < 50 || 'Max Length = 50 characters',
                ]"
                class="q-mt-xl"
                ref="nameInput"
              >
                <template v-slot:after>
                  <q-btn
                    icon="info"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.nameError"
                    color="red"
                  >
                    <q-menu anchor="bottom middle" self="top middle">
                      <div
                        class="q-ma-sm text-body2 text-center"
                        style="max-width: 250px"
                      >
                        Max Length = 50 characters.
                      </div>
                    </q-menu>
                  </q-btn>
                  <q-btn
                    icon="done"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.nameError"
                    color="green"
                  />
                </template>
              </q-input>
              <q-input
                dark
                style="
                  font-family: 'SourceCodePro', Helvetica, Arial;
                  max-width: 600px;
                "
                dense
                filled
                v-model="registerDataOptional.location"
                type="name"
                label="Location"
                lazy-rules
                :rules="[
                  (val) => val.length < 50 || 'Max Length = 50 characters',
                ]"
                class="q-mt-md"
                ref="locationInput"
              >
                <template v-slot:after>
                  <q-btn
                    icon="info"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.locationError"
                    color="red"
                  >
                    <q-menu anchor="bottom middle" self="top middle">
                      <div
                        class="q-ma-sm text-body2 text-center"
                        style="max-width: 250px"
                      >
                        Max Length = 50 characters.
                      </div>
                    </q-menu>
                  </q-btn>
                  <q-btn
                    icon="done"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.locationError"
                    color="green"
                  />
                </template>
              </q-input>

              <q-input
                dense
                filled
                dark
                v-model="registerDataOptional.status"
                label="Status"
                lazy-rules
                :rules="[
                  (val) => val.length < 16 || 'Max Length = 15 characters',
                ]"
                style="
                  font-family: 'SourceCodePro', Helvetica, Arial;
                  max-width: 600px;
                "
                class="q-mt-md"
                ref="statusInput"
              >
                <template v-slot:after>
                  <q-btn
                    icon="info"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.statusError"
                    color="red"
                  >
                    <q-menu anchor="bottom middle" self="top middle">
                      <div
                        class="q-ma-sm text-body2 text-center"
                        style="max-width: 250px"
                      >
                        Max Length = 15 characters
                      </div>
                    </q-menu>
                  </q-btn>
                  <q-btn
                    icon="done"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.statusError"
                    color="green"
                  />
                </template>
              </q-input>

              <q-input
                type="textarea"
                dense
                dark
                filled
                v-model="registerDataOptional.description"
                label="Description"
                lazy-rules
                :rules="[
                  (val) => val.length < 256 || 'Max Length = 255 characters',
                ]"
                style="
                  font-family: 'SourceCodePro', Helvetica, Arial;
                  max-width: 600px;
                "
                class="q-mt-sm"
                ref="descriptionInput"
              >
                <template v-slot:after>
                  <q-btn
                    icon="info"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.descriptionError"
                    color="red"
                  >
                    <q-menu anchor="bottom middle" self="top middle">
                      <div
                        class="q-ma-sm text-body2 text-center"
                        style="max-width: 250px"
                      >
                        Max Length = 255 characters.
                      </div>
                    </q-menu>
                  </q-btn>
                  <q-btn
                    icon="done"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.descriptionError"
                    color="green"
                  />
                </template>
              </q-input>

              <q-file
                v-model="registerDataOptional.avatar"
                outlined
                dark
                label="Profile Picture"
                max-file-size="2048000"
                accept=".jpg, .png, .gif, .jpeg"
                style="
                  font-family: 'SourceCodePro', Helvetica, Arial;
                  max-width: 600px;
                "
                counter
                class="q-mt-sm"
                @update:model-value="onAvatarSelect"
                @rejected="avatarUploadRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:before>
                  <q-avatar>
                    <img :src="avatarPreview" />
                  </q-avatar>
                </template>
                <template v-slot:after>
                  <q-btn
                    icon="info"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.avatarError"
                    color="red"
                  >
                    <q-menu anchor="bottom middle" self="top middle">
                      <div
                        class="q-ma-sm text-body2 text-center"
                        style="max-width: 250px"
                      >
                        Your upload was rejected.Make sure it fits the
                        requirements.
                      </div>
                    </q-menu>
                  </q-btn>
                  <q-btn
                    icon="done"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.avatarError"
                    color="green"
                  />
                </template>
              </q-file>

              <q-file
                v-model="registerDataOptional.background"
                outlined
                dark
                label="Background Picture"
                max-file-size="2048000"
                accept=".jpg, .png, .gif, .jpeg"
                style="
                  font-family: 'SourceCodePro', Helvetica, Arial;
                  max-width: 600px;
                "
                counter
                class="q-mt-md"
                @update:model-value="onBackgroundSelect"
                @rejected="backgroundUploadRejected"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
                <template v-slot:before>
                  <q-avatar>
                    <img :src="backgroundPreview" />
                  </q-avatar>
                </template>
                <template v-slot:after>
                  <q-btn
                    icon="info"
                    flat
                    round
                    :tabindex="-1"
                    v-if="!errorMap.backgroundError"
                    color="red"
                  >
                    <q-menu anchor="bottom middle" self="top middle">
                      <div
                        class="q-ma-sm text-body2 text-center"
                        style="max-width: 250px"
                      >
                        Your upload was rejected.Make sure it fits the
                        requirements.
                      </div>
                    </q-menu>
                  </q-btn>
                  <q-btn
                    icon="done"
                    flat
                    round
                    :tabindex="-1"
                    v-if="errorMap.backgroundError"
                    color="green"
                  />
                </template>
              </q-file>

              <div
                class="text-caption text-center q-mt-md"
                style="
                  font-family: 'SourceCodePro', Helvetica, Arial;
                  max-width: 600px;
                "
              >
                Allowed Images: .jpg, .png, .gif, .jpeg, less than 2mb
                <br />
                Recommended Profile Picture Aspect Ratio: square <br />
                Recommended Background Picture: Any length, 200px height
              </div>
            </q-card-section>
          </q-card>
        </q-step>

        <q-step
          :name="4"
          title="Verify that you are not a bot"
          done-color="green"
          active-icon="smart_toy"
          active-color="primary"
          icon="smart_toy"
          :error="captchaVerified == false"
          :done="captchaVerified"
          style="background: transparent"
          error-color="red"
        >
          <q-card
            class="no-shadow"
            style="width: 100%; min-width: 275px; background: transparent"
            flat
            bordered
            dark
          >
            <div v-if="!captchaVerified">
              <div class="row justify-center q-mt-md">
                <section class="captcha-box">
                  <VueClientRecaptcha
                    :value="captchaRegister"
                    @isValid="checkCaptchaRegister"
                    height="50"
                    width="150"
                  >
                    <template #icon>
                      <div style="color: blue; font-size: large">Refresh</div>
                    </template>
                  </VueClientRecaptcha>
                </section>
              </div>
              <q-form @submit="checkCaptcha">
                <div class="row justify-center q-mt-md">
                  <q-input
                    dark
                    class="row justify-center"
                    dense
                    filled
                    v-model="captchaRegister"
                    label="Captcha"
                    :rules="[(val) => val.length == 5 || '5 characters.']"
                    style="
                      font-family: 'SourceCodePro', Helvetica, Arial;
                      width: 200px;
                    "
                  >
                  </q-input>
                </div>
                <div class="row justify-center">
                  <q-btn
                    label="Verify"
                    color="green"
                    class="text-white q-mt-md q-mb-md"
                    size="xl"
                    type="submit"
                    style="font-family: 'SourceCodePro', Helvetica, Arial"
                  />
                </div>
              </q-form>

              <div
                v-if="captchaError"
                class="text-center text-red text-body1 q-mt-md"
                style="font-family: 'SourceCodePro', Helvetica, Arial"
              >
                Wrong Captcha
              </div>
            </div>

            <div
              v-if="captchaVerified"
              class="text-center text-h4 text-green q-ma-md"
              style="font-family: 'SourceCodePro', Helvetica, Arial"
            >
              Verified
            </div>
          </q-card>
        </q-step>
        <q-step
          :name="5"
          title="Done!"
          done-color="green"
          active-icon="done"
          active-color="green"
          icon="done"
          :done="true"
          v-if="captchaVerified"
        >
        </q-step>
      </q-stepper>
      <div v-if="captchaVerified">
        <div class="row justify-center">
          <q-btn
            size="xl"
            label="Register"
            class="text-white"
            color="green"
            trans
            @click="submitRegister"
            style="font-family: 'SourceCodePro', Helvetica, Arial"
          />
        </div>
        <div
          v-if="
            (checkErrorRequired && !loading) || (checkErrorOptional && !loading)
          "
          class="q-mt-lg text-center text-red text-h6 shake"
          style="font-family: 'SourceCodePro', Helvetica, Arial"
          id="errorText"
          v-on:animationend="
            ($event) => $event.target.classList.remove('shake')
          "
        >
          You still have some errors though, please fix them first!
        </div>
        <div
          v-if="serverError && !loading"
          class="q-mt-lg text-center text-red text-h6"
          style="font-family: 'SourceCodePro', Helvetica, Arial"
        >
          There was a servererror :/
        </div>
        <div class="justify-center row" v-if="loading">
          <q-spinner v-if="!loading" color="green" size="4em" :thickness="2" />
        </div>
      </div>
      <q-page-sticky position="bottom" :offset="[50, 18]">
        <q-btn
          fab
          icon="arrow_back_ios_new"
          v-if="step > 1"
          color="red"
          @click="$refs.stepper.previous()"
        />

        <q-btn
          v-if="step < 4 || (step < 5 && captchaVerified)"
          icon="arrow_forward_ios"
          fab
          color="green"
          @click="
            if (step == 2) {
              this.testRequiredInformation();
            } else if (step == 3) {
              this.testOptionalInformation();
            }
            $refs.stepper.next();
          "
          class="q-ml-lg"
        />

        <q-btn
          v-if="captchaVerified"
          icon="done"
          fab
          color="green"
          class="q-ml-lg"
          :loading="loading"
          @click="submitRegister"
        />
      </q-page-sticky>
    </div>
    <div v-if="registerSuccessful">
      <div
        style="
          position: absolute;
          top: 35%;
          left: 50%;
          -moz-transform: translateX(-50%) translateY(-50%);
          -webkit-transform: translateX(-50%) translateY(-50%);
          transform: translateX(-50%) translateY(-50%);
          font-family: 'SourceCodePro', Helvetica, Arial;
        "
        class="text-h6 text-center text-green fade-in-text"
      >
        Successfully registered!
        <div>Now activate your account with the E-Mail we sent you!</div>
        <div class="row justify-center">
          <q-item
            v-ripple
            to="/"
            class="text-primary text-weight-bold q-mt-lg"
            style="width: 150px; font-family: 'SourceCodePro', Helvetica, Arial"
          >
            <q-item-section> Startpage </q-item-section>
          </q-item>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import VueClientRecaptcha from 'vue-client-recaptcha';
import { useSettingsStore } from 'stores/settings';
import VueWriter from 'vue-writer';

export default {
  name: 'RegisterView',
  components: { VueClientRecaptcha, VueWriter },

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
    const registerDataOptional = ref({
      name: ref(''),
      location: ref(''),
      status: ref(''),
      description: ref(''),
      avatar: ref(null),
      background: ref(null),
    });

    const registerDataRequired = ref({
      username: ref(''),
      password: ref(''),
      password2: ref(''),
      email: ref(''),
    });

    const settingsStore = useSettingsStore();

    return {
      settingsStore,
      step: ref(1),
      axios_config,
      q,
      isPwd: ref(true),
      isPwd2: ref(true),
      registerSuccessful: ref(false),
      loading: ref(false),
      serverError: ref(false),

      registerDataOptional,
      registerDataRequired,

      errorMap: ref({
        usernameError: ref(null),
        emailError: ref(null),
        passwordError: ref(null),
        password2Error: ref(null),
        nameError: ref(true),
        statusError: ref(true),
        locationError: ref(true),
        descriptionError: ref(true),
        avatarError: ref(true),
        backgroundError: ref(true),
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
    registerDataOptional: {
      async handler(val) {
        await this.testOptionalInformation();
      },
      deep: true,
    },
  },

  methods: {
    avatarUploadRejected() {
      this.errorMap.avatarError = false;
    },
    backgroundUploadRejected() {
      this.errorMap.backgroundError = false;
    },

    async isValidUsername() {
      this.$nextTick(async () => {
        var val = await this.$refs.usernameInput.validate();
        this.errorMap.usernameError = val;
        this.testRequiredInformation();
      });
    },

    async isValidEmail() {
      this.$nextTick(async () => {
        var val = await this.$refs.emailInput.validate();
        this.errorMap.emailError = val;
        this.testRequiredInformation();
      });
    },
    async isValidPassword() {
      this.$nextTick(async () => {
        var val = await this.$refs.passwordInput.validate();
        this.errorMap.passwordError = val;
        this.testRequiredInformation();
      });
    },
    async isValidPassword2() {
      this.$nextTick(async () => {
        var val = await this.$refs.password2Input.validate();
        this.errorMap.password2Error = val;
        this.testRequiredInformation();
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
      this.errorMap.avatarError = true;
    },
    onBackgroundSelect() {
      this.backgroundPreview = URL.createObjectURL(
        this.registerDataOptional.background
      );
      this.errorMap.backgroundError = true;
    },

    checkCaptcha() {
      this.captchaVerified = this.captchaVal;
      if (this.captchaVerified) {
        this.captchaError = false;
        this.step += 1;
        this.testRequiredInformation();
        this.testOptionalInformation();
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
      if (this.checkErrorRequired || this.checkErrorOptional) {
        var d = document.getElementById('errorText');
        d.classList.add('shake');
        this.testRequiredInformation();
        this.testOptionalInformation();
      } else {
        this.loading = true;
        let form_data = new FormData();
        form_data.append('username', this.registerDataRequired.username);
        form_data.append('password', this.registerDataRequired.password);
        form_data.append('password2', this.registerDataRequired.password2);
        form_data.append('email', this.registerDataRequired.email);
        form_data.append('name', this.registerDataOptional.name);
        form_data.append('location', this.registerDataOptional.location);
        form_data.append('description', this.registerDataOptional.description);
        form_data.append('status', this.registerDataOptional.status);

        if (this.registerDataOptional.avatar != null) {
          form_data.append('avatar', this.registerDataOptional.avatar);
        }
        if (this.registerDataOptional.background != null) {
          form_data.append('background', this.registerDataOptional.background);
        }
        api
          .post('/auth/register', form_data, this.axios_config)
          .then((response) => {
            if (response.status == 200) {
              this.registerSuccessful = true;
              this.loading = false;
            } else {
              this.loading = false;
              var msg = response.data.error;
              this.notify('negative', msg);
              this.serverError = true;
            }
          })
          .catch((error) => {
            this.loading = false;
            var msg = 'Error (Server Error): ' + error;
            this.notify('negative', msg);
            this.serverError = true;
          });
      }
    },

    onRejected() {
      this.notify('negative', 'Invalid Image');
    },
  },
};
</script>

<style>
@import url('/node_modules/vue-client-recaptcha/dist/style.css');

.bg {
  position: relative;
  overflow: hidden;
  width: inherit;
  height: 500%;
  background: linear-gradient(#000729 1%, rgb(255, 188, 188, 0.6) 200%);
}

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
@font-face {
  font-family: 'SourceCodePro';
  src: local('SourceCodePro'), url(../css//SourceCodePro.ttf) format('truetype');
}

code {
  font-family: 'SourceCodePro', Helvetica, Arial;
}
</style>
