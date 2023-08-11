<template><div></div></template>

<script>
import { useQuasar } from 'quasar';

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
    });
    this.$router.push('/');
  },
};
</script>

<style scoped></style>
