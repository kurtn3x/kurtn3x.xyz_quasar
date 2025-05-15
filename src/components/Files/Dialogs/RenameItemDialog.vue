<template>
  <q-dialog
    v-model="showDialog"
    @hide="close"
  >
    <q-card
      bordered
      style="width: 350px"
    >
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Rename Item</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-md">
        <q-input
          :color="darkmode ? 'white' : 'black'"
          v-model="newName"
          dense
          outlined
          label="New Name"
          class="text-primary text-body1 col"
          style="height: 45px"
          @keyup.enter="renameFile"
          autofocus
        />
      </div>

      <q-separator class="q-mt-md" />
      <q-card-actions
        align="center"
        class="row q-mt-sm q-mb-sm"
      >
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
          label="Rename"
          @click="renameFile"
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
  name: 'RenameItemDialog',
  props: {
    active: Boolean,
    currentName: String,
  },
  emits: ['close', 'rename'],
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    var showDialog = ref(props.active) as Ref<boolean>;
    var newName = ref(props.currentName);

    return {
      newName,
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
    },
    renameFile() {
      this.$emit('rename', this.newName);
    },
  },
});
</script>
