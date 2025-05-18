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
      <!-- Desktop Layout Component -->
      <div class="gt-xs q-ma-xs">
        <DesktopLayout
          :user="user"
          :userlink="userlink"
        />
      </div>

      <!-- Mobile Layout Component -->
      <div class="lt-sm q-ma-xs">
        <MobileLayout
          :user="user"
          :userlink="userlink"
        />
      </div>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import ErrorPage from 'src/components/ErrorPage.vue';
import { useUserProfile } from 'src/api/profile';
import DesktopLayout from 'src/components/profile/DesktopLayout.vue';
import MobileLayout from 'src/components/profile/MobileLayout.vue';

// Use the extracted profile functionality
const { state, user, userlink, getUser } = useUserProfile();

// Lifecycle hooks
onMounted(() => {
  getUser();
});
</script>

<style scoped>
.profile-card {
  min-height: calc(100vh - 300px);
}
</style>
