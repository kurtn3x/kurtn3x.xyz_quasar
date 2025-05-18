<template>
  <q-card
    class="bg-transparent no-shadow"
    flat
    bordered
    dark
  >
    <div>
      <q-btn
        flat
        class="full-width bg-layout-bg text-layout-text"
        :label="darkmode ? 'Light' : 'Dark'"
        @click="toggleDarkmode"
        :icon="darkmode ? 'light_mode' : 'dark_mode'"
      />
    </div>
    <q-separator color="layout-text" />

    <div
      class="row justify-evenly"
      style="width: 155px"
    >
      <template
        v-for="theme in themes"
        :key="theme.name"
      >
        <q-btn
          outline
          color="layout-text"
          @click="setTheme(theme.name)"
          :class="theme.preview"
          style="width: 32px"
          class="q-mt-xs q-mb-xs"
        />
      </template>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { themes } from 'components/lib/themes';
import { useLocalStore } from 'stores/localStore';

export default defineComponent({
  name: 'ThemeSelector',

  setup() {
    const localStore = useLocalStore();

    const darkmode = computed(() => localStore.darkmodeState);

    const toggleDarkmode = () => {
      localStore.darkmode = !darkmode.value;
    };

    const setTheme = (theme: string) => {
      document.body.setAttribute('data-theme', theme);
      localStore.theme = theme;
    };

    return {
      themes,
      darkmode,
      toggleDarkmode,
      setTheme,
    };
  },
});
</script>
