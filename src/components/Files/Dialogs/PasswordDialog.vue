<template>
  <q-dialog
    v-model="showDialog"
    @hide="close"
    persistent
    backdrop-filter="brightness(10%)"
  >
    <q-card bordered style="width: 350px">
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">Password Required</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-md">
        <q-input
          :color="darkmode ? 'white' : 'black'"
          v-model="password"
          dense
          outlined
          label="Password"
          class="text-primary text-body1 col"
          style="height: 45px"
          @keyup.enter="submitPassword"
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
          @click="submitPassword"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { useQuasar } from 'quasar';
import { apiPost } from 'src/components/apiWrapper';
import { FolderEntryType } from 'src/types/index';

export default defineComponent({
  name: 'PasswordDialog',
  props: {
    propItem: Object,
    active: Boolean,
  },
  emits: ['close', 'passwordReceived'],
  setup(props) {
    const localStore = useLocalStore();
    const q = useQuasar();
    var showDialog = ref(props.active) as Ref<boolean>;
    var item = ref(props.propItem) as Ref<FolderEntryType>;

    return {
      localStore,
      q,
      showDialog,
      password: ref(''),
      item,
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
      this.item = newVal;
    },
  },
  methods: {
    close() {
      this.$emit('close', true);
      this.showDialog = false;
    },
    submitPassword() {
      var data = {
        id: this.item.id,
        type: this.item.type,
        password: this.password,
      };
      const axiosConfig = {
        withCredentials: true,
        headers: {
          'X-CSRFToken': this.q.cookies.get('csrftoken'),
        },
      };
      apiPost('/files/password', data, axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.$emit(
            'passwordReceived',
            encodeURIComponent(apiData.data.encryptedPassword)
          );
        } else {
          if (apiData.returnCode == 290) {
            // wrong password
            this.q.notify({
              type: 'negative',
              message: 'Wrong Password.',
              progress: true,
              multiLine: false,
            });
          } else {
            this.q.notify({
              type: 'negative',
              message: apiData.errorMessage,
              progress: true,
              multiLine: false,
            });
          }
        }
      });
    },
  },
});
</script>
