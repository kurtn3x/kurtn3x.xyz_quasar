<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="q-ma-md"
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
            <q-tab name="profile" icon="manage_accounts" label="Profile" />
            <q-tab name="account" icon="admin_panel_settings" label="Account" />
          </q-expansion-item>
          <q-expansion-item
            icon="public"
            label="Website settings"
            v-if="!small"
            header-style="fontSize: 1.3em"
          >
            <q-tab name="theme" icon="palette" label="Themes" />
            <q-tab name="other" icon="settings" label="Other" />
          </q-expansion-item>
          <div v-if="small">
            <q-tab name="profile" icon="manage_accounts" label="Profile" />
            <q-tab name="account" icon="admin_panel_settings" label="Account" />
            <q-tab name="theme" icon="palette" label="Themes" />
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
          <q-tab-panel
            name="profile"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <div class="text-h4 q-mb-md">Profile Settings</div>
            <!--  -->
            <!--
            <q-parallax
              :src="this.user.background"
              style="height: 400px"
              @mouseover="background_hover = true"
              @mouseleave="background_hover = false"
              :style="background_hover ? 'filter: brightness(50%);' : ''"
            />
            <q-avatar
              round="round"
              size="150px"
              text-color="white"
              @mouseover="avatar_hover = true"
              @mouseleave="avatar_hover = false"
              style="top: -2em; left: 0.1em"
            >
              <img
                :src="this.user.avatar"
                :style="avatar_hover ? 'filter: brightness(50%);' : ''" />
              <q-file
                v-if="avatar_hover"
                v-model="image"
                borderless
                hide-bottom-space
                style="
                  display: inline-block;
                  position: absolute;
                  z-index: 100;
                  height: 120px;
                  width: 120px;
                "
                @change="updateFile()"
                color="transparent"
                bg-color="transparent"
              >
                <q-icon
                  name="attach_file"
                  color="black"
                  class="q-mr-xl"
                  style="height: 120px"
                  size="22px"
                /> </q-file
            ></q-avatar>

            <q-card
              class="profile-card"
              v-if="!small"
              :class="darkmode ? 'bg-dark text-light' : 'bg-light text-dark'"
            >
              <q-card-section
                :class="darkmode ? 'bg-primarydark' : 'bg-primary'"
              >
                <div class="text-weight-bolder text-h4 q-pa-xs q-pl-md">
                  {{ user.username }}
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row justify-between">
                  <p class="text-h6 q-pt-md q-pl-lg">{{ user.first_name }}</p>

                  <p class="text-h6 q-pt-md q-pa-md">{{ user.last_name }}</p>

                  <p class="text-h6 q-pt-md q-pa-md">{{ user.phone }}</p>

                  <p class="text-h6 q-pt-md q-pa-md">Some Country</p>

                  <p class="text-h6 q-pt-md q-pa-md">Flag</p>
                </div>
              </q-card-section>
              <q-card-section>
                <div class="row justify-start q-pt-xl">
                  <p class="text-body q-pt-md q-pl-lg">Joined: 26.02.2002</p>

                  <p class="text-body-2 q-pt-md q-pa-md">
                    Total Posts: 9000000
                  </p>

                  <p class="text-body-2 q-pt-md q-pa-md">Status</p>
                </div>
              </q-card-section>
            </q-card> -->

            <q-card
              class="profile-card2"
              flat
              bordered
              style="background-color: transparent"
            >
              <q-parallax
                :src="this.user.background"
                :style="background_hover ? 'filter: brightness(50%);' : ''"
                style="height: 200px"
              />

              <q-avatar
                round="round"
                size="150px"
                text-color="white"
                @mouseover="avatar_hover = true"
                @mouseleave="avatar_hover = false"
                style="
                  top: -1.2em;
                  left: 0.1em;
                  z-index: 9999999999999999999999999;
                "
                class="justify-center"
              >
                <img
                  :src="this.user.avatar"
                  :style="avatar_hover ? 'filter: brightness(50%);' : ''" />
                <q-file
                  v-if="avatar_hover"
                  v-model="image"
                  borderless
                  hide-bottom-space
                  style="
                    display: inline-block;
                    position: absolute;
                    z-index: 100;
                    height: 120px;
                    width: 120px;
                  "
                  @change="updateFile()"
                  color="transparent"
                  bg-color="transparent"
                >
                  <q-icon
                    name="attach_file"
                    color="white"
                    class="q-mr-xl"
                    style="height: 120px"
                    size="22px"
                  /> </q-file
              ></q-avatar>
              <div
                style="position: relative; top: -25em; height: 200px"
                v-if="!small"
                @mouseover="background_hover = true"
                @mouseleave="background_hover = false"
              >
                <q-file
                  v-if="background_hover"
                  v-model="image"
                  borderless
                  hide-bottom-space
                  style="
                    position: absolute;
                    z-index: 100;
                    height: 100%;
                    width: 100%;
                  "
                  @change="updateFile()"
                  color="transparent"
                  bg-color="transparent"
                >
                  <q-icon name="attach_file" color="white" size="22px" />
                </q-file>
                <q-card-section
                  :style="
                    background_hover ? 'cursor: pointer' : 'cursor:default'
                  "
                  style="
                    left: 15em;
                    max-width: 400px;
                    min-width: 300px;
                    top: 0em;
                  "
                >
                  <div class="text-h6 text-orange">#1111111</div>
                  <div
                    :class="darkmode ? 'text-primary' : 'text-primarydark'"
                    class="text-h4 q-mt-sm q-mb-xs text-weight-bolder"
                  >
                    Usernamessssssssssssssssss
                  </div>
                  <div class="text-h6 q-mt-md text-weight-bold">Role</div>
                </q-card-section>
              </div>
              <div style="position: relative; top: -25em" v-if="!small">
                <q-card-section>
                  <div class="text-h6 q-mt-sm q-mb-xs">Bio</div>
                  <div class="text-caption text-grey">
                    Name etc bla bli blub djasid dsanda dsjuiadiu dsabdiua
                  </div>
                </q-card-section>
                <q-card-actions>
                  <div class="absolute-bottom text-subtitle2 text-center">
                    Title
                  </div>
                </q-card-actions>
              </div>
            </q-card>

            <!--  -->
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
          </q-tab-panel>

          <q-tab-panel
            name="theme"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <div class="text-h4 q-mb-md row">
              Themes
              <q-btn
                class="q-ml-lg"
                flat
                icon="info"
                @click="test_darkmode = !test_darkmode"
              >
                <q-tooltip
                  max-width="250px"
                  class="text-body1"
                  anchor="center right"
                  self="center left"
                  :offset="[10, 10]"
                >
                  Darkmode can be enabled or disabled in the Quick-Settings-Menu
                  in the bottom right corner.
                </q-tooltip>
              </q-btn>
            </div>
            <q-scroll-area style="height: 500px; max-width: 10000px">
              <div class="q-pa-md row items-start q-gutter-md">
                <!-- DEFAULT THEME -->

                <q-card
                  class="my-card"
                  :class="test_darkmode ? 'default-dark' : 'default-light'"
                  bordered
                >
                  <q-card-section
                    :class="
                      test_darkmode ? 'default-primarydark' : 'default-primary'
                    "
                    class="row"
                  >
                    <div class="text-h6">Default Theme</div>
                    <q-btn
                      class="q-ml-lg"
                      flat
                      icon="lightbulb"
                      @click="test_darkmode = !test_darkmode"
                    />
                  </q-card-section>
                  <q-card-section>
                    <p class="q-mb-none">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed ac lobortis nunc, sit amet egestas tortor. Donec
                      pellentesque dolor ac urna efficitur maximus.
                    </p>
                  </q-card-section>

                  <q-card-actions vertical class="q-mt-none">
                    <q-btn stretch flat @click="setTheme('default')">
                      Use
                    </q-btn>
                  </q-card-actions>
                </q-card>

                <!-- CLASSIC THEME -->

                <q-card
                  class="my-card"
                  :class="test_darkmode ? 'classic-dark' : 'classic-light'"
                  bordered
                >
                  <q-card-section
                    :class="
                      test_darkmode ? 'classic-primarydark' : 'classic-primary'
                    "
                    class="row"
                  >
                    <div class="text-h6">Classic Theme</div>
                    <q-btn
                      class="q-ml-lg"
                      flat
                      icon="lightbulb"
                      @click="test_darkmode = !test_darkmode"
                    />
                  </q-card-section>
                  <q-card-section>
                    <p class="q-mb-none">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed ac lobortis nunc, sit amet egestas tortor. Donec
                      pellentesque dolor ac urna efficitur maximus.
                    </p>
                  </q-card-section>

                  <q-card-actions vertical class="q-mt-none">
                    <q-btn stretch flat @click="setTheme('classic')">
                      Use
                    </q-btn>
                  </q-card-actions>
                </q-card>
              </div>
            </q-scroll-area>
          </q-tab-panel>

          <q-tab-panel
            name="other"
            :class="
              test_darkmode
                ? 'text-dark bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <div class="text-h4 q-mb-md">Other</div>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
            <p>
              Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quis
              praesentium cumque magnam odio iure quidem, quod illum numquam
              possimus obcaecati commodi minima assumenda consectetur culpa fuga
              nulla ullam. In, libero.
            </p>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </div>
</template>

<script>
import { ref, reactive } from 'vue';
import { useQuasar, QSpinnerGears } from 'quasar';
import { api } from 'boot/axios';
import { useUserStore } from 'stores/user.ts';
import { useSettingsStore } from 'stores/settings';
import { defaultUser, serializeUser } from 'src/models';

export default {
  name: 'SettingsView',

  setup() {
    const settingsStore = useSettingsStore();
    const userStore = useUserStore();
    const q = useQuasar();

    return {
      user: userStore.user,
      theme: ref('default'),
      tab: ref('start'),
      splitterModel: ref(20),
      settingsStore,
      q,
      userStore,
      loading: ref(false),
      test_darkmode: ref(false),
      avatar_hover: ref(false),
      background_hover: ref(false),
    };
  },

  created() {
    if (!this.user.feched) {
      this.getMe();
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
    changeBackground() {
      console.log('bla');
    },
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },
    setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      this.settingsStore.theme = theme;
      if (this.test_darkmode) {
        this.settingsStore.darkmode = true;
      } else {
        this.settingsStore.darkmode = false;
      }
    },

    getMe() {
      let config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/profile/user', config)
        .then((response) => {
          if (response.status == 200) {
            this.user = serializeUser(response.data);
            this.userStore.setUser(this.user);
          } else {
            this.user = defaultUser();
            this.notify('negative', 'Something went wrong with the API :/');
          }
        })
        .catch((error) => {
          this.user = defaultUser();
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },
  },
};
</script>

<style>
.my-card {
  width: 100%;
  max-width: 250px;
}

.profile-card {
  position: relative;
  top: -38em;
  left: 6em;
  text-align: start;
  min-height: 350px;
  max-height: 500px;
  max-width: 70%;
  margin: 0 auto;
}

.profile-card2 {
  min-height: 350px;
  max-height: 500px;
  margin: 0 auto;
}

.default-light {
  background: #ffffff;
  color: #1a1c1f;
}
.default-dark {
  background: #1a1c1f;
  color: #dddddd;
}
.default-primary {
  background: #1ecececc;
  color: #1a1c1f;
}
.default-primarydark {
  background: #1a4158;
  color: #d6d6d6;
}

.classic-light {
  background: #ffffff;
  color: #101010;
}
.classic-dark {
  background: #101010;
  color: #ffffff;
}
.classic-primary {
  background: #eef0f2;
  color: #101010;
}
.classic-primarydark {
  background: #232c33;
  color: #ffffff;
}
</style>
