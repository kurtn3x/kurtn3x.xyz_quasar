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

      <div
        class="row"
        :class="darkmode ? 'bg-grey-7 text-white' : 'bg-grey-4 text-dark'"
      >
        <q-btn
          stretch
          flat
          icon="download"
          :label="'Download (' + item.size + ')'"
          class="text-weight-bold text-caption"
          @click="downloadFile(item.id)"
        />
        <q-separator vertical size="2px" />

        <div
          v-if="
            !Object.values(availablePreviews).every(
              (item) => item.available == false
            )
          "
          class="row"
        >
          <q-btn
            stretch
            flat
            label="Open with"
            icon-right="expand_more"
            class="text-weight-bold text-caption"
          >
            <q-menu>
              <q-list separator>
                <template
                  v-for="(value, propertyName) in availablePreviews"
                  v-bind:key="propertyName"
                >
                  <q-item
                    v-if="value.available"
                    clickable
                    dense
                    @click="setMime(propertyName, false)"
                    v-close-popup
                  >
                    <q-item-section>
                      <q-item-label>{{ value.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
          <q-separator vertical size="2px" />
        </div>
      </div>

      <q-card-section>
        <VideoView :prop-item="item" v-if="mimePreview.video" />
        <div v-if="mimePreview.image">
          <q-img :src="src" />
        </div>
        <div v-if="mimePreview.code">Code Editor</div>
        <div v-if="mimePreview.text">Text Editor</div>
        <div v-if="mimePreview.wysiwyg">WYSIWYG</div>
        <div v-if="mimePreview.pdf">PDF</div>
        <div v-if="Object.values(mimePreview).every((item) => item === false)">
          No Preview available.
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, defineAsyncComponent } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { FolderEntryType } from 'src/types/index';
import { update } from 'lodash';

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

const WYSIWYGMIME = ['wysiwyg'];

const TEXTMIME = ['text'];

const CODEMIME = ['code'];

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
      availablePreviews: ref({
        text: {
          available: false,
          label: 'Text Editor',
        },
        code: {
          available: false,
          label: 'Code Editor',
        },
        wysiwyg: {
          available: false,
          label: 'WYSIWYG (HTML) Editor',
        },
        markdown: {
          available: false,
          label: 'Markdown Preview',
        },
      }),
      mimePreview: ref({
        video: false,
        image: false,
        pdf: false,
        text: false,
        code: false,
        wysiwyg: false,
        markdown: false,
      }),
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
      this.setMime(newVal.mime, true);
    },
  },

  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },

    setMime(mime: string, updateAvail: boolean) {
      Object.keys(this.mimePreview).forEach(
        (v) => ((this.mimePreview as any)[v] = false)
      );
      if (updateAvail) {
        Object.keys(this.availablePreviews).forEach(
          (v) => ((this.availablePreviews as any)[v]['available'] = false)
        );
      }

      if (VIDEOMIME.includes(mime)) {
        this.mimePreview.video = true;
      } else if (IMAGEMIME.includes(mime)) {
        this.mimePreview.image = true;
      } else if (PDFMIME == mime) {
        this.mimePreview.pdf = true;
      } else if (TEXTMIME.includes(mime)) {
        this.mimePreview.text = true;
        if (updateAvail) {
          this.availablePreviews.text.available = true;
          this.availablePreviews.code.available = true;
        }
      } else if (CODEMIME.includes(mime)) {
        this.mimePreview.code = true;
        if (updateAvail) {
          this.availablePreviews.text.available = true;
          this.availablePreviews.code.available = true;
        }
      } else if (WYSIWYGMIME.includes(mime)) {
        this.mimePreview.wysiwyg = true;
        if (updateAvail) {
          this.availablePreviews.wysiwyg.available = true;
          this.availablePreviews.text.available = true;
          this.availablePreviews.code.available = true;
        }
      } else if (updateAvail) {
        this.availablePreviews.wysiwyg.available = true;
        this.availablePreviews.text.available = true;
        this.availablePreviews.code.available = true;
      }
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
