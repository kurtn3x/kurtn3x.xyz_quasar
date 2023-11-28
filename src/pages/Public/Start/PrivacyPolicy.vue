<template>
  <div class="q-ma-sm row justify-center">
    <q-card
      flat
      bordered
      class="full-width fade-in-text effect3dbox"
      style="background-color: transparent; max-width: 600px"
    >
      <q-expansion-item
        label="Cookies"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <div class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-md">
          Only used for Authorization and CSRF-Prevention. No 3rd-party cookies.
        </div>
      </q-expansion-item>
      <q-separator color="layout-text" />
      <q-expansion-item
        label="Privacy Policy"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <div class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-md">
          No data besides Account-Data is stored. No data is shared to 3rd
          parties. Only Username & Password are needed to access an account, any
          other info is optional. (A correct E-Mail is recommended for recovery)
        </div>
      </q-expansion-item>
      <q-separator color="layout-text" />
      <q-expansion-item
        label="Contact"
        header-style="fontSize: 1.9em; height: 70px"
        header-class="text-h5 text-weight-bolder text-layout-text bg-layout-bg"
        class="full-width text-center"
        expand-icon-class="text-layout-text"
      >
        <div class="text-center text-body1 q-mr-lg q-ml-lg q-mt-sm q-mb-md">
          Mail: kurtn3x@proton.me <br />
          Discord: nex1233 <br />
        </div>
      </q-expansion-item>
    </q-card>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'PrivacyPolicyView',
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
