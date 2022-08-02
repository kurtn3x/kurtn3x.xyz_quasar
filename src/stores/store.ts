import { defineStore } from 'pinia';

export const useStore = defineStore('counter', {
  state: () => ({
    isAuthenticated: false,
  }),
  getters: {},
  actions: {
    setAccess(state: any, access: boolean) {
      state.isAuthenticated = access;
    },
  },
});
