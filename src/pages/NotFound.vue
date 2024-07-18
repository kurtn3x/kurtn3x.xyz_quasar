<template>
  <ErrorPage error-message="This site does not exist." />
</template>

<script>
import ErrorPage from 'src/components/ErrorPage.vue';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'FileView',
  components: {
    ErrorPage,
  },
});
</script>
