<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div
    v-if="initialFetch && initialFetchSuccessful && passwordSet && !passwordOk"
  >
    <div class="text-h6 text-center text-weight-bolder q-mt-lg">
      Password required
    </div>
    <div class="row justify-center">
      <q-input
        autofocus
        v-model="password"
        :color="darkmode ? 'white' : 'dark'"
        label="Password"
        :type="isPwd ? 'password' : 'text'"
        outlined
        class="q-mt-md"
        input-class="text-body1"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            class="pw_icon"
            :name="isPwd ? 'visibility' : 'visibility_off'"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input>
    </div>
    <div class="row justify-center q-mt-lg">
      <q-btn
        push
        class="bg-green text-white"
        label="OK"
        icon="done"
        size="lg"
        style="width: 250px"
        @click="getFile"
      />
    </div>
  </div>
  <div
    v-if="
      initialFetch && initialFetchSuccessful && (!passwordSet || passwordOk)
    "
  >
    <div class="text-primary text-h4 text-center q-mt-lg ellipsis">
      <q-icon name="file_present" class="q-mr-sm" />
      {{ fileData.name }}
    </div>
    <div class="row justify-center items-center full-width q-mt-lg">
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
          <q-card flat class="bg-transparent">
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
      fileId: ref(''),
      initialFetch: ref(true),
      initialFetchSuccessful: ref(false),
      passwordSet: ref(false),
      passwordOk: ref(false),
      password: ref(''),
      isPwd: ref(true),
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
      var url = 'https://api.kurtn3x.xyz/files/download/file/' + id;
      if (this.passwordSet == true) {
        url += '?password=' + this.password;
      }
      window?.open(url, '_blank')?.focus();
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
      if (this.fileId == '') {
        this.fileId = this.$route.params.id as string;
      }

      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };

      var url = '/files/file/' + this.fileId;
      if (this.passwordSet == true) {
        url += '?password=' + this.password;
      }

      api
        .get(url, axiosConfig)
        .then((response) => {
          console.log(response);
          if (response.status == 200) {
            this.initialFetchSuccessful = true;
            this.initialFetch = true;
            this.passwordOk = true;
            this.fileData = response.data;
          } else if (response.status == 290) {
            // file is password protected but no password has been given → Prompt password input
            this.initialFetchSuccessful = true;
            this.initialFetch = true;
            this.passwordSet = true;
            this.passwordOk = false;
          } else if (response.status == 291) {
            // wrong password
            this.initialFetchSuccessful = true;
            this.initialFetch = true;
            this.passwordSet = true;
            this.passwordOk = false;
            this.notify('negative', response.data.error);
          } else {
            this.initialFetch = true;
            this.initialFetchSuccessful = false;
          }
        })
        .catch((error) => {
          console.log('Error');
          console.log(error);

          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            this.notify('negative', error.message);
          }
          this.initialFetch = true;
          this.initialFetchSuccessful = false;
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
