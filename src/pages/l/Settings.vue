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
          swipeable
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

            <div class="background-photo">
              <div class="default-background">
                <q-img
                  :src="this.user.background"
                  style="height: 200px"
                ></q-img>
              </div>
            </div>
            <div class="profile-container">
              <div class="profile-photo text-center">
                <div class="default-user-image">
                  <q-avatar
                    round="round"
                    font-size="100px"
                    size="120px"
                    text-color="white"
                  >
                    <img :src="this.user.avatar"
                  /></q-avatar>
                </div>
              </div>
              <div class="text-weight-bold text-h6 q-pt-xl">
                {{ user.username }}
              </div>
              <div class="user-info q-mt-lg">
                <div class="row justify-between">
                  <label class="text-h6 text-weight-bolder">First Name:</label>
                  <p class="text-h6">{{ user.first_name }}</p>
                </div>
                <div class="row justify-between">
                  <label class="text-h6 text-weight-bolder">Last Name:</label>
                  <p class="text-h6">{{ user.last_name }}</p>
                </div>
                <div class="row justify-between">
                  <label class="text-h6 text-left text-weight-bolder"
                    >Mobile Number:</label
                  >
                  <p class="text-h6 text-right">{{ user.phone }}</p>
                </div>
                <div class="column">
                  <label class="text-h6 text-left text-weight-bolder"
                    >Bio:</label
                  >
                  <p class="text-h6 text-left">{{ user.bio }}</p>
                </div>
              </div>
            </div>

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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    ac lobortis nunc, sit amet egestas tortor. Donec
                    pellentesque dolor ac urna efficitur maximus.
                  </p>
                </q-card-section>

                <q-card-actions vertical class="q-mt-none">
                  <q-btn stretch flat @click="setTheme('default')"> Use </q-btn>
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
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                    ac lobortis nunc, sit amet egestas tortor. Donec
                    pellentesque dolor ac urna efficitur maximus.
                  </p>
                </q-card-section>

                <q-card-actions vertical class="q-mt-none">
                  <q-btn stretch flat @click="setTheme('classic')"> Use </q-btn>
                </q-card-actions>
              </q-card>
            </div>
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
    };
  },

  created() {
    if (!this.user.feched) {
      console.log(this.user.avatar);
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
      console.log(this.settingsStore.theme);
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
            console.log(this.user.avatar);
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
.profile-container {
  position: relative;
  text-align: center;
  background: rgba(0, 0, 0, 0);
  top: -10em;
}
.user-info {
  margin: 2em auto;
  max-width: 24em;
  position: relative;
}
.my-card {
  width: 100%;
  max-width: 250px;
}

.default-light {
  background: #f8e3e3;
  color: #1a1c1f;
}
.default-dark {
  background: #1a1c1f;
  color: #f8e3e3;
}
.default-primary {
  background: #1ecececc;
  color: #1a1c1f;
}
.default-primarydark {
  background: #1a4158;
  color: #f8e3e3;
}

.classic-light {
  background: #fafaff;
  color: #101010;
}
.classic-dark {
  background: #101010;
  color: #fafaff;
}
.classic-primary {
  background: #eef0f2;
  color: #101010;
}
.classic-primarydark {
  background: #232c33;
  color: #fafaff;
}
</style>
