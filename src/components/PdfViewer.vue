<template>
  <q-dialog seamless full-height :maximized="this.pdf_viewer_maximized">
    <q-card>
      <q-bar>
        <q-icon name="laptop_chromebook" />
        <div>Google Chrome</div>

        <q-space />

        <q-btn dense flat icon="minimize" />
        <q-btn
          dense
          flat
          icon="crop_square"
          @click="pdf_viewer_maximized = !pdf_viewer_maximized"
        />
        <q-btn
          dense
          flat
          icon="close"
          @click="show_file_editor = !show_file_editor"
        />
      </q-bar>
      <q-slider
        v-model="height"
        :min="0"
        :max="2560"
        :step="40"
        label
        :label-value="height + 'px'"
        label-always
        color="purple"
      />
      <q-slider
        v-model="width"
        :min="0"
        :max="2560"
        :step="40"
        label
        :label-value="width + 'px'"
        label-always
        color="purple"
      />
      <vue-pdf-embed
        ref="pdfRef"
        :source="this.initical_doc"
        :page="page"
        :height="height"
        :width="width"
        @password-requested="handlePasswordRequest"
        @rendered="handleDocumentRender"
        @loaded="loaded"
      />
      <div class="row justify-center"></div>
    </q-card>
  </q-dialog>
</template>

<script>
import VuePdfEmbed from 'vue-pdf-embed';
import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';

export default {
  name: 'PdfViewer',
  props: {
    initialDoc: { type: ArrayBuffer },
    show: { type: Boolean },
  },
  components: { VuePdfEmbed },

  setup(props) {
    const q = useQuasar();
    return {
      q,
      initical_doc: ref(props.initialDoc),
      pdf_viewer_maximized: ref(false),
      height: ref(600),
      width: ref(600),
      show_file_editor: ref(props.show),
    };
  },
  created() {
    this.screen_height = this.q.screen.height;
  },
  watch: {
    showAllPages() {
      this.page = this.showAllPages ? null : 1;
    },
  },
  methods: {
    loaded(pdf) {
      console.log(this.$refs.pdfRef.getPageDimensions().width);
    },
    handleDocumentRender() {
      this.isLoading = false;
      this.pageCount = this.$refs.pdfRef.pageCount;
    },
    handlePasswordRequest(callback, retry) {
      callback(prompt(retry ? 'Enter password again' : 'Enter password'));
    },
  },
};
</script>

<style>
#webviewer {
  height: 100vh;
}
</style>
