<template>
  <div>Redirecting to userprofile...</div>
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
    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axios_config,
      user: ref(defaultUser()),
      q,
    };
  },

  created() {
    this.getUser();
  },

  computed: {},

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
        .get('/profile/id/' + id, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.$router.push('/user/' + response.data.account.username);
            this.notify('positive', 'Redirecting to user profile.');
          } else {
            this.notify('negative', 'User does not exist.');
          }
        })
        .catch((error) => {
          this.notify('negative', 'Something went wrong with the API :/');
          console.log(error);
        });
    },
  },
};
</script>
