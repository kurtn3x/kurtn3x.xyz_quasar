<template>
  <div v-if="ok">Redirecting...</div>
  <div v-if="!ok">Something went wrong :/</div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';

export default defineComponent({
  name: 'IndexPage',

  setup() {
    const userStore = useUserStore();
    const settings_store = useSettingsStore();
    const q = useQuasar();

    return {
      userStore,
      settings_store,
      q,
      ok: ref(true),
    };
  },
  created() {
    var id = this.$route.params.id;
    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': this.q.cookies.get('csrftoken'),
      },
    };
    api
      .get('/files/permalink/' + id, axios_config)
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
        this.notify('negative', 'API ERROR :/');
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
