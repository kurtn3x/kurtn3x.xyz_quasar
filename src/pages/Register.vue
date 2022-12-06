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
              v-model="registerData.username"
              label="Username"
              lazy-rules
              input-class="text-body1"
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) => (val && val.length > 3) || 'At least 4 characters',
                (val) =>
                  (val && val.length < 50) || 'Not more than 16 characters',
                (val) =>
                  /^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/.test(
                    val
                  ) || 'Only alphanumeric characters allowed.',
              ]"
              class="q-mt-lg"
            >
              <template v-slot:prepend>
                <q-icon name="person" />
              </template>

              <template v-slot:after>
                <q-btn icon="info" flat round />
              </template>
            </q-input>

            <q-input
              square
              filled
              v-model="registerData.email"
              type="email"
              label="Email"
              input-class="text-body1"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) => (val && val.length > 3) || 'At least 4 characters',
                (val) =>
                  /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                    val
                  ) || 'Not a valid E-Mail',
              ]"
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon name="email" />
              </template>
              <template v-slot:after>
                <q-btn icon="info" flat round />
              </template>
            </q-input>
            <q-input
              square
              filled
              v-model="registerData.password"
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
                (val) => /(?=.*[0-9])/.test(val) || 'At least 1 number',
              ]"
              :type="isPwd ? 'password' : 'text'"
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon
                  class="pw_icon"
                  :name="isPwd ? 'lock' : 'lock_open'"
                  @click="isPwd = !isPwd"
                />
              </template>
              <template v-slot:after>
                <q-btn icon="info" flat round />
              </template>
            </q-input>

            <q-input
              square
              filled
              v-model="registerData.password2"
              label="Confirm Password"
              input-class="text-body1"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
                (val) => val == password || 'Passwords do not match',
              ]"
              :type="isPwd2 ? 'password' : 'text'"
              class="q-mt-md"
            >
              <template v-slot:prepend>
                <q-icon
                  class="pw_icon"
                  :name="isPwd2 ? 'lock' : 'lock_open'"
                  @click="isPwd2 = !isPwd2"
                />
              </template>
              <template v-slot:after>
                <q-btn icon="info" flat round />
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
              v-model="registerData.name"
              type="name"
              label="Name"
              lazy-rules
              :rules="[
                (val) => val.length < 50 || 'Max Length = 50 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-xl"
            >
              <template v-slot:append>
                <q-icon name="add_reaction" class="button_hover">
                  <q-menu>
                    <EmojiPicker :native="true" @select="onSelectEmojiName" />
                  </q-menu>
                  <q-tooltip> Add emoji</q-tooltip>
                </q-icon>
              </template>
            </q-input>
            <q-input
              dense
              square
              filled
              v-model="registerData.location"
              label="Location"
              lazy-rules
              :rules="[
                (val) => val.length < 50 || 'Max Length = 50 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-sm"
            >
              <template v-slot:append>
                <q-icon name="add_reaction" class="button_hover">
                  <q-menu>
                    <EmojiPicker
                      :native="true"
                      @select="onSelectEmojiLocation"
                    />
                  </q-menu>
                  <q-tooltip> Add emoji</q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <q-input
              dense
              square
              filled
              v-model="registerData.status"
              label="Status"
              lazy-rules
              :rules="[
                (val) => val.length < 15 || 'Max Length = 15 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-sm"
            >
              <template v-slot:append>
                <q-icon name="add_reaction" class="button_hover">
                  <q-menu>
                    <EmojiPicker :native="true" @select="onSelectEmojiStatus" />
                  </q-menu>
                  <q-tooltip> Add emoji</q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <q-input
              type="textarea"
              dense
              square
              filled
              v-model="registerData.description"
              label="Description"
              lazy-rules
              :rules="[
                (val) => val.length < 255 || 'Max Length = 255 characters',
              ]"
              style="max-width: 600px"
              class="q-mt-sm"
            >
              <template v-slot:append>
                <q-icon name="add_reaction" class="button_hover">
                  <q-menu>
                    <EmojiPicker
                      :native="true"
                      @select="onSelectEmojiDescription"
                    />
                  </q-menu>
                  <q-tooltip> Add emoji</q-tooltip>
                </q-icon>
              </template>
            </q-input>

            <q-file
              v-model="registerData.avatar"
              outlined
              label="Profile Picture"
              max-file-size="2048000"
              accept=".jpg, .png, .gif, .jpeg"
              @rejected="onRejected"
              style="max-width: 400px"
              counter
              class="q-mt-sm"
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
              v-model="registerData.background"
              outlined
              label="Background Picture"
              max-file-size="2048000"
              accept=".jpg, .png, .gif, .jpeg"
              @rejected="onRejected"
              style="max-width: 400px"
              counter
              class="q-mt-md"
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
    <div class="row justify-center" v-if="captchaVerified">
      <q-btn size="xl" label="Register" class="text-white" color="green" />
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

      registerData: ref({
        username: ref(''),
        password: ref(''),
        password2: ref(''),
        email: ref(''),
        name: ref(''),
        location: ref(''),
        status: ref(''),
        description: ref(''),
        avatar: ref(null),
        background: ref(null),
      }),

      avatarPreview: ref('https://media.kurtn3x.xyz/default.png'),
      backgroundPreview: ref('https://media.kurtn3x.xyz/background.png'),

      // captcha
      captchaRegister: ref(''),
      checkCaptchaRegister,
      captchaVal,
      captchaVerified: ref(false),
      captchaError: ref(false),
    };
  },

  methods: {
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
  },
};
</script>

<style>
@import url('/node_modules/vue-client-recaptcha/dist/style.css');
</style>
