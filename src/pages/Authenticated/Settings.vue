<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    Something went wrong.
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <q-dialog v-model="confirm">
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm"
            >To change your username you will be logged out and have to relogin
            with your new credentials. </span
          >
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="red" v-close-popup />
          <q-btn
            flat
            label="Continue"
            color="green"
            v-close-popup
            @click="updateUsername"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="confirm_delete"
      @hide="
        this.current_password = '';
        this.isPwd = true;
      "
    >
      <q-card>
        <q-card-section class="row items-center">
          <span class="q-ml-sm text-red"
            >This will delete your account and all data associated with
            it.</span
          >
          <span class="q-ml-sm q-mt-sm"
            >Confirm with your password to continue</span
          >
          <q-card-section class="q-pt-none">
            <q-input
              class="q-mt-lg"
              dense
              autofocus
              v-model="current_password"
              label="Current Password"
              :type="isPwd ? 'password' : 'text'"
              lazy-rules
              :rules="[
                (val) => (val && val.length > 0) || 'Please type something',
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
          </q-card-section>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="red"
            v-close-popup
            @click="
              this.current_password = '';
              this.isPwd = true;
            "
          />
          <q-btn
            flat
            label="Continue"
            color="green"
            v-close-popup
            @click="deleteAccount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-tabs
      v-model="tab"
      :class="darkmode ? 'text-light ' : 'text-dark '"
      style="background: transparent"
    >
      <q-tab name="profile" icon="person" label="Profile" />
      <q-tab name="account" icon="admin_panel_settings" label="Account" />
      <q-tab name="other" icon="settings" label="Other" />
    </q-tabs>
    <q-separator />

    <q-tab-panels
      v-model="tab"
      swipeable="false"
      vertical
      :class="darkmode ? 'text-light' : 'text-dark'"
      style="background: transparent"
    >
      <q-tab-panel
        style="background: transparent"
        name="start"
        :class="darkmode ? 'text-light' : 'text-dark'"
        ><div class="text-h4 q-mt-lg text-center">
          The Settings Menu
        </div></q-tab-panel
      >
      <!-- PROFILE SETTINGS  -->
      <q-tab-panel
        name="profile"
        :class="darkmode ? 'text-light' : 'text-dark'"
        style="background: transparent"
      >
        <div class="text-h4 q-mb-xs text-center">Profile Settings</div>

        <q-card
          class="no-shadow q-ma-md q-pa-md"
          style="background: transparent"
          flat
          v-if="!small"
        >
          <q-card-section>
            <q-form
              class="q-gutter-sm text-grey"
              @submit.prevent="updateUserProfile"
            >
              <q-splitter model-value="50" disable>
                <template v-slot:before>
                  <div class="q-mr-sm">
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
                        (val) =>
                          val.length < 50 || 'Max Length = 50 characters',
                      ]"
                      style="max-width: 600px"
                    >
                      <template v-slot:append>
                        <q-icon
                          name="add_reaction"
                          class="button_hover"
                          v-if="name_edit"
                        >
                          <q-menu>
                            <EmojiPicker
                              :native="true"
                              @select="onSelectEmojiName"
                            />
                          </q-menu>
                          <q-tooltip> Add emoji</q-tooltip>
                        </q-icon>
                      </template>
                      <template v-slot:after>
                        <q-btn
                          :label="name_edit ? 'save' : 'edit'"
                          class="cursor-pointer bg-green q-ml-xl"
                          @click="
                            if (this.name_edit) {
                              this.name_edit = false;
                              updateUserProfile();
                            } else {
                              this.name_edit = true;
                            }
                          "
                          :loading="loading"
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
                        (val) =>
                          val.length < 50 || 'Max Length = 50 characters',
                      ]"
                      style="max-width: 600px"
                    >
                      <template v-slot:append>
                        <q-icon
                          name="add_reaction"
                          class="button_hover"
                          v-if="location_edit"
                        >
                          <q-menu>
                            <EmojiPicker
                              :native="true"
                              @select="onSelectEmojiLocation"
                            />
                          </q-menu>
                          <q-tooltip> Add emoji</q-tooltip>
                        </q-icon>
                      </template>
                      <template v-slot:after>
                        <q-btn
                          :label="location_edit ? 'save' : 'edit'"
                          class="cursor-pointer bg-green q-ml-md"
                          @click="
                            if (this.location_edit) {
                              this.location_edit = false;
                              updateUserProfile();
                            } else {
                              this.location_edit = true;
                            }
                          "
                          :loading="loading"
                        />
                      </template>
                    </q-input>

                    <q-input
                      :readonly="!status_edit"
                      dense
                      square
                      filled
                      v-model="status"
                      label="Status"
                      lazy-rules
                      :rules="[
                        (val) =>
                          val.length < 15 || 'Max Length = 15 characters',
                      ]"
                      style="max-width: 600px"
                    >
                      <template v-slot:append>
                        <q-icon
                          name="add_reaction"
                          class="button_hover"
                          v-if="status_edit"
                        >
                          <q-menu>
                            <EmojiPicker
                              :native="true"
                              @select="onSelectEmojiStatus"
                            />
                          </q-menu>
                          <q-tooltip> Add emoji</q-tooltip>
                        </q-icon>
                      </template>
                      <template v-slot:after>
                        <q-btn
                          :label="status_edit ? 'save' : 'edit'"
                          class="cursor-pointer bg-green q-ml-md"
                          @click="
                            if (this.status_edit) {
                              updateUserProfile();
                              this.status_edit = false;
                            } else {
                              this.status_edit = true;
                            }
                          "
                          :loading="loading"
                        />
                      </template>
                    </q-input>

                    <q-input
                      :readonly="!description_edit"
                      type="textarea"
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
                        <q-icon
                          name="add_reaction"
                          class="button_hover"
                          v-if="description_edit"
                        >
                          <q-menu>
                            <EmojiPicker
                              :native="true"
                              @select="onSelectEmojiDescription"
                            />
                          </q-menu>
                          <q-tooltip> Add emoji</q-tooltip>
                        </q-icon>
                      </template>
                      <template v-slot:after>
                        <q-btn
                          :label="description_edit ? 'save' : 'edit'"
                          class="cursor-pointer bg-green q-ml-md"
                          @click="
                            if (this.description_edit) {
                              this.description_edit = false;
                              updateUserProfile();
                            } else {
                              this.description_edit = true;
                            }
                          "
                          :loading="loading"
                        />
                      </template>
                    </q-input>
                  </div>
                </template>
                <template v-slot:after>
                  <div style="overflow: hidden" class="q-ml-md">
                    <q-file
                      v-model="avatar"
                      outlined
                      label="Profile Picture"
                      max-file-size="2048000"
                      accept=".jpg, .png, .gif, .jpeg"
                      @rejected="onRejected"
                      style="max-width: 400px"
                      counter
                    >
                      <template v-slot:before>
                        <q-avatar>
                          <img :src="this.account.profile.avatar" />
                        </q-avatar>
                      </template>
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                    </q-file>

                    <q-file
                      v-model="background"
                      outlined
                      label="Background Picture"
                      max-file-size="2048000"
                      accept=".jpg, .png, .gif, .jpeg"
                      @rejected="onRejected"
                      style="max-width: 400px"
                      counter
                      class="q-mt-lg"
                    >
                      <template v-slot:before>
                        <q-avatar>
                          <img :src="this.account.profile.background" />
                        </q-avatar>
                      </template>
                      <template v-slot:prepend>
                        <q-icon name="attach_file" />
                      </template>
                    </q-file>
                    <div class="text-body1 q-mt-xl q-ml-md">
                      Allowed Images: .jpg, .png, .gif, .jpeg, less than 2mb
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
                  :loading="loading"
                />
              </div>
            </q-form>
          </q-card-section>
        </q-card>
        <q-card
          class="no-shadow q-ma-md q-pa-md"
          style="background: transparent"
          flat
          v-if="small"
        >
          <q-card-section>
            <q-form
              class="q-gutter-sm text-grey"
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
                  <q-icon
                    name="add_reaction"
                    class="button_hover"
                    v-if="name_edit"
                  >
                    <q-menu>
                      <EmojiPicker :native="true" @select="onSelectEmojiName" />
                    </q-menu>
                    <q-tooltip> Add emoji</q-tooltip>
                  </q-icon>
                </template>
                <template v-slot:after>
                  <q-btn
                    :label="name_edit ? 'save' : 'edit'"
                    class="cursor-pointer bg-green q-ml-md"
                    @click="
                      if (this.name_edit) {
                        this.name_edit = false;
                        updateUserProfile();
                      } else {
                        this.name_edit = true;
                      }
                    "
                    :loading="loading"
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
                  <q-icon
                    name="add_reaction"
                    class="button_hover"
                    v-if="location_edit"
                  >
                    <q-menu>
                      <EmojiPicker
                        :native="true"
                        @select="onSelectEmojiLocation"
                      />
                    </q-menu>
                    <q-tooltip> Add emoji</q-tooltip>
                  </q-icon>
                </template>
                <template v-slot:after>
                  <q-btn
                    :label="location_edit ? 'save' : 'edit'"
                    class="cursor-pointer bg-green q-ml-md"
                    @click="
                      if (this.location_edit) {
                        this.location_edit = false;
                        updateUserProfile();
                      } else {
                        this.location_edit = true;
                      }
                    "
                    :loading="loading"
                  />
                </template>
              </q-input>

              <q-input
                :readonly="!status_edit"
                dense
                square
                filled
                v-model="status"
                label="Status"
                lazy-rules
                :rules="[
                  (val) => val.length < 15 || 'Max Length = 15 characters',
                ]"
                style="max-width: 600px"
              >
                <template v-slot:append>
                  <q-icon
                    name="add_reaction"
                    class="button_hover"
                    v-if="status_edit"
                  >
                    <q-menu>
                      <EmojiPicker
                        :native="true"
                        @select="onSelectEmojiStatus"
                      />
                    </q-menu>
                    <q-tooltip> Add emoji</q-tooltip>
                  </q-icon>
                </template>
                <template v-slot:after>
                  <q-btn
                    :label="status_edit ? 'save' : 'edit'"
                    class="cursor-pointer bg-green q-ml-md"
                    @click="
                      if (this.status_edit) {
                        this.status_edit = false;
                        updateUserProfile();
                      } else {
                        this.status_edit = true;
                      }
                    "
                    :loading="loading"
                  />
                </template>
              </q-input>

              <q-input
                :readonly="!description_edit"
                type="textarea"
                dense
                square
                filled
                v-model="description"
                label="Description"
                lazy-rules
                :rules="[
                  (val) => val.length < 255 || 'Max Length = 255 characters',
                ]"
                style="max-width: 600px"
              >
                <template v-slot:append>
                  <q-icon
                    name="add_reaction"
                    class="button_hover"
                    v-if="description_edit"
                  >
                    <q-menu>
                      <EmojiPicker
                        :native="true"
                        @select="onSelectEmojiDescription"
                      />
                    </q-menu>
                    <q-tooltip> Add emoji</q-tooltip>
                  </q-icon>
                </template>
                <template v-slot:after>
                  <q-btn
                    :label="description_edit ? 'save' : 'edit'"
                    class="cursor-pointer bg-green q-ml-md"
                    @click="
                      if (this.description_edit) {
                        this.description_edit = false;
                        updateUserProfile();
                      } else {
                        this.description_edit = true;
                      }
                    "
                    :loading="loading"
                  />
                </template>
              </q-input>

              <q-file
                v-model="avatar"
                outlined
                label="Profile Picture"
                max-file-size="2048000"
                accept=".jpg, .png, .gif, .jpeg"
                @rejected="onRejected"
                style="max-width: 400px"
                counter
              >
                <template v-slot:before>
                  <q-avatar>
                    <img :src="this.account.profile.avatar" />
                  </q-avatar>
                </template>
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
              <q-file
                v-model="background"
                outlined
                label="Background Picture"
                max-file-size="2048000"
                accept=".jpg, .png, .gif, .jpeg"
                @rejected="onRejected"
                style="max-width: 400px"
                counter
              >
                <template v-slot:before>
                  <q-avatar>
                    <img :src="this.account.profile.background" />
                  </q-avatar>
                </template>
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <div class="text-body1 text-center q-mt-md">
                Allowed Images: .jpg, .png, .gif, .jpeg, less than 2mb
              </div>

              <div class="row justify-center q-mt-lg">
                <q-btn
                  size="xl"
                  color="green"
                  label="Save"
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
        :class="darkmode ? 'text-light' : 'text-dark'"
        style="background: transparent"
      >
        <div class="text-h4 q-mb-xs text-center">Account Settings</div>
        <q-card style="background: transparent" flat>
          <q-card-section>
            <div class="text-body1">Id: {{ this.account.account.id }}</div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Username: {{ this.account.account.username }}
            </div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Email: {{ this.account.account.email }}
            </div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Admin: {{ this.account.account.is_admin }}
            </div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Joined: {{ this.account.account.date_joined }}
            </div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Name: {{ this.account.profile.name }}
            </div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Last Seen: {{ this.account.account.last_seen }}
            </div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Location: {{ this.account.profile.location }}
            </div>
            <q-separator />
            <div class="text-body1 q-mt-md">
              Status: {{ this.account.profile.status }}
            </div>
            <q-separator />
          </q-card-section>

          <q-card-actions vertical align="center">
            <q-expansion-item
              label="Change Username"
              header-style="fontSize: 1.3em"
              group="expansions"
            >
              <q-form
                class="q-gutter-md text-grey q-mt-lg"
                @submit.prevent="confirm = true"
              >
                <q-input
                  dense
                  square
                  filled
                  v-model="new_username"
                  label="New username"
                  lazy-rules
                  :rules="[
                    (val) => (val && val.length > 0) || 'Please type something',
                    (val) => (val && val.length > 3) || 'At least 4 characters',
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
                    (val) => (val && val.length > 0) || 'Please type something',
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
                  class="full-width q-mb-md"
                  label="Change Username"
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
                    (val) => (val && val.length > 0) || 'Please type something',
                    (val) => (val && val.length > 3) || 'At least 4 characters',
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
                    (val) => (val && val.length > 0) || 'Please type something',
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
                  class="full-width q-mb-md"
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
                    (val) => (val && val.length > 0) || 'Please type something',
                    (val) => (val && val.length > 7) || 'At least 8 characters',
                    (val) =>
                      (val && val.length < 100) ||
                      'Not more than 100 characters',
                    (val) =>
                      /(?=.*[a-z])/.test(val) || 'At least 1 lowercase letter',
                    (val) =>
                      /(?=.*[A-Z])/.test(val) || 'At least 1 uppercase letter',
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
                    (val) => (val && val.length > 0) || 'Please type something',
                    (val) => val == new_password || 'Passwords do not match',
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
                    (val) => (val && val.length > 0) || 'Please type something',
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
                  class="full-width q-mb-md"
                  label="Change Password"
                  type="submit"
                  :loading="loading"
                />
              </q-form>
            </q-expansion-item>
            <q-btn flat class="q-mt-md" @click="confirm_delete = true"
              >Delete Account</q-btn
            >
          </q-card-actions>
        </q-card>
      </q-tab-panel>
      <q-tab-panel
        name="other"
        :class="darkmode ? 'text-light' : 'text-dark'"
        style="background: transparent"
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
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import {
  serializeHeaderInformation,
  defaultHeaderInformation,
  path_to_link_av,
  path_to_link_bg,
} from 'src/models';
import EmojiPicker from 'vue3-emoji-picker';
import '../../../node_modules/vue3-emoji-picker/dist/style.css';
export default {
  name: 'SettingsView',
  components: { EmojiPicker },
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
      background: ref(null),
      name: ref(''),
      location: ref(''),
      description: ref(''),
      status: ref(''),
      q,
      userStore,
      loading: ref(false),
      name_edit: ref(false),
      description_edit: ref(false),
      location_edit: ref(false),
      status_edit: ref(false),
      isPwd: ref(true),
      isPwd1: ref(true),
      isPwd2: ref(true),
      isPwd3: ref(true),
      current_password: ref(''),
      new_password: ref(''),
      confirm_new_password: ref(''),
      new_username: ref(''),
      new_email: ref(''),
      confirm: ref(false),
      confirm_delete: ref(false),
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),
    };
  },

  created() {
    if (!this.userStore.authenticated) {
      this.$router.push('/');
      this.notify(
        'negative',
        'You are not allowed to access this page without being logged in.'
      );
    } else {
      this.getAccountInformation();
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
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },
    onSelectEmojiName(emoji) {
      this.name += emoji.i;
    },
    onSelectEmojiLocation(emoji) {
      this.location += emoji.i;
    },
    onSelectEmojiStatus(emoji) {
      this.status += emoji.i;
    },
    onSelectEmojiDescription(emoji) {
      this.description += emoji.i;
    },

    deleteAccount() {
      let data = {
        password: this.current_password,
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
            this.userStore.setAuthState(false);
            this.userStore.setHeaderInfo(defaultHeaderInformation());
            this.$router.push('/');
            LocalStorage.remove('header');
          } else if (response.status == 244) {
            this.notify('negative', 'Current Password is wrong.');
          } else {
            this.notify('negative', '' + response.data.error);
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          console.log(error);
        });
    },

    updateUsername() {
      let data = {
        new_username: this.new_username,
        password: this.current_password,
      };
      api
        .put('/auth/update/username', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            api
              .post('/auth/logout', '', this.axios_config)
              .then((response) => {
                if (response.status == 200) {
                  this.userStore.setAuthState(false);
                  LocalStorage.clear();
                  this.userStore.setHeaderInfo();
                  LocalStorage.remove('header');
                  window.location.replace('https://kurtn3x.xyz');
                }
              })
              .catch();
          } else if (response.status == 244) {
            this.notify('negative', 'Current Password is wrong.');
          } else {
            this.notify('negative', '' + response.data.error);
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
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
            this.notify('positive', 'Password has been changed.');
            api
              .post('/auth/logout', '', this.axios_config)
              .then((response) => {
                if (response.status == 200) {
                  this.userStore.setAuthState(false);
                  LocalStorage.clear();
                  this.userStore.setHeaderInfo();
                  LocalStorage.remove('header');
                  this.$router.push('/');
                  this.notify('positive', 'Please log in again.');
                }
              })
              .catch();
          } else if (response.status == 244) {
            this.notify('negative', 'Current Password is wrong.');
          } else {
            this.notify('negative', '' + response.data.error);
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          console.log(error);
        });
    },

    updateEmail() {
      let data = {
        new_email: this.new_email,
        password: this.current_password,
      };
      api
        .put('/auth/update/email', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Email has been changed.');
            this.getAccountInformation();
          } else if (response.status == 244) {
            this.notify('negative', 'Current Password is wrong.');
          } else {
            this.notify('negative', '' + response.data.error);
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
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

    onRejected() {
      this.notify(
        'negative',
        'Something went wrong when uploading the picture. Check if the picture meets the requirements: .jpg, .png, .gif, .jpeg, less than 2mb'
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
      form_data.append('status', this.status);

      if (this.avatar != null) {
        form_data.append('avatar', this.avatar);
      }
      if (this.background != null) {
        form_data.append('background', this.background);
      }

      api
        .put('/profile/update', form_data, config)
        .then((response) => {
          if (response.status == 200) {
            this.account = response.data;
            var header = serializeHeaderInformation(response.data);
            this.userStore.setHeaderInfo(header);
            this.loading = false;
            this.notify('positive', 'Saved!');
            this.name_edit = false;
            this.location_edit = false;
            this.status_edit = false;
            this.description_edit = false;
            this.account.profile.avatar = path_to_link_av(
              response.data.profile.avatar
            );
            this.account.profile.background = path_to_link_bg(
              response.data.profile.background
            );
          } else {
            this.loading = false;
            this.notify('negative', '' + response.data.error);
          }
        })
        .catch((error) => {
          this.loading = false;
          this.notify('negative', 'API ERROR :/');
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
            this.account.profile.avatar = path_to_link_av(
              response.data.profile.avatar
            );
            this.account.profile.background = path_to_link_bg(
              response.data.profile.background
            );
            this.name = response.data.profile.name;
            this.location = response.data.profile.location;
            this.description = response.data.profile.description;
            this.status = response.data.profile.status;
            this.initialFetch = true;
            this.initialFetchSuccessful = true;
          } else {
            this.notify('negative', '' + response.data.error);
            this.initialFetch = true;
          }
        })
        .catch((error) => {
          this.initialFetch = true;

          this.notify('negative', 'API ERROR :/');
          console.log(error);
        });
    },
  },
};
</script>

<style>
.button_hover:hover {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
