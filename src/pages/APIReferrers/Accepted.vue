<template><div></div></template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default {
  name: 'AcceptedView',
  setup() {
    const q = useQuasar();

    return {
      q,
    };
  },
  created() {
    this.q.notify({
      type: 'positive',
      message: 'Successfully authenticated, you can now log in!',
      position: 'top',
    });
    this.$router.push('/');
  },
};
</script>

<style scoped></style>
