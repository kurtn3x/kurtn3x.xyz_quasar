<template>
  <div
    v-if="loading"
    class="absolute-center"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div v-if="!loading">
    <ErrorPage error-message="Something went wrong" />
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import ErrorPage from 'src/components/ErrorPage.vue';

export default defineComponent({
  name: 'ShortLinkView',
  components: {
    ErrorPage,
  },
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    return {
      localStore,
      q,
      loading: ref(true),
    };
  },
  created() {
    var id = this.$route.params.id;

    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': this.q.cookies.get('csrftoken'),
      },
    };

    api
      .get('/files/sl/' + id, axiosConfig)
      .then((response) => {
        if (response.status == 200) {
          this.$router.push(
            '/files/' + response.data.objectType + '/' + response.data.objectId
          );
        } else {
          this.loading = false;
        }
      })
      .catch((error) => {
        if (error.response) {
          this.notify('negative', error.response.data.error);
        }
        this.loading = false;
      });
  },
});
</script>

<style scoped>
.disable-select {
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}

.my-custom-class {
  outline: 5px dotted green;
}
</style>
