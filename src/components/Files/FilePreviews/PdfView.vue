<template>
  <div
    class="absolute-full flex flex-center bg-transparent column"
    v-if="loading"
  >
    <q-spinner color="primary" size="10em" />
    <div class="text-center text-red text-body1 q-ma-sm" v-if="longload">
      It seems like loading is taking long. There might be something wrong with
      the PDF and it cannot be previewed.
    </div>
  </div>
  <div
    class="row justify-center q-mt-lg text-red text-h6"
    v-if="error && !loading"
  >
    Error loading pdf
  </div>
  <div v-if="!loading && !error" class="col column">
    <q-resize-observer @resize="onResize" />
    <q-scroll-area :thumb-style="thumbStyle" :bar-style="barStyle" class="col">
      <div :id="id" class="pdfviewer row justify-center" ref="pdfviewer">
        <div v-for="pageNum in pageNumbersArray" :key="pageNum">
          <div :id="id && `${id}-${pageNum}`" class="pdfviewer_page col">
            <canvas />
          </div>
        </div>
      </div>
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
        >Pages: {{ pdfPageCount }}</a
      >
      <div v-if="pdfSiteView" class="text-body2">
        <q-btn
          icon="arrow_left"
          flat
          round
          :disable="pdfCurrentPage == 1"
          @click="pdfCurrentPage -= 1"
        />
        Page: {{ pdfCurrentPage }}
        <q-btn
          icon="arrow_right"
          flat
          round
          :disable="pdfCurrentPage == pdfPageCount"
          @click="pdfCurrentPage += 1"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { pdfsample } from './samples';

import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import PdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
GlobalWorkerOptions.workerSrc = PdfjsWorker;

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
var loading = ref(true);
var error = ref(false);
var longload = ref(false);

// options / values
var pdfPageCount = ref(0);
var pdfCurrentPage = ref(0);
var pageNumbersArray = ref(0);
var pdfviewer = ref(null);
var id = 'pdfviewer';

var pdfDoc = ref(null);
var pdfSiteView = ref(false);
var pdfZoom = ref(1);
var defWidth = ref(0);
var width = computed(() => {
  return defWidth.value * pdfZoom.value;
});
var base64 = ref('');
// base64.value = 'data:application/pdf;base64,' + pdfsample;

watch(pdfSiteView, async (n, o) => {
  if (n == true) {
    pdfCurrentPage.value = 1;
  } else {
    pdfCurrentPage.value = 0;
  }
});

watch([width, pdfCurrentPage], async () => {
  if (pdfDoc.value != null) {
    await render(pdfDoc.value);
  }
});

watch(
  () => props.item.id,
  async () => {
    await getPdfFile();
    const doc = await load(base64.value);
    console.log('loading of pdf done');
    await render(doc);
    console.log('rendering of pdf done');
  }
);

async function load(src) {
  const loadingTask = getDocument(src);
  // // password stuff
  // loadingTask.onPassword = (callback, reason) => {
  //   const retry = reason === pdf.PasswordResponses.INCORRECT_PASSWORD;
  // };
  const doc = await loadingTask.promise;
  pdfDoc.value = doc;
  return doc;
}

async function renderPage(page, canvas, width, rotation) {
  const pageWidth = (rotation / 90) % 2 ? page.view[3] : page.view[2];
  const viewport = page.getViewport({
    scale: Math.ceil(width / pageWidth) + 1,
    rotation,
  });

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: canvas.getContext('2d'),
    viewport,
  }).promise;
}

function getPageDimensions(ratio) {
  let w, h;
  w = width.value || pdfviewer.value.clientWidth;
  h = w * ratio;
  return [w, h];
}

async function render(doc) {
  pdfPageCount.value = doc.numPages;
  pageNumbersArray.value = pdfCurrentPage.value
    ? [pdfCurrentPage.value]
    : [...Array(pdfPageCount.value + 1).keys()].slice(1);
  const pageElements = document.getElementsByClassName('pdfviewer_page');
  await Promise.all(
    pageNumbersArray.value.map(async (pageNum, i) => {
      const page = await doc.getPage(pageNum);
      const rotation = page.rotate;
      const [canvas, div1, div2] = pageElements[i].children;
      const [actualWidth, actualHeight] = getPageDimensions(
        (rotation / 90) % 2
          ? page.view[2] / page.view[3]
          : page.view[3] / page.view[2]
      );

      canvas.style.width = `${Math.floor(actualWidth)}px`;
      canvas.style.height = `${Math.floor(actualHeight)}px`;

      await renderPage(page, canvas, actualWidth, rotation);
    })
  );
}

async function emptyElement() {
  while (pdfviewer.value.firstChild) {
    await pdfviewer.value.removeChild(pdfviewer.value.firstChild);
  }
}

async function releaseChildCanvases() {
  await pdfviewer.value.querySelectorAll('canvas').forEach((canvas) => {
    canvas.width = 1;
    canvas.height = 1;
    canvas.getContext('2d')?.clearRect(0, 0, 1, 1);
  });
  await emptyElement();
}

onUnmounted(async () => {
  await releaseChildCanvases();
});

onMounted(async () => {
  await getPdfFile();
  const doc = await load(base64.value);
  console.log('loading of pdf done');
  await render(doc);
  console.log('rendering of pdf done');
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

// functions
async function getPdfFile() {
  await api
    .get('/files/file-content/' + props.item.id, axiosConfig)
    .then((response) => {
      base64.value = 'data:application/pdf;base64,' + response.data.content;
      error.value = false;
      loading.value = false;
    })
    .catch(() => {
      error.value = true;
      loading.value = false;
    });
}

function onResize(size) {
  defWidth.value = size.width;
}
</script>
