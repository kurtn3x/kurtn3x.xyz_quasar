<template>
  <q-list>
    <q-item clickable class="bg-layout-bg text-layout-text">
      <q-item-section avatar>
        <q-icon name="keyboard_arrow_right" />
      </q-item-section>

      <q-item-section>
        <q-item-label>Themes</q-item-label>
      </q-item-section>
      <q-menu
        anchor="top end"
        self="top start"
        style="overflow-x: hidden; width: 150px"
      >
        <q-list>
          <q-item
            clickable
            @click="setTheme('default')"
            style="background: #3b4fb5"
          />

          <q-item
            clickable
            @click="setTheme('cool-orange')"
            style="background: #ee4d2e"
          />
          <q-item
            clickable
            @click="setTheme('nice-green')"
            style="background: #1db992"
          />
          <q-item
            clickable
            @click="setTheme('olive-green')"
            style="background: #bfbc06"
          />
          <q-item
            clickable
            @click="setTheme('epic-blue')"
            style="background: #008fff"
          />
          <q-item
            clickable
            @click="setTheme('dark')"
            style="background: #1d1d1d"
          />
          <q-item
            clickable
            @click="setTheme('light')"
            style="background: #f8f0e3"
          />
        </q-list>
      </q-menu>
    </q-item>
    <q-item class="bg-layout-bg text-layout-text" style="width: 170px">
      <q-item-section>
        <q-toggle
          v-model="darkmodeToogle"
          checked-icon="check"
          color="green"
          unchecked-icon="clear"
          label="Dark Mode"
          @click="darkmodeChanged"
        />
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script lang="js">
import { defineComponent, ref } from 'vue';
import { useSettingsStore } from 'stores/settings';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'RightClickLayoutMenu',

  setup() {
    const settingsStore = useSettingsStore();
    const q = useQuasar();
    const darkmodeToogle = ref(settingsStore.darkmodeState);


    return {
      darkmodeToogle,
      q,
      settingsStore,
    };
  },

  computed: {
    darkmode() {
      return this.settingsStore.darkmode;
    },
    mobile() {
      if (this.q.screen.width < 700) {
        return true;
      } else {
        return false;
      }
    },

  },

  methods: {
    setTheme(theme) {
      document.body.setAttribute('data-theme', theme);
      this.settingsStore.theme = theme;
    },

    darkmodeChanged() {
      this.settingsStore.darkmode = this.darkmodeToogle;
    },
  },
});
</script>

<style></style>
