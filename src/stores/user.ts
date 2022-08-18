import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import { User } from 'src/models';
import { LocalStorage } from 'quasar';
import { defaultUser } from 'src/models';

export const useUserStore = defineStore('user', {
  state: () => ({
    authenticated: LocalStorage.getItem('authenticated') || false,
    user: (LocalStorage.getItem('user') || defaultUser()) as User,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
  },

  actions: {
    setUser(user: User) {
      this.user = user;
    },
  },
});
