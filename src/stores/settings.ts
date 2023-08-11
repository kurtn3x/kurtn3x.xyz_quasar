import { defineStore } from 'pinia';
import { LocalStorage } from 'quasar';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    darkmode: LocalStorage.getItem('darkmode'),
    theme: LocalStorage.getItem('theme'),
    backgroundAnimation: LocalStorage.getItem('backgroundAnimation'),
  }),

  getters: {
    darkmodeState: (state) => state.darkmode,
    themeState: (state) => state.theme,
  },

  actions: {},
});
