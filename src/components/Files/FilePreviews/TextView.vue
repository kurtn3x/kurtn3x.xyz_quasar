<template>
  <div class="absolute-full flex flex-center bg-transparent" v-if="loading">
    <q-spinner color="primary" size="10em" />
  </div>
  <div
    v-if="!loading && error"
    class="row justify-center q-mt-lg text-red text-h6"
  >
    Couldn't load Text from File.
  </div>

  <div v-if="!loading && !error" class="col column">
    <div
      class="bg-light-blue-8 row text-white q-mt-sm full-width"
      style="height: 40px"
    >
      <q-btn
        icon="save"
        label="Save"
        flat
        stretch
        class="bg-green text-white"
        @click="save"
      />
      <q-separator vertical color="white" />
      <q-space />
      <q-separator vertical color="white" />
      <q-separator vertical color="white" />
      <q-btn icon="settings" flat stretch>
        <q-menu class="no-shadow" anchor="bottom middle" self="top middle">
          <q-card bordered>
            <q-item>
              <q-item-section side>
                <q-icon name="text_decrease" size="sm" color="blue-5" />
              </q-item-section>
              <q-item-section>
                <q-slider
                  v-model="textScale"
                  :min="0.5"
                  :max="3"
                  :step="0.25"
                  snap
                  label
                  switch-label-side
                  :label-value="textScale + 'x'"
                  color="blue-5"
                  label-color="blue-5"
                />
              </q-item-section>
              <q-item-section side>
                <q-icon name="text_increase" size="sm" color="blue-5" />
              </q-item-section>
            </q-item>
            <q-separator color="blue-5" />
            <q-item
              ><q-item-section>
                <q-checkbox
                  class="text-blue-5 text-body1"
                  v-model="mono"
                  label="Monospace Font"
                  color="green"
                />
              </q-item-section>
            </q-item>
          </q-card>
        </q-menu>
      </q-btn>
      <q-separator vertical color="white" />
      <q-btn
        :icon="darkmode ? 'dark_mode' : 'light_mode'"
        flat
        @click="darkmode = !darkmode"
      />
    </div>
    <q-card
      class="col column q-mt-xs"
      bordered
      :class="darkmode ? 'bg-dark text-white' : 'bg-white text-dark'"
    >
      <textarea
        :style="'font-size:' + textSize + 'px;'"
        style="resize: none"
        v-model="text"
        class="col full-width rounded-borders textarea"
        :class="[
          darkmode ? 'bg-dark text-white' : 'bg-white text-dark',
          mono ? 'mono' : '',
        ]"
      />
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { api } from 'boot/axios';
import { defineProps, computed, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';

const props = defineProps({
  item: Object,
  password: {
    type: String,
    default: '',
  },
});

const q = useQuasar();
const localStore = useLocalStore();
const axiosConfig = {
  withCredentials: true,
  headers: {
    'X-CSRFToken': q.cookies.get('csrftoken'),
  },
};
var loading = ref(true);
var error = ref(false);

// styling
var darkmode = ref(localStore.darkmodeState);

// options / values
var text = ref('');
const defSize = 16;
var textScale = ref(1);
var mono = ref(false);
getFile();

var textSize = computed(() => {
  return defSize * textScale.value;
});

// functions

watch(
  () => props.item.id,
  () => {
    getFile();
  }
);

function getFile() {
  api
    .get(
      '/files/file-content/' +
        props.item.id +
        (props.password != '' ? '?password=' + props.password : ''),
      axiosConfig
    )
    .then((response) => {
      if (response.status == 200) {
        text.value = response.data.content;
        loading.value = false;
        error.value = false;
      } else {
        loading.value = false;
        error.value = true;
      }
    })
    .catch(() => {
      loading.value = false;
      error.value = true;
    });
}

function save() {
  var data = {
    item_id: props.item.id,
    content: text.value,
  };
  api
    .put('/files/update-content/file', data, axiosConfig)
    .then((response) => {
      if (response.status == 200) {
        q.notify({
          type: 'positive',
          message: 'Saved.',
          progress: true,
          multiLine: true,
        });
      } else {
        q.notify({
          type: 'negative',
          message: 'Something went wrong.',
          progress: true,
          multiLine: true,
        });
      }
    })
    .catch(() => {
      q.notify({
        type: 'negative',
        message: 'Something went wrong.',
        progress: true,
        multiLine: true,
      });
    });
}
</script>

<style>
.textarea {
  padding: 10px;
  max-width: 100%;
  line-height: 1.5;
  border-radius: 5px;
  border: 2px solid #31beff;
  box-shadow: 1px 1px 1px #31beff;
}

.textarea:focus {
  border: 2px solid #036ff4;
  box-shadow: 1px 1px 1px #036ff4;
  outline: none;
}

.mono {
  font-family: 'Lucida Console', Courier, monospace;
}
</style>
