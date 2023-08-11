<template>
  <div
    class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center"
  >
    <div>
      <div class="text-h5">404</div>

      <div class="text-h5">This site does not exist.</div>

      <q-btn
        class="q-mt-md"
        color="layout-bg"
        text-color="layout-text"
        unelevated
        to="/"
        label="Home"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorNotFound',
});
</script>
