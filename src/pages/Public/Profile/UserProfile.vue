<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div
    v-if="initialFetch && !initialFetchSuccessful"
    class="text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="text-h5 q-mt-md">User not found.</div>
    </div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <q-page class="column">
      <div class="gt-sm q-ma-sm">
        <q-card
          bordered
          flat
          style="height: 200px"
          class="bg-primary text-layout-text"
        >
          <q-avatar
            rounded
            size="170px"
            class="absolute-left q-ml-lg bg-transparent"
            style="top: 15px"
          >
            <q-card
              class="bg-transparent"
              flat
              dark
              style="height: 170px; width: 170px"
            >
              <q-img
                :src="user.avatar"
                style="border-radius: 10%; height: 160px; width: 160px"
                class="q-ma-xs"
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
            </q-card>
          </q-avatar>
          <div class="absolute-bottom q-mb-lg" style="left: 240px">
            <div
              class="text-h4 text-weight-bolder text-layout-text text3d-primary non-selectable"
            >
              {{ user.username }}
            </div>
            <div class="text-body2 q-mt-sm">
              {{ user.role }}
            </div>
          </div>
          <q-card-actions
            class="absolute-right q-pa-none q-mr-xs"
            style="width: 150px; height: 200px"
            vertical
          >
            <q-btn
              size="lg"
              outline
              color="layout-text"
              icon="chat"
              style="height: 60px; width: 150px; top: 5px"
            >
              <q-tooltip
                class="text-body2"
                anchor="bottom middle"
                self="center middle"
              >
                Start a Conversation
              </q-tooltip>
            </q-btn>

            <q-btn
              size="lg"
              outline
              color="layout-text"
              icon="person_add"
              style="height: 60px; width: 150px; top: 5px"
            >
              <q-tooltip
                class="text-body2"
                anchor="bottom middle"
                self="center middle"
              >
                Add as Friend
              </q-tooltip>
            </q-btn>
            <q-btn
              size="lg"
              outline
              stretch
              color="layout-text"
              icon="share"
              style="height: 60px; width: 150px; top: 5px; bottom: 5px"
            >
              <q-tooltip
                anchor="bottom middle"
                self="center middle"
                class="text-body2"
              >
                Copy the profile link
              </q-tooltip>
              <q-menu>
                <q-input filled square v-model="userlink" readonly />
                <q-item
                  clickable
                  @click="copyToClipboard(userlink)"
                  class="justify-center text-body1"
                >
                  Copy the link</q-item
                >
              </q-menu>
            </q-btn>
          </q-card-actions>
        </q-card>

        <q-card
          flat
          bordered
          class="bg-transparent"
          :style="'min-height:' + screenHeight + 'px;'"
        >
          <q-separator size="1px" :color="darkmode ? 'white' : 'dark'" />
          <q-tabs
            v-model="profileTab"
            align="justify"
            inline-label
            indicator-color="transparent"
            active-color="layout-text"
            active-bg-color="primary"
          >
            <q-separator
              vertical
              size="1px"
              :color="darkmode ? 'white' : 'dark'"
            />

            <q-tab name="about" icon="person" label="About" />
            <q-separator
              vertical
              size="1px"
              :color="darkmode ? 'white' : 'dark'"
            />

            <q-tab name="placeholder" icon="block" label="Placeholder" />
            <q-separator
              vertical
              size="1px"
              :color="darkmode ? 'white' : 'dark'"
            />
          </q-tabs>
          <q-separator size="1px" :color="darkmode ? 'white' : 'dark'" />
          <q-tab-panels v-model="profileTab" animated class="bg-transparent">
            <q-tab-panel name="about">
              <q-card flat class="full-width full-height bg-transparent">
                <div class="text-h5 text-weight-bold">About</div>
                <q-separator class="q-mt-sm" />
                <q-card-section horizontal>
                  <q-card-section class="q-mr-sm q-ml-md bg-transparent">
                    <div
                      class="text-h6 text-weight-bolder items-center flex"
                      style="height: 45px"
                    >
                      Name
                    </div>

                    <div
                      class="text-h6 q-mt-sm text-weight-bolder items-center flex"
                      style="height: 45px"
                    >
                      Location
                    </div>
                    <div
                      class="text-h6 q-mt-sm text-weight-bolder items-center flex"
                      style="height: 45px"
                    >
                      Joined
                    </div>
                    <div
                      class="text-h6 q-mt-sm text-weight-bolder items-center flex"
                      style="height: 45px"
                    >
                      Status
                    </div>
                    <div
                      class="text-h6 q-mt-sm text-weight-bolder items-center flex"
                      style="height: 45px"
                    >
                      Role
                    </div>
                  </q-card-section>

                  <q-separator vertical />

                  <q-card-section class="q-ml-sm">
                    <div
                      class="text-body1 items-center flex"
                      style="height: 45px"
                    >
                      {{ user.name }}
                    </div>
                    <div
                      class="text-body1 items-center flex q-mt-sm"
                      style="height: 45px"
                    >
                      {{ user.location }}
                    </div>
                    <div
                      class="text-body1 items-center flex q-mt-sm"
                      style="height: 45px"
                    >
                      {{ user.dateJoined }}
                    </div>
                    <div
                      class="text-body1 items-center flex q-mt-sm"
                      style="height: 45px"
                    >
                      {{ user.status }}
                    </div>
                    <div
                      class="text-body1 items-center flex q-mt-sm"
                      style="height: 45px"
                    >
                      {{ user.role }}
                    </div>
                  </q-card-section>
                </q-card-section>
                <div class="text-h5 q-mt-lg text-weight-bold">Description</div>
                <q-separator class="q-mt-sm" />

                <q-card-section>
                  <div class="text-body1 q-mt-sm q-ml-lg">
                    {{ user.description }}
                  </div>
                </q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
      <div class="lt-md q-ma-xs">
        <q-card flat bordered class="bg-transparent q-ma-sm">
          <div style="height: 225px" class="bg-primary">
            <div class="row justify-center items-center">
              <q-avatar
                size="150px"
                style="z-index: 99; border-radius: 10%"
                class="q-mt-md"
              >
                <q-card
                  class="bg-transparent"
                  flat
                  style="height: 150px; width: 150px"
                  dark
                >
                  <q-img
                    :src="user.avatar"
                    style="height: 140px; width: 140px"
                    class="q-ma-xs"
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
                </q-card>
              </q-avatar>
            </div>
            <div
              class="text-h5 text-center text-weight-bolder q-mt-md text-layout-text text3d-primary non-selectable"
            >
              {{ user.username }}
            </div>
          </div>
          <q-separator size="1px" :color="darkmode ? 'white' : 'dark'" />

          <q-tabs
            v-model="profileTab"
            align="justify"
            inline-label
            indicator-color="transparent"
            active-color="layout-text"
            active-bg-color="primary"
            class="bg-transparent"
          >
            <q-separator
              vertical
              size="1px"
              :color="darkmode ? 'white' : 'dark'"
            />
            <q-tab name="about" icon="person" label="About" />
            <q-separator
              vertical
              size="1px"
              :color="darkmode ? 'white' : 'dark'"
            />
            <q-tab name="placeholder" icon="block" label="Placeholder" />
            <q-separator
              vertical
              size="1px"
              :color="darkmode ? 'white' : 'dark'"
            />
          </q-tabs>
          <q-separator size="1px" :color="darkmode ? 'white' : 'dark'" />
          <q-tab-panels v-model="profileTab" animated class="bg-transparent">
            <q-tab-panel name="about" class="bg-transparent">
              <q-card flat class="bg-transparent">
                <q-card-section horizontal class="full-width bg-transparent">
                  <q-card-section class="full-width bg-transparent">
                    <div class="text-body1">
                      <a class="text-weight-bolder">Name</a>
                      <div style="line-break: anywhere" class="q-mb-sm">
                        {{ user.name }}
                      </div>
                    </div>
                    <q-separator />

                    <div class="text-body1 q-mt-sm">
                      <a class="text-weight-bolder">Location</a>
                      <div style="line-break: anywhere" class="q-mb-sm">
                        {{ user.location }}
                      </div>
                    </div>
                    <q-separator />

                    <div class="text-body1 q-mt-sm">
                      <a class="text-weight-bolder">Joined</a>
                      <div style="line-break: anywhere" class="q-mb-sm">
                        {{ user.dateJoined }}
                      </div>
                    </div>
                    <q-separator />

                    <div class="text-body1 q-mt-sm">
                      <a class="text-weight-bolder">Status</a>
                      <div style="line-break: anywhere" class="q-mb-sm">
                        {{ user.status }}
                      </div>
                    </div>
                    <q-separator />

                    <div class="text-body1 q-mt-sm">
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
        </q-card>
      </div>
    </q-page>
  </div>
</template>

<script lang="ts">
import { ref, Ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';
import { UserProfileType } from 'src/types/index';
import { defaultUser } from 'src/types/defaults';

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
      profileTab: ref('about'),
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

    screenHeight() {
      return this.q.screen.height - 300;
    },
  },

  methods: {
    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
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
          this.user = defaultUser();
        });
    },
  },
};
</script>
