import { defineStore } from 'pinia';

export const useAuthStore = defineStore('authenticated', {
  state: () => ({
    authenticated: false,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
  },

  actions: {},
});
