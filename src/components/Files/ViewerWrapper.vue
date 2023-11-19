<template>
  <q-dialog v-model="itemInformationDialog">
    <ItemInformation :prop-item="propItem" />
  </q-dialog>
  <q-dialog
    v-model="showDialog"
    :maximized="maximizedToggle"
    transition-show="slide-up"
    transition-hide="slide-down"
    @hide="close"
  >
    <q-card style="min-width: 350px">
      <q-toolbar class="bg-light-blue-6 text-white q-pa-none">
        <a class="q-ml-md text-h6 ellipsis">Preview: {{ item.name }}</a>
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

      <div class="row bg-light-blue-8 text-white">
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
            <q-menu class="bg-light-blue-8 text-white">
              <q-list separator>
                <template
                  v-for="(value, propertyName) in availablePreviews"
                  v-bind:key="propertyName"
                >
                  <q-item
                    v-if="value.available"
                    dense
                    clickable
                    @click="setMime(value.mime, false)"
                    v-close-popup
                    class="text-body1"
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
        <q-btn
          stretch
          flat
          label="Info"
          class="text-weight-bold text-caption"
          @click="itemInformationDialog = true"
        />
        <q-separator vertical size="2px" />
      </div>

      <q-card-section style="min-height: 200px">
        <div v-if="mimePreview.video">
          <VideoView :item="item" />
        </div>
        <div v-else-if="mimePreview.image">
          <ImageView :item="item" />
        </div>
        <div v-else-if="mimePreview.code">Code Editor</div>
        <div v-else-if="mimePreview.text"><TextView :item="item" /></div>
        <div v-else-if="mimePreview.wysiwyg">
          <WysiwygView :item="item" />
        </div>
        <div v-else-if="mimePreview.pdf">
          <PdfView :item="item" />
        </div>
        <div v-else>
          <div class="text-h6 text-center q-mt-lg">No Preview available.</div>
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
import ItemInformation from './ItemInformation.vue';
import {
  IMAGEMIME,
  TEXTMIME,
  VIDEOMIME,
  WYSIWYGMIME,
  CODEMIME,
  PDFMIME,
} from 'components/Files/mimeMap';

const VideoView = defineAsyncComponent(
  () => import('./FilePreviews/VideoView.vue')
);
const WysiwygView = defineAsyncComponent(
  () => import('./FilePreviews/WysiwygView.vue')
);
const TextView = defineAsyncComponent(
  () => import('./FilePreviews/TextView.vue')
);
const PdfView = defineAsyncComponent(
  () => import('./FilePreviews/PdfView.vue')
);
const ImageView = defineAsyncComponent(
  () => import('./FilePreviews/ImageView.vue')
);

export default defineComponent({
  name: 'ViewerWrapper',
  components: {
    VideoView,
    ItemInformation,
    WysiwygView,
    TextView,
    PdfView,
    ImageView,
  },

  props: {
    propItem: Object,
    active: Boolean,
  },
  emits: ['close'],

  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    var item = ref(props.propItem) as Ref<FolderEntryType>;
    var showDialog = ref(props.active) as Ref<boolean>;
    return {
      item,
      localStore,
      q,
      showDialog,
      itemInformationDialog: ref(false),
      maximizedToggle: ref(true),
      availablePreviews: ref({
        text: {
          available: false,
          label: 'Text Editor',
          mime: 'text/text',
        },
        code: {
          available: false,
          label: 'Code Editor',
          mime: 'text/code',
        },
        wysiwyg: {
          available: false,
          label: 'WYSIWYG (Rich-) Editor',
          mime: 'text/wysiwyg',
        },
        markdown: {
          available: false,
          label: 'Markdown Preview',
          mime: 'text/markdown',
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

    // mime: mimeType to be previewed
    // updateAvail: if the available Mimetype-Previews for the file should be updated
    // by default an Unknown Mimetype can be opened with text, code and wysiwyg
    // text or code can each be opened with mytype text or code
    // wysiwyg mime can be opened with text, code & wysiwyg
    setMime(mime: string, updateAvail = true) {
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
        if (updateAvail) {
          this.availablePreviews.text.available = true;
          this.availablePreviews.code.available = true;
        }
        this.mimePreview.text = true;
      } else if (CODEMIME.includes(mime)) {
        if (updateAvail) {
          this.availablePreviews.text.available = true;
          this.availablePreviews.code.available = true;
        }
        this.mimePreview.code = true;
      } else if (WYSIWYGMIME.includes(mime)) {
        if (updateAvail) {
          this.availablePreviews.wysiwyg.available = true;
          this.availablePreviews.text.available = true;
          this.availablePreviews.code.available = true;
        }
        this.mimePreview.wysiwyg = true;
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
