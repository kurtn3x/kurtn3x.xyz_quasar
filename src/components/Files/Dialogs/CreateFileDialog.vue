<template>
  <q-dialog v-model="showDialog" @hide="close">
    <q-card bordered style="width: 350px">
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Create new File</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-md">
        <q-input
          :color="darkmode ? 'white' : 'black'"
          v-model="newFile.name"
          dense
          outlined
          label="Name"
          class="text-primary text-body1 col"
          style="height: 45px"
          @keyup.enter="createFile"
        />
      </div>
      <div class="q-ml-md">
        <a class="text-h6"> Type:</a>
        <q-option-group
          v-model="newFile.mime"
          :options="mimeOptions"
          color="primary"
          class="q-mt-xs text-body1"
        />
      </div>
      <q-separator class="q-mt-md" />
      <q-card-actions align="center" class="row q-mt-sm q-mb-sm">
        <q-btn
          v-close-popup
          push
          icon="close"
          label="Cancel"
          class="bg-red text-white col"
        />
        <q-btn
          push
          class="bg-green text-white col"
          icon="done"
          size="md"
          label="Create"
          @click="createFile"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'CreateFileDialog',
  props: {
    active: Boolean,
  },
  emits: ['close', 'create'],
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    var showDialog = ref(props.active) as Ref<boolean>;
    var newFile = ref({
      name: '',
      mime: 'Unknown',
    });
    const mimeOptions = [
      {
        label: 'Text',
        value: 'text/plain',
      },
      {
        label: 'WYSIWYG (Rich Text Editor)',
        value: 'text/wysiwyg',
      },
      {
        label: 'Code',
        value: 'text/code',
      },
      {
        label: 'Unknown',
        value: 'Unknown',
      },
    ];
    return {
      mimeOptions,
      newFile,
      localStore,
      q,
      showDialog,
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
  },
  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
      this.newFile.name = '';
      this.newFile.mime = 'Unknown';
    },
    createFile() {
      this.$emit('create', this.newFile);
      this.newFile.name = '';
      this.newFile.mime = 'Unknown';
    },
  },
});
</script>
