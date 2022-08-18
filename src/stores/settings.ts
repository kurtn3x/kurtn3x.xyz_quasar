import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkmode: LocalStorage.getItem('darkmode'),
    theme: LocalStorage.getItem('theme'),
  }),

  getters: {
    darkmode_state: (state) => state.darkmode,
    theme_state: (state) => state.theme,
  },

  actions: {},
});
