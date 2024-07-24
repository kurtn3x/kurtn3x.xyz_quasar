<template>
  <q-dialog
    v-model="showDialog"
    @hide="close"
  >
    <q-card bordered>
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Delete selected Items</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-md text-red text-weight-bolder">
        All selected Items will be deleted.
      </div>
      <div class="row justify-center q-ma-md">
        <q-btn
          push
          icon="expand_more"
          :label="(selectedItems as Array<Object>).length + ' Item' + ((selectedItems as Array<Object>).length > 1 ? 's' : '')"
          class="bg-blue-grey-7 text-white text-body1"
          style="width: 310px"
        >
          <q-menu
            anchor="bottom middle"
            self="top middle"
            class="no-shadow bg-blue-grey-7 text-white"
            style="width: 310px"
          >
            <q-card
              flat
              style="max-height: 250px; width: 310px"
              class="bg-blue-grey-7 text-white"
            >
              <q-separator color="white" />

              <template
                v-for="item in selectedItems"
                :key="item"
              >
                <div class="ellipsis text-body1 q-ma-sm">
                  <q-icon
                    :name="item.type == 'folder' ? 'folder' : 'file_present'"
                  />
                  <a class="q-ml-sm">{{ item.name }}</a>
                </div>
                <q-separator color="white" />
              </template>
            </q-card>
          </q-menu>
        </q-btn>
      </div>
      <q-separator />
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
