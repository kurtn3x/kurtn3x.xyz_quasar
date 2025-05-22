<template>
  <q-card
    bordered
    style="width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">Set new Password</q-toolbar-title>
    </q-toolbar>
    <div class="text-body1 text-center q-ma-sm">
      <q-input
        v-model="localPassword"
        class="q-ma-md full-width"
        style="max-width: 400px"
        label="Password"
        input-class="text-body1"
        outlined
        no-error-icon
        hide-bottom-space
        :type="isPwdHidden ? 'password' : 'text'"
        :color="localStore.isDarkMode ? 'white' : 'black'"
        :rules="[
          (val) =>
            /^[a-z0-9]+$/i.test(val) ||
            'Only alphanumerical characters and length > 0',
        ]"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            class="pw_icon"
            :name="isPwdHidden ? 'visibility' : 'visibility_off'"
            @click="isPwdHidden = !isPwdHidden"
          />
        </template>
      </q-input>
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
        push
        class="bg-green text-white col"
        icon="done"
        size="md"
        label="Set"
        @click="setPassword"
        v-close-popup
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useLocalStore } from 'stores/localStore';
import { FolderEntryType } from 'src/types/index';
import { useFileStore } from 'src/stores/fileStore';

const props = defineProps({
  propItem: {
    type: Object as () => FolderEntryType,
    required: true,
  },
});

const localStore = useLocalStore();
const fileStore = useFileStore();

// Local state
const isPwdHidden = ref(true);
const localPassword = ref('');

// Handle set password button
function setPassword() {
  fileStore.fileOps.updateSharingPassword(
    props.propItem.type,
    props.propItem.id,
    { sharedPasswordProtected: true, sharedPassword: localPassword.value }
  );
  localPassword.value = '';
}
</script>
