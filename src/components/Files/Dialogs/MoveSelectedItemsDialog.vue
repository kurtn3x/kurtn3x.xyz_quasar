<template>
  <q-dialog v-model="showDialog" @hide="close">
    <q-card bordered style="min-width: 350px">
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm"
          >Move Items to new Folder</q-toolbar-title
        >
      </q-toolbar>
      <div
        v-if="loading"
        class="q-ma-md row justify-center items-center"
        style="height: 375px"
      >
        <q-spinner size="10em" />
      </div>
      <div
        v-if="(selectedItems as Array<Object>).length == 0"
        class="q-ma-md row justify-center items-center text-red text-body1 text-weight-bold"
        style="height: 375px"
      >
        No Items selected.
      </div>
      <div
        v-if="!loading && error"
        class="q-ma-md row justify-center items-center text-red text-body1 text-weight-bold"
        style="height: 375px"
      >
        Failed fetching folders.
      </div>
      <div class="q-ma-sm" v-if="!loading && !error">
        <div class="row">
          <q-input
            :color="darkmode ? 'white' : 'black'"
            v-model="moveItemsFilter"
            dense
            outlined
            label="Search"
            class="text-primary text-body1"
            style="height: 45px; width: 200px"
          />

          <q-btn
            icon="expand_more"
            :label="(selectedItems as Array<Object>).length + ' Items'"
            class="bg-blue text-white q-ml-sm text-body1"
            push
            dense
            style="height: 40px; width: 150px"
          >
            <q-menu anchor="bottom middle" self="top middle" class="no-shadow">
              <q-card flat bordered style="min-width: 150px; max-height: 250px">
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
        <q-separator />
        <q-scroll-area style="height: 350px">
          <q-tree
            :nodes="allAvailableFolders"
            v-model:selected="moveItemsSelectedId"
            v-model:expanded="moveItemsExpanded"
            :filter="moveItemsFilter"
            node-key="id"
            label-key="name"
            selected-color="green"
            class="text-body1"
            no-transition
            no-selection-unset
            no-results-label="No folder found"
            @update:selected="moveItemsUpdateSelectedLabel"
          />
        </q-scroll-area>
      </div>
      <q-separator />

      <q-card-actions class="q-mb-sm column">
        <div class="full-width">
          <a class="text-weight-bolder">New Folder: </a>
          {{ moveItemsSelectedName }}
        </div>
        <div class="row full-width q-mt-sm">
          <q-btn
            v-close-popup
            push
            icon="close"
            label="Cancel"
            class="bg-red text-white col q-mr-xs"
          />
          <q-btn
            push
            class="bg-green text-white col q-ml-xs"
            icon="done"
            label="Move"
            @click="move"
          />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { AllAvailableFoldersType, FolderEntryType } from 'src/types/index';
import { apiGet } from 'src/components/apiWrapper';

export default defineComponent({
  name: 'MoveItemsSelectedDialog',
  props: {
    active: Boolean,
    propItem: Array<FolderEntryType>,
  },
  emits: ['close', 'move'],
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();

    return {
      selectedItems: ref(props.propItem),
      showDialog: ref(props.active),
      localStore,
      q,
      allAvailableFolders: ref([{}]),
      moveItemsExpanded: ref([{}]),
      moveItemsFilter: ref(''),
      moveItemsSelectedName: ref(''),
      moveItemsSelectedId: ref(''),

      loading: ref(false),
      error: ref(false),
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
    propItem(newVal, oldVal) {
      this.selectedItems = newVal;
    },
    showDialog(newVal, oldVal) {
      if (newVal == true) {
        this.fetchAllAvailableFolders();
      }
    },
  },
  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
      this.moveItemsExpanded = [];
      this.moveItemsFilter = '';
      this.moveItemsSelectedName = '';
      this.moveItemsSelectedId = '';
    },
    move() {
      this.$emit('move', this.moveItemsSelectedId);
    },
    fetchAllAvailableFolders() {
      this.moveItemsExpanded = [];
      this.allAvailableFolders = [];
      var config = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      this.loading = true;
      apiGet('/files/available-folders', config).then((apiData) => {
        if (apiData.error == false) {
          this.allAvailableFolders = apiData.data as AllAvailableFoldersType[];
          this.moveItemsExpanded.push(
            (apiData.data as AllAvailableFoldersType[])[0].id
          );
          this.error = false;
          this.loading = false;
        } else {
          this.q.notify({
            type: 'negative',
            message: apiData.errorMessage,
            multiLine: false,
          });
          this.loading = false;
          this.error = true;
        }
      });
    },

    // find the name of the selected folder by its id
    moveItemsUpdateSelectedLabel() {
      function flatten(arr: any[]): any[] {
        let children: any[] = [];
        const flatArr = arr.map((m) => {
          if (m.children && m.children.length) {
            children = [...children, ...m.children];
          }
          return m;
        });

        return flatArr.concat(
          children.length ? flatten(children) : children
        ) as any[];
      }

      var flat = flatten(this.allAvailableFolders);
      this.moveItemsSelectedName = flat.find(
        (o) => o.id == this.moveItemsSelectedId
      ).name;
    },
  },
});
</script>
