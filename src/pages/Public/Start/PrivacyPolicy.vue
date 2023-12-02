<template>
  <q-page class="bg row justify-center" :class="theme">
    <ParticlesIndex />

    <q-card
      flat
      class="full-width fade-in-text q-mt-md text-layout-text"
      style="background-color: transparent; max-width: 600px"
    >
      <q-expansion-item
        label="Cookies"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <q-list bordered>
          <div
            class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-sm text-layout-text"
          >
            Only used for Authorization and CSRF-Prevention. No 3rd-party
            cookies.
          </div>
        </q-list>
      </q-expansion-item>
      <q-separator color="layout-text" />
      <q-expansion-item
        label="Privacy Policy"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <q-list bordered>
          <div
            class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-md text-layout-text"
          >
            No data besides Account-Data is stored. No data is shared to 3rd
            parties. Only Username & Password are needed to access an account,
            any other info is optional. (A correct E-Mail is recommended for
            recovery)
          </div>
        </q-list>
      </q-expansion-item>
      <q-separator color="layout-text" />
      <q-expansion-item
        label="Contact"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <q-list bordered>
          <div
            class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-md text-layout-text"
          >
            Mail: kurtn3x@proton.me <br />
            Discord: nex1233 <br />
          </div>
        </q-list>
      </q-expansion-item>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { useLocalStore } from 'stores/localStore';
import ParticlesIndex from 'components/ParticlesIndex.vue';
import { getThemeBackground } from 'components/themes';

export default defineComponent({
  name: 'PrivacyPolicyView',
  components: { ParticlesIndex },
  setup() {
    const localStore = useLocalStore();

    return {
      localStore,
    };
  },
  computed: {
    theme() {
      var t = getThemeBackground(this.localStore.theme);
      return t;
    },
  },
});
</script>

<style scoped lang="scss">
.fade-in-text {
  animation: fadeIn 3s;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
</style>
