<template>
  <div v-if="this.user.fetched && this.page_load">
    <div class="q-ma-sm">
      <q-card class="gt-sm" style="background-color: transparent">
        <div class="row">
          <div style="width: 90%">
            <q-img :src="this.user.background" style="height: 200px" />

            <q-avatar
              rounded
              size="200px"
              style="
                top: -0.7em;
                left: 0.2em;
                z-index: 101;
                max-height: 0px;
                border-radius: 20%;
              "
              class="justify-center"
            >
              <img :src="this.user.avatar" />
            </q-avatar>
            <div
              style="left: 18em; top: 9em; max-height: 150px"
              class="absolute-left"
            >
              <div class="row">
                <div
                  class="text-h2 text-weight-bolder q-mt-sm q-ml-sm q-mr-md text-primary"
                >
                  {{ this.user.username }}
                </div>
                <!-- more roles -> colors -->

                <q-btn
                  :label="this.user.role"
                  :color="this.user.role == 'Admin' ? 'red' : 'light-blue'"
                  size="sm"
                  class="q-mt-lg q-ml-md"
                  style="height: 30px"
                >
                  <q-tooltip
                    anchor="bottom middle"
                    self="center middle"
                    class="text-body1"
                    :class="
                      this.user.role == 'Admin' ? 'bg-red' : 'bg-light-blue'
                    "
                  >
                    Role: {{ this.user.role }}
                  </q-tooltip>
                </q-btn>
              </div>
              <div class="text-body1 q-mt-md q-ml-md q-mr-md q-mt-xs">
                <a v-if="this.user.location != ''"
                  >from {{ this.user.location }},</a
                >
                last seen
                {{ this.user.last_seen }}
              </div>
            </div>
            <q-card-section
              style="
                padding: 0;
                margin: 0;
                top: 5em;
                min-height: 470px;
                background-color: transparent;
              "
            >
              <div v-if="!small">
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

                <q-tab-panels
                  v-model="profile_tab"
                  animated
                  style="background-color: transparent"
                >
                  <q-tab-panel
                    name="about"
                    style="background-color: transparent"
                  >
                    <q-card flat style="background-color: transparent">
                      <q-card-section
                        class="row justify-center"
                        style="background-color: transparent"
                      >
                        <q-card
                          flat
                          class="q-ml-lg"
                          style="background-color: transparent"
                        >
                          <div class="text-h6">About</div>
                          <q-separator />
                          <q-card-section horizontal>
                            <q-card-section>
                              <div class="text-body1">Name</div>
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
                    <div class="text-h6">Comments</div>
                    <a>Placeholder</a>
                  </q-tab-panel>

                  <q-tab-panel name="postings">
                    <div class="text-h6">Placeholder</div>
                    <a>Placeholder</a>
                  </q-tab-panel>
                </q-tab-panels>
              </div>
            </q-card-section>
          </div>
          <q-card
            style="width: 10%; height: 200px"
            v-if="authenticated"
            bordered
          >
            <q-card-actions vertical class="q-pa-none q-mt-xs">
              <q-btn size="xl" flat stretch color="primary" icon="chat">
                <q-tooltip
                  class="text-body2"
                  anchor="bottom middle"
                  self="center middle"
                >
                  Start a Conversation
                </q-tooltip>
              </q-btn>
              <q-separator />
              <q-btn size="xl" flat stretch color="primary" icon="person_add">
                <q-tooltip
                  class="text-body2"
                  anchor="bottom middle"
                  self="center middle"
                >
                  Add as Friend
                </q-tooltip>
              </q-btn>
              <q-separator />
              <q-btn size="xl" flat stretch color="primary" icon="share">
                <q-tooltip
                  anchor="bottom middle"
                  self="center middle"
                  class="text-body2"
                >
                  Copy the profile link
                </q-tooltip>
                <q-menu>
                  <q-list style="min-width: 390px">
                    <q-input filled square v-model="this.userlink" readonly />
                    <q-item
                      clickable
                      @click="copyuserlink"
                      class="justify-center text-body1"
                    >
                      Copy the link</q-item
                    >
                  </q-list>
                </q-menu>
              </q-btn>
            </q-card-actions>
          </q-card>
        </div>
      </q-card>

      <q-card class="lt-md" bordered style="background-color: transparent">
        <q-img :src="this.user.background" style="height: 200px" />

        <q-avatar
          round="round"
          size="150px"
          text-color="white"
          style="z-index: 99; top: 0.66em; border-radius: 20%"
          class="absolute-center"
        >
          <img :src="this.user.avatar" />
        </q-avatar>
        <q-card-section>
          <div class="text-h5 text-center text-weight-bolder lt-md">
            <a>{{ this.user.username }}</a>
          </div>
          <div class="text-center text-caption q-mt-sm">
            <!-- more roles -> colors -->
            <a
              :class="
                this.user.role == 'Admin' ? 'text-red' : 'text-light-blue'
              "
            >
              Role: {{ this.user.role }}
            </a>
            <a class="q-ml-lg">Last Seen: {{ this.user.last_seen }} </a>
          </div>
          <div class="text-center text-caption q-mt-sm">
            <a v-if="this.user.status != ''">Status: {{ this.user.status }} </a>
          </div>
        </q-card-section>
        <q-separator></q-separator>
        <q-card-section style="padding: 0" class="transparent">
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
                  <q-card flat class="q-ml-lg full-width">
                    <div class="text-h5 text-center text-weight-bold">
                      About
                    </div>
                    <q-separator></q-separator>
                    <q-card-section horizontal class="full-width">
                      <q-card-section class="full-width">
                        <div class="text-body1 q-mt-md">
                          <a class="text-weight-bolder">Name</a>
                          <a style="left: 125px" class="absolute">
                            {{ this.user.name }}
                          </a>
                        </div>
                        <q-separator />

                        <div class="text-body1 q-mt-md">
                          <a class="text-weight-bolder">Location</a>
                          <a style="left: 125px" class="absolute">
                            {{ this.user.location }}
                          </a>
                        </div>
                        <q-separator />

                        <div class="text-body1 q-mt-md">
                          <a class="text-weight-bolder">Joined</a>
                          <a style="left: 125px" class="absolute">
                            {{ this.user.date_joined }}
                          </a>
                        </div>
                        <q-separator />

                        <div class="text-body1 q-mt-md">
                          <a class="text-weight-bolder">Last Seen</a>
                          <a style="left: 125px" class="absolute">
                            {{ this.user.last_seen }}
                          </a>
                        </div>
                        <q-separator />

                        <div class="text-body1 q-mt-md">
                          <a class="text-weight-bolder">Status</a>
                          <a style="left: 125px" class="absolute">
                            {{ this.user.status }}
                          </a>
                        </div>
                        <q-separator />

                        <div class="text-body1 q-mt-md">
                          <a class="text-weight-bolder">Role</a>
                          <a style="left: 125px" class="absolute">
                            {{ this.user.role }}
                          </a>
                        </div>
                        <q-separator />
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
              <div class="text-h6">Comments</div>
              <a>Placeholder</a>
            </q-tab-panel>

            <q-tab-panel name="postings">
              <div class="text-h6">Placeholder</div>
              <a>Placeholder</a>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
        <q-card-actions class="row justify-center">
          <q-btn size="lg" flat stretch color="primary" icon="chat" />
          <q-btn size="lg" flat stretch color="primary" icon="person_add" />
          <q-btn size="lg" flat stretch color="primary" icon="share">
            <q-menu>
              <q-list style="min-width: 300px">
                <q-input filled square v-model="this.userlink" readonly />
                <q-item clickable @click="copyuserlink" class="justify-center">
                  Copy the link</q-item
                >
              </q-list>
            </q-menu>
          </q-btn>
        </q-card-actions>
      </q-card>
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
    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axios_config,
      user: ref(defaultUser()),
      settingsStore,
      q,
      userStore,
      loading: ref(false),
      page_load: ref(false),
      profile_tab: ref('about'),
      user_found: ref(false),
      test: ref(false),
      userlink: ref('kurtn3x.xyz/id/'),
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
    authenticated() {
      return this.userStore.authenticated;
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
    selectuserlink() {
      var autoselect = document.getElementById('userlink');
      autoselect.select();
    },
    copyuserlink() {
      navigator.clipboard.writeText(this.userlink);
      this.notify('positive', 'copied the link');
    },

    getUser() {
      var user = this.$route.params.username;
      api
        .get('/profile/user/' + user, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.user = serializeUser(response.data);
            this.page_load = true;
            this.userlink = 'kurtn3x.xyz/id/' + this.user.id;
          } else {
            this.page_load = true;
            this.notify('negative', '' + response.data.error);
          }
        })
        .catch((error) => {
          this.page_load = true;
          // if (this.test) {
          this.user = defaultUser();
          this.user.fetched = true;
          // }
          this.notify('negative', 'API ERROR :/');
          console.log(error);
        });
    },
  },
};
</script>
