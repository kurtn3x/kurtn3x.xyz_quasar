<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div
    v-if="initialFetch && !initialFetchSuccessful"
    class="text-center q-pa-md flex flex-center"
    :key="user.id"
  >
    <div>
      <div class="text-h5 q-mt-md">User not found.</div>
    </div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful" :key="user.id">
    <div v-if="!small" class="q-ma-md">
      <div class="row">
        <q-card
          bordered
          flat
          class="bg-layout-bg text-layout-text full-height q-mr-md col-2"
        >
          <q-card-section style="height: 200px" class="items-center">
            <div class="row justify-center">
              <q-avatar rounded size="150px">
                <q-img
                  :src="user.avatar"
                  style="border-radius: 10%; height: 150px"
                >
                  <q-icon
                    class="bg-white absolute-bottom-right all-pointer-events q-mt-sm q-ml-sm"
                    :name="user.role == 'Admin' ? 'shield' : 'account_circle'"
                    :color="user.role == 'Admin' ? 'red' : 'blue'"
                    size="30px"
                    style="border-radius: 30%"
                  >
                    <q-tooltip
                      :class="user.role == 'Admin' ? 'bg-red' : 'bg-blue'"
                      class="text-white text-body1"
                    >
                      {{ user.role }}
                    </q-tooltip>
                  </q-icon>
                </q-img>
              </q-avatar>
            </div>

            <div
              class="ellipsis text-h6 text-weight-bolder q-mt-sm text-center"
            >
              {{ user.username }}

              <q-tooltip
                class="text-h6"
                :class="darkmode ? 'bg-dark text-white' : 'bg-white text-dark'"
                >{{ user.username }}</q-tooltip
              >
            </div>
          </q-card-section>

          <q-card-actions vertical class="full-width">
            <q-separator color="layout-text" size="2px" />
            <q-btn
              size="xl"
              outline
              stretch
              color="layout-text"
              icon="chat"
              style="height: 60px"
              class="q-mt-md"
              unelevated
            >
              <q-tooltip
                class="text-body2"
                anchor="bottom middle"
                self="center middle"
              >
                Start a Conversation
              </q-tooltip>
            </q-btn>
            <q-separator />
            <q-btn
              size="xl"
              outline
              stretch
              color="layout-text"
              icon="person_add"
              style="height: 60px"
              class="q-mt-sm"
            >
              <q-tooltip
                class="text-body2"
                anchor="bottom middle"
                self="center middle"
              >
                Add as Friend
              </q-tooltip>
            </q-btn>
            <q-separator />
            <q-btn
              size="xl"
              outline
              stretch
              color="layout-text"
              icon="share"
              style="height: 60px"
              class="q-mt-sm"
            >
              <q-tooltip
                anchor="bottom middle"
                self="center middle"
                class="text-body2"
              >
                Copy the profile link
              </q-tooltip>
              <q-menu>
                <q-list style="min-width: 200px">
                  <q-input filled square v-model="userlink" readonly />
                  <q-item
                    clickable
                    @click="copyToClipboard(userlink)"
                    class="justify-center text-body1"
                  >
                    Copy the link</q-item
                  >
                </q-list>
              </q-menu>
            </q-btn>
            <q-separator />
          </q-card-actions>
        </q-card>

        <div class="col">
          <q-card flat bordered class="full-height bg-transparent">
            <q-separator color="primary" size="2px" />
            <q-tabs
              v-model="profile_tab"
              align="justify"
              inline-label
              indicator-color="transparent"
              active-color="layout-text"
              active-bg-color="layout-bg"
            >
              <q-separator vertical color="primary" size="2px" />

              <q-tab name="about" icon="person" label="About" />
              <q-tab name="placeholder" icon="block" label="Placeholder" />
              <q-separator vertical color="primary" size="2px" />
            </q-tabs>
            <q-separator size="2px" color="primary" />
            <q-tab-panels v-model="profile_tab" animated class="bg-transparent">
              <q-tab-panel name="about" style="min-height: 300px">
                <q-card flat class="full-width full-height bg-transparent">
                  <q-splitter :model-value="50">
                    <template v-slot:before>
                      <div class="text-h5">About</div>
                      <q-separator />
                      <q-card-section horizontal>
                        <q-card-section class="q-mr-md q-ml-md bg-transparent">
                          <div
                            class="text-h6 text-weight-bolder"
                            style="height: 40px"
                          >
                            Name
                          </div>
                          <div
                            class="q-mt-sm text-h6 text-weight-bolder"
                            style="height: 40px"
                          >
                            Location
                          </div>
                          <div
                            class="q-mt-sm text-h6 text-weight-bolder"
                            style="height: 40px"
                          >
                            Joined
                          </div>
                          <div
                            class="q-mt-sm text-h6 text-weight-bolder"
                            style="height: 40px"
                          >
                            Status
                          </div>
                          <div
                            class="q-mt-sm text-h6 text-weight-bolder"
                            style="height: 40px"
                          >
                            Role
                          </div>
                        </q-card-section>

                        <q-separator vertical />

                        <q-card-section class="q-ml-md">
                          <div class="text-h6" style="height: 40px">
                            {{ user.name }}
                          </div>
                          <div class="q-mt-sm text-h6" style="height: 40px">
                            {{ user.location }}
                          </div>
                          <div class="q-mt-sm text-h6" style="height: 40px">
                            {{ user.date_joined }}
                          </div>
                          <div class="q-mt-sm text-h6" style="height: 40px">
                            {{ user.status }}
                          </div>
                          <div class="q-mt-sm text-h6" style="height: 40px">
                            {{ user.role }}
                          </div>
                        </q-card-section>
                      </q-card-section>
                    </template>
                    <template v-slot:after>
                      <div class="text-h6 q-ml-md text-weight-bolder">
                        Description
                      </div>
                      <q-separator />

                      <div class="text-h6 q-mt-sm q-ml-lg">
                        {{ user.description }}
                      </div>
                      <q-card-section horizontal> </q-card-section>
                    </template>
                  </q-splitter>
                </q-card>
              </q-tab-panel>
            </q-tab-panels>
          </q-card>
        </div>
      </div>
    </div>
    <div v-if="small" class="q-ma-sm">
      <q-card flat bordered class="bg-transparent">
        <div style="height: 225px" class="bg-layout-bg">
          <div class="row justify-center items-center">
            <q-avatar
              size="140px"
              text-color="white"
              style="z-index: 99; border-radius: 10%"
              square
              class="q-mt-lg"
            >
              <q-img :src="user.avatar" style="height: 150px" />
            </q-avatar>
          </div>
          <div
            class="text-h5 text-center text-weight-bolder q-mt-md text-layout-text"
          >
            {{ user.username }}
          </div>
        </div>
        <div class="text-center text-body1">
          <div class="q-mt-md">
            <div v-if="user.role == 'Admin'" class="text-red">
              Administrator
              <q-icon name="shield" />
            </div>
            <div v-else class="text-light-blue">
              User
              <q-icon name="account_circle" />
            </div>
          </div>
        </div>
        <q-separator size="2px" color="primary" class="q-mt-md" />

        <q-tabs
          v-model="profile_tab"
          align="justify"
          inline-label
          indicator-color="transparent"
          active-color="layout-text"
          active-bg-color="layout-bg"
          class="bg-transparent"
        >
          <q-separator vertical color="layout-bg" />

          <q-tab name="about" icon="person" label="About" />
          <q-separator vertical size="2px" color="primary" />
          <q-tab name="placeholder" icon="block" label="Placeholder" />
          <q-separator vertical size="2px" color="primary" />
        </q-tabs>
        <q-separator size="2px" color="primary" />
        <q-tab-panels v-model="profile_tab" animated class="bg-transparent">
          <q-tab-panel name="about" class="bg-transparent">
            <q-card flat class="bg-transparent">
              <q-card-section horizontal class="full-width bg-transparent">
                <q-card-section class="full-width bg-transparent">
                  <div class="text-body1 q-mt-sm" style="height: 55px">
                    <a class="text-weight-bolder">Name</a>
                    <div style="line-break: anywhere" class="q-mb-sm">
                      {{ user.name }}
                    </div>
                  </div>
                  <q-separator />

                  <div class="text-body1 q-mt-sm" style="height: 55px">
                    <a class="text-weight-bolder">Location</a>
                    <div style="line-break: anywhere" class="q-mb-sm">
                      {{ user.location }}
                    </div>
                  </div>
                  <q-separator />

                  <div class="text-body1 q-mt-sm" style="height: 55px">
                    <a class="text-weight-bolder">Joined</a>
                    <div style="line-break: anywhere" class="q-mb-sm">
                      {{ user.date_joined }}
                    </div>
                  </div>
                  <q-separator />

                  <div class="text-body1 q-mt-sm" style="height: 55px">
                    <a class="text-weight-bolder">Status</a>
                    <div style="line-break: anywhere" class="q-mb-sm">
                      {{ user.status }}
                    </div>
                  </div>
                  <q-separator />

                  <div class="text-body1 q-mt-sm" style="height: 55px">
                    <a class="text-weight-bolder">Role</a>
                    <div style="line-break: anywhere" class="q-mb-sm">
                      {{ user.role }}
                    </div>
                  </div>
                </q-card-section>
              </q-card-section>
              <q-separator size="3px" />
              <q-card-section>
                <div class="text-h6">Description:</div>
                <div class="text-body1 q-mt-sm q-ml-lg">
                  {{ user.description }}
                </div>
              </q-card-section>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
        <q-card-actions class="row justify-center">
          <q-btn size="lg" flat stretch color="primary" icon="chat" />
          <q-btn size="lg" flat stretch color="primary" icon="person_add" />
          <q-btn size="lg" flat stretch color="primary" icon="share">
            <q-menu>
              <q-list style="min-width: 300px">
                <q-input filled square v-model="userlink" readonly />
                <q-item
                  clickable
                  @click="copyToClipboard(userlink)"
                  class="justify-center"
                >
                  Copy the link</q-item
                >
              </q-list>
            </q-menu>
          </q-btn>
        </q-card-actions>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, Ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';
import { UserProfileType } from 'src/types/index';

export default {
  name: 'UserProfile',

  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      splitter: ref(50),
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),
      axiosConfig,
      user: ref({}) as Ref<UserProfileType>,
      q,
      localStore,
      loading: ref(false),
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
    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    // copy a text to clipboard
    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      this.notify('positive', 'Copied to clipboard.');
    },

    getUser() {
      var user = this.$route.params.username;
      api
        .get('/profile/user/' + user, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.user = response.data;
            this.userlink = 'kurtn3x.xyz/id/' + this.user.id;
            this.initialFetch = true;
            this.initialFetchSuccessful = true;
          } else {
            this.notify('negative', response.data.error);
            this.initialFetch = true;
            this.initialFetchSuccessful = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
          this.initialFetch = true;
          this.initialFetchSuccessful = false;
        });
    },
  },
};
</script>
