<template>
  <div v-if="loading" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="!allowed && !loading">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="allowed && !loading" class="q-ma-sm">
    <div class="text-primary text-h4 text-center q-ma-md ellipsis">
      <q-icon name="file_present" class="q-mr-sm" />
      {{ fileData.name }}
    </div>
    <div class="row justify-center items-center full-width">
      <q-list
        bordered
        class="rounded-borders full-width"
        style="max-width: 500px"
      >
        <q-expansion-item
          icon="info"
          label="File Info"
          class="text-h5 text-center"
        >
          <q-separator />
          <q-card flat>
            <div class="q-ma-sm">
              <div class="text-h6 text-left row">
                <a class="text-weight-bolder col">Name:</a>
                <a class="col-8 ellipsis">{{ fileData.name }}</a>
                <q-tooltip class="text-body1">
                  {{ fileData.name }}
                </q-tooltip>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Size:</a>
                <a class="col-8">{{ fileData.size }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">ID:</a>
                <a class="col-8 ellipsis">{{ fileData.id }}</a>
                <q-tooltip class="text-body1">
                  {{ fileData.id }}
                </q-tooltip>
              </div>
              <div
                class="text-h6 text-left row q-mt-md"
                style="overflow-wrap: break-word; line-break: anywhere"
              >
                <a class="text-weight-bolder col">Path:</a>
                <a class="col-8 ellipsis">{{ fileData.path }}</a>
                <q-tooltip class="text-body1">
                  {{ fileData.path }}
                </q-tooltip>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Owner:</a>
                <a
                  class="text-blue col-8 ellipsis"
                  :href="'https://www.kurtn3x.xyz/user/' + fileData.owner"
                >
                  {{ fileData.owner }}</a
                >
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Modified:</a>
                <a class="col-8 ellipsis">{{ fileData.modified }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Created:</a>
                <a class="col-8 ellipsis">{{ fileData.created }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Mime:</a>
                <a class="col-8 ellipsis">{{ fileData.mime }}</a>
              </div>
            </div>
          </q-card>
        </q-expansion-item></q-list
      >
    </div>
    <div class="row justify-center">
      <q-btn
        :label="'Download (' + fileData.size + ')'"
        icon="file_download"
        class="cursor-pointer bg-green text-white q-mt-lg"
        push
        @click="downloadFile(fileData.id)"
        size="xl"
        style="min-width: 330px"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { FileItemExtendedType } from 'src/types/index';
import type { Ref } from 'vue';

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();
    return {
      localStore,
      q,
      loading: ref(true),
      allowed: ref(false),
      fileData: ref({}) as Ref<FileItemExtendedType>,
    };
  },
  computed: {
    darkmode() {
      return this.localStore.darkmode;
    },
  },
  created() {
    this.getFile();
  },
  methods: {
    downloadFile(id: string) {
      window
        ?.open(
          'https://api.kurtn3x.xyz/files/download/file/' +
            id +
            '?password=test1234',
          '_blank'
        )
        ?.focus();
    },

    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
        multiLine: true,
      });
    },

    getFile() {
      var id = this.$route.params.id;
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      api
        .get('/files/file/' + id, axiosConfig)
        .then((response) => {
          if (response.status == 200) {
            this.allowed = true;
            this.loading = false;
            this.fileData = response.data;
            console.log(this.fileData);
          } else {
            this.loading = false;
            this.allowed = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
          this.loading = false;
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
.my-custom-class {
  outline: 5px dotted green;
}
</style>
