<template>
  <q-dialog
    v-model="showDialog"
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="close"
  >
    <q-card style="min-width: 350px">
      <q-toolbar class="bg-layout-bg text-layout-text q-pa-none">
        <q-toolbar-title class="q-ml-md">{{ item.name }}</q-toolbar-title>
        <q-space />

        <q-btn
          flat
          stretch
          size="sm"
          icon="minimize"
          @click="maximizedToggle = false"
          :disable="!maximizedToggle"
        >
          <q-tooltip v-if="maximizedToggle">Minimize</q-tooltip>
        </q-btn>
        <q-btn
          flat
          stretch
          size="sm"
          icon="crop_square"
          @click="maximizedToggle = true"
          :disable="maximizedToggle"
        >
          <q-tooltip v-if="!maximizedToggle">Maximize</q-tooltip>
        </q-btn>
        <q-btn size="sm" flat stretch icon="close" @click="close" class="close">
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-toolbar>
      <q-bar
        class="q-pa-none"
        :class="darkmode ? 'bg-grey-7 text-white' : 'bg-grey-4 text-dark'"
      >
        <q-btn
          stretch
          flat
          icon="download"
          :label="'Download (' + item.size + ')'"
          class="text-weight-bold"
          @click="downloadFile(item.id)"
        />
        <q-separator vertical size="2px" />
      </q-bar>

      <q-card-section>
        <VideoView :prop-item="item" v-if="mimePreview.video" />
        <div v-if="mimePreview.image">
          <q-img :src="src" />
        </div>
        <div v-if="Object.values(mimePreview).every((item) => item === false)">
          No Preview available.
        </div>
      </q-card-section>
      <q-separator size="2px" class="q-ma-sm" />
      <q-card bordered>
        <q-expansion-item :label="item.name" class="text-h5 text-center">
          <q-separator />
          <q-card flat class="bg-transparent">
            <div class="q-ma-sm">
              <div class="text-h6 text-left row">
                <a class="text-weight-bolder col">Name:</a>
                <a class="col-8 ellipsis">{{ item.name }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Size:</a>
                <a class="col-8">{{ item.size }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">ID:</a>
                <a class="col-8 ellipsis">{{ item.id }}</a>
              </div>
              <div
                class="text-h6 text-left row q-mt-md"
                style="overflow-wrap: break-word; line-break: anywhere"
              >
                <a class="text-weight-bolder col">Path:</a>
                <a class="col-8 ellipsis">{{ item.path }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Modified:</a>
                <a class="col-8 ellipsis">{{ item.modified }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Created:</a>
                <a class="col-8 ellipsis">{{ item.created }}</a>
              </div>
              <div class="text-h6 text-left row q-mt-md">
                <a class="text-weight-bolder col">Mime:</a>
                <a class="col-8 ellipsis">{{ item.mime }}</a>
              </div>
            </div>
          </q-card>
        </q-expansion-item>
      </q-card>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, defineAsyncComponent } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { FolderEntryType } from 'src/types/index';

const VIDEOMIME = [
  'video/ogg',
  'video/ogg',
  'video/mp4',
  'video/mp4',
  'video/mp4',
  'video/x-matroska',
  'audio/mp4',
  'audio/mpeg',
  'audio/aac',
  'audio/x-caf',
  'audio/flac',
  'audio/ogg',
  'audio/wav',
  'application/x-mpegURL',
  'application/dash+xml',
];

const IMAGEMIME = [
  'image/jpeg',
  'image/jpeg',
  'image/gif',
  'image/png',
  'image/svg+xml',
  'image/webp',
];

const TEXTMIME = [''];

const CODEMIME = [''];

const PDFMIME = 'application/pdf';

const VideoView = defineAsyncComponent(() => import('./VideoView.vue'));

export default defineComponent({
  name: 'VideoViewer',
  components: {
    VideoView,
  },

  props: {
    propItem: Object,
    active: Boolean,
  },
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    var item = ref(props.propItem) as Ref<FolderEntryType>;
    var src = 'https://api.kurtn3x.xyz/files/download/file/' + item.value.id;
    var showDialog = ref(props.active) as Ref<boolean>;
    return {
      src,
      item,
      localStore,
      q,
      initialFetch: ref(true),
      initialFetchSuccessful: ref(false),
      showDialog,
      maximizedToggle: ref(true),
      mimePreview: {
        video: false,
        image: false,
        pdf: false,
        text: false,
        code: false,
      },
    };
  },
  computed: {
    darkmode() {
      return this.localStore.darkmode;
    },
  },
  watch: {
    active(newVal, oldVal) {
      this.showDialog = newVal;
    },
    propItem(newVal, oldVal) {
      this.item = newVal;
      this.setMime(newVal.mime);
    },
  },

  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },

    setMime(mime: string) {
      this.mimePreview.video = false;
      this.mimePreview.image = false;
      this.mimePreview.pdf = false;
      this.mimePreview.text = false;
      this.mimePreview.code = false;
      if (VIDEOMIME.includes(mime)) {
        this.mimePreview.video = true;
      } else if (IMAGEMIME.includes(mime)) {
        this.mimePreview.image = true;
      } else if (PDFMIME == mime) {
        this.mimePreview.pdf = true;
      } else if (TEXTMIME.includes(mime)) {
        this.mimePreview.text = true;
      } else if (CODEMIME.includes(mime)) {
        this.mimePreview.code = true;
      }
      console.log(this.mimePreview);
    },

    downloadFile(id: string) {
      var url = 'https://api.kurtn3x.xyz/files/download/file/' + id;
      window?.open(url, '_blank')?.focus();
    },
  },
});
</script>

<style>
.close:hover {
  background-color: rgba(255, 0, 0, 0.644);
}
</style>
