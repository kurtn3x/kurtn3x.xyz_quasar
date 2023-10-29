<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <q-dialog
      v-model="confirmDeleteAccountDialog"
      @hide="
        deleteAccountPassword = '';
        isPwd = true;
      "
    >
      <q-card bordered flat style="max-width: 350px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm">Delete Account</q-toolbar-title>
        </q-toolbar>
        <div class="q-ma-md">
          <div class="text-red text-body1 text-weight-bolder">
            This will delete your account and all data associated with it.
          </div>
          <div class="text-caption2 q-mt-md">
            Confirm with your password to continue.
          </div>
          <q-input
            autofocus
            v-model="deleteAccountPassword"
            :color="darkmode ? 'white' : 'dark'"
            label="Current Password"
            :type="isPwd ? 'password' : 'text'"
            outlined
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                class="pw_icon"
                :name="isPwd ? 'visibility' : 'visibility_off'"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </div>

        <q-separator class="q-mt-sm" />

        <q-card-actions align="center" class="q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            push
            icon="close"
            label="Cancel"
            class="bg-red text-white"
            style="width: 130px"
          />
          <q-btn
            push
            class="bg-green text-white"
            icon="done"
            size="md"
            label="Delete"
            @click="deleteAccount"
            style="width: 130px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-card bordered flat class="q-ma-xs bg-transparent">
      <q-tabs
        inline-label
        v-model="tab"
        class="full-width"
        align="justify"
        indicator-color="transparent"
        active-color="layout-text"
        active-bg-color="layout-bg"
      >
        <q-tab name="site" icon="settings_applications" label="Site" />
        <q-tab name="profile" icon="person" label="Profile" />
        <q-tab name="account" icon="admin_panel_settings" label="Account" />
      </q-tabs>
      <q-separator size="2px" color="primary" />

      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <q-tab-panel name="site" class="q-pa-none q-ma-none">
          <div class="q-ma-md">
            <div class="text-h4 text-center q-mt-lg">Site Settings</div>
            <q-separator class="q-mt-md" />
            <q-card-section>
              <div class="row justify-center">
                <q-item>
                  <q-item-section>
                    <q-toggle
                      v-model="darkmodeToogle"
                      checked-icon="check"
                      color="green"
                      unchecked-icon="clear"
                      label="Dark Mode"
                      @click="darkmodeChanged"
                      class="full-width text-h5"
                    />
                  </q-item-section>
                </q-item>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-center text-h5">Theme</div>

              <div class="row justify-center q-mt-md">
                <q-list bordered style="width: 300px">
                  <q-item
                    clickable
                    @click="setTheme('default')"
                    style="background: #000e5b"
                  />
                  <q-item
                    clickable
                    @click="setTheme('cool-orange')"
                    style="background: #ee4d2e"
                  />
                  <q-item
                    clickable
                    @click="setTheme('nice-green')"
                    style="background: #1db992"
                  />
                  <q-item
                    clickable
                    @click="setTheme('olive-green')"
                    style="background: #bfbc06"
                  />
                  <q-item
                    clickable
                    @click="setTheme('epic-blue')"
                    style="background: #008fff"
                  />
                  <q-item
                    clickable
                    @click="setTheme('dark')"
                    style="background: #1d1d1d"
                  />
                  <q-item
                    clickable
                    @click="setTheme('light')"
                    style="background: #f8f0e3"
                  />
                </q-list>
              </div>
            </q-card-section>
          </div>
        </q-tab-panel>
        <!-- PROFILE SETTINGS  -->
        <q-tab-panel
          name="profile"
          :class="darkmode ? 'text-white' : 'text-dark'"
        >
          <q-card flat class="q-ma-sm bg-transparent" v-if="!small">
            <div class="text-h4 text-center q-mt-lg">Profile Settings</div>

            <q-card-section class="q-mt-md">
              <q-form
                class="q-gutter-sm text-grey"
                @submit.prevent="updateUserProfile"
              >
                <q-splitter :model-value="50" disable>
                  <template v-slot:before>
                    <div class="float-right q-mr-lg">
                      <q-input
                        v-model="accountData.profile.name"
                        style="width: 400px"
                        input-class="text-body1"
                        label="Name"
                        :color="darkmode ? 'white' : 'black'"
                        outlined
                        lazy-rules
                        :rules="[
                          (val) =>
                            val.length < 50 || 'Max Length = 50 characters',
                        ]"
                      />

                      <q-input
                        v-model="accountData.profile.location"
                        style="width: 400px"
                        input-class="text-body1"
                        label="Location"
                        :color="darkmode ? 'white' : 'black'"
                        outlined
                        lazy-rules
                        :rules="[
                          (val) =>
                            val.length < 50 || 'Max Length = 50 characters',
                        ]"
                      />

                      <q-input
                        v-model="accountData.profile.status"
                        style="width: 400px"
                        input-class="text-body1"
                        label="Status"
                        :color="darkmode ? 'white' : 'black'"
                        outlined
                        lazy-rules
                        :rules="[
                          (val) =>
                            val.length < 15 || 'Max Length = 15 characters',
                        ]"
                      />

                      <q-input
                        v-model="accountData.profile.description"
                        style="width: 400px"
                        input-class="text-body1"
                        label="Description"
                        :color="darkmode ? 'white' : 'black'"
                        type="textarea"
                        outlined
                        lazy-rules
                        :rules="[
                          (val) =>
                            val.length < 255 || 'Max Length = 255 characters',
                        ]"
                      />
                    </div>
                  </template>
                  <template v-slot:after>
                    <div style="overflow: hidden" class="q-ml-lg">
                      <q-file
                        v-model="avatar"
                        style="width: 400px"
                        label="Profile Picture"
                        :color="darkmode ? 'white' : 'black'"
                        outlined
                        max-file-size="2048000"
                        accept=".jpg, .png, .gif, .jpeg"
                        counter
                        @update:model-value="onAvatarSelect"
                        @rejected="onRejected"
                      >
                        <template v-slot:before>
                          <q-avatar>
                            <img :src="(avatarPreview as string)" />
                          </q-avatar>
                        </template>
                        <template v-slot:prepend>
                          <q-icon name="attach_file" />
                        </template>
                      </q-file>

                      <div class="text-caption2 q-mt-sm q-ml-md">
                        Allowed Images: .jpg, .png, .gif, .jpeg, less than 2mb
                        <br />
                        Recommended Profile Picture Aspect Ratio: Square <br />
                      </div>
                    </div>
                  </template>
                </q-splitter>
                <div class="row justify-center q-mt-xl">
                  <q-btn
                    size="xl"
                    color="green"
                    label="Save"
                    type="submit"
                    push
                    :loading="loading"
                    style="width: 300px"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
          <q-card flat class="bg-transparent q-ma-sm" v-if="small">
            <div class="text-h4 text-center q-mt-lg">Profile Settings</div>
            <q-card-section class="row justify-center">
              <q-form
                class="q-gutter-sm text-grey q-mt-md"
                @submit.prevent="updateUserProfile"
              >
                <q-input
                  v-model="accountData.profile.name"
                  input-class="text-body1"
                  label="Name"
                  :color="darkmode ? 'white' : 'black'"
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => val.length < 50 || 'Max Length = 50 characters',
                  ]"
                  style="max-width: 600px"
                />
                <q-input
                  v-model="accountData.profile.location"
                  style="max-width: 600px"
                  input-class="text-body1"
                  label="Location"
                  :color="darkmode ? 'white' : 'black'"
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => val.length < 50 || 'Max Length = 50 characters',
                  ]"
                />

                <q-input
                  v-model="accountData.profile.status"
                  style="max-width: 600px"
                  input-class="text-body1"
                  label="Status"
                  :color="darkmode ? 'white' : 'black'"
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => val.length < 15 || 'Max Length = 15 characters',
                  ]"
                />

                <q-input
                  v-model="accountData.profile.description"
                  style="max-width: 600px"
                  label="Description"
                  input-class="text-body1"
                  :color="darkmode ? 'white' : 'black'"
                  type="textarea"
                  outlined
                  lazy-rules
                  :rules="[
                    (val) => val.length < 255 || 'Max Length = 255 characters',
                  ]"
                />

                <q-file
                  v-model="avatar"
                  style="max-width: 600px"
                  label="Profile Picture"
                  :color="darkmode ? 'white' : 'black'"
                  outlined
                  max-file-size="2048000"
                  accept=".jpg, .png, .gif, .jpeg"
                  counter
                  @update:model-value="onAvatarSelect"
                  @rejected="onRejected"
                >
                  <template v-slot:before>
                    <q-avatar>
                      <img :src="(avatarPreview as string)" />
                    </q-avatar>
                  </template>
                  <template v-slot:prepend>
                    <q-icon name="attach_file" />
                  </template>
                </q-file>

                <div class="text-caption2 text-center q-mt-md">
                  Allowed Images: .jpg, .png, .gif, .jpeg, less than 2mb
                  <br />
                  Recommended Profile Picture Aspect Ratio: Square <br />
                </div>

                <div class="row justify-center q-mt-lg">
                  <q-btn
                    size="xl"
                    color="green"
                    label="Save"
                    type="submit"
                    push
                    :loading="loading"
                    style="width: 300px"
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </q-tab-panel>

        <q-tab-panel
          :class="darkmode ? 'text-white' : 'text-dark'"
          style="background: transparent"
          name="account"
        >
          <q-card flat class="no-shadow q-ma-md bg-transparent">
            <div class="text-h4 text-center q-mt-lg">Account Settings</div>

            <q-card-section class="full-width">
              <q-item>
                <q-item-section side style="width: 100px"> Id: </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.account.id }}
                </q-item-section>
              </q-item>
              <q-separator />

              <q-item>
                <q-item-section side style="width: 100px">
                  Username:
                </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.account.username }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section side style="width: 100px">
                  Email:
                </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.account.email }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section side style="width: 100px">
                  Admin:
                </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.account.is_admin }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section side style="width: 100px">
                  Joined:
                </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.profile.date_joined }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section side style="width: 100px">
                  Name:
                </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.profile.name }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section side style="width: 100px">
                  Location:
                </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.profile.location }}
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item>
                <q-item-section side style="width: 100px">
                  Status:
                </q-item-section>
                <q-item-section style="line-break: anywhere">
                  {{ accountData.profile.status }}
                </q-item-section>
              </q-item>

              <q-separator />
            </q-card-section>

            <q-card-actions class="justify-center">
              <q-list bordered class="full-width" style="max-width: 750px">
                <q-expansion-item
                  class="full-width text-center"
                  label="Change Username"
                  header-style="fontSize: 1.6em"
                  group="expansions"
                >
                  <q-separator />

                  <q-form
                    class="q-ma-md q-mt-lg justify-center row"
                    @submit.prevent="updateUsername"
                  >
                    <q-input
                      v-model="newUsername"
                      class="full-width"
                      style="max-width: 400px"
                      input-class="text-body1"
                      outlined
                      label="New username"
                      lazy-rules
                      :rules="[
                        (val) =>
                          (val && val.length > 3) || 'At least 4 characters',
                      ]"
                      no-error-icon
                      :color="darkmode ? 'white' : 'black'"
                    >
                      <template v-slot:prepend>
                        <q-icon name="person" />
                      </template>
                    </q-input>
                    <q-input
                      v-model="changeUsernamePassword"
                      class="q-mt-sm full-width"
                      style="max-width: 400px"
                      label="Current Password"
                      input-class="text-body1"
                      outlined
                      :type="isPwd1 ? 'password' : 'text'"
                      :color="darkmode ? 'white' : 'black'"
                    >
                      <template v-slot:prepend>
                        <q-icon name="lock" />
                      </template>
                      <template v-slot:append>
                        <q-icon
                          class="pw_icon"
                          :name="isPwd1 ? 'visibility' : 'visibility_off'"
                          @click="isPwd1 = !isPwd1"
                        />
                      </template>
                    </q-input>
                    <q-btn
                      class="full-width q-mb-md q-mt-lg"
                      style="max-width: 350px"
                      label="Change Username"
                      size="lg"
                      color="green"
                      push
                      type="submit"
                      :loading="loading"
                    />
                  </q-form>
                </q-expansion-item>
                <q-separator />
                <q-expansion-item
                  class="full-width text-center"
                  label="Change E-Mail"
                  header-style="fontSize: 1.6em"
                  group="expansions"
                >
                  <q-separator />

                  <q-form class="q-ma-md q-mt-lg" @submit.prevent="updateEmail">
                    <div class="row justify-center">
                      <q-input
                        v-model="newEmail"
                        class="full-width"
                        style="max-width: 400px"
                        label="New Email"
                        input-class="text-body1"
                        outlined
                        type="email"
                        no-error-icon
                        lazy-rules
                        :rules="[
                          (val) =>
                            (val && val.length > 3) || 'At least 4 characters',
                          (val) =>
                            /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/.test(
                              val
                            ) || 'Not a valid E-Mail',
                        ]"
                        :color="darkmode ? 'white' : 'black'"
                      >
                        <template v-slot:prepend>
                          <q-icon name="email" />
                        </template>
                      </q-input>
                    </div>
                    <div class="row justify-center">
                      <q-input
                        v-model="changeEmailPassword"
                        class="q-mt-sm full-width"
                        style="max-width: 400px"
                        label="Current Password"
                        input-class="text-body1"
                        outlined
                        :type="isPwd2 ? 'password' : 'text'"
                        :color="darkmode ? 'white' : 'black'"
                      >
                        <template v-slot:prepend>
                          <q-icon name="lock" />
                        </template>
                        <template v-slot:append>
                          <q-icon
                            class="pw_icon"
                            :name="isPwd2 ? 'visibility' : 'visibility_off'"
                            @click="isPwd2 = !isPwd2"
                          />
                        </template>
                      </q-input>
                    </div>
                    <q-btn
                      class="full-width q-mb-md q-mt-lg"
                      style="max-width: 350px"
                      label="Change E-Mail"
                      size="lg"
                      color="green"
                      push
                      type="submit"
                      :loading="loading"
                    />
                  </q-form>
                </q-expansion-item>
                <q-separator />

                <q-expansion-item
                  class="full-width text-center"
                  label="Change Password"
                  header-style="fontSize: 1.6em"
                  group="expansions"
                >
                  <q-separator />
                  <q-form
                    class="q-ma-md q-mt-lg"
                    @submit.prevent="updatePassword"
                  >
                    <div class="row justify-center">
                      <q-input
                        v-model="newPassword"
                        class="full-width"
                        style="max-width: 400px"
                        label="New Password"
                        input-class="text-body1"
                        :color="darkmode ? 'white' : 'black'"
                        type="password"
                        lazy-rules
                        outlined
                        :rules="[
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
                          (val) =>
                            /(?=.*[0-9])/.test(val) || 'At least 1 number',
                        ]"
                        no-error-icon
                      >
                        <template v-slot:prepend>
                          <q-icon name="lock" />
                        </template>
                      </q-input>
                    </div>
                    <div class="row justify-center">
                      <q-input
                        v-model="confirmNewPassword"
                        class="q-mt-sm full-width"
                        style="max-width: 400px"
                        label="Confirm New Password"
                        input-class="text-body1"
                        :color="darkmode ? 'white' : 'black'"
                        no-error-icon
                        outlined
                        type="password"
                        lazy-rules
                        :rules="[
                          (val) =>
                            val == newPassword || 'Passwords do not match',
                        ]"
                      >
                        <template v-slot:prepend>
                          <q-icon name="lock" />
                        </template>
                      </q-input>
                    </div>
                    <div class="row justify-center">
                      <q-input
                        v-model="changePasswordPassword"
                        class="q-mt-sm full-width"
                        style="max-width: 400px"
                        label="Current Password"
                        input-class="text-body1"
                        outlined
                        :type="isPwd3 ? 'password' : 'text'"
                        :color="darkmode ? 'white' : 'black'"
                      >
                        <template v-slot:prepend>
                          <q-icon name="lock" />
                        </template>
                        <template v-slot:append>
                          <q-icon
                            class="pw_icon"
                            :name="isPwd3 ? 'visibility' : 'visibility_off'"
                            @click="isPwd3 = !isPwd3"
                          />
                        </template>
                      </q-input>
                    </div>

                    <q-btn
                      class="full-width q-mb-md q-mt-lg"
                      style="max-width: 350px"
                      label="Change Password"
                      size="lg"
                      color="green"
                      push
                      type="submit"
                      :loading="loading"
                    />
                  </q-form>
                </q-expansion-item>
                <q-separator />

                <div class="row">
                  <q-space />
                  <q-btn
                    outline
                    class="q-mt-md"
                    @click="confirmDeleteAccountDialog = true"
                    >Delete Account</q-btn
                  >
                </div>
              </q-list>
            </q-card-actions>
          </q-card>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script lang="ts">
import { Ref, ref } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';
import { defaultHeaderInformation } from 'src/types/defaults';
import { AccountSettingsType, HeaderInformationType } from 'src/types/index';
import { defaultAccountSettings } from '../../types/defaults';

export default {
  name: 'SettingsView',
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };
    const darkmodeToogle = ref(localStore.darkmodeState);

    return {
      darkmodeToogle,
      axiosConfig,
      tab: ref('site'),
      localStore,
      q,
      loading: ref(false),

      // data
      avatar: ref(null) as Ref<any | Blob | MediaSource | null>,
      avatarPreview: ref(null) as Ref<string | null>,
      accountData: ref({}) as Ref<AccountSettingsType>,

      // show / hide password fields
      isPwd: ref(true),
      isPwd1: ref(true),
      isPwd2: ref(true),
      isPwd3: ref(true),

      // change password, username and email
      newPassword: ref(''),
      confirmNewPassword: ref(''),
      newUsername: ref(''),
      newEmail: ref(''),

      //fetch initialInformation
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),

      // password confirmations for change username, email & password
      changeUsernamePassword: ref(''),
      changeEmailPassword: ref(''),
      changePasswordPassword: ref(''),

      // delete account dialog
      confirmDeleteAccountDialog: ref(false),
      deleteAccountPassword: ref(''),
    };
  },

  created() {
    if (this.$route.params.page == 'account') {
      this.tab = 'account';
    } else if (this.$route.params.page == 'profile') {
      this.tab = 'profile';
    }

    this.getAccountInformation();
  },

  computed: {
    darkmode() {
      return this.localStore.darkmode;
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
    onAvatarSelect() {
      this.avatarPreview = URL.createObjectURL(this.avatar as MediaSource);
    },

    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    getHeaderInfo() {
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/profile/headerinfo', axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            var headerinfo = response.data;
            this.localStore.setHeaderInfo(headerinfo);
            this.localStore.setAuthState(true);
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },

    setTheme(theme: string) {
      document.body.setAttribute('data-theme', theme);
      this.localStore.theme = theme;
    },

    darkmodeChanged() {
      this.localStore.darkmode = this.darkmodeToogle;
    },

    deleteAccount() {
      let data = {
        password: this.deleteAccountPassword,
      };
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
        data: data,
      };
      api
        .delete('/auth/delete', config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Deleted your account');
            this.localStore.setAuthState(false);
            this.localStore.setHeaderInfo(defaultHeaderInformation());
            this.$router.push('/');
            LocalStorage.remove('header');
          } else if (response.status == 244) {
            this.notify('negative', 'Current Password is wrong.');
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },

    updateUsername() {
      let data = {
        new_username: this.newUsername,
        password: this.changeUsernamePassword,
      };
      api
        .put('/auth/update/username', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Username has been changed!');
            this.getHeaderInfo();
            this.getAccountInformation();
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },

    updatePassword() {
      let data = {
        new_password: this.newPassword,
        password: this.changePasswordPassword,
      };
      api
        .put('/auth/update/password', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.clear_all();
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },

    updateEmail() {
      let data = {
        new_email: this.newEmail,
        password: this.changeEmailPassword,
      };
      api
        .put('/auth/update/email', data, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Email has been changed.');
            this.getAccountInformation();
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },

    clear_all() {
      api
        .post('/auth/logout', '', this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.localStore.setAuthState(false);
            LocalStorage.clear();
            this.localStore.setHeaderInfo({} as HeaderInformationType);
            LocalStorage.remove('header');
            this.$router.push('/');
            this.notify('positive', 'Password changed. Please login again.');
          }
        })
        .catch();
    },

    onRejected() {
      this.notify(
        'negative',
        'Something went wrong when uploading the picture. Check the requirements.'
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
      form_data.append('name', this.accountData.profile.name);
      form_data.append('location', this.accountData.profile.location);
      form_data.append('description', this.accountData.profile.description);
      form_data.append('status', this.accountData.profile.status);

      if (this.avatar != null) {
        form_data.append('avatar', this.avatar as Blob);
      }

      api
        .put('/profile/update', form_data, config)
        .then((response) => {
          if (response.status == 200) {
            this.getAccountInformation();
            // set selections back to null
            this.avatar = null;
            this.loading = false;

            this.notify('positive', 'Saved!');
          } else {
            this.loading = false;
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          this.loading = false;
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },

    // get account settings
    getAccountInformation() {
      api
        .get('/profile/account', this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.accountData = response.data;
            this.avatarPreview =
              response.data.profile.avatar + '?' + Math.random();

            this.initialFetch = true;
            this.initialFetchSuccessful = true;
          } else {
            this.notify('negative', response.data.error);
            this.initialFetch = true;
            this.initialFetchSuccessful = false;
            this.accountData = defaultAccountSettings();
          }
        })
        .catch((error) => {
          this.initialFetch = true;
          this.initialFetchSuccessful = false;
          this.accountData = defaultAccountSettings();
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
        });
    },
  },
};
</script>
