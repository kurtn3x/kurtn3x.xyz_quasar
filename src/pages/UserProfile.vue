<template>
  <div v-if="this.user.fetched && this.page_load">
    <q-dialog seamless v-model="edit_popup">
      <q-card bordered square class="no-shadow q-ma-md q-pa-md">
        <q-card-section class="row items-center q-pb-none">
          <p class="text-weight-bolder text-primary">Update your Profile</p>
          <q-space />
          <q-btn
            class="text-red"
            flat
            icon="close"
            round
            v-close-popup
            style="top: -2em; left: 2em"
          />
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
                (val) => (val && val.length > 0) || 'Please type something',
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
                (val) => (val && val.length > 0) || 'Please type something',
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
                (val) => (val && val.length > 0) || 'Please type something',
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
    </q-dialog>

    <div class="q-ma-xs">
      <q-card class="gt-sm" bordered style="background-color: transparent">
        <q-img :src="this.user.background" style="height: 200px" />

        <q-avatar
          round="round"
          size="150px"
          text-color="white"
          style="top: -1.25em; left: 0.2em; z-index: 101; max-height: 0px"
          class="justify-center"
        >
          <img :src="this.user.avatar" />
        </q-avatar>
        <div
          style="
            left: 14em;
            top: 24px;
            background-color: rgba(0, 0, 0, 0.3);
            max-height: 150px;
          "
          class="absolute-left"
        >
          <div
            class="text-light text-h4 text-weight-bolder q-mt-sm q-mb-sm q-ml-sm q-mr-md"
          >
            {{ this.user.username }}
          </div>

          <q-separator class="bg-white q-ml-sm q-mr-lg q-mt-xs" />
          <div class="text-body1 q-mt-sm text-light q-ml-md q-mr-md q-mt-xs">
            Status: {{ this.user.status }}
          </div>
          <div class="text-body1 q-mt-sm text-light q-ml-md q-mr-md q-mt-xs">
            Last Seen: {{ this.user.last_seen }}
          </div>
        </div>
        <q-card-actions
          vertical
          class="q-ma-sm absolute-right"
          style="background-color: rgba(0, 0, 0, 0.5); max-height: 183px"
        >
          <q-btn size="lg" flat stretch color="primary" icon="chat">
            <q-tooltip
              class="bg-primary text-body2"
              anchor="bottom left"
              self="center middle"
            >
              Start a Conversation
            </q-tooltip>
          </q-btn>
          <q-btn size="lg" flat stretch color="primary" icon="person_add">
            <q-tooltip
              class="bg-primary text-body2"
              anchor="bottom left"
              self="center middle"
            >
              Add as Friend
            </q-tooltip>
          </q-btn>
          <q-btn size="lg" flat stretch color="primary" icon="share">
            <q-tooltip
              anchor="bottom left"
              self="center middle"
              class="bg-primary text-body2"
            >
              Copy the profile link
            </q-tooltip>
          </q-btn>
        </q-card-actions>
        <q-card-section style="padding: 0; margin: 0; top: -1.5em">
          <div style="width: 100%" v-if="!small">
            <q-tabs
              v-model="profile_tab"
              active-color="primary"
              indicator-color="primary"
              align="justify"
            >
              <q-tab name="about" label="About" />
              <q-tab name="comments" label="Comments" />
              <q-tab name="postings" label="Recent Activity" />
            </q-tabs>

            <q-tab-panels v-model="profile_tab" animated>
              <q-tab-panel name="about">
                <q-card flat>
                  <q-card-section class="row justify-center">
                    <q-card flat class="q-ml-lg">
                      <div class="text-h6">About</div>
                      <q-separator />
                      <q-card-section horizontal>
                        <q-card-section>
                          <div class="text-body1">Name</div>
                          <div class="q-mt-sm text-body1">UserID</div>
                          <div class="q-mt-sm text-body1">Location</div>
                          <div class="q-mt-sm text-body1">Joined</div>
                          <div class="q-mt-sm text-body1">Last Seen</div>
                          <div class="q-mt-sm text-body1">Status</div>
                          <div class="q-mt-sm text-body1">Role</div>
                        </q-card-section>

                        <q-separator vertical class="q-mt-sm" />

                        <q-card-section>
                          <div class="text-body1">
                            {{ this.user.name }}
                          </div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.id }}
                          </div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.location }}
                          </div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.date_joined }}
                          </div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.last_seen }}
                          </div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.status }}
                          </div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.role }}
                          </div>
                        </q-card-section>
                      </q-card-section>
                    </q-card>
                    <q-separator vertical class="q-ml-xl" />
                    <q-card class="q-ml-xl" flat>
                      <div class="text-h6">Description</div>
                      <q-separator />

                      <div class="text-body1 q-mt-sm q-ml-lg">
                        {{ this.user.description }}
                      </div>
                      <q-card-section horizontal> </q-card-section>
                    </q-card>
                  </q-card-section>
                </q-card>
              </q-tab-panel>

              <q-tab-panel name="comments">
                <div class="text-h6">Alarms</div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </q-tab-panel>

              <q-tab-panel name="postings">
                <div class="text-h6">Movies</div>
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </q-tab-panel>
            </q-tab-panels>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="lt-md" bordered style="background-color: transparent">
        <q-img :src="this.user.background" style="height: 200px" />

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
          <div class="text-center text-caption q-mt-sm">
            <a> Role: {{ this.user.role }} </a>
            <a class="q-ml-lg">Last Seen: {{ this.user.last_seen }} </a>
            <a class="q-ml-lg">Status: {{ this.user.status }} </a>
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section style="padding: 0">
          <q-tabs
            v-model="profile_tab"
            active-color="primary"
            indicator-color="primary"
            align="justify"
          >
            <q-tab name="about" label="About" />
            <q-tab name="comments" label="Comments" />
            <q-tab name="postings" label="Recent Activity" />
          </q-tabs>
          <q-tab-panels v-model="profile_tab" animated>
            <q-tab-panel name="about">
              <q-card flat>
                <q-card-section class="row justify-center">
                  <q-card flat class="q-ml-lg">
                    <div class="text-h5 text-center text-weight-bold">
                      About
                    </div>
                    <q-separator></q-separator>
                    <q-card-section horizontal style="min-width: 320px">
                      <q-card-section>
                        <div class="text-body1">Name</div>
                        <div class="q-mt-sm text-body1">UserID</div>
                        <div class="q-mt-sm text-body1">Location</div>
                        <div class="q-mt-sm text-body1">Joined</div>
                        <div class="q-mt-sm text-body1">Last Seen</div>
                        <div class="q-mt-sm text-body1">Status</div>
                        <div class="q-mt-sm text-body1">Role</div>
                      </q-card-section>

                      <q-separator vertical class="q-mt-sm" />

                      <q-card-section>
                        <div class="text-body1">
                          {{ this.user.name }}
                        </div>
                        <div class="q-mt-sm text-body1">{{ this.user.id }}</div>
                        <div class="q-mt-sm text-body1">
                          {{ this.user.location }}
                        </div>
                        <div class="q-mt-sm text-body1">
                          {{ this.user.date_joined }}
                        </div>
                        <div class="q-mt-sm text-body1">
                          {{ this.user.last_seen }}
                        </div>
                        <div class="q-mt-sm text-body1">
                          {{ this.user.status }}
                        </div>
                        <div class="q-mt-sm text-body1">
                          {{ this.user.role }}
                        </div>
                      </q-card-section>
                    </q-card-section>
                    <q-separator class="q-mt-sm" />
                    <q-card-section>
                      <div class="text-h6">Description:</div>
                      <div class="text-body1 q-mt-sm q-ml-lg">
                        {{ this.user.description }}
                      </div>
                    </q-card-section>
                  </q-card>

                  <q-card-section horizontal> </q-card-section>
                </q-card-section>
              </q-card>
            </q-tab-panel>

            <q-tab-panel name="comments">
              <div class="text-h6">Alarms</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </q-tab-panel>

            <q-tab-panel name="postings">
              <div class="text-h6">Movies</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
        <q-card-actions class="row justify-center">
          <q-btn size="lg" flat stretch color="primary" icon="chat" />
          <q-btn size="lg" flat stretch color="primary" icon="person_add" />
          <q-btn size="lg" flat stretch color="primary" icon="share" />
        </q-card-actions>
      </q-card>
    </div>
    <div
      class="row justify-center q-mt-md"
      v-if="user.username == me.username || test"
    >
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
  </div>
  <div
    v-if="!this.user.fetched && this.page_load"
    class="text-center q-pa-md flex flex-center"
  >
    <div>
      <div style="font-size: 30vh">404</div>

      <div class="text-h2" style="opacity: 0.4">Oops. User not found.</div>

      <q-btn
        size="xl"
        class="q-mt-xl"
        text-color="primary"
        to="/"
        label="Go Home"
        no-caps
      />
    </div>
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
  name: 'UserProfile',

  setup() {
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    const q = useQuasar();

    return {
      user: ref(defaultUser()),
      me: userStore.user,
      name: ref(userStore.user.username),
      description: ref(userStore.user.description),
      location: ref(userStore.user.location),
      avatar: ref(''),
      background: ref(''),
      settingsStore,
      q,
      userStore,
      loading: ref(false),
      page_load: ref(false),
      avatar_hover: ref(false),
      edit_popup: ref(false),
      profile_tab: ref('about'),
      user_found: ref(false),
      test: ref(true),
    };
  },

  created() {
    this.getUser();
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

    uploadFile() {
      console.log('Uploading');
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
            this.user = serializeUser(response.data);
            this.userStore.setUser(this.user);
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
            this.user = serializeUser(response.data);
            this.userStore.setUser(this.user);
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

    getUser() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      var user = this.$route.params.id;
      api
        .get('/profile/user/' + user, config)
        .then((response) => {
          if (response.status == 200) {
            this.user = serializeUser(response.data);
            this.page_load = true;
          } else {
            this.page_load = true;
            this.notify('negative', 'User does not exist.');
          }
        })
        .catch((error) => {
          this.page_load = true;
          if (this.test) {
            this.user = defaultUser();
            this.user.fetched = true;
          }
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },
  },
};
</script>
