<template>
  <div v-if="!allowed && !loading">Not allowed.</div>
  <div v-if="allowed && !loading">
    <div class="text-primary text-h4 text-center q-mt-lg">
      File: {{ fileData.name }}
    </div>
    <div class="row justify-center">
      <div style="max-width: 450px">
        <q-expansion-item
          icon="info"
          label="File Info"
          class="q-mt-lg text-h5 text-center"
          style="min-width: 450px"
        >
          <q-card
            bordered
            style="
              white-space: nowrap;
              overflow: scroll;
              text-overflow: ellipsis;
            "
          >
            <q-card-section>
              <div class="text-h6 text-left" style="text-decoration: underline">
                Name: {{ fileData.name }}
                <q-tooltip class="text-body1">
                  File ID: {{ fileData.id }}</q-tooltip
                >
              </div>
              <div class="text-h6 text-left" style="text-decoration: underline">
                Owner: {{ fileData.owner }}
                <q-tooltip class="text-body1">
                  Owner ID: {{ fileData.ownerid }}</q-tooltip
                >
              </div>
              <div class="text-h6 text-left">
                Modified: {{ fileData.modified }}
              </div>
              <div class="text-h6 text-left">
                Created: {{ fileData.created }}
              </div>
              <div class="text-h6 text-left">Path: {{ fileData.path }}</div>
              <div class="text-h6 text-left">Size: {{ fileData.size }}</div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </div>
    </div>
    <div class="row justify-center">
      <q-btn
        label="Download"
        icon="file_download"
        class="cursor-pointer bg-green text-white q-mt-lg"
        flat
        @click="openInNewTab(fileData.id)"
        size="xl"
      />
    </div>
  </div>
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
      text_animation: ref(true),
      loading: ref(true),
      allowed: ref(false),
      fileData: ref({
        name: 'file.name',
        owner: 'file.user.name',
        ownerid: 'file.user.id',
        modified: "file.modified.strftime('%Y-%m-%d, %H:%M:%S')",
        created: "file.created.strftime('%Y-%m-%d, %H:%M:%S')",
        path: 'file.path',
        size: 'file.size',
        id: 'id',
      }),
    };
  },
  computed: {
    mobile() {
      if (this.q.screen.width < 600) {
        return true;
      } else {
        return false;
      }
    },
  },
  created() {
    this.getInitialFile();
  },
  methods: {
    openInNewTab(id) {
      window
        .open('https://api.kurtn3x.xyz/files/download/' + id, '_blank')
        .focus();
    },
    notify(type, message) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },
    getInitialFile() {
      var id = this.$route.params.id;
      const axios_config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/files/public/file/' + id, axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.allowed = true;
            this.loading = false;
            this.fileData = response.data;
          } else {
            this.loading = false;
            this.allowed = false;
          }
        })
        .catch((error) => {
          this.notify('negative', 'API ERROR :/');
          this.loading = false;
          console.log(error);
          this.allowed = false;
        });
    },
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
</style>
