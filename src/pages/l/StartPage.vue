<template>
  <div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  created() {
    this.$router.push('/l/home/');
  },
});
</script>
