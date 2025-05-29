<template>
  <q-card
    bordered
    flat
    style="max-width: 400px; min-width: 350px"
  >
    <q-toolbar class="bg-layout-bg text-layout-text text-center items-center">
      <q-toolbar-title class="q-ma-sm">Setup VPN Connection</q-toolbar-title>
      <div class="absolute-right row items-center q-mr-sm">
        <q-btn
          icon="question_mark"
          push
          class="bg-blue text-white"
          round
          size="sm"
          style="height: 15px; width: 15px"
          @click="$emit('open-help')"
        />
      </div>
    </q-toolbar>
    <q-form @submit="handleSubmit">
      <div class="q-ma-md text-body1">
        <q-input
          v-model="localSetupInput.name"
          outlined
          :color="localStore.isDarkMode ? 'white' : 'black'"
          label="VPN Connection Name"
          input-style="font-size: 18px"
          input-class="text-body1"
          class="q-mt-md"
          no-error-icon
          :rules="[
            (val) => (val && val.length > 3) || 'At least 4 characters',
            (val) => (val && val.length < 17) || 'Not more than 16 characters',
            (val) =>
              /^[a-z0-9]+$/i.test(val) ||
              'Only alphanumeric characters allowed.',
            (val) => /^\S+$/.test(val) || 'No spaces allowed.',
          ]"
          lazy-rules
        />
        <div class="row justify-center q-mt-sm">
          <q-checkbox
            v-model="localSetupInput.autoKeyGeneration"
            color="green"
            dense
            label="Generate Keypair automatically"
            style="width: 300px"
          />
        </div>
        <div v-if="!localSetupInput.autoKeyGeneration">
          <q-input
            v-model="localSetupInput.clientPublicKey"
            outlined
            dense
            :color="localStore.isDarkMode ? 'white' : 'black'"
            label="Public Key"
            input-style="font-size: 14px"
            input-class="text-body2"
            class="q-mt-md"
            no-error-icon
          />
          <q-input
            v-model="localSetupInput.clientPrivateKey"
            outlined
            dense
            :color="localStore.isDarkMode ? 'white' : 'black'"
            label="Private Key"
            input-style="font-size: 14px"
            input-class="text-body2"
            class="q-mt-md"
            no-error-icon
          >
            <q-tooltip
              class="text-body1 shadow-1"
              :class="
                localStore.isDarkMode
                  ? 'bg-dark text-white'
                  : 'bg-white text-dark'
              "
            >
              Private Keys are never transmitted
            </q-tooltip>
          </q-input>
        </div>
        <div class="row justify-center q-mt-md">
          <q-checkbox
            v-model="localSetupInput.alternativeRoute"
            color="green"
            dense
            label="Use alternative route"
            style="width: 300px"
          >
            <q-tooltip
              class="text-body1 shadow-1"
              :class="
                localStore.isDarkMode
                  ? 'bg-dark text-white'
                  : 'bg-white text-dark'
              "
            >
              For connection issues
            </q-tooltip>
          </q-checkbox>
        </div>
      </div>
      <q-separator class="q-mt-sm" />
      <q-card-actions
        align="center"
        class="q-mt-sm q-mb-sm row"
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
          label="Generate"
          type="submit"
        />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { ref, Ref } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import { VPNSetupType } from 'src/types/localTypes';

// Define events
const emit = defineEmits(['submit', 'open-help']);

const localStore = useLocalStore();
const q = useQuasar();

// Define default values
const localSetupInput: Ref<VPNSetupType> = ref({
  clientPublicKey: '',
  clientPrivateKey: '',
  name: '',
  autoKeyGeneration: true,
  alternativeRoute: false,
});

// Handle form submission - send the current state to parent
function handleSubmit() {
  // Validate form data if needed
  if (validateForm()) {
    // Emit the current state to the parent component
    emit('submit', localSetupInput.value);
  }
}

// Basic validation
function validateForm(): boolean {
  if (localSetupInput.value.name.length < 4) {
    q.notify({
      type: 'negative',
      message: 'Name must be at least 4 characters',
    });
    return false;
  }

  if (
    !localSetupInput.value.autoKeyGeneration &&
    !localSetupInput.value.clientPublicKey
  ) {
    q.notify({
      type: 'negative',
      message: 'Public key is required when not using auto generation',
    });
    return false;
  }

  return true;
}
</script>
