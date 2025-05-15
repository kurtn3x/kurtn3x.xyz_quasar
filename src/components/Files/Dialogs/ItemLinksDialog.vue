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
        <q-toolbar-title class="q-ma-sm">Item Links</q-toolbar-title>
      </q-toolbar>
      <q-list
        bordered
        class="rounded-borders"
      >
        <q-expansion-item
          expand-separator
          default-opened
          label="Existing Links"
          header-class="text-weight-bolder text-body1 bg-blue text-white"
          expand-icon-class="text-white"
        >
          <q-list
            class="q-ml-sm q-mr-sm q-mb-md"
            style="max-height: 200px; overflow: scroll"
          >
            <q-card
              class="q-mt-md"
              flat
            >
              <q-item
                dense
                clickable
                @click="copyToClipboard(itemShareLink)"
                class="bg-blue text-white"
              >
                <q-item-section class="q-pa-none">
                  <q-item-label
                    class="ellipsis text-weight-bolder"
                    style="width: 165px"
                  >
                    Permanent Link
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-card>
            <div
              v-if="loading"
              class="row justify-center q-mt-sm q-mb-sm"
            >
              <q-spinner size="1em" />
            </div>
            <div v-if="!loading && error">
              <div
                class="row justify-center text-body1 text-red q-mt-sm q-mb-sm q-ml-sm"
              >
                Couldn't fetch links
              </div>
            </div>
            <div v-if="!loading && !error">
              <template
                v-for="shortLink in shortLinks"
                :key="shortLink.id"
              >
                <q-card
                  class="q-mt-sm"
                  flat
                >
                  <q-item
                    dense
                    clickable
                    @click="
                      copyToClipboard(
                        'https://kurtn3x.xyz/files/sl/' + shortLink.linkId
                      )
                    "
                    class="bg-layout-bg text-layout-text"
                  >
                    <q-item-section class="q-pa-none">
                      <q-item-label
                        class="ellipsis"
                        style="width: 165px"
                      >
                        {{ shortLink.linkId }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-btn
                        size="xs"
                        icon="delete"
                        round
                        unelevated
                        outline
                        class="bg-red text-white q-ml-sm"
                        @click.stop="deleteShortLink(shortLink.id)"
                      />
                    </q-item-section>
                  </q-item>
                </q-card>
              </template>
            </div>
          </q-list>
        </q-expansion-item>

        <q-expansion-item
          expand-separator
          header-class="text-weight-bolder text-body1 bg-cyan text-white"
          expand-icon-class="text-white"
          label="Create Short Link"
        >
          <div class="row justify-center q-ma-sm">
            <q-checkbox
              v-model="linkRandom"
              label="Random Link"
              color="green"
              class="text-body1"
            />
          </div>
          <div
            v-if="!linkRandom"
            class="q-ma-sm row justify-center"
          >
            <q-input
              :color="darkmode ? 'white' : 'black'"
              v-model="linkId"
              input-class="text-left"
              style="max-width: 300px"
              label="Link ID"
              class="text-body1 full-width"
              outlined
              no-error-icon
              hide-bottom-space
              dense
              :rules="[
                (val) =>
                  /^[a-z0-9]+$/i.test(val) || 'Only alphanumerical characters',
                (val) =>
                  (val.length > 0 && val.length < 25) || '0-25 characters',
              ]"
            />
          </div>
          <div class="row justify-center q-ma-sm">
            <q-btn
              label="Create Short Link"
              class="bg-cyan text-white"
              @click="createShortLink"
            />
          </div>
        </q-expansion-item>
      </q-list>

      <q-card-actions
        align="center"
        class="q-mt-sm q-mb-sm"
      >
        <q-btn
          v-close-popup
          push
          class="bg-green text-white col"
          icon="done"
          size="md"
          label="OK"
          style="max-width: 130px"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { FolderEntryType } from 'src/types/index';
import { apiGet, apiPost, apiDelete } from 'src/components/apiWrapper';

export default defineComponent({
  name: 'ItemInformationDialog',
  props: {
    propItem: Object,
    active: Boolean,
  },
  emits: ['close'],
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    var item = ref(props.propItem) as Ref<FolderEntryType>;
    var showDialog = ref(props.active) as Ref<boolean>;
    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      shortLinks: ref([]) as Ref<{ linkId: string; id: string }[]>,
      loading: ref(true),
      error: ref(false),
      item,
      localStore,
      q,
      showDialog,
      linkRandom: ref(true),
      linkId: ref(''),
      axiosConfig,
    };
  },
  watch: {
    active(newVal, oldVal) {
      this.showDialog = newVal;
    },
    propItem(newVal, oldVal) {
      this.item = newVal;
    },
  },

  created() {
    this.getShortLinks();
  },

  methods: {
    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
      });
    },

    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },

    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      this.notify('positive', 'Copied to clipboard.');
    },

    getShortLinks() {
      this.loading = true;
      apiGet(
        '/files/item-sl/' + this.item.type + '/' + this.item.id,
        this.axiosConfig
      ).then((apiData) => {
        if (apiData.error == false) {
          this.shortLinks = apiData.data as { linkId: string; id: string }[];
          this.error = false;
        } else {
          this.notify('negative', apiData.errorMessage);
          this.error = true;
        }
        this.loading = false;
      });
    },

    createShortLink() {
      var data = {
        random: this.linkRandom,
        objectType: this.item.type,
        objectId: this.item.id,
        linkId: this.linkId,
      };

      this.loading = true;
      apiPost('/files/sl', data, this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.getShortLinks();
        } else {
          this.notify('negative', apiData.errorMessage);
        }
        this.loading = false;
      });
    },

    deleteShortLink(id: string) {
      this.loading = true;
      apiDelete('/files/sl/' + id, this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.getShortLinks();
        } else {
          this.notify('negative', apiData.errorMessage);
        }
        this.loading = false;
      });
    },
  },
  computed: {
    darkmode() {
      return this.localStore.darkmode;
    },
    itemShareLink() {
      return 'kurtn3x.xyz/files/' + this.item.type + '/' + this.item.id;
    },
  },
});
</script>
