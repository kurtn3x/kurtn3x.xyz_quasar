import { reactive } from 'vue';
import { useQuasar } from 'quasar';
import { apiGet, apiPut, apiDelete } from 'src/components/apiWrapper';
import { AccountType, UserProfileType } from 'src/types';
import { defaultAccount, defaultUserProfile } from 'src/types/test';
import { useLocalStore } from 'stores/localStore';

export function useSettings() {
  const q = useQuasar();

  const state = reactive({
    accountData: {} as AccountType,
    profileData: {} as UserProfileType,
    avatarPreview: null as string | null,
    loading: true,
    error: false,
    errorMessage: '',
  });

  const localStore = useLocalStore();

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  // Fetch account and profile information
  const getAccountInformation = async () => {
    state.loading = true;
    state.error = false;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      state.loading = false;
      state.error = false;
      state.accountData = defaultAccount();
      state.profileData = defaultUserProfile();
      return;
    }

    const accountResponse = await apiGet('/auth/account', axiosConfig);

    if (accountResponse.error === false) {
      state.accountData = accountResponse.data as AccountType;

      const profileResponse = await apiGet('/profile/user', axiosConfig);

      if (profileResponse.error === false) {
        state.profileData = profileResponse.data as UserProfileType;
        // force refresh by adding random stuff to url
        state.avatarPreview = state.profileData.avatar + '?' + Math.random();
        state.error = false;
      } else {
        q.notify({
          type: 'negative',
          message: profileResponse.errorMessage,
        });
        state.error = true;
        state.errorMessage = profileResponse.errorMessage;
      }
    } else {
      q.notify({ type: 'negative', message: accountResponse.errorMessage });
      state.error = true;
      state.errorMessage = accountResponse.errorMessage;
    }

    state.loading = false;
  };

  // Update user profile including avatar
  const updateUserProfile = async (
    profileData: UserProfileType,
    avatarFile: File | null
  ) => {
    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    state.loading = true;
    const formData = new FormData();
    formData.append('username', profileData.username);
    formData.append('location', profileData.location);
    formData.append('description', profileData.description);
    formData.append('status', profileData.status);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const apiData = await apiPut('/profile/user', formData, config);

    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Profile updated successfully.',
      });
      await getAccountInformation();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    state.loading = false;
  };

  // Update user email
  const updateEmail = async (newEmail: string, password: string) => {
    state.loading = true;

    const data = { newEmail, password };
    const apiData = await apiPut('/auth/account', data, axiosConfig);

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Email updated successfully.' });
      await getAccountInformation();
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      return false;
    }

    state.loading = false;
    return true;
  };

  // Update user password
  const updatePassword = async (
    newPassword: string,
    newPasswordConfirm: string,
    password: string
  ) => {
    state.loading = true;

    const data = { newPassword, newPasswordConfirm, password };
    const apiData = await apiPut('/auth/account', data, axiosConfig);

    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Password changed successfully.',
      });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      return false;
    }

    state.loading = false;
    return true;
  };

  // Delete user account
  const deleteAccount = async (password: string) => {
    const config = {
      ...axiosConfig,
      data: { password },
    };

    const apiData = await apiDelete('/auth/account', config);

    if (apiData.error === false) {
      q.notify({
        type: 'positive',
        message: 'Account deleted successfully.',
      });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
  };

  return {
    state,
    getAccountInformation,
    updateUserProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
  };
}
