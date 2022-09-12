import { defineStore } from 'pinia';
import { UserPreview } from 'src/models';
import { LocalStorage } from 'quasar';
import { defaultUserPreview } from 'src/models';

export const useUserStore = defineStore('user', {
  state: () => ({
    authenticated: LocalStorage.getItem('authenticated') || false,
    user: (LocalStorage.getItem('user') || defaultUserPreview()) as UserPreview,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
  },

  actions: {
    setUser(user: UserPreview) {
      this.user = user;
    },
    setAuthState(state: boolean) {
      this.authenticated = state;
    },
  },
});
