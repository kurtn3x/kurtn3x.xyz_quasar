<template>
  <q-card
    style="margin-top: 50px; z-index: 1; filter: sepia(0.6)"
    bordered
    class="bg-layout-bg text-center fullscreen items-center"
  >
    <div class="q-mt-lg">
      <div class="q-ma-md text-layout-text text-h2 text-weight-bolder">
        OOPS :&lpar;
      </div>
      <div class="q-ma-md text-layout-text text-h6 q-mt-lg">
        Something went wrong.
      </div>
      <div class="q-ma-md text-layout-text text-h6" style="max-width: 450px">
        The error was: {{ error }}
      </div>
    </div>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ErrorPage',
  props: {
    errorMessage: String,
  },
  setup(props) {
    return {
      error: ref(props.errorMessage),
    };
  },
  watch: {
    errorMessage(newVal, oldVal) {
      this.error = newVal;
    },
  },
});
</script>
