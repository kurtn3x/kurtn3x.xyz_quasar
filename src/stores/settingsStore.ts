// stores/settingsStore.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { UserProfileType, AccountType } from 'src/types';
import { apiGet, apiPut, apiDelete } from '../api/apiWrapper';
import { useQuasar } from 'quasar';
import { defaultAccount, defaultUserProfile } from 'src/types/test';
import { useLocalStore } from 'stores/localStore';

export const useSettingsStore = defineStore('settings', () => {
  const q = useQuasar();
  const localStore = useLocalStore();

  // State
  const profileData = ref<UserProfileType | null>(null);
  const accountData = ref<AccountType | null>(null);
  const avatarPreview = ref<string | null>(null);

  const loading = ref(false);
  const componentLoading = ref(false);
  const error = ref(false);
  const errorMessage = ref('');

  const axiosConfig = {
    withCredentials: true,
    headers: {
      'X-CSRFToken': q.cookies.get('csrftoken'),
    },
  };

  // Actions
  async function getAccountInformation() {
    loading.value = true;
    error.value = false;

    if (localStore.isDebugMode) {
      q.notify({ type: 'info', message: 'Debug' });
      await new Promise((resolve) => setTimeout(resolve, 500));
      loading.value = false;
      error.value = false;
      accountData.value = defaultAccount();
      profileData.value = defaultUserProfile();
      avatarPreview.value = profileData.value.avatar + '?' + Math.random();
      return;
    }

    const accountResponse = await apiGet('/auth/account', axiosConfig);

    if (accountResponse.error === false) {
      accountData.value = accountResponse.data as AccountType;

      const profileResponse = await apiGet('/profile/user', axiosConfig);

      if (profileResponse.error === false) {
        profileData.value = profileResponse.data as UserProfileType;
        // force refresh by adding random stuff to url
        avatarPreview.value = profileData.value.avatar + '?' + Math.random();
        error.value = false;
      } else {
        q.notify({
          type: 'negative',
          message: profileResponse.errorMessage,
        });
        error.value = true;
        errorMessage.value = profileResponse.errorMessage;
      }
    } else {
      q.notify({ type: 'negative', message: accountResponse.errorMessage });
      error.value = true;
      errorMessage.value = accountResponse.errorMessage;
    }
  }

  async function updateProfile(
    newProfileData: UserProfileType,
    avatarFile: File | null
  ) {
    componentLoading.value = true;

    const config = {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    const formData = new FormData();
    if (newProfileData.username !== profileData.value?.username) {
      formData.append('username', newProfileData.username);
    }
    if (newProfileData.location !== profileData.value?.location) {
      formData.append('location', newProfileData.location);
    }
    if (newProfileData.description !== profileData.value?.description) {
      formData.append('description', newProfileData.description);
    }
    if (newProfileData.status !== profileData.value?.status) {
      formData.append('status', newProfileData.status);
    }

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
      if (avatarFile && profileData.value) {
        localStore.setHeaderAvatar(profileData.value.avatar);
      }
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }

    componentLoading.value = false;
  }

  async function updateEmail(
    newEmail: string,
    password: string
  ): Promise<boolean> {
    const data = { newEmail, password };
    const apiData = await apiPut('/auth/account', data, axiosConfig);

    if (apiData.error === false) {
      q.notify({ type: 'positive', message: 'Email updated successfully.' });
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
      return false;
    }

    return true;
  }

  // Update user password
  async function updatePassword(
    newPassword: string,
    newPasswordConfirm: string,
    password: string
  ): Promise<boolean> {
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

    return true;
  }

  // Delete user account
  async function deleteAccount(password: string): Promise<boolean> {
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
      return true;
    } else {
      q.notify({ type: 'negative', message: apiData.errorMessage });
    }
    return false;
  }

  function setAvatarPreview(avatar: File | null) {
    avatarPreview.value = URL.createObjectURL(avatar as File);
    localStore.setHeaderAvatar(avatarPreview.value);
  }

  return {
    // State
    profileData,
    accountData,
    avatarPreview,
    loading,
    componentLoading,
    error,
    errorMessage,

    // Actions
    getAccountInformation,
    updateProfile,
    updateEmail,
    updatePassword,
    deleteAccount,
    setAvatarPreview,
  };
});
