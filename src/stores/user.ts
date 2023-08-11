import { defineStore } from 'pinia';
import { HeaderInformation, defaultHeaderInformation } from 'src/models';
import { LocalStorage } from 'quasar';

export const useUserStore = defineStore('header', {
  state: () => ({
    // authenticated stores the authentication state
    authenticated: LocalStorage.getItem('authenticated') || false,
    // headerInfo stores information required to load the header such as username and avatar
    headerInfo: (LocalStorage.getItem('header') ||
      defaultHeaderInformation()) as HeaderInformation,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
    username: (state) => state.headerInfo.username,
    is_admin: (state) => state.headerInfo.admin,
  },

  actions: {
    updateProfilePicture(pic: string) {
      this.headerInfo.avatar = pic;
    },
    setHeaderInfo(info: HeaderInformation) {
      this.headerInfo = info;
    },
    setAuthState(state: boolean) {
      this.authenticated = state;
    },
  },
});
