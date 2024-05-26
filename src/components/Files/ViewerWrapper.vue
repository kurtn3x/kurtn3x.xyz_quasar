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
      :style="maximizedToggle ? 'width: 100%; height: 100%;' : dialogStyle"
      class="column"
      ref="viewerWrapper"
      id="viewerWrapper"
    >
      <q-toolbar
        class="bg-layout-bg text-layout-text q-pa-none cursor-pointer"
        v-touch-pan.mouse="onPan"
        style="height: 50px"
      >
        <a class="q-ml-md text-h6 ellipsis">File: {{ item.name }}</a>
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
      <q-separator :color="darkmode ? 'white' : 'dark'" />

      <div class="row" style="height: 31px">
        <q-btn
          stretch
          flat
          icon="download"
          :label="'(' + item.size + ')'"
          class="text-weight-bold text-caption"
          @click="downloadFile(item.id)"
        />
        <q-separator vertical :color="darkmode ? 'white' : 'dark'" />

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
            <q-menu class="no-shadow" style="width: 140px">
              <q-card bordered>
                <q-separator :color="darkmode ? 'white' : 'dark'" />
                <template v-for="value in availablePreviews" v-bind:key="value">
                  <div v-if="value.available">
                    <q-item
                      clickable
                      @click="setMime(value.mime, false)"
                      v-close-popup
                      class="text-body1"
                    >
                      <q-item-section>
                        <q-item-label>{{ value.label }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-separator :color="darkmode ? 'white' : 'dark'" />
                  </div>
                </template>
              </q-card>
            </q-menu>
          </q-btn>
          <q-separator vertical :color="darkmode ? 'white' : 'dark'" />
        </div>
        <q-space />
        <q-separator vertical :color="darkmode ? 'white' : 'dark'" />

        <q-btn
          stretch
          flat
          icon="question_mark"
          class="text-weight-bold text-caption"
          @click="itemInformationDialog = true"
        />
      </div>
      <q-separator :color="darkmode ? 'white' : 'dark'" />

      <q-card-section
        class="col column q-pa-xs"
        style="min-height: 250px; min-width: 250px"
      >
        <div v-if="mimePreview.video">
          <VideoView :item="item" :password="$props.password" />
        </div>
        <div v-else-if="mimePreview.image" class="col column">
          <ImageView :item="item" :password="$props.password" />
        </div>
        <div v-else-if="mimePreview.code" class="col column">
          <CodeView :item="item" :password="$props.password" />
        </div>
        <div v-else-if="mimePreview.text" class="col column">
          <TextView :item="item" :password="$props.password" />
        </div>
        <div v-else-if="mimePreview.wysiwyg" class="col column">
          <WysiwygView :item="item" :password="$props.password" />
        </div>
        <div v-else-if="mimePreview.pdf" class="col column">
          <PdfView :item="item" :password="$props.password" />
        </div>
        <div v-else>
          <div class="text-h6 text-center q-mt-lg">No Preview available.</div>
        </div>
      </q-card-section>
      <q-btn
        class="absolute-bottom-right row items-end"
        v-if="!maximizedToggle && !mobile"
        size="xs"
        style="overflow: hidden; background: #a8e3ff; bottom: 0px"
        v-touch-pan.mouse="onPanResize"
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
import { mimeMap } from 'components/Files/mimeMap';

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
const CodeView = defineAsyncComponent(
  () => import('./FilePreviews/CodeView.vue')
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
    CodeView,
  },

  props: {
    propItem: Object,
    active: Boolean,
    password: {
      type: String,
      default: '',
    },
  },

  emits: ['close'],

  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    var item = ref(props.propItem) as Ref<FolderEntryType>;
    var showDialog = ref(props.active) as Ref<boolean>;
    var mobile = q.platform.is.mobile;
    if (mobile == undefined) {
      mobile = false;
    }
    return {
      mimeMap,
      mobile,
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
      dialogSize: ref({
        x: 350,
        y: 400,
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
          label: 'Rich Editor',
          mime: 'text/wysiwyg',
        },
      }),
      mimePreview: ref({
        video: false,
        image: false,
        pdf: false,
        text: false,
        code: false,
        wysiwyg: false,
      }),
    };
  },

  created() {
    this.setMime(this.item.mime, true);
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
        'px); ' +
        'min-width: ' +
        this.dialogSize.x +
        'px; ' +
        'min-height: ' +
        this.dialogSize.y +
        'px;'
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
    childHeight(newVal, oldVal) {
      console.log(newVal);
    },
  },

  methods: {
    // this sucks ass but for some reason after minimizing, the child component views have difficulty gaining
    // the full size of the rest of the card. There has to be another rezise event to properly set the right height
    onResize(size: any) {
      if (this.initialHeightMinimized) {
        this.initialHeightMinimized = false;
        var el = document.getElementById('viewerWrapper') as any;
        el.style.height = '401px';
      }
    },

    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },

    // do some math so the dialog isnt allowed to leave the window
    onPan(evt: any) {
      if (this.maximizedToggle) {
        return;
      }
      var el = document.getElementById('viewerWrapper') as any;
      var bounds = el.getBoundingClientRect() as any;
      var x;
      if (bounds.x < 0) {
        x = this.dialogPos.x - bounds.x;
      } else if (bounds.x + el.clientWidth > this.q.screen.width) {
        x =
          this.dialogPos.x + (this.q.screen.width - bounds.x - el.clientWidth);
      } else {
        x = this.dialogPos.x + evt.delta.x;
      }

      var y;
      if (bounds.y < 0) {
        y = this.dialogPos.y - bounds.y;
      } else if (bounds.y + el.clientHeight > this.q.screen.height) {
        y =
          this.dialogPos.y +
          (this.q.screen.height - bounds.y - el.clientHeight);
      } else {
        y = this.dialogPos.y + evt.delta.y;
      }

      this.dialogPos = {
        x: x,
        y: y,
      };
    },

    onPanResize(evt: any) {
      var el = document.getElementById('viewerWrapper') as any;
      var bounds = el.getBoundingClientRect() as any;
      var x;
      var y;
      // window width is between 350px and screenwidth-100

      if (bounds.x + el.clientWidth >= this.q.screen.width || bounds.x <= 0) {
        // dont allow the resizing to make the window leave
        x = this.dialogSize.x - 0.1;
      } else {
        x = this.dialogSize.x + evt.delta.x;
      }

      // window height is between 400px and screenheight-100
      if (bounds.y + el.clientHeight >= this.q.screen.height || bounds.y <= 0) {
        y = this.dialogSize.y - 0.1;
      } else {
        y = this.dialogSize.y + evt.delta.y;
      }

      this.dialogSize = {
        x: x,
        y: y,
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

      var mimeType = this.mimeMap.get(mime);
      if (mimeType != undefined) {
        (this.mimePreview as any)[mimeType.type] = true;
        if (updateAvail && mimeType.availableTypes.length != 0) {
          for (var availType of mimeType.availableTypes) {
            (this.availablePreviews as any)[availType].available = true;
          }
        }
      } else {
        if (updateAvail) {
          // always allow text & code editor for unknown mimes because why not
          this.availablePreviews.text.available = true;
          this.availablePreviews.code.available = true;
        }
      }
    },

    downloadFile(id: string) {
      var url =
        'https://api.kurtn3x.xyz/files/download/file/' +
        id +
        (this.$props.password != '' ? '?password=' + this.$props.password : '');
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
