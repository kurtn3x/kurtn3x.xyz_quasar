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
    seamless
  >
    <q-card
      :style="
        maximizedToggle
          ? 'width: 100%; height: 100%;'
          : dialogStyle +
            ';' +
            'max-width:' +
            ($q.screen.width - 100) +
            'px; resize: both'
      "
      style="min-height: 300px; min-width: 350px; overflow: hidden"
    >
      <q-toolbar
        class="bg-light-blue-6 text-white q-pa-none cursor-pointer"
        v-touch-pan.mouse="onPan"
      >
        <a class="q-ml-md text-h6 ellipsis">Preview: {{ item.name }}</a>
        <q-space />

        <q-btn
          flat
          stretch
          size="sm"
          icon="minimize"
          @click="
            maximizedToggle = false;
            initialHeightMinimized = true;
          "
          :disable="!maximizedToggle"
        >
          <q-tooltip v-if="maximizedToggle">Minimize</q-tooltip>
        </q-btn>
        <q-btn
          flat
          stretch
          size="sm"
          icon="crop_square"
          @click="
            maximizedToggle = true;
            dialogPos.x = 0;
            dialogPos.y = 0;
          "
          :disable="maximizedToggle"
        >
          <q-tooltip v-if="!maximizedToggle">Maximize</q-tooltip>
        </q-btn>
        <q-btn size="sm" flat stretch icon="close" @click="close" class="close">
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-toolbar>
      <q-separator color="white" />

      <div class="row bg-light-blue-8 text-white">
        <q-btn
          stretch
          flat
          icon="download"
          :label="'(' + item.size + ')'"
          class="text-weight-bold text-caption"
          @click="downloadFile(item.id)"
        />
        <q-separator vertical size="2px" color="white" />

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
              <q-list dark bordered>
                <template v-for="value in availablePreviews" v-bind:key="value">
                  <div v-if="value.available">
                    <q-item
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
                    <q-separator color="white" />
                  </div>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
          <q-separator vertical size="2px" color="white" />
        </div>
        <q-space />
        <q-separator vertical size="2px" color="white" />
        <q-btn
          stretch
          flat
          icon="question_mark"
          class="text-weight-bold text-caption"
          @click="itemInformationDialog = true"
        />
      </div>
      <q-separator color="white" size="1px" />
      <q-resize-observer @resize="onResize" />

      <q-card-section class="full-height full-width">
        <div v-if="mimePreview.video">
          <VideoView :item="item" />
        </div>
        <div v-else-if="mimePreview.image">
          <ImageView :item="item" />
        </div>
        <div v-else-if="mimePreview.code">Code Editor</div>
        <div v-else-if="mimePreview.text">
          <TextView
            :item="item"
            :initial-height="initialHeight"
            :initial-width="initialWidth"
          />
        </div>
        <div v-else-if="mimePreview.wysiwyg">
          <WysiwygView :item="item" />
        </div>
        <div v-else-if="mimePreview.pdf" class="full-height full-width">
          <PdfView
            :item="item"
            :initial-height="initialHeight"
            :initial-width="initialWidth"
          />
        </div>
        <div v-else>
          <div class="text-h6 text-center q-mt-lg">No Preview available.</div>
        </div>
      </q-card-section>
      <div
        class="absolute-bottom-right row items-end"
        v-if="!maximizedToggle"
        style="
          overflow: hidden;
          background: #a8e3ff;
          width: 15px;
          height: 15px;
          bottom: 0px;
        "
      />
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
      initialHeight: ref(0),
      initialWidth: ref(0),
      initialHeightMinimized: ref(false),
      item,
      localStore,
      q,
      showDialog,
      itemInformationDialog: ref(false),
      maximizedToggle: ref(true),
      dialogPos: ref({
        x: 0,
        y: 0,
      }),
      dialogWidth: ref(0),
      initialDialogWidth: ref(0),
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
    dialogStyle() {
      return (
        'transform: translate(' +
        this.dialogPos.x +
        'px,' +
        this.dialogPos.y +
        'px)'
      );
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
    height(newVal) {
      console.log(newVal);
    },
  },

  methods: {
    onResize(size: any) {
      this.initialHeight = size.height - 150;
      this.initialWidth = size.width - 35;
    },

    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },

    onPan(evt: any) {
      this.dialogPos = {
        x: this.dialogPos.x + evt.delta.x,
        y: this.dialogPos.y + evt.delta.y,
      };
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
