import { defineStore } from 'pinia';
import { HeaderInformationType } from 'src/types';
import { LocalStorage } from 'quasar';

export const useLocalStore = defineStore('header', {
  state: () => ({
    // authenticated stores the authentication state
    authenticated: (LocalStorage.getItem('authenticated') as boolean) || false,
    // headerInfo stores information required to load the header such as username and avatar
    headerInfo: LocalStorage.getItem('header'),
    darkmode: LocalStorage.getItem('darkmode'),
    theme: LocalStorage.getItem('theme'),
    // Debug flag for testing authenticated views
    debugMode: LocalStorage.getItem('isDebugMode') || false,
  }),

  getters: {
    isAuthenticated: (state) => state.authenticated,
    username: (state) => state.headerInfo.username,
    avatar: (state) => state.headerInfo.avatar,
    isAdmin: (state) => state.headerInfo.isAdmin,
    darkmodeState: (state) => state.darkmode,
    themeState: (state) => state.theme,
    isDebugMode: (state) => state.debugMode,
  },

  actions: {
    // Add a toggle for debug mode
    toggleDebugMode() {
      this.debugMode = !this.debugMode;
      // If entering debug mode and we don't have proper header info, set a test one
      if (this.debugMode && this.headerInfo.username === 'username') {
        this.headerInfo = {
          username: 'testuser',
          isAdmin: true,
          avatar: 'https://media.kurtn3x.xyz/default.png',
        };
      }
    },

    // Existing actions
    setAuthState(state: boolean) {
      this.authenticated = state;
      LocalStorage.set('authenticated', state);
    },

    setHeaderInfo(info: HeaderInformationType) {
      this.headerInfo = info;
      LocalStorage.set('header', info);
    },

    loginUser(headerInfo: HeaderInformationType) {
      this.authenticated = true;
      this.headerInfo = headerInfo;
      LocalStorage.set('authenticated', true);
      LocalStorage.set('header', headerInfo);
    },

    deleteAll() {
      this.authenticated = false;
      this.headerInfo = {
        avatar: '',
        isAdmin: false,
        username: '',
      } as HeaderInformationType;
      LocalStorage.set('authenticated', false);
      LocalStorage.set('header', this.headerInfo);
    },
  },
});
