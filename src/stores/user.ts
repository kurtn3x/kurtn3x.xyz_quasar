import { defineStore } from 'pinia';
import { Me } from 'src/models';
import { LocalStorage } from 'quasar';
import { defaultMe } from 'src/models';

export const useUserStore = defineStore('user', {
  state: () => ({
    authenticated: LocalStorage.getItem('authenticated') || false,
    user: (LocalStorage.getItem('user') || defaultMe()) as Me,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
  },

  actions: {
    setUser(user: Me) {
      this.user = user;
    },
    setAuthState(state: boolean) {
      this.authenticated = state;
    },
  },
});
