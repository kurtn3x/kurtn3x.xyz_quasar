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
              <div class="text-weight-bold text-h6 q-pt-xl">TestUser</div>
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

          <q-tab-panel
            name="account"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <div class="text-h4 q-mb-md">Account Settings</div>
            <div class="q-pl-none q-pt-md">
              <q-table
                :rows="testthing"
                :columns="columns"
                flat
                square
                hide-header
                hide-bottom
                separator="vertical"
                :class="
                  darkmode
                    ? 'text-light bg-background-dark'
                    : 'text-dark bg-background-light'
                "
                table-style="max-width:700px"
              >
                <!-- https://codepen.io/metalsadman/pen/ZgKexK -->
              </q-table>
            </div>
          </q-tab-panel>

          <q-tab-panel
            name="theme"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
                : 'text-dark bg-background-light'
            "
          >
            <div class="text-h4 q-mb-md">Themes</div>
            <q-btn
              style="background: #1ecececc; color: white"
              label="Default Theme"
            />
            <q-btn
              class="q-ml-xl"
              style="background: #00ff62cc; color: white"
              label="Green Theme"
            />
          </q-tab-panel>

          <q-tab-panel
            name="other"
            :class="
              darkmode
                ? 'text-light bg-background-dark'
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
import { useAuthStore } from 'stores/authenticated.ts';
import { useSettingsStore } from 'stores/settings';
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
      width: '100px',
      fontSize: '1.2em',
    },
  },
];

export default {
  name: 'SettingsView',
  data() {
    return {
      rows: [
        {
          key: 'Userid',
          value: 'Fetching',
        },
        {
          key: 'Username',
          value: 'Fetching',
        },
        {
          key: 'E-Mail',
          value: 'Fetching',
        },
        {
          key: 'Role',
          value: 'Fetching',
        },
        {
          key: 'Groups',
          value: 'Fetching',
        },
      ],
    };
  },
  setup() {
    const settings_store = useSettingsStore();
    const q = useQuasar();
    return {
      theme: ref('default'),
      columns,
      tab: ref('start'),
      splitterModel: ref(20),
      settings_store,
      q,
      loading: ref(false),
      username: ref('SomeUser'),
      avatar: ref('https://media.kurtn3x.xyz/test/avatar.png'),
      background_avatar: ref(''),
      userid: ref(''),
      email: ref(''),
      role: ref(''),
      group: ref(''),
      name: ref(''),
      surname: ref(''),
      phone: ref(''),
    };
  },
  created() {
    this.getMe();
  },

  computed: {
    testthing() {
      return this.rows;
    },
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
    changeTheme() {
      document.body.setAttribute('data-theme', 'orange');
    },
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
    test() {
      this.rows[0].value = 777;
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
            this.rows[0].value = this.userid = 1;
            this.rows[1].value = this.username = 'SomeUser';
            this.rows[2].value = this.email = 'SomeEmail';
            this.rows[3].value = this.role = 'SomeRoles';
            this.rows[4].value = this.group = 'SomeGroup';
            this.avatar = 'https://media.kurtn3x.xyz/test/avatar.png';
          }
        })
        .catch((error) => {
          this.rows[0].value = this.userid = 1;
          this.rows[1].value = this.username = 'SomeUser';
          this.rows[2].value = this.email = 'SomeEmail';
          this.rows[3].value = this.role = 'SomeRoles';
          this.rows[4].value = this.group = 'SomeGroup';
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
  top: -10em;
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
