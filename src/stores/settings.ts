import { defineStore } from 'pinia';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkmode: true,
  }),

  getters: {
    darkmode_state: (state) => state.darkmode,
  },

  actions: {},
});
