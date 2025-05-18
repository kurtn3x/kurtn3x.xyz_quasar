import { reactive, ref } from 'vue';
import { useQuasar } from 'quasar';
import { apiGet } from 'src/components/apiWrapper';
import { UserProfileType } from 'src/types/index';
import { useRoute } from 'vue-router';
import { defaultUserProfile } from 'src/types/test';
import { useLocalStore } from 'stores/localStore';

export function useUserProfile() {
  const route = useRoute();
  const q = useQuasar();
  const localStore = useLocalStore();

  // State variables
  const state = reactive({
    loading: true,
    error: false,
    errorMessage: '',
  });

  const user = ref({} as UserProfileType);
  const userlink = ref('kurtn3x.xyz/user/');

  // Axios configuration
  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  const getUser = async () => {
    state.loading = true;
    state.error = false;

    const userParam = route.params.username;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      state.loading = false;
      user.value = defaultUserProfile();
      userlink.value = 'kurtn3x.xyz/user/' + user.value.id;
      return;
    }

    const apiData = await apiGet('/profile/user/' + userParam, axiosConfig);

    if (apiData.error === false) {
      user.value = apiData.data as UserProfileType;
      userlink.value = 'kurtn3x.xyz/user/' + user.value.id;
    } else {
      state.error = true;
      state.errorMessage = apiData.errorMessage;
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    state.loading = false;
  };

  return {
    state,
    user,
    userlink,
    getUser,
  };
}
