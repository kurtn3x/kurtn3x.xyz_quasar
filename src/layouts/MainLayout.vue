<template>
  <q-layout view="hHh LpR fff">
    <!-- Debug Panel (only in development) -->
    <div
      v-if="nodeEnv === 'development'"
      style="position: fixed; bottom: 10px; right: 10px; z-index: 9999"
    >
      <q-btn
        round
        color="red"
        icon="bug_report"
        size="md"
      >
        <q-menu>
          <q-list style="min-width: 200px">
            <q-item>
              <q-item-section>
                <q-toggle
                  v-model="debugAuthMode"
                  label="DEBUG"
                  color="primary"
                />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item
              clickable
              v-close-popup
              @click="resetLocalStorage"
            >
              <q-item-section>Reset LocalStorage</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <q-header
      reveal
      height-hint="98"
      class="bg-layout-bg text-layout-text"
    >
      <!-- Authenticated Header -->
      <q-toolbar
        class="q-pa-none"
        v-if="localStore.isAuthenticated"
      >
        <q-btn
          flat
          stretch
          icon="menu"
          class="text-body1 text-weight-bold"
          size="md"
          @click="
            miniState = !miniState;
            navDrawer = true;
          "
          style="width: 57px"
        />
        <q-space />

        <q-btn
          stretch
          flat
          class="button_hover"
        >
          <q-avatar
            class="q-mr-sm"
            size="26px"
            rounded
          >
            <img :src="headerInfo.avatar" />
          </q-avatar>
          <a class="text-body2 q-mr-sm text-weight-bold">
            {{ headerInfo.username }}
          </a>
          <q-icon
            name="arrow_drop_down"
            size="sm"
          />
          <user-menu :headerInfo="headerInfo" />
        </q-btn>
      </q-toolbar>

      <!-- Public Header -->
      <q-toolbar
        class="q-pa-none q-ma-none"
        v-if="!localStore.isAuthenticated"
      >
        <q-btn
          unelevated
          stretch
          icon="home"
          size="md"
          to="/"
        />
        <q-btn
          icon="settings"
          class="bg-transparent text-layout-text"
          unelevated
          stretch
        >
          <q-menu class="bg-layout-bg no-shadow">
            <theme-selector />
          </q-menu>
        </q-btn>

        <q-space />
        <q-btn
          stretch
          unelevated
          icon="login"
          :label="q.screen.gt.xs ? 'Login' : ''"
          class="text-body1 text-weight-bold"
          size="md"
          to="/login"
          :style="q.screen.gt.xs ? 'width: 140px' : 'width: 80px'"
        >
          <q-tooltip
            class="bg-layout-bg text-layout-text"
            v-if="!q.screen.gt.xs"
          >
            <a class="text-body1">Login</a>
          </q-tooltip>
        </q-btn>

        <q-btn
          stretch
          flat
          icon="add"
          :label="q.screen.gt.xs ? 'Register' : ''"
          to="/register"
          class="text-body1 text-weight-bold q-ml-xs"
          size="md"
          :style="q.screen.gt.xs ? 'width: 140px' : 'width: 80px'"
        >
          <q-tooltip
            class="bg-layout-bg text-layout-text"
            v-if="!q.screen.gt.xs"
          >
            <a class="text-body1">Register</a>
          </q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- NAV DRAWER -->
    <navigation-drawer
      v-if="localStore.isAuthenticated"
      v-model:navDrawer="navDrawer"
      v-model:miniState="miniState"
    />

    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- FOOTER  -->
  </q-layout>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted, watchEffect, computed } from 'vue';
import { useQuasar, LocalStorage } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';
import { defaultHeaderInformation } from 'src/types/test';
import { useRoute, useRouter } from 'vue-router';
import NavigationDrawer from 'src/components/layout/NavigationDrawer.vue';
import ThemeSelector from 'src/components/layout/ThemeSelector.vue';
import UserMenu from 'src/components/layout/UserMenu.vue';

export default defineComponent({
  name: 'MainLayout',

  components: {
    NavigationDrawer,
    ThemeSelector,
    UserMenu,
  },

  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();
    const route = useRoute();
    const router = useRouter();

    // Drawer state
    const navDrawer = ref(true);
    const miniState = ref(true);

    // Debug auth mode toggle - fixed syntax
    const debugAuthMode = computed({
      get: () => localStore.isDebugMode,
      set: () => {
        localStore.toggleDebugMode();
        if (localStore.isDebugMode) {
          getHeaderInfo();
        }
      },
    });

    // Reference to process.env for the template
    const nodeEnv = process.env.NODE_ENV;

    // Reset function for localStorage
    const resetLocalStorage = () => {
      LocalStorage.clear();
      window.location.reload();
    };

    // Responsive adjustment
    if (q.screen.width < 1024) {
      navDrawer.value = false;
      miniState.value = false;
    }

    const darkmodeToogle = ref(localStore.darkmodeState);
    const headerInfo = ref(localStore.headerInfo);

    // Authentication handling - modify to respect debug mode
    watchEffect(() => {
      const requiresAuth = route.meta.requiresAuth === true;
      if (requiresAuth && !localStore.isAuthenticated) {
        // Only redirect if not in debug mode
        if (!localStore.isDebugMode) {
          router.push('/login');
        }
      }
    });

    const getHeaderInfo = () => {
      // If in debug mode and not authenticated, use mock data
      if (localStore.isDebugMode) {
        headerInfo.value = {
          username: 'testuser',
          isAdmin: true,
          avatar: 'https://media.kurtn3x.xyz/default.png',
        };
        return;
      }

      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': q.cookies.get('csrftoken'),
        },
      };

      api
        .get('/profile/headerinfo', axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            headerInfo.value = response.data;
            localStore.loginUser(response.data);
          } else {
            q.notify({
              type: 'negative',
              message: 'Something went wrong when fetching the user.',
              progress: true,
            });
            localStore.deleteAll();
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

    onMounted(() => {
      if (localStore.isAuthenticated) {
        getHeaderInfo();
      } else {
        headerInfo.value = defaultHeaderInformation();
        localStore.deleteAll();
      }
    });

    return {
      navDrawer,
      miniState,
      darkmodeToogle,
      localStore,
      q,
      headerInfo,
      getHeaderInfo,
      debugAuthMode,
      resetLocalStorage,
      nodeEnv, // Expose process.env.NODE_ENV to the template instead of process
    };
  },

  computed: {
    myprofileroute() {
      return '/user/' + this.headerInfo.username;
    },

    darkmode() {
      return this.localStore.darkmodeState;
    },

    headerInfoStore() {
      return this.localStore.headerInfo;
    },

    screenWidth() {
      return this.q.screen.width;
    },
  },

  watch: {
    headerInfoStore(newVal) {
      this.headerInfo = newVal;
    },

    darkmode(newVal) {
      this.darkmodeToogle = newVal;
    },

    screenWidth(newVal) {
      if (newVal < 1024) {
        this.navDrawer = false;
        this.miniState = false;
      } else {
        this.navDrawer = true;
        this.miniState = true;
      }
    },
  },
});
</script>
