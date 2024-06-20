import { defineStore } from 'pinia';
import { HeaderInformationType } from 'src/types';
import { defaultHeaderInformation } from 'src/types/defaults';
import { LocalStorage } from 'quasar';

export const useLocalStore = defineStore('header', {
  state: () => ({
    // authenticated stores the authentication state
    authenticated: (LocalStorage.getItem('authenticated') as boolean) || false,
    // headerInfo stores information required to load the header such as username and avatar
    headerInfo: (LocalStorage.getItem('header') ||
      defaultHeaderInformation()) as HeaderInformationType,
    darkmode: LocalStorage.getItem('darkmode'),
    theme: LocalStorage.getItem('theme'),
  }),

  getters: {
    isAuthenticated: (state) => state.authenticated,
    username: (state) => state.headerInfo.username,
    avatar: (state) => state.headerInfo.avatar,
    isAdmin: (state) => state.headerInfo.isAdmin,
    darkmodeState: (state) => state.darkmode,
    themeState: (state) => state.theme,
  },

  actions: {
    setHeaderInfoAvatar(data: string) {
      this.headerInfo.avatar = data;
    },
    setHeaderInfoUsername(data: string) {
      this.headerInfo.username = data;
    },
    setHeaderInfoAdmin(data: boolean) {
      this.headerInfo.isAdmin = data;
    },
    setHeaderInfo(info: HeaderInformationType) {
      this.headerInfo = info;
    },
    setAuthState(state: boolean) {
      this.authenticated = state;
    },

    deleteAll() {
      this.headerInfo = defaultHeaderInformation() as HeaderInformationType;
      this.authenticated = false;
    },

    loginUser(headerData: HeaderInformationType) {
      this.headerInfo = headerData;
      this.authenticated = true;
    },
  },
});
