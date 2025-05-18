import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { apiGet, apiPost } from 'src/components/apiWrapper';
import { defaultHeaderInformation } from 'src/types/test';

export function useAuth() {
  const localStore = useLocalStore();
  const q = useQuasar();
  const router = useRouter();

  const state = reactive({
    loading: false,
    error: false,
    errorMessage: '',
  });

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  const login = async (credentials: { username: string; password: string }) => {
    state.loading = true;
    state.error = false;
    state.errorMessage = '';

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      state.loading = false;
      state.error = false;
      localStore.loginUser(defaultHeaderInformation());
      router.push('/');
      return;
    }

    const apiData = await apiPost('/auth/login', credentials, axiosConfig);

    if (apiData.error === false) {
      localStore.loginUser(apiData.data);
      q.notify({
        type: 'positive',
        message: 'Login Sucessful',
      });
      await fetchCsrfToken();
      router.push('/');
      state.loading = false;
    } else {
      state.error = true;
      state.errorMessage = apiData.errorMessage || 'Authentication failed';
      localStore.setAuthState(false);
      state.loading = false;
    }
  };

  const fetchCsrfToken = async () => {
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
  };

  const logout = async () => {
    // Add logout functionality here if needed
  };

  const redirectIfAuthenticated = () => {
    if (localStore.isAuthenticated) {
      router.push('/');
    }
  };

  return {
    state,
    login,
    logout,
    redirectIfAuthenticated,
  };
}
