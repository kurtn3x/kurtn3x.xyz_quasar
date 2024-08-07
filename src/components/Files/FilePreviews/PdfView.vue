<template>
  <div
    class="absolute-full flex flex-center bg-transparent column"
    v-if="loading"
  >
    <q-spinner color="primary" size="10em" />
  </div>
  <div
    class="row justify-center q-mt-lg text-red text-h6"
    v-if="error && !loading"
  >
    Error loading pdf
  </div>
  <div v-show="!loading && !error" class="col column">
    <q-resize-observer @resize="onResize" :debounce="250" />
    <q-scroll-area
      :thumb-style="thumbStyle"
      :bar-style="barStyle"
      class="col column"
    >
      <div
        :id="id"
        class="pdfviewer justify-center items-center col column"
        ref="pdfviewer"
      >
        <div v-for="pageNum in pageNumbersArray" :key="pageNum">
          <div :id="id && `${id}-${pageNum}`" class="pdfviewer_page col column">
            <canvas />
          </div>
        </div>
      </div>
    </q-scroll-area>
    <div
      class="bg-layout-bg row items-center text-layout-text"
      style="height: 50px"
    >
      <q-btn
        :icon="darkmode ? 'light_mode' : 'dark_mode'"
        flat
        stretch
        @click="toogleDarkmode"
      />
      <q-btn
        :icon="pdfSiteView ? 'view_stream' : 'view_carousel'"
        flat
        stretch
        @click="pdfSiteView = !pdfSiteView"
      />

      <q-btn icon="zoom_in" flat stretch>
        <q-menu anchor="top middle" self="bottom middle">
          <div
            class="row items-center justify-center"
            style="width: 240px; height: 60px"
          >
            <q-btn
              icon="zoom_out"
              flat
              round
              @click="pdfZoom -= 0.25"
              :disable="pdfZoom <= 0.25"
              class="q-mr-sm"
            />
            <q-slider
              v-model="pdfZoom"
              :min="0.25"
              :max="2.5"
              :step="0.1"
              snap
              switch-label-side
              style="max-width: 125px"
            />
            <q-btn
              round
              icon="zoom_in"
              flat
              class="q-ml-sm"
              @click="pdfZoom += 0.25"
              :disable="pdfZoom >= 2.5"
            />
          </div>
        </q-menu>
      </q-btn>

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
import {
  defineProps,
  ref,
  computed,
  onMounted,
  watch,
  onBeforeUnmount,
} from 'vue';
import { useQuasar } from 'quasar';
import { toRaw } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
// no idea what this is, but it works. Vite is an asshole
import pdfJSWorkerURL from 'pdfjs-dist/build/pdf.worker?url';

GlobalWorkerOptions.workerSrc = pdfJSWorkerURL;

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
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
const localStore = useLocalStore();
var darkmode = ref(localStore.darkmodeState);
var item = ref(props.item);

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

var args = '';
if (props.password != '') {
  args += '?password=' + props.password + '&attachment=0';
} else {
  args += '?attachment=0';
}
var src = ref(
  'https://api.kurtn3x.xyz/files/download/file/' + props.item.id + args
);

watch(pdfSiteView, async (n, o) => {
  if (n == true) {
    pdfCurrentPage.value = 1;
  } else {
    pdfCurrentPage.value = 0;
  }
});

watch([width, pdfCurrentPage], async () => {
  if (pdfDoc.value != null) {
    // console.log(pdfDoc.value);
    await render(pdfDoc.value);
  }
});

watch(
  () => item.value.id,
  async () => {
    const doc = await load(src.value);
    console.log('loading of pdf done');
    await render(doc);
    console.log('rendering of pdf done');
    if (darkmode.value == true) {
      pdfviewer.value.style.filter =
        'invert(70%) contrast(200%) brightness(100%) hue-rotate(180deg)';
    }
  }
);

async function load(src) {
  const loadingTask = getDocument({
    url: encodeURI(src),
    withCredentials: true,
  });
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
  canvas.background = 'rgba(0,0,0,0)';

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
      const page = await toRaw(doc).getPage(pageNum);
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

async function emptyElement(pdfViewerValue) {
  while (pdfViewerValue.firstChild) {
    await pdfViewerValue.removeChild(pdfViewerValue.firstChild);
  }
}

async function releaseChildCanvases() {
  var pdfViewerValue = pdfviewer.value;
  await emptyElement(pdfViewerValue);
  await pdfViewerValue.querySelectorAll('canvas').forEach((canvas) => {
    canvas.width = 1;
    canvas.height = 1;
    canvas.getContext('2d')?.clearRect(0, 0, 1, 1);
  });
}

onBeforeUnmount(async () => {
  await releaseChildCanvases();
});

onMounted(async () => {
  const doc = await load(src.value);
  console.log('loading of pdf done');
  await render(doc);
  console.log('rendering of pdf done');
  if (darkmode.value == true) {
    pdfviewer.value.style.filter =
      'invert(70%) contrast(200%) brightness(100%) hue-rotate(180deg)';
  }
  loading.value = false;
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

function toogleDarkmode() {
  if (darkmode.value == false) {
    pdfviewer.value.style.filter =
      'invert(70%) contrast(200%) brightness(100%) hue-rotate(180deg)';
    darkmode.value = true;
  } else {
    pdfviewer.value.style.filter = '';
    darkmode.value = false;
  }
}

function onResize(size) {
  defWidth.value = size.width;
  var els = document.getElementsByClassName('q-scrollarea__container');
  for (var el of els) {
    el.classList.add('column', 'col');
  }
}
</script>
