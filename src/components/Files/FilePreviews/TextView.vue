<template>
  <div
    class="absolute-full flex flex-center bg-transparent"
    v-if="loading"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>
  <div
    v-if="!loading && error"
    class="row justify-center q-mt-lg text-red text-h6"
  >
    Couldn't load Text from File.
  </div>

  <div
    v-if="!loading && !error"
    class="col column"
  >
    <div class="bg-layout-bg text-layout-text row rounded-borders q-pa-none">
      <q-btn
        icon="save"
        label="Save"
        flat
        stretch
        class="bg-green text-white"
        @click="updateContent"
        v-if="localStore.isAuthenticated"
      />
      <q-separator
        vertical
        color="layout-text"
        v-if="localStore.isAuthenticated"
      />
      <q-space />
      <q-separator
        vertical
        color="layout-text"
      />
      <q-btn
        icon="settings"
        flat
        stretch
      >
        <q-menu
          class="no-shadow"
          anchor="bottom middle"
          self="top middle"
        >
          <q-card bordered>
            <q-item>
              <q-item-section side>
                <q-icon
                  name="text_decrease"
                  size="sm"
                />
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
                />
              </q-item-section>
              <q-item-section side>
                <q-icon
                  name="text_increase"
                  size="sm"
                />
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item>
              <q-item-section>
                <q-checkbox
                  class="text-body1"
                  v-model="mono"
                  label="Monospace Font"
                  color="green"
                />
              </q-item-section>
            </q-item>
          </q-card>
        </q-menu>
      </q-btn>
      <q-separator
        vertical
        color="layout-text"
      />
      <q-btn
        :icon="darkmode ? 'dark_mode' : 'light_mode'"
        flat
        stretch
        @click="darkmode = !darkmode"
      />
    </div>
    <q-card
      class="col column q-mb-xs"
      bordered
      square
    >
      <textarea
        :style="'font-size:' + textSize + 'px;'"
        style="resize: none"
        v-model="text"
        class="col full-width textarea"
        :class="[
          darkmode
            ? 'bg-dark text-white textarea-dark'
            : 'bg-white text-dark textarea-light',
          mono ? 'mono' : '',
        ]"
        @keydown.ctrl.s.prevent.stop="updateContent"
      />
    </q-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { apiPut, apiGet } from 'src/components/apiWrapper';
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

var item = ref(props.item);

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
getFileContent();

var textSize = computed(() => {
  return defSize * textScale.value;
});

// functions

watch(
  () => item.value.id,
  () => {
    getFileContent();
  }
);

function getFileContent() {
  var args = '';
  if (props.password != '') {
    args += '?password=' + props.password;
  }
  apiGet('/files/file-content/' + item.value.id + args, axiosConfig).then(
    (apiData) => {
      if (apiData.error == false) {
        text.value = apiData.data.content;
        loading.value = false;
        error.value = false;
      } else {
        loading.value = false;
        error.value = true;
      }
    }
  );
}

function updateContent() {
  var data = {
    content: text.value,
  };
  apiPut('/files/file-content/' + item.value.id, data, axiosConfig).then(
    (apiData) => {
      if (apiData.error == false) {
        q.notify({
          type: 'positive',
          message: 'Saved.',
          progress: true,
        });
        apiGet(
          '/files/file-content/' + item.value.id + '?only_size=1',
          axiosConfig
        ).then((apiData) => {
          if (apiData.error == false) {
            item.value.size = apiData.data.size;
            item.value.sizeBytes = apiData.data.sizeBytes;
          } else {
            q.notify({
              type: 'negative',
              message: apiData.errorMessage,
              progress: true,
            });
          }
        });
      } else {
        q.notify({
          type: 'negative',
          message: apiData.errorMessage,
          progress: true,
        });
      }
    }
  );
}
</script>

<style lang="scss">
.textarea-dark {
  padding: 10px;
  max-width: 100%;
  line-height: 1.5;
  border-radius: 5px;
  border: 2px solid #a0a0a0;
}

.textarea-dark:focus {
  border: 2px solid #ffffff;
  outline: none;
}

.textarea-light {
  padding: 10px;
  max-width: 100%;
  line-height: 1.5;
  border-radius: 5px;
  border: 2px solid #a0a0a0;
}

.textarea-light:focus {
  border: 2px solid #535353;
  outline: none;
}

.mono {
  font-family: 'Lucida Console', Courier, monospace;
}
</style>
