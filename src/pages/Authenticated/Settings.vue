<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="q-ma-sm"
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
            <q-tab name="account" icon="admin_panel_settings" label="Account" />
          </q-expansion-item>
          <q-expansion-item
            icon="public"
            label="Website settings"
            v-if="!small"
            header-style="fontSize: 1.3em"
          >
            <q-tab name="other" icon="settings" label="Other" />
          </q-expansion-item>
          <div v-if="small">
            <q-tab name="account" icon="admin_panel_settings" label="Account" />
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
            name="account"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <div class="text-h4 q-mb-md">Account Settings</div>
            <q-card class="my-card">
              <q-card-section>
                <div class="text-body1">Id: {{ this.user.id }}</div>
                <div class="text-body1">Username: {{ this.user.username }}</div>
                <div class="text-body1">Email: {{ this.user.email }}</div>
                <div class="text-body1">Role: {{ this.user.role }}</div>
                <div class="text-body1">Groups: {{ placeholder }}</div>
                <div class="text-body1">Phone: {{ this.user.phone }}</div>
                <div class="text-body1">
                  First Name: {{ this.user.first_name }}
                </div>
                <div class="text-body1">
                  Last Name: {{ this.user.last_name }}
                </div>
              </q-card-section>

              <q-card-actions vertical align="center">
                <q-btn flat stretch>Change E-Mail</q-btn>
                <q-btn flat stretch>Change Password</q-btn>
                <q-btn flat stretch>Delete Account</q-btn>
                <q-btn flat stretch @click="this.$router.push('/l/profile')"
                  >Other Settings can be changed under 'My Profile'.</q-btn
                >
              </q-card-actions>
            </q-card>
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
      tab: ref('start'),
      splitterModel: ref(20),
      settingsStore,
      q,
      userStore,
      loading: ref(false),
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
            this.$router.push('/');
          }
        })
        .catch((error) => {
          this.$router.push('/');
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },
  },
};
</script>

<style></style>
