import { defineStore } from 'pinia';

export const useAuthStore = defineStore('authenticated', {
  state: () => ({
    authenticated: false,
    darkmode: true,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
    darkmode_state: (state) => state.darkmode,
  },

  actions: {},
});
