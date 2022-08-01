<template>
  <q-layout view="hHh lpR fff">
    <q-header reveal elevated class="bg-primary text-dark" height-hint="98">
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="menu"
          class="q-mr-sm"
          @click="toggleLeftDrawer"
        />
        <q-separator dark vertical inset />
        <q-btn stretch flat label="Home" to="/" />

        <q-space />

        <q-btn-dropdown
          color="amber"
          text-color="dark"
          dropdown-icon="change_history"
          v-model="menu"
          :content-style="{ backgroundColor: '#272727' }"
          icon="person"
        >
          <q-item clickable v-close-popup to="/login" class="text-white">
            <q-item-section>
              <q-item-label>Login</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup to="/register" class="text-white">
            <q-item-section>
              <q-item-label>Register</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable v-close-popup to="/register" class="text-white">
            <q-item-section>
              <q-item-label>Settings</q-item-label>
            </q-item-section>
          </q-item>
        </q-btn-dropdown>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" side="left" overlay bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-drawer v-model="rightDrawerOpen" side="right" overlay bordered>
      <!-- drawer content -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer elevated class="bg-grey-8 text-white">
      <q-toolbar>
        <q-toolbar-title>
          <div>Title</div>
        </q-toolbar-title>
        <q-toggle
          v-model="mode"
          checked-icon="check"
          color="green"
          unchecked-icon="clear"
          label="Dark Mode"
          @click="toogleDarkMode"
        />
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { ref } from 'vue';
import { Dark } from 'quasar';

export default {
  setup() {
    const leftDrawerOpen = ref(false);
    const rightDrawerOpen = ref(false);
    Dark.set(true);

    return {
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },

      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },

      toogleDarkMode() {
        Dark.toggle();
      },

      mode: ref(true),
    };
  },
};
</script>
