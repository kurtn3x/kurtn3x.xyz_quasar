<template>
  <q-dialog v-model="showDialog" @hide="close">
    <q-card bordered style="width: 350px">
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Delete selected Items</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-md">
        All selected Items will be deleted.
      </div>
      <div class="row justify-center q-ma-md">
        <q-btn
          push
          icon="expand_more"
          :label="(selectedItems as Array<Object>).length + ' Items'"
          class="bg-blue text-white text-body1"
          style="width: 150px"
        >
          <q-menu anchor="bottom middle" self="top middle" class="no-shadow">
            <q-card bordered flat style="width: 150px; max-height: 250px">
              <template v-for="item in selectedItems" :key="item">
                <div class="ellipsis text-body1 q-ma-sm">
                  <q-icon
                    :name="item.type == 'folder' ? 'folder' : 'file_present'"
                  />
                  <a class="q-ml-sm"> {{ item.name }} </a>
                </div>
                <q-separator />
              </template>
            </q-card>
          </q-menu>
        </q-btn>
      </div>
      <q-separator class="q-mt-sm" />
      <q-card-actions align="center" class="row q-mt-sm q-mb-sm">
        <q-btn
          v-close-popup
          push
          icon="close"
          label="Cancel"
          class="bg-red text-white col"
        />
        <q-btn
          v-close-popup
          push
          class="bg-green text-white col"
          icon="done"
          size="md"
          label="Continue"
          @click="deleteItems"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { FolderEntryType } from 'src/types/index';

export default defineComponent({
  name: 'DeleteItemsSelectedDialog',
  props: {
    active: Boolean,
    propItem: Array<FolderEntryType>,
  },
  emits: ['close', 'deleteItems'],
  setup(props) {
    return {
      selectedItems: ref(props.propItem),
      showDialog: ref(props.active),
    };
  },
  watch: {
    active(newVal, oldVal) {
      this.showDialog = newVal;
    },
    propItem(newVal, oldVal) {
      this.selectedItems = newVal;
    },
  },
  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },
    deleteItems() {
      this.$emit('deleteItems', true);
    },
  },
});
</script>
