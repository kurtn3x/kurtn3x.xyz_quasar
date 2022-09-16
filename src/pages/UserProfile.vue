<template>
  <div v-if="this.user.fetched && this.page_load">
    <div class="q-ma-md">
      <q-card class="gt-sm" bordered style="background-color: transparent">
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
                <q-btn
                  :label="this.user.role"
                  color="primary"
                  size="sm"
                  class="q-mt-lg q-ml-md"
                  style="height: 30px"
                >
                  <q-tooltip anchor="bottom middle" self="center middle">
                    Role: {{ this.user.role }}
                  </q-tooltip>
                </q-btn>
              </div>
              <div class="text-body1 q-mt-md q-ml-md q-mr-md q-mt-xs">
                from {{ this.user.location }}, last seen
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
          </div>
          <q-card-actions vertical style="width: 10%">
            <q-btn size="xl" flat stretch color="primary" icon="chat">
              <q-tooltip
                class="text-body2"
                anchor="bottom middle"
                self="center middle"
              >
                Start a Conversation
              </q-tooltip>
            </q-btn>
            <q-btn
              size="xl"
              flat
              stretch
              color="primary"
              icon="person_add"
              class="q-mt-md"
            >
              <q-tooltip
                class="text-body2"
                anchor="bottom middle"
                self="center middle"
              >
                Add as Friend
              </q-tooltip>
            </q-btn>
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
            <a> Role: {{ this.user.role }} </a>
            <a class="q-ml-lg">Last Seen: {{ this.user.last_seen }} </a>
            <a class="q-ml-lg">Status: {{ this.user.status }} </a>
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
                  <q-card flat class="q-ml-lg">
                    <div class="text-h5 text-center text-weight-bold">
                      About
                    </div>
                    <q-separator></q-separator>
                    <q-card-section horizontal style="min-width: 320px">
                      <q-card-section>
                        <div class="row justify-between">
                          <div class="text-body1">Name</div>
                          <div class="text-body1">
                            {{ this.user.name }}
                          </div>
                        </div>
                        <q-separator />

                        <div class="row justify-between">
                          <div class="q-mt-sm text-body1">UserID  </div>
                          <p
                            class="q-mt-sm text-body1"
                            style="word-break: break-all"
                          >
                            {{ this.user.id }}
                          </p>
                        </div>
                        <q-separator />

                        <div class="row justify-between">
                          <div class="q-mt-sm text-body1">Location</div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.location }}
                          </div>
                        </div>
                        <q-separator />

                        <div class="row justify-between">
                          <div class="q-mt-sm text-body1">Joined</div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.date_joined }}
                          </div>
                        </div>
                        <q-separator />

                        <div class="row justify-between">
                          <div class="q-mt-sm text-body1">Last Seen</div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.last_seen }}
                          </div>
                        </div>
                        <q-separator />

                        <div class="row justify-between">
                          <div class="q-mt-sm text-body1">Status</div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.status }}
                          </div>
                        </div>
                        <q-separator />

                        <div class="row justify-between">
                          <div class="q-mt-sm text-body1">Role</div>
                          <div class="q-mt-sm text-body1">
                            {{ this.user.role }}
                          </div>
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
      test: ref(true),
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
