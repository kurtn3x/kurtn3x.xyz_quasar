<template>
  <div
    v-if="state.loading"
    class="absolute-center"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div v-if="!state.loading && state.error">
    <ErrorPage :error-message="state.errorMessage" />
  </div>
  <div v-if="!state.loading && !state.error">
    <q-page class="column">
      <q-card
        bordered
        flat
        class="q-ma-sm bg-transparent"
      >
        <q-separator
          size="1px"
          :color="darkmode ? 'white' : 'dark'"
        />
        <q-tabs
          inline-label
          v-model="tab"
          class="full-width"
          align="justify"
          indicator-color="transparent"
          active-color="layout-text"
          active-bg-color="primary"
        >
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />

          <q-tab
            name="site"
            icon="settings_applications"
            label="Site"
          />
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />

          <q-tab
            name="profile"
            icon="person"
            label="Profile"
          />
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />

          <q-tab
            name="account"
            icon="admin_panel_settings"
            label="Account"
          />
          <q-separator
            vertical
            size="1px"
            :color="darkmode ? 'white' : 'dark'"
          />
        </q-tabs>
        <q-separator
          size="1px"
          :color="darkmode ? 'white' : 'dark'"
        />

        <q-tab-panels
          v-model="tab"
          animated
          class="bg-transparent"
        >
          <q-tab-panel
            name="site"
            class="q-pa-none q-ma-none"
          >
            <SiteSettings />
          </q-tab-panel>

          <q-tab-panel
            name="profile"
            :class="darkmode ? 'text-white' : 'text-dark'"
          >
            <ProfileSettings :profile-data="state.profileData" />
          </q-tab-panel>

          <q-tab-panel
            name="account"
            :class="darkmode ? 'text-white' : 'text-dark'"
          >
            <AccountSettings
              :account-data="state.accountData"
              :profile-data="state.profileData"
            />
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useLocalStore } from 'stores/localStore';
import ErrorPage from 'src/components/ErrorPage.vue';
import { useRoute } from 'vue-router';
import SiteSettings from 'src/components/settings/SiteSettings.vue';
import ProfileSettings from 'src/components/settings/ProfileSettings.vue';
import AccountSettings from 'src/components/settings/AccountSettings.vue';
import { useSettings } from 'src/api/settings';

// Setup composables
const route = useRoute();
const localStore = useLocalStore();
const { state, getAccountInformation } = useSettings();

// State variables
const tab = ref('site');

// Computed properties
const darkmode = computed(() => localStore.darkmode);

// Lifecycle hooks
onMounted(() => {
  if (route.params.page === 'account') {
    tab.value = 'account';
  } else if (route.params.page === 'profile') {
    tab.value = 'profile';
  }

  getAccountInformation();
});
</script>
