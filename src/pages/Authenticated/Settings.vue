<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="q-ma-sm"
      :class="darkmode ? 'text-light' : 'text-dark'"
      style="min-height: 500px"
    >
      <template v-slot:before>
        <q-tabs
          v-model="tab"
          vertical
          :class="
            darkmode
              ? 'text-light bg-background-dark'
              : 'text-dark bg-background-light'
          "
        >
          <q-expansion-item
            icon="perm_identity"
            label="Account settings"
            v-if="!small"
            header-style="fontSize: 1.3em"
          >
            <q-tab name="profile" icon="person" label="Profile" />
            <q-tab name="account" icon="admin_panel_settings" label="Account" />
          </q-expansion-item>
          <q-expansion-item
            icon="public"
            label="Website settings"
            v-if="!small"
            header-style="fontSize: 1.3em"
          >
            <q-tab name="other" icon="settings" label="Other" />
          </q-expansion-item>
          <div v-if="small">
            <q-tab name="profile" icon="person" label="Profile" />
            <q-tab name="account" icon="admin_panel_settings" label="Account" />
            <q-tab name="other" icon="settings" label="Other" />
          </div>
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="tab"
          animated
          swipeable="false"
          vertical
          :class="
            darkmode
              ? 'text-light bg-background-dark'
              : 'text-dark bg-background-light'
          "
        >
          <q-tab-panel
            name="start"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
            ><div class="text-h4 q-mb-md">The Settings Menu</div></q-tab-panel
          >
          <!-- PROFILE SETTINGS  -->
          <q-tab-panel
            name="profile"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <q-card bordered square class="no-shadow q-ma-md q-pa-md">
              <q-card-section class="row items-center q-pb-none">
                <p class="text-weight-bolder text-primary">
                  Update your Profile
                </p>
              </q-card-section>

              <q-card-section>
                <q-form
                  class="q-gutter-md text-grey"
                  @submit.prevent="updateUserProfile"
                >
                  <q-input
                    :readonly="!name_edit"
                    dense
                    square
                    filled
                    v-model="name"
                    type="name"
                    label="Name"
                    lazy-rules
                    :rules="[
                      (val) => val.length < 50 || 'Max Length = 50 characters',
                    ]"
                    style="max-width: 600px"
                  >
                    <template v-slot:append>
                      <q-btn
                        label="edit"
                        class="cursor-pointer bg-green"
                        @click="this.name_edit = !this.name_edit"
                      />
                    </template>
                  </q-input>
                  <q-input
                    :readonly="!location_edit"
                    dense
                    square
                    filled
                    v-model="location"
                    label="Location"
                    lazy-rules
                    :rules="[
                      (val) => val.length < 50 || 'Max Length = 50 characters',
                    ]"
                    style="max-width: 600px"
                  >
                    <template v-slot:append>
                      <q-btn
                        label="edit"
                        class="cursor-pointer bg-green"
                        @click="this.location_edit = !this.location_edit"
                      />
                    </template>
                  </q-input>

                  <q-input
                    :readonly="!description_edit"
                    dense
                    square
                    filled
                    v-model="description"
                    label="Description"
                    lazy-rules
                    :rules="[
                      (val) =>
                        val.length < 255 || 'Max Length = 255 characters',
                    ]"
                    style="max-width: 600px"
                  >
                    <template v-slot:append>
                      <q-btn
                        label="edit"
                        class="cursor-pointer bg-green"
                        @click="this.description_edit = !this.description_edit"
                      />
                    </template>
                  </q-input>
                  <q-file
                    v-model="avatar"
                    outlined
                    label="Profile Picture"
                    max-file-size="20480000"
                    accept=".jpg, .png, .gif"
                    @rejected="onRejected"
                    ref="avatarFile"
                    style="max-width: 600px"
                  >
                    <template v-slot:before>
                      <q-avatar>
                        <img :src="this.userStore.headerinfo.avatar" />
                      </q-avatar>
                    </template>
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>

                  <div class="row justify-center">
                    <q-btn
                      rounded
                      size="md"
                      color="green"
                      label="Update"
                      type="submit"
                      :loading="loading"
                    />
                  </div>
                </q-form>
              </q-card-section>
            </q-card>
          </q-tab-panel>

          <q-tab-panel
            name="account"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <div class="text-h4 q-mb-md">Account Settings</div>
            <q-card class="my-card">
              <q-card-section>
                <div class="text-body1">Id: {{ this.account.account.id }}</div>
                <div class="text-body1">
                  Username: {{ this.account.account.username }}
                </div>
                <div class="text-body1">
                  Email: {{ this.account.account.email }}
                </div>
                <div class="text-body1">
                  Role: {{ this.account.profile.role }}
                </div>
                <div class="text-body1">
                  Joined: {{ this.account.account.date_joined }}
                </div>
                <div class="text-body1">
                  Name: {{ this.account.profile.name }}
                </div>
                <div class="text-body1">
                  Last Seen: {{ this.account.profile.last_seen }}
                </div>
                <div class="text-body1">
                  Location: {{ this.account.profile.location }}
                </div>
                <div class="text-body1">
                  Status: {{ this.account.profile.status }}
                </div>
              </q-card-section>

              <q-card-actions vertical align="center">
                <q-expansion-item
                  label="Change E-Mail"
                  header-style="fontSize: 1.3em"
                  group="expansions"
                >
                  <q-form
                    class="q-gutter-md text-grey q-mt-lg"
                    @submit.prevent="updateUsername"
                  >
                    <q-input
                      dense
                      square
                      filled
                      v-model="new_username"
                      label="New username"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 3) || 'At least 4 characters',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                    <q-input
                      dense
                      square
                      filled
                      v-model="current_password"
                      label="Current Password"
                      :type="isPwd ? 'password' : 'text'"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd ? 'lock' : 'lock_open'"
                          @click="isPwd = !isPwd"
                        />
                      </template>
                    </q-input>
                    <q-btn
                      rounded
                      size="md"
                      color="green"
                      class="full-width"
                      label="Change E-Mail"
                      type="submit"
                      :loading="loading"
                    />
                  </q-form>
                </q-expansion-item>
                <q-expansion-item
                  label="Change E-Mail"
                  header-style="fontSize: 1.3em"
                  group="expansions"
                >
                  <q-form
                    class="q-gutter-md text-grey q-mt-lg"
                    @submit.prevent="updateEmail"
                  >
                    <q-input
                      dense
                      square
                      filled
                      v-model="new_email"
                      type="email"
                      label="New Email"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 3) || 'At least 4 characters',
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
                    <q-input
                      dense
                      square
                      filled
                      v-model="current_password"
                      label="Current Password"
                      :type="isPwd ? 'password' : 'text'"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd ? 'lock' : 'lock_open'"
                          @click="isPwd = !isPwd"
                        />
                      </template>
                    </q-input>
                    <q-btn
                      rounded
                      size="md"
                      color="green"
                      class="full-width"
                      label="Change E-Mail"
                      type="submit"
                      :loading="loading"
                    />
                  </q-form>
                </q-expansion-item>
                <q-expansion-item
                  label="Change Password"
                  header-style="fontSize: 1.3em"
                  group="expansions"
                >
                  <q-form
                    class="q-gutter-md text-grey q-mt-lg"
                    @submit.prevent="updatePassword"
                  >
                    <q-input
                      dense
                      square
                      filled
                      v-model="new_password"
                      label="New Password"
                      :type="isPwd ? 'password' : 'text'"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          (val && val.length > 7) || 'At least 8 characters',
                        (val) =>
                          (val && val.length < 100) ||
                          'Not more than 100 characters',
                        (val) =>
                          /(?=.*[a-z])/.test(val) ||
                          'At least 1 lowercase letter',
                        (val) =>
                          /(?=.*[A-Z])/.test(val) ||
                          'At least 1 uppercase letter',
                        (val) => /(?=.*[0-9])/.test(val) || 'At least 1 number',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd3 ? 'lock' : 'lock_open'"
                          @click="isPwd3 = !isPwd3"
                        />
                      </template>
                    </q-input>

                    <q-input
                      dense
                      square
                      filled
                      v-model="confirm_new_password"
                      label="Confirm New Password"
                      :type="isPwd1 ? 'password' : 'text'"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                        (val) =>
                          val == new_password || 'Passwords do not match',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd1 ? 'lock' : 'lock_open'"
                          @click="isPwd1 = !isPwd1"
                        />
                      </template>
                    </q-input>

                    <q-input
                      dense
                      square
                      filled
                      v-model="current_password"
                      label="Current Password"
                      :type="isPwd2 ? 'password' : 'text'"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    >
                      <template v-slot:prepend>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd2 ? 'lock' : 'lock_open'"
                          @click="isPwd2 = !isPwd2"
                        />
                      </template>
                    </q-input>

                    <q-btn
                      rounded
                      size="md"
                      color="green"
                      class="full-width"
                      label="Change Password"
                      type="submit"
                      :loading="loading"
                    />
                  </q-form>
                </q-expansion-item>
                <q-btn flat class="q-mt-xl">Delete Account</q-btn>
              </q-card-actions>
            </q-card>
          </q-tab-panel>
          <q-tab-panel
            name="other"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <q-btn
              rounded
              size="md"
              color="green"
              class="full-width"
              label="Clear Local Storage and Logout"
              :loading="loading"
              @click="clear_all"
            />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import {
  defaultUser,
  serializeHeaderInformation,
  serializeUser,
} from 'src/models';

export default {
  name: 'SettingsView',

  setup() {
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    const q = useQuasar();

    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axios_config,
      account: ref(''),
      tab: ref('start'),
      splitterModel: ref(20),
      settingsStore,
      avatar: ref(null),
      name: ref(''),
      location: ref(''),
      description: ref(''),
      q,
      userStore,
      loading: ref(false),
      name_edit: ref(false),
      description_edit: ref(false),
      location_edit: ref(false),
      avatar_edit: ref(false),
      isPwd: ref(true),
      isPwd1: ref(true),
      isPwd2: ref(true),
      isPwd3: ref(true),
      current_password: ref(''),
      new_password: ref(''),
      confirm_new_password: ref(''),
      new_username: ref(''),
      new_email: ref(''),
    };
  },

  created() {
    this.getAccountInformation();
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
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    updateUsername() {
      let data = {
        new_username: this.username,
        password: this.current_password,
      };
      api
        .put('/auth/update/username', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
          } else {
            this.notify('negative', 'Something went wrong :/');
          }
        })
        .catch((error) => {
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },

    updatePassword() {
      let data = {
        new_password: this.new_password,
        password: this.current_password,
      };
      api
        .put('/auth/update/password', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
          } else {
            this.notify('negative', 'Something went wrong :/');
          }
        })
        .catch((error) => {
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },

    updateEmail() {
      let data = {
        new_email: this.email,
        password: this.current_password,
      };
      api
        .put('/auth/update/email', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
          } else {
            this.notify('negative', 'Something went wrong :/');
          }
        })
        .catch((error) => {
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },

    clear_all() {
      api
        .post('/auth/logout', '', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.userStore.setAuthState(false);
            LocalStorage.clear();
            this.userStore.setHeaderInfo();
            LocalStorage.remove('header');
            this.$router.push('/');
            this.notify('positive', 'Cleared everything and logged out!!');
          }
        })
        .catch();
    },

    onRejected(stuff, x) {
      this.notify(
        'negative',
        'Something went wrong when uploading the picture.' + x
      );
    },

    updateUserProfile() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };
      this.loading = true;
      let form_data = new FormData();
      form_data.append('name', this.name);
      form_data.append('location', this.location);
      form_data.append('description', this.description);
      if (this.avatar != null) {
        form_data.append('avatar', this.avatar);
      }

      api
        .put('/profile/update', form_data, config)
        .then((response) => {
          if (response.status == 200) {
            var header = serializeHeaderInformation(response.data);
            this.userStore.setHeaderInfo(header);
            this.loading = false;
            this.notify(
              'positive',
              'Updated your profile! You may need to reload the page to see some changes.'
            );
          } else {
            this.loading = false;
            this.notify('negative', 'User does not exist.');
          }
        })
        .catch((error) => {
          this.loading = false;
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },

    // get account settings
    getAccountInformation() {
      api
        .get('/profile/account', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.account = response.data;
            this.name = response.data.profile.name;
            this.location = response.data.profile.location;
            this.description = response.data.profile.description;
          } else {
            this.notify('negative', 'Something went wrong :/');
          }
        })
        .catch((error) => {
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },
  },
};
</script>

<style></style>
