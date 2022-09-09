import { defineStore } from 'pinia';
import { LiteUser } from 'src/models';
import { LocalStorage } from 'quasar';
import { defaultLiteUser } from 'src/models';

export const useUserStore = defineStore('user', {
  state: () => ({
    authenticated: LocalStorage.getItem('authenticated') || false,
    user: (LocalStorage.getItem('user') || defaultLiteUser()) as LiteUser,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
  },

  actions: {
    setUser(user: LiteUser) {
      this.user = user;
    },
    setAuthState(state: boolean) {
      this.authenticated = state;
    },
  },
});
