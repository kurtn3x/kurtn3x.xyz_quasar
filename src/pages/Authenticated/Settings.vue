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
          <div class="text-red text-body1 text-weight-bolder text-center">
            This will delete your account and all data associated with it.
          </div>
          <q-input
            autofocus
            v-model="deleteAccountPassword"
            :color="darkmode ? 'white' : 'dark'"
            label="Current Password"
            :type="isPwd ? 'password' : 'text'"
            outlined
            class="q-mt-md"
          >
            <template v-slot:prepend>
              <q-icon name="lock" />
            </template>
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility' : 'visibility_off'"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </div>

        <q-separator class="q-mt-sm" />

        <q-card-actions align="center" class="q-mt-sm q-mb-sm row">
          <q-btn
            v-close-popup
            push
            icon="close"
            label="Cancel"
            class="bg-red text-white col"
          />
          <q-btn
            push
            class="bg-green text-white col"
            icon="done"
            size="md"
            label="Delete"
            @click="deleteAccount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-page class="column">
      <q-card bordered flat class="q-ma-sm bg-transparent">
        <q-separator size="1px" :color="darkmode ? 'white' : 'dark'" />
        <q-tabs
          inline-label
          v-model="tab"
          class="full-width"
          align="justify"
          indicator-color="transparent"
          active-color="layout-text"
          active-bg-color="primary"
        >
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />

          <q-tab name="site" icon="settings_applications" label="Site" />
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />

          <q-tab name="profile" icon="person" label="Profile" />
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />

          <q-tab name="account" icon="admin_panel_settings" label="Account" />
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />
        </q-tabs>
        <q-separator size="1px" :color="darkmode ? 'white' : 'dark'" />

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
                    <template v-for="theme in themes" :key="theme.name">
                      <q-item
                        clickable
                        @click="setTheme(theme.name)"
                        :class="theme.preview"
                      />
                    </template>
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
            <q-card flat class="q-ma-sm bg-transparent lt-md">
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
                          v-model="profileData.name"
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
                          v-model="profileData.location"
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
                          v-model="profileData.status"
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
                          v-model="profileData.description"
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
                          Recommended Profile Picture Aspect Ratio: Square
                          <br />
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
            <q-card flat class="bg-transparent q-ma-sm gt-sm">
              <div class="text-h4 text-center q-mt-lg">Profile Settings</div>
              <q-card-section class="row justify-center">
                <q-form
                  class="q-gutter-sm text-grey q-mt-md"
                  @submit.prevent="updateUserProfile"
                >
                  <q-input
                    v-model="profileData.name"
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
                    v-model="profileData.location"
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
                    v-model="profileData.status"
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
                    v-model="profileData.description"
                    style="max-width: 600px"
                    label="Description"
                    input-class="text-body1"
                    :color="darkmode ? 'white' : 'black'"
                    type="textarea"
                    outlined
                    lazy-rules
                    :rules="[
                      (val) =>
                        val.length < 255 || 'Max Length = 255 characters',
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

              <q-card-section class="full-width text-body1">
                <q-item>
                  <q-item-section side style="width: 100px">
                    Id:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ accountData.id }}
                  </q-item-section>
                </q-item>
                <q-separator />

                <q-item>
                  <q-item-section side style="width: 100px">
                    Username:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ accountData.username }}
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section side style="width: 100px">
                    Email:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ accountData.email }}
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section side style="width: 100px">
                    Is Admin:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ accountData.isAdmin }}
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section side style="width: 100px">
                    Joined:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ profileData.dateJoined }}
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section side style="width: 100px">
                    Name:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ profileData.name }}
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section side style="width: 100px">
                    Location:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ profileData.location }}
                  </q-item-section>
                </q-item>

                <q-separator />

                <q-item>
                  <q-item-section side style="width: 100px">
                    Status:
                  </q-item-section>
                  <q-item-section style="line-break: anywhere">
                    {{ profileData.status }}
                  </q-item-section>
                </q-item>

                <q-separator />
              </q-card-section>

              <q-card-actions class="justify-center">
                <q-list bordered class="full-width" style="max-width: 750px">
                  <q-expansion-item
                    class="full-width text-center"
                    label="Change E-Mail"
                    header-style="fontSize: 1.6em"
                    group="expansions"
                  >
                    <q-separator />

                    <q-form
                      class="q-ma-md q-mt-lg"
                      @submit.prevent="updateEmail"
                    >
                      <div class="row justify-center">
                        <q-input
                          v-model="updateEmailData.newEmail"
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
                              (val && val.length > 3) ||
                              'At least 4 characters',
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
                          v-model="updateEmailData.password"
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
                          v-model="updatePasswordData.newPassword"
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
                              (val && val.length > 7) ||
                              'At least 8 characters',
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
                          v-model="updatePasswordData.newPasswordConfirm"
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
                              val == updatePasswordData.newPassword ||
                              'Passwords do not match',
                          ]"
                        >
                          <template v-slot:prepend>
                            <q-icon name="lock" />
                          </template>
                        </q-input>
                      </div>
                      <div class="row justify-center">
                        <q-input
                          v-model="updatePasswordData.password"
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
    </q-page>
  </div>
</template>

<script lang="ts">
import { Ref, ref } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { apiGet, apiPut, apiDelete } from 'src/apiWrapper';
import { useLocalStore } from 'stores/localStore';
import { defaultHeaderInformation } from 'src/types/defaults';
import {
  AccountType,
  UserProfileType,
  HeaderInformationType,
} from 'src/types/index';
import { themes } from 'components/themes';

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
      themes,
      darkmodeToogle,
      axiosConfig,
      tab: ref('site'),
      localStore,
      q,
      loading: ref(false),

      // data
      avatar: ref(null) as Ref<any | Blob | MediaSource | null>,
      avatarPreview: ref(null) as Ref<string | null>,
      accountData: ref({}) as Ref<AccountType>,
      profileData: ref({}) as Ref<UserProfileType>,

      // show / hide password fields
      isPwd: ref(true),
      isPwd1: ref(true),
      isPwd2: ref(true),
      isPwd3: ref(true),

      //fetch initialInformation
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),

      // password confirmations for change username, email & password
      updateEmailData: ref({ newEmail: '', password: '' }),
      updatePasswordData: ref({
        newPassword: '',
        newPasswordConfirm: '',
        password: '',
      }),

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
  },
  watch: {
    darkmode(newVal) {
      this.darkmodeToogle = newVal;
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
      });
    },

    getHeaderInfo() {
      const config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      apiGet('/profile/headerinfo', config).then((apiData) => {
        if (apiData.error == false) {
          this.localStore.setHeaderInfo(apiData.data as HeaderInformationType);
          this.localStore.setAuthState(true);
        } else {
          this.notify('negative', apiData.errorMessage);
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
      apiDelete('/auth/account', config).then((apiData) => {
        if (apiData.error == false) {
          this.notify('positive', 'Deleted.');
          this.localStore.setAuthState(false);
          this.localStore.setHeaderInfo(defaultHeaderInformation());
          this.$router.push('/');
          LocalStorage.remove('header');
        } else {
          this.notify('negative', apiData.errorMessage);
        }
      });
    },

    updatePassword() {
      apiPut('/auth/account', this.updatePasswordData, this.axiosConfig).then(
        (apiData) => {
          if (apiData.error == false) {
            this.updatePasswordData = {
              newPassword: '',
              newPasswordConfirm: '',
              password: '',
            };
          } else {
            this.notify('negative', apiData.errorMessage);
          }
        }
      );
    },

    updateEmail() {
      apiPut('/auth/update', this.updateEmailData, this.axiosConfig).then(
        (apiData) => {
          if (apiData.error == false) {
            this.getAccountInformation();
            this.updateEmailData = { newEmail: '', password: '' };
          } else {
            this.notify('negative', apiData.errorMessage);
          }
        }
      );
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
      form_data.append('name', this.profileData.name);
      form_data.append('location', this.profileData.location);
      form_data.append('description', this.profileData.description);
      form_data.append('status', this.profileData.status);

      if (this.avatar != null) {
        form_data.append('avatar', this.avatar as Blob);
      }

      apiPut('/profile/update', form_data, config).then((apiData) => {
        if (apiData.error == false) {
          this.getAccountInformation();
          // set selections back to null
          this.avatar = null;
          this.loading = false;
        } else {
          this.notify('negative', apiData.errorMessage);
        }
      });
    },

    // get account settings
    getAccountInformation() {
      apiGet('/auth/account', this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.accountData = apiData.data as AccountType;
          apiGet('/profile/profile', this.axiosConfig).then((apiData) => {
            if (apiData.error == false) {
              this.profileData = apiData.data as UserProfileType;
              this.avatarPreview =
                this.profileData.avatar + '?' + Math.random();
              this.initialFetch = true;
              this.initialFetchSuccessful = true;
            } else {
              this.notify('negative', apiData.errorMessage);
              this.initialFetch = true;
              this.initialFetchSuccessful = false;
            }
          });
        } else {
          this.notify('negative', apiData.errorMessage);
          this.initialFetch = true;
          this.initialFetchSuccessful = false;
        }
      });
    },
  },
};
</script>
