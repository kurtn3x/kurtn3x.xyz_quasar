<template><div></div></template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default {
  name: 'DeclinedView',
  setup() {
    const q = useQuasar();

    return {
      q,
    };
  },
  created() {
    this.q.notify({
      type: 'negative',
      message:
        'Something went wrong. Please login to request a new verification E-Mail.',
    });
    this.$router.push('/');
  },
};
</script>

<style scoped></style>
