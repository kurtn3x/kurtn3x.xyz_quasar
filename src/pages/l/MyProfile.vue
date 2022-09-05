<template>
  <q-dialog v-model="edit_popup">
    <q-card square class="no-shadow q-ma-md q-pa-md">
      <p
        class="text-weight-bolder"
        :class="darkmode ? 'text-grey-2' : 'text-grey-8'"
      >
        Login to your account
      </p>
      <q-card-section>
        <q-form
          class="q-gutter-md text-grey"
          ref="loginform"
          @submit.prevent="submitLogin"
        >
          <q-input
            dense
            square
            filled
            v-model="username"
            type="username"
            label="First Name"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />
          <q-input
            dense
            square
            filled
            v-model="username"
            type="username"
            label="Last Name"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />
          <q-input
            dense
            square
            filled
            v-model="username"
            type="username"
            label="Description"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Please type something',
            ]"
          />

          <q-file
            v-model="filesMaxSize"
            outlined
            label="Profile Picture"
            max-file-size="2048"
            accept=".jpg, .png, .gif"
            @rejected="onRejected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>

          <q-file
            v-model="filesMaxSize"
            outlined
            label="Background Picture"
            max-file-size="2048"
            accept=".jpg, .png, .gif"
            @rejected="onRejected"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
          <q-card-actions>
            <q-btn
              rounded
              size="md"
              color="green"
              class="full-width"
              label="Update"
              type="submit"
              :loading="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <div class="q-ma-xs">
    <q-card class="gt-sm" bordered style="background-color: transparent">
      <q-parallax :src="this.user.background" style="height: 200px" />

      <q-avatar
        round="round"
        size="150px"
        text-color="white"
        @mouseover="avatar_hover = true"
        @mouseleave="avatar_hover = false"
        style="top: -1.25em; left: 0.2em; z-index: 101; max-height: 0px"
        class="justify-center"
      >
        <img
          :src="this.user.avatar"
          :style="avatar_hover ? 'filter: brightness(50%);' : ''" />
        <q-file
          v-if="avatar_hover"
          v-model="image"
          borderless
          hide-bottom-space
          style="
            display: inline-block;
            position: absolute;
            z-index: 100;
            height: 120px;
            width: 120px;
          "
          @change="updateFile()"
          color="transparent"
          bg-color="transparent"
        >
          <q-icon
            name="attach_file"
            color="white"
            class="q-mr-xl"
            style="height: 120px"
            size="22px"
          /> </q-file
      ></q-avatar>
      <div style="height: 200px; max-height: 200px">
        <q-card-section
          style="
            left: 14em;
            top: 1.8em;
            background-color: rgba(0, 0, 0, 0.5);
            max-height: 150px;
          "
          class="absolute-left"
        >
          <div class="text-light text-h4 text-weight-bolder">
            {{ this.user.username }}
            <q-tooltip
              class="text-body2"
              :class="darkmode ? 'bg-dark text-light' : 'bg-light text-dark'"
              anchor="bottom middle"
              self="center middle"
              >{{ this.user.role }}</q-tooltip
            >
          </div>
          <div class="text-caption q-mt-sm text-light">
            {{ this.user.first_name }} {{ this.user.last_name }}
          </div>
          <div class="text-caption q-mt-sm text-light">Country</div>
          <div class="text-caption q-mt-sm text-light">last online: Today</div>
        </q-card-section>
        <q-card-actions
          vertical
          class="q-ma-sm absolute-right"
          style="background-color: rgba(0, 0, 0, 0.5); max-height: 183px"
        >
          <q-btn size="lg" flat stretch color="red" icon="favorite" />
          <q-btn size="lg" flat stretch color="accent" icon="bookmark" />
          <q-btn size="lg" flat stretch color="primary" icon="share" />
        </q-card-actions>
      </div>
      <div
        style="position: relative; top: -17em; max-height: 0px"
        v-if="!small"
      >
        <q-card-section>
          <div class="text-h6 q-mt-sm q-mb-xs">Description</div>
          <div class="text-body1 q-ml-xl">
            {{ this.user.bio }}
          </div>
        </q-card-section>
      </div>
    </q-card>

    <q-card class="lt-md" bordered style="background-color: transparent">
      <q-parallax :src="this.user.background" style="height: 200px" />

      <q-avatar
        round="round"
        size="150px"
        text-color="white"
        style="z-index: 99; top: 0.66em"
        class="absolute-center"
      >
        <img :src="this.user.avatar" />
      </q-avatar>
      <q-card-section>
        <div class="text-h5 text-center text-weight-bolder lt-md">
          <a>{{ this.user.username }}</a>
        </div>
        <div class="text-center text-caption q-mt-xs">
          <a>{{ this.user.first_name }} {{ this.user.last_name }} </a>
        </div>
      </q-card-section>
      <q-card-section style="padding: 0">
        <div class="text-h6 q-mb-xs q-ml-sm">Description</div>
        <div class="text-left text-body1 q-ml-xl q-mr-sm">
          {{ this.user.bio }}
        </div>
      </q-card-section>
      <q-card-actions class="q-mt-md row justify-center">
        <q-btn size="lg" flat stretch color="red" icon="favorite" />
        <q-btn size="lg" flat stretch color="accent" icon="bookmark" />
        <q-btn size="lg" flat stretch color="primary" icon="share" />
      </q-card-actions>
    </q-card>
  </div>
  <div class="row justify-center q-mt-md">
    <q-btn
      size="lg"
      flat
      stretch
      color="primary"
      icon="edit"
      label="Edit Profile"
      @click="this.edit_popup = !this.edit_popup"
    />
  </div>
</template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import { defaultUser, serializeUser } from 'src/models';

export default {
  name: 'SettingsView',

  setup() {
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    const q = useQuasar();

    return {
      user: userStore.user,
      settingsStore,
      q,
      userStore,
      loading: ref(false),
      avatar_hover: ref(false),
      edit_popup: ref(false),
    };
  },

  created() {
    if (!this.user.feched) {
      this.getMe();
    }
  },

  computed: {
    darkmode() {
      return this.settingsStore.darkmode;
    },
    small() {
      if (this.q.screen.width < 1024) {
        return true;
      } else {
        return false;
      }
    },
  },

  methods: {
    changeBackground() {
      console.log('bla');
    },
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },
    setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      this.settingsStore.theme = theme;
      if (this.test_darkmode) {
        this.settingsStore.darkmode = true;
      } else {
        this.settingsStore.darkmode = false;
      }
    },

    getMe() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/profile/user', config)
        .then((response) => {
          if (response.status == 200) {
            this.user = serializeUser(response.data);
            this.userStore.setUser(this.user);
          } else {
            this.user = defaultUser();
            this.notify('negative', 'Something went wrong with the API :/');
          }
        })
        .catch((error) => {
          this.user = defaultUser();
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },
  },
};
</script>
