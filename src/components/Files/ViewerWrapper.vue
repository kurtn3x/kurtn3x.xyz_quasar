<template>
  <q-dialog
    v-model="showDialog"
    persistent
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card>
      <q-bar>
        <a
          :style="maximizedToggle == false ? 'max-width: 250px' : ''"
          class="ellipsis"
        >
          {{ item.name }}
        </a>
        <q-space />

        <q-btn
          dense
          flat
          icon="minimize"
          @click="maximizedToggle = false"
          :disable="!maximizedToggle"
        >
          <q-tooltip v-if="maximizedToggle" class="bg-white text-primary"
            >Minimize</q-tooltip
          >
        </q-btn>
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="maximizedToggle = true"
          :disable="maximizedToggle"
        >
          <q-tooltip v-if="!maximizedToggle" class="bg-white text-primary"
            >Maximize</q-tooltip
          >
        </q-btn>
        <q-btn dense flat icon="close" @click="close">
          <q-tooltip class="bg-white text-primary">Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <VideoView :prop-item="item" />
      </q-card-section>
      <q-card-section>
        <q-btn
          :label="'Download (' + item.size + ')'"
          icon="file_download"
          class="cursor-pointer bg-green text-white q-mt-lg"
          push
          @click="downloadFile(item.id)"
          size="xl"
          style="min-width: 330px"
        />
      </q-card-section>
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
  'image/jpeg',
  'image/jpeg',
  'image/gif',
  'image/png',
  'image/svg+xml',
  'image/webp',
];

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
    var showDialog = ref(props.active) as Ref<boolean>;
    return {
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
