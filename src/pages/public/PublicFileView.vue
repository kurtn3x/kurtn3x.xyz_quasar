<template>
  <div v-if="loading" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="!allowed && !loading">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="allowed && !loading">
    <div class="text-primary text-h4 text-center q-mt-lg">
      File: {{ fileData.name }}
    </div>
    <q-separator class="q-ma-md" size="3px" />
    <div class="row justify-center">
      <div>
        <q-card
          bordered
          flat
          class="rounded-borders q-ma-sm bg-transparent"
          style="min-width: 350px"
        >
          <q-expansion-item
            icon="info"
            label="File Info"
            class="text-h5 text-center"
            style="min-width: 350px"
          >
            <q-separator />
            <q-card-section>
              <div class="text-h6 text-left row">
                <a class="text-weight-bolder col">Name:</a>
                <a class="col-8">{{ fileData.name }}</a>
              </div>
              <div
                class="text-h6 text-left row q-mt-md"
                style="overflow-wrap: break-word; line-break: anywhere"
              >
                <a class="text-weight-bolder col">ID:</a>
                <a class="col-8">{{ fileData.id }}</a>
              </div>
              <div
                class="text-h6 text-left row q-mt-md"
                style="overflow-wrap: break-word; line-break: anywhere"
              >
                <a class="text-weight-bolder col">Path:</a>
                <a class="col-8">{{ fileData.path }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Owner:</a>
                <a
                  class="text-blue col-8"
                  :href="'https://www.kurtn3x.xyz/user/' + fileData.owner"
                >
                  {{ fileData.owner }}</a
                >
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Modified:</a>
                <a class="col-8">{{ fileData.modified }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Created:</a>
                <a class="col-8">{{ fileData.created }}</a>
              </div>
            </q-card-section>
          </q-expansion-item>
        </q-card>
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
        style="min-width: 350px"
      />
    </div>
    <div class="text-h6 text-center q-mt-md">
      <a class="text-weight-bolder">Size:</a> {{ fileData.size }}
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

const filedata: FileItemExtendedType = {
  id: 'ca9c1719-82ff-4bb6-90f0-2e35251bcac6',
  name: '1_1_1.pdf',
  modified: '2023-09-14, 06:37:04',
  created: '2023-08-16, 10:42:01',
  size: '137.8KB',
  permissions: 'owner',
  owner: 'kurt',
  ownerid: 'abeb69f0-a469-4511-bc88-fd3d8635c194',
  path: 'Home',
  type: 'file',
  mime: 'application/pdf',
};

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();
    return {
      localStore,
      q,
      text_animation: ref(true),
      loading: ref(true),
      allowed: ref(false),
      fileData: ref(filedata) as Ref<FileItemExtendedType>,
      // fileData: ref({
      //   name: '',
      //   owner: '',
      //   ownerid: '',
      //   modified: '',
      //   created: '',
      //   path: '',
      //   size: '0',
      //   id: '',
      //   permissions: '',
      // }),
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
    openInNewTab(id: string) {
      window
        ?.open('https://api.kurtn3x.xyz/files/content/file/' + id, '_blank')
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
    getInitialFile() {
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
