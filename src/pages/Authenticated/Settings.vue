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
                  ref="loginform"
                  @submit.prevent="updateUserProfile"
                >
                  <q-input
                    dense
                    square
                    filled
                    v-model="name"
                    type="name"
                    label="Name"
                    lazy-rules
                    :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Please type something',
                    ]"
                  />
                  <q-input
                    dense
                    square
                    filled
                    v-model="description"
                    label="Description"
                    lazy-rules
                    :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Please type something',
                    ]"
                  />
                  <q-input
                    dense
                    square
                    filled
                    v-model="location"
                    label="Location"
                    lazy-rules
                    :rules="[
                      (val) =>
                        (val && val.length > 0) || 'Please type something',
                    ]"
                  />
                  <input type="file" @change="uploadFile" ref="myFile" />

                  <q-file
                    v-model="avatar"
                    outlined
                    label="Profile Picture"
                    max-file-size="20480000"
                    accept=".jpg, .png, .gif"
                    @rejected="onRejected"
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_file" />
                    </template>
                  </q-file>

                  <q-file
                    v-model="background"
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
                <div class="text-body1">Id: {{ this.account.id }}</div>
                <div class="text-body1">
                  Username: {{ this.account.username }}
                </div>
                <div class="text-body1">Email: {{ this.account.email }}</div>
                <div class="text-body1">Role: {{ this.account.role }}</div>
                <div class="text-body1">Groups: {{ placeholder }}</div>
                <div class="text-body1">Phone: {{ this.account.phone }}</div>
                <div class="text-body1">
                  First Name: {{ this.account.first_name }}
                </div>
                <div class="text-body1">
                  Last Name: {{ this.account.last_name }}
                </div>
              </q-card-section>

              <q-card-actions vertical align="center">
                <q-expansion-item
                  label="Change E-Mail"
                  header-style="fontSize: 1.3em"
                >
                  <q-form
                    class="q-gutter-md text-grey"
                    ref="loginform"
                    @submit.prevent="updateUserProfile"
                  >
                    <q-input
                      dense
                      square
                      filled
                      v-model="change_email"
                      type="email"
                      label="New E-Mail"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    />
                    <q-input
                      dense
                      square
                      filled
                      v-model="password"
                      label="Your Password"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    />
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
                >
                  <q-form
                    class="q-gutter-md text-grey"
                    ref="loginform"
                    @submit.prevent="updateUserProfile"
                  >
                    <q-input
                      dense
                      square
                      filled
                      v-model="change_email"
                      type="email"
                      label="New Password"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    />
                    <q-input
                      dense
                      square
                      filled
                      v-model="password"
                      label="Confirm New Password"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 0) || 'Please type something',
                      ]"
                    />
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

    return {
      account: ref(''),
      tab: ref('start'),
      splitterModel: ref(20),
      settingsStore,
      q,
      userStore,
      loading: ref(false),
      avatar_hover: ref(false),
      background_hover: ref(false),
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

    clear_all() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .post('/auth/logout', '', config)
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

    uploadFile() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
          'Content-Type': 'multipart/form-data',
        },
      };
      this.loading = true;

      let form_data = new FormData();
      form_data.append('avatar', this.$refs.myFile.files[0]);

      api
        .put('/profile/update', form_data, config)
        .then((response) => {
          if (response.status == 200) {
            this.account = response.data;
            var header = serializeHeaderInformation(response.data);
            this.userStore.setHeaderInfo(header);
            this.loading = false;
          } else {
            this.loading = false;
            this.notify('negative', 'User does not exist.');
          }
        })
        .catch((error) => {
          console.log(error);
          this.loading = false;
          this.notify('negative', 'Something went wrong with the API :/');
        });
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
      var data = {
        name: this.name,
        description: this.description,
        location: this.location,
        avatar: this.avatar,
        background: this.background,
      };
      let form_data = new FormData();

      console.log(this.avatar);

      api
        .put('/profile/update', data, config)
        .then((response) => {
          if (response.status == 200) {
            this.account = serializeUser(response.data);
            this.userStore.setUser(this.account);
            this.loading = false;
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
      let config = {
        withCredentials: true,

        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/profile/account', config)
        .then((response) => {
          if (response.status == 200) {
            this.account = response.data;
          } else {
            this.$router.push('/');
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
