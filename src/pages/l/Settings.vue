<template>
  <div>
    <q-splitter
      v-model="splitterModel"
      class="q-ma-md"
      style="min-height: 500px"
    >
      <template v-slot:before>
        <q-tabs
          v-model="tab"
          vertical
          :class="darkmode ? 'text-white' : 'text-dark'"
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
            icon="perm_identity"
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
        <q-tab-panels v-model="tab" animated swipeable vertical>
          <q-tab-panel name="start"
            ><div class="text-h4 q-mb-md">The Settings Menu</div></q-tab-panel
          >
          <q-tab-panel name="profile">
            <div class="text-h4 q-mb-md">Profile Settings</div>
            <!--  -->

            <div class="background-photo">
              <div class="default-background">
                <q-img
                  src="https://cdn.quasar.dev/img/material.png"
                  style="height: 200px"
                ></q-img>
              </div>
            </div>
            <div class="profile-container">
              <div class="profile-photo text-center">
                <div class="default-user-image">
                  <q-avatar
                    round="round"
                    color="blue-grey-10"
                    icon="person"
                    font-size="100px"
                    size="120px"
                    text-color="white"
                  ></q-avatar>
                </div>
              </div>
              <div class="text-weight-bold text-h6">TestUser</div>
              <div class="user-info q-mt-lg">
                <div class="row justify-between">
                  <label class="text-h6 text-body1">Email:</label>
                  <p class="text-h6 text-body1">TestUser@Email.de</p>
                </div>
                <div class="row justify-between">
                  <label class="text-body1 text-left">Mobile Number:</label>
                  <p class="text-body1 text-right">+49152345</p>
                </div>
              </div>
            </div>

            <!--  -->
          </q-tab-panel>

          <q-tab-panel name="account">
            <div class="text-h4 q-mb-md">Account Settings</div>
            <div class="q-pl-none q-pt-md">
              <q-table
                :rows="rows"
                :columns="columns"
                flat
                square
                hide-header
                hide-bottom
                separator="vertical"
              >
                <!-- https://codepen.io/metalsadman/pen/ZgKexK -->
                <template v-slot:body-cell-button="props">
                  <q-td :props="props">
                    <div>
                      <q-btn icon="info" dense flat @click="deleteRow(props)">
                        <q-tooltip> Changing these values </q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-tab-panel>

          <q-tab-panel name="theme">
            <div class="text-h4 q-mb-md">Themes</div>
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

          <q-tab-panel name="other">
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
const columns = [
  {
    name: 'key',
    align: 'left',
    field: 'key',
    classes: 'text-weight-bolder',
    style: {
      width: '100px',
      fontSize: '1.2em',
    },
  },

  {
    name: 'value',
    align: 'left',
    field: 'value',
    classes: 'text-weight-bolder',
    style: {
      width: '1px',
      fontSize: '1.2em',
    },
  },

  {
    name: 'button',
    align: 'left',
    field: 'button',
    style: {
      fontSize: '1.2em',
    },
  },
];

const rows = [
  {
    key: 'Userid',
    value: 400,
  },
  {
    key: 'Username',
    value: 'WASDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDd',
  },
  {
    key: 'E-Mail',
    value: 'dkowdwadwoadnaodnad@email.de',
  },
  {
    key: 'Role',
    value: 'Admin',
  },
  {
    key: 'E-Mail',
    value: 2,
  },
];

import { ref } from 'vue';
import { useQuasar, QSpinnerGears } from 'quasar';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/authenticated.ts';
import { useSettingsStore } from 'stores/settings';

export default {
  name: 'SettingsView',
  setup() {
    const settings_store = useSettingsStore();
    const q = useQuasar();
    return {
      columns,
      rows,
      tab: ref('start'),
      splitterModel: ref(20),
      settings_store,
      q,
      username: ref('SomeUser'),
      avatar: ref('https://media.kurtn3x.xyz/test/avatar.png'),
    };
  },
  created() {
    this.getMe();
  },

  computed: {
    darkmode() {
      return this.settings_store.darkmode;
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
    deleteRow(props) {
      this.q.notify({
        type: 'negative',
        multiline: true,
        message: `I'll delete row data => ${JSON.stringify(props.row)
          .split(',')
          .join(', ')}`,
        timeout: 2000,
      });
    },
    test(test2) {
      console.log(test2);
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
            this.username = response.data.username;
            this.avatar = response.data.avatar;
          } else {
            this.username = 'SomeUser';
            this.avatar = 'https://media.kurtn3x.xyz/test/avatar.png';
          }
        })
        .catch((error) => {
          this.username = 'SomeUser';
          this.avatar = 'https://media.kurtn3x.xyz/test/avatar.png';
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
  top: -4.6em;
}

.account-container {
  position: relative;
  text-align: center;
  background: rgba(0, 0, 0, 0);
}
.user-info {
  margin: 2em auto;
  max-width: 24em;
  position: relative;
}
</style>
