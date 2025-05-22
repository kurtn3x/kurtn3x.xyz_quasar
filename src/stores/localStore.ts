import { defineStore } from 'pinia';
import { ref, computed, watch, onMounted } from 'vue';
import { HeaderInformationType } from 'src/types';
import { LocalStorage } from 'quasar';
import { useQuasar } from 'quasar';
import { apiGet, apiPost } from '../api/apiWrapper';
import { defaultHeaderInformation } from 'src/types/test';
import { useRouter } from 'vue-router';
import { getThemeBackground, ThemeName } from 'src/components/lib/themes';

export const useLocalStore = defineStore('header', () => {
  const q = useQuasar();
  const router = useRouter();

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  const loading = ref(false);
  const componentLoading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');

  // State - converted from state object to individual refs
  const authenticated = ref<boolean>(
    (LocalStorage.getItem('authenticated') as boolean) || false
  );
  const headerInfo = ref<HeaderInformationType>(
    LocalStorage.getItem('header') || {
      username: '',
      avatar: '',
      isAdmin: false,
    }
  );

  const theme = ref<string>(LocalStorage.getItem('theme') || 'theme-violet');
  const darkMode = ref<boolean>(LocalStorage.getItem('isDarkMode') === true);
  const debugMode = ref<boolean>(
    (LocalStorage.getItem('isDebugMode') as boolean) || false
  );

  // Getters - converted to computed properties
  const isAuthenticated = computed(() => authenticated.value);
  const isDebugMode = computed(() => debugMode.value);
  const isDarkMode = computed(() => darkMode.value);
  const themeBackground = computed(() =>
    getThemeBackground(theme.value as ThemeName)
  );

  function toggleDebugMode() {
    debugMode.value = !debugMode.value;
    LocalStorage.set('isDebugMode', debugMode.value);
  }

  function setAuthState(state: boolean) {
    authenticated.value = state;
    LocalStorage.set('authenticated', state);
  }

  function setHeaderInfo(info: HeaderInformationType) {
    headerInfo.value = info;
    LocalStorage.set('header', info);
  }

  function setHeaderAvatar(avatar: string) {
    headerInfo.value.avatar = avatar;
    LocalStorage.set('header', headerInfo.value);
  }

  // Additional helper function to toggle isDarkMode
  function toggleDarkMode() {
    darkMode.value = !darkMode.value;
    LocalStorage.set('isDarkMode', isDarkMode.value);
  }

  // Set theme function
  function setTheme(newTheme: string) {
    theme.value = newTheme;
    LocalStorage.set('theme', newTheme);
    document.body.setAttribute('data-theme', newTheme);
  }

  async function login(credentials: { username: string; password: string }) {
    componentLoading.value = true;
    error.value = false;
    errorMessage.value = '';

    if (isDebugMode.value) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      componentLoading.value = false;
      error.value = false;
      setAuthState(true);
      setHeaderInfo(defaultHeaderInformation());
      router.push('/');
      return;
    }

    const apiData = await apiPost('/auth/login', credentials, axiosConfig);

    if (apiData.error === false) {
      setAuthState(true);
      setHeaderInfo(apiData.data);
      q.notify({
        type: 'positive',
        message: 'Login Sucessful',
      });
      await fetchCsrfToken();
      router.push('/');
      error.value = false;
    } else {
      error.value = true;
      errorMessage.value = apiData.errorMessage || 'Authentication failed';
      setAuthState(false);
    }
    componentLoading.value = false;
  }

  async function logout() {
    const apiData = await apiPost('/auth/logout', {}, axiosConfig);
    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Logout Sucessful',
      });
      await fetchCsrfToken();
      clearAll();
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage || 'Logout failed',
      });
      router.push('/');
    }
  }

  async function fetchCsrfToken() {
    const csrfData = await apiGet('/auth/csrf_cookie', {
      withCredentials: true,
    });
    if (csrfData.error === true) {
      q.notify({
        type: 'warning',
        message: 'CSRF token update failed. You may need to refresh.',
        icon: 'refresh',
        actions: [
          { label: 'Refresh', handler: () => window.location.reload() },
        ],
      });
    }
  }

  async function getAuthState() {
    componentLoading.value = true;
    if (isDebugMode.value) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      componentLoading.value = false;
      setAuthState(true);
      return;
    }

    const apiData = await apiGet('/auth/state', axiosConfig);
    if (apiData.error === false) {
      setAuthState(apiData.data.isAuthenticated as boolean);
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage || 'Failed to get auth state',
      });
      setAuthState(false);
    }
    componentLoading.value = false;
  }

  async function getHeaderInfo() {
    loading.value = true;

    if (isDebugMode.value) {
      setHeaderInfo(defaultHeaderInformation());
      setAuthState(true);
      loading.value = false;
      return;
    }

    const apiData = await apiGet('/profile/headerinfo', axiosConfig);

    if (apiData.error === false) {
      setHeaderInfo(apiData.data);
      setAuthState(true);
    } else {
      q.notify({
        type: 'negative',
        message: apiData.errorMessage || 'Failed to get user information',
      });
    }

    loading.value = false;
  }

  function redirectIfAuthenticated() {
    if (isAuthenticated.value) {
      q.notify({
        type: 'warning',
        message: 'You are already logged in',
      });
      router.push('/');
    }
  }

  function clearAll() {
    LocalStorage.clear();
    router.push('/');
  }

  // Initialize Quasar dark mode when store is first used
  onMounted(() => {
    // Set initial dark mode
    if (q) {
      q.dark.set(isDarkMode.value);
    }
    setTheme(theme.value);
  });

  // Watch isDarkMode changes and update Quasar
  watch(
    () => isDarkMode.value,
    (newDarkMode) => {
      if (q) {
        q.dark.set(newDarkMode);
      }
    }
  );

  // Return all state, getters and actions
  return {
    // State
    authenticated,
    headerInfo,
    darkMode,
    theme,
    debugMode,
    error,
    errorMessage,
    loading,
    componentLoading,

    // Getters
    isAuthenticated,
    isDebugMode,
    themeBackground,
    isDarkMode,

    // Actions
    toggleDebugMode,
    login,
    toggleDarkMode,
    setTheme,
    logout,
    setHeaderAvatar,
    fetchCsrfToken,
    getAuthState,
    clearAll,
    getHeaderInfo,
    redirectIfAuthenticated,
  };
});
