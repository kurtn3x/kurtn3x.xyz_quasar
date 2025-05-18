<template>
  <q-menu
    dark
    anchor="bottom left"
    self="top left"
  >
    <q-card
      class="bg-layout-bg"
      bordered
      dark
      style="width: 240px"
    >
      <div class="q-mt-sm">
        <div class="row justify-center q-ma-xs">
          <q-btn
            flat
            class="bg-layout-bg text-layout-text"
            :to="myProfileRoute"
            align="left"
            style="font-size: 14px; width: 220px"
          >
            <q-avatar
              rounded
              size="20px"
            >
              <img :src="headerInfo.avatar" />
            </q-avatar>
            <div class="q-ml-md ellipsis">My Profile</div>
          </q-btn>
        </div>

        <q-separator
          color="layout-text"
          inset
        />
        <div class="row justify-center q-ma-xs">
          <q-btn
            flat
            to="/dashboard/settings/profile"
            icon="person"
            label="Profile Settings"
            style="font-size: 14px; width: 220px"
            class="bg-layout-bg text-layout-text"
            align="left"
          />
        </div>
        <q-separator
          color="layout-text"
          inset
        />
        <div class="row justify-center q-ma-xs">
          <q-btn
            flat
            to="/dashboard/settings/account"
            icon="admin_panel_settings"
            label="Account Settings"
            style="font-size: 14px; width: 220px"
            class="bg-layout-bg text-layout-text"
            align="left"
          />
        </div>
      </div>
      <q-separator
        inset
        color="layout-text"
      />
      <div class="q-mb-sm">
        <div class="row q-ma-xs justify-center">
          <q-btn-dropdown
            icon="settings"
            class="bg-transparent text-layout-text"
            flat
            content-class="bg-layout-bg no-shadow"
            menu-anchor="bottom middle"
            menu-self="top middle"
            style="width: 100px"
          >
            <theme-selector />
          </q-btn-dropdown>

          <q-separator
            class="q-ml-xs q-mr-xs"
            vertical
            inset
            color="layout-text"
          />
          <q-btn
            flat
            icon="logout"
            class="bg-layout-bg text-layout-text"
            v-close-popup
            @click="logout"
            style="font-size: 14px; width: 100px"
            align="center"
          />
        </div>
      </div>
    </q-card>
  </q-menu>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';
import ThemeSelector from './ThemeSelector.vue';

export default defineComponent({
  name: 'UserMenu',

  components: {
    ThemeSelector,
  },

  props: {
    headerInfo: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    const q = useQuasar();
    const localStore = useLocalStore();

    const myProfileRoute = computed(() => `/user/${props.headerInfo.username}`);

    const logout = () => {
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': q.cookies.get('csrftoken'),
        },
      };

      api
        .post('/auth/logout', '', axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            localStore.deleteAll();
            q.notify({
              type: 'positive',
              message: 'Logged out!',
              progress: true,
            });
            LocalStorage.remove('header');
            window.location.replace('https://kurtn3x.xyz');
          }
        })
        .catch((error) => {
          console.log(error);
          q.notify({
            type: 'negative',
            message: 'API ERROR.',
            progress: true,
          });
          localStore.deleteAll();
        });
    };

    return {
      myProfileRoute,
      logout,
    };
  },
});
</script>
