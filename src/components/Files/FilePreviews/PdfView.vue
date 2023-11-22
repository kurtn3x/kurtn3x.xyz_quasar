<template>
  <div class="absolute-full flex flex-center bg-transparent" v-if="loading">
    <q-spinner color="primary" size="10em" />
  </div>
  <div
    class="row justify-center q-mt-lg text-red text-h6"
    v-if="error && !loading"
  >
    Error loading pdf
  </div>
  <div v-if="!loading && !error" class="col column">
    <q-resize-observer @resize="onResize" />
    <q-scroll-area
      :thumb-style="thumbStyle"
      :bar-style="barStyle"
      class="col column"
    >
      <vue-pdf-embed
        :page="pdfSiteView ? pdfSite : 0"
        :source="base64"
        :width="width"
        class="col row justify-center"
        ref="pdfRef"
        @rendered="getPdfInfo"
        @rendering-failed="pdfLoadError"
      />
    </q-scroll-area>
    <div class="bg-light-blue-8 row items-center" style="height: 50px">
      <q-btn
        icon="view_stream"
        flat
        stretch
        @click="pdfSiteView = false"
        :disable="!pdfSiteView"
      />
      <q-btn
        icon="view_carousel"
        flat
        stretch
        @click="pdfSiteView = true"
        :disable="pdfSiteView"
      />
      <q-btn
        icon="zoom_out"
        flat
        stretch
        @click="pdfZoom -= 0.25"
        :disable="pdfZoom == 0.25"
      />
      <q-btn
        icon="zoom_in"
        flat
        stretch
        @click="pdfZoom += 0.25"
        :disable="pdfZoom == 3"
      />

      <q-space />
      <a v-if="!pdfSiteView" class="text-body1 q-mr-md"
        >Pages: {{ pdfPages }}</a
      >
      <div v-if="pdfSiteView" class="text-body2">
        <q-btn
          icon="arrow_left"
          flat
          round
          :disable="pdfSite == 1"
          @click="pdfSite -= 1"
        />
        Page: {{ pdfSite }}
        <q-btn
          icon="arrow_right"
          flat
          round
          :disable="pdfSite == pdfPages"
          @click="pdfSite += 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import VuePdfEmbed from 'vue-pdf-embed';
import { defineProps, ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const props = defineProps({
  item: Object,
});
const q = useQuasar();
const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};

// options / values
var pdfRef = ref(null);
var pdfPages = ref(0);
var pdfSiteView = ref(false);
var pdfZoom = ref(1);
var pdfSite = ref(1);
var defWidth = ref(0);
var width = computed(() => {
  return defWidth.value * pdfZoom.value;
});

// styling
var thumbStyle = {
  right: '4px',
  borderRadius: '5px',
  backgroundColor: '#0288d1',
  width: '5px',
  opacity: 0.75,
};

var barStyle = {
  right: '2px',
  borderRadius: '9px',
  backgroundColor: '#4fc3f7',
  width: '9px',
  opacity: 0.2,
};

var base64 = ref('');
var loading = ref(false);
var error = ref(false);

// functions
api
  .get('/files/file-content/' + props.item.id, axiosConfig)
  .then((response) => {
    base64.value = 'data:application/pdf;base64,' + response.data.content;
    error.value = false;
  })
  .catch((e) => {
    error.value = true;
  });

function onResize(size) {
  defWidth.value = size.defWidth;
}

function getPdfInfo() {
  pdfPages.value = pdfRef.value.pageCount;
  loading.value = false;
}

function pdfLoadError() {
  error.value = true;
}
</script>
