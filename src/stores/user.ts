import { defineStore } from 'pinia';
import { HeaderInformation, defaultHeaderInformation } from 'src/models';
import { LocalStorage } from 'quasar';

export const useUserStore = defineStore('header', {
  state: () => ({
    // authenticated stores the authentication state
    authenticated: LocalStorage.getItem('authenticated') || false,
    // headerinfo stores information required to load the header such as username and avatar
    headerinfo: (LocalStorage.getItem('header') ||
      defaultHeaderInformation()) as HeaderInformation,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
  },

  actions: {
    setHeaderInfo(info: HeaderInformation) {
      this.headerinfo = info;
    },
    setAuthState(state: boolean) {
      this.authenticated = state;
    },
    setStatus(status: string) {
      this.headerinfo.status = status;
    },
  },
});
