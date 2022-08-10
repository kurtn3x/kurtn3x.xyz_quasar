import { defineStore } from 'pinia';

export const useAuthStore = defineStore('authenticated', {
  state: () => ({
    authenticated: false,
    test: false,
  }),

  getters: {
    auth_state: (state) => state.authenticated,
    test_state: (state) => state.authenticated,
  },

  actions: {},
});
