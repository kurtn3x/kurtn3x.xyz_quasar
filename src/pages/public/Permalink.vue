<template>
  <div v-if="ok" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="!ok">Something went wrong :/. The link is probably invalid.</div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    return {
      localStore,
      q,
      ok: ref(true),
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
      .get('/files/permalink/' + id, axiosConfig)
      .then((response) => {
        if (response.status == 200) {
          this.$router.push(
            '/public/' + response.data.type + '/' + response.data.id
          );
        } else {
          this.ok = false;
        }
      })
      .catch((error) => {
        if (error.response) {
          this.notify('negative', error.response.data.error);
        } else {
          console.log(error);
        }
        this.ok = false;
        console.log(error);
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
