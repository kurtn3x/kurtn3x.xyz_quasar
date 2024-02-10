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
    <q-dialog v-model="itemInformationDialog">
      <q-card bordered style="width: 350px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm">{{ item.name }}</q-toolbar-title>
          <q-tooltip class="text-body1 bg-layout-bg text-layout-text">
            {{ item.name }}
          </q-tooltip>
        </q-toolbar>
        <div class="q-ma-md">
          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Owner</div>
            <div class="col q-ml-sm">
              <a
                :href="'https://www.kurtn3x.xyz/user/' + item.owner"
                class="text-blue"
              >
                {{ item.owner }}
              </a>
            </div>
          </div>
          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Type</div>
            <div class="col q-ml-sm">{{ item.type }}</div>
          </div>

          <div v-if="item.type != 'folder'">
            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder col-3">Mime</div>
              <div class="col q-ml-sm" style="line-break: anywhere">
                {{ item.mime }}
              </div>
            </div>

            <div class="text-body1 q-mt-md row">
              <div class="text-weight-bolder col-3">Size</div>
              <div class="col q-ml-sm">
                {{ item.size }}
              </div>
            </div>
          </div>

          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Created</div>
            <div class="col q-ml-sm">{{ item.created }}</div>
          </div>

          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Modified</div>
            <div class="col q-ml-sm">{{ item.modified }}</div>
          </div>

          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Folder</div>
            <div class="col q-ml-sm" style="line-break: anywhere">
              {{ item.path }}
            </div>
          </div>
        </div>

        <q-separator class="q-mt-sm" />

        <q-card-actions align="center" class="q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            push
            class="bg-green text-white col"
            icon="done"
            size="md"
            label="OK"
            style="max-width: 130px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div
      class="text-primary text-h4 text-center q-mt-lg ellipsis text-weight-bolder"
    >
      <q-icon :name="getIcon(item.mime)" class="q-mr-sm" />
      {{ item.name }}
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        :label="'Download (' + item.size + ')'"
        icon="file_download"
        class="cursor-pointer bg-green text-white q-mt-lg"
        push
        @click="downloadFile(item.id)"
        size="xl"
        style="width: 380px"
      />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        icon="visibility"
        label="Open in File Viewer"
        class="cursor-pointer bg-light-blue-6 text-white q-mt-lg"
        push
        @click="filePreview = true"
        size="xl"
        style="width: 380px"
      />
    </div>
    <div class="row justify-center q-mt-sm">
      <q-btn
        label="File Information"
        icon="question_mark"
        class="cursor-pointer q-mt-lg bg-blue-8 text-white"
        push
        @click="itemInformationDialog = true"
        size="xl"
        style="width: 380px"
      />
    </div>

    <viewer-wrapper
      :propItem="item"
      :active="filePreview"
      :password="password"
      @close="filePreview = false"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { FileItemExtendedType } from 'src/types/index';
import ViewerWrapper from 'src/components/Files/ViewerWrapper.vue';
import { getIcon } from 'components/Files/mimeMap';

export default defineComponent({
  name: 'FileView',
  components: { ViewerWrapper },
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
      item: ref({}) as Ref<FileItemExtendedType>,
      filePreview: ref(false),
      itemInformationDialog: ref(false),
      getIcon,
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
          if (response.status == 200) {
            this.initialFetchSuccessful = true;
            this.initialFetch = true;
            this.passwordOk = true;
            this.item = response.data;
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
