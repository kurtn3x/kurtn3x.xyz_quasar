<template>
  <div></div>
</template>

<script>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { defaultUser } from 'src/models';

export default {
  name: 'UserProfile',

  setup() {
    const q = useQuasar();
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axiosConfig,
      user: ref(defaultUser()),
      q,
    };
  },

  created() {
    this.getUser();
  },

  methods: {
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    getUser() {
      var id = this.$route.params.id;
      api
        .get('/profile/id/' + id, this.axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.$router.push('/user/' + response.data.account.username);
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          console.log(error);
        });
    },
  },
};
</script>
