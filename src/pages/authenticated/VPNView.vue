<template>
  <!-- Initial loading and error states -->
  <div
    v-if="vpnStore.loading"
    class="absolute-center"
  >
    <q-spinner
      color="primary"
      size="10em"
    />
  </div>

  <div v-if="!vpnStore.loading && vpnStore.error">
    <ErrorPage :error-message="vpnStore.errorMessage" />
  </div>

  <div v-if="!vpnStore.loading && !vpnStore.error">
    <q-dialog v-model="helpVPNDialog">
      <VPNHelpDialog />
    </q-dialog>

    <q-dialog v-model="vpnInfoDialog">
      <VPNInformationDialog :prop-item="vpnClientInfo" />
    </q-dialog>

    <!-- Setup Dialog -->
    <q-dialog v-model="setupVPNDialog">
      <VPNSetupDialog
        @submit="handleCreateVPNClient"
        @open-help="helpVPNDialog = true"
      />
    </q-dialog>

    <!-- Success Dialog -->
    <q-dialog
      v-model="setupVPNDialogSuccessful"
      persistent
    >
      <VPNSetupSuccessDialog
        :connection="vpnSetupConnection"
        @open-help="helpVPNDialog = true"
        @done="handleCreated"
      />
    </q-dialog>

    <!-- Main content -->
    <q-page class="column">
      <div class="q-ma-sm">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm">VPN Connections</q-toolbar-title>
          <div class="absolute-right row items-center q-mr-sm">
            <q-btn
              icon="question_mark"
              push
              round
              class="bg-blue text-white"
              size="md"
              @click="helpVPNDialog = true"
            />
          </div>
        </q-toolbar>

        <q-card
          class="bg-transparent"
          bordered
          flat
        >
          <q-item
            dense
            class="text-weight-bold q-mt-sm q-mb-sm text-body2"
          >
            <q-item-section
              avatar
              style="min-width: 50px; max-width: 50px"
            >
              Nr.
            </q-item-section>
            <q-item-section>
              <q-item-label>Name</q-item-label>
            </q-item-section>
            <q-item-section>
              <q-item-label>Addresses (v4, v6)</q-item-label>
            </q-item-section>
            <q-item-section
              side
              style="width: 50px"
            />
          </q-item>

          <q-separator
            color="primary"
            size="2px"
          />

          <div
            v-if="vpnStore.connections.length == 0"
            class="text-center q-mt-md text-body1 q-mb-md"
          >
            No VPN setup yet. Click the + at the bottom of the screen to set one
            up.
          </div>

          <div
            class="vpn-connection-list"
            style="overflow: auto"
          >
            <template
              v-for="(item, index) in vpnStore.connections"
              :key="item.id"
            >
              <q-item
                clickable
                @click="
                  vpnInfoDialog = true;
                  vpnClientInfo = item;
                "
                :class="item.selected ? 'bg-cyan-14 text-white' : ''"
              >
                <q-popup-proxy
                  context-menu
                  :breakpoint="0"
                  @before-show="item.selected = true"
                  @before-hide="item.selected = false"
                  class="shadow-1"
                >
                  <q-list
                    separator
                    bordered
                  >
                    <q-item
                      clickable
                      v-close-popup
                      @click="deleteConnection(item.id)"
                    >
                      <q-item-section avatar>
                        <q-icon name="delete" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Delete</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      @click="
                        vpnInfoDialog = true;
                        vpnClientInfo = item;
                      "
                    >
                      <q-item-section avatar>
                        <q-icon name="info" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>Information</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-popup-proxy>

                <q-item-section
                  avatar
                  style="min-width: 50px; max-width: 50px"
                >
                  {{ index + 1 }}.
                </q-item-section>
                <q-item-section class="text-body1">
                  <q-item-label class="text-weight-bolder ellipsis">
                    {{ item.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section class="text-body2">
                  {{ item.addresses }}
                </q-item-section>
                <q-item-section
                  side
                  style="width: 50px"
                >
                  <q-btn
                    icon="more_vert"
                    flat
                    round
                    @click.prevent.stop
                  >
                    <q-menu>
                      <q-list
                        separator
                        bordered
                      >
                        <q-item
                          clickable
                          v-close-popup
                          @click="deleteConnection(item.id)"
                        >
                          <q-item-section avatar>
                            <q-icon name="delete" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>Delete</q-item-label>
                          </q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          @click="
                            vpnInfoDialog = true;
                            vpnClientInfo = item;
                          "
                        >
                          <q-item-section avatar>
                            <q-icon name="info" />
                          </q-item-section>
                          <q-item-section>
                            <q-item-label>Information</q-item-label>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-item-section>
              </q-item>
              <q-separator size="1px" />
            </template>
          </div>
        </q-card>

        <div class="row justify-center q-ma-md absolute-bottom">
          <q-btn
            push
            icon="add"
            active-icon="add"
            direction="up"
            color="green"
            round
            size="lg"
            @click="setupVPNDialog = !setupVPNDialog"
          />
        </div>
      </div>
    </q-page>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue';
import { useQuasar } from 'quasar';
import ErrorPage from 'src/components/ErrorPage.vue';
import { VPNSetupType } from 'src/types/localTypes';
import { VPNClient, VPNConnection } from 'src/types/apiTypes';
import VPNHelpDialog from 'src/components/vpn/VPNHelpDialog.vue';
import VPNInformationDialog from 'src/components/vpn/VPNInformationDialog.vue';
import VPNSetupDialog from 'src/components/vpn/VPNSetupDialog.vue';
import VPNSetupSuccessDialog from 'src/components/vpn/VPNSetupSuccessDialog.vue';

import { useVPNStore } from 'src/stores/vpnStore';

const q = useQuasar();
const vpnStore = useVPNStore();

// UI-specific state (dialog controls and form data)
const vpnInfoDialog = ref(false);
const helpVPNDialog = ref(false);
const setupVPNDialog = ref(false);
const setupVPNDialogSuccessful = ref(false);

// Data references
const vpnClientInfo = ref({}) as Ref<VPNClient>;
const vpnSetupConnection = ref({}) as Ref<VPNConnection>;

// Wrapper function for creating a VPN connection that handles the UI state
const handleCreateVPNClient = async (formData: VPNSetupType) => {
  const connection = await vpnStore.createVPNClient(formData);
  if (connection) {
    vpnSetupConnection.value = connection;
    setupVPNDialog.value = false;
    setupVPNDialogSuccessful.value = true;
  }
};

function handleCreated() {
  setupVPNDialogSuccessful.value = false;
  vpnStore.getConnections();
}

function deleteConnection(id: string) {
  vpnStore.deleteConnection(id);
}

// Lifecycle hooks
onMounted(() => {
  vpnStore.getConnections();
});
</script>
<style scoped>
.vpn-connection-list {
  max-height: calc(100vh - 240px);
}
</style>
