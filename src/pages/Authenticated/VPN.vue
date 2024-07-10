<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <q-dialog v-model="helpVPNDialog">
      <VPNHelpDialog />
    </q-dialog>
    <q-dialog v-model="vpnInfoDialog">
      <VPNInformation :propItem="vpnClientInfo" />
    </q-dialog>

    <q-dialog
      v-model="setupVPNDialog"
      @hide="
        vpnSetupInput = {
          clientPublicKey: '',
          clientPrivateKey: '',
          name: '',
          autoKeyGeneration: true,
        }
      "
    >
      <q-card bordered style="max-width: 400px; min-width: 350px">
        <q-toolbar
          class="bg-layout-bg text-layout-text text-center items-center"
        >
          <q-toolbar-title class="q-ma-sm"
            >Setup VPN Connection</q-toolbar-title
          >
          <div class="absolute-right row items-center q-mr-sm">
            <q-btn
              icon="question_mark"
              push
              class="bg-blue text-white"
              round
              size="sm"
              style="height: 15px; width: 15px"
              @click="helpVPNDialog = true"
            />
          </div>
        </q-toolbar>
        <q-form @submit="createVPNClient">
          <div class="q-ma-md text-body1" v-if="!loading">
            <q-input
              v-model="vpnSetupInput.name"
              outlined
              :color="darkmode ? 'white' : 'black'"
              label="VPN Connection Name"
              input-style="font-size: 18px"
              input-class="text-body1"
              class="q-mt-md"
              no-error-icon
              :rules="[
                (val) => (val && val.length > 3) || 'At least 4 characters',
                (val) =>
                  (val && val.length < 17) || 'Not more than 16 characters',
                (val) =>
                  /^([a-zA-Z0-9\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9 _.-]+)$/.test(
                    val
                  ) || 'Only alphanumeric characters allowed.',
                (val) => /^\S+$/.test(val) || 'No spaces allowed.',
              ]"
              lazy-rules
            />
            <div class="row justify-center q-mt-sm">
              <q-checkbox
                v-model="vpnSetupInput.autoKeyGeneration"
                color="green"
                dense
                label="Generate Keypair automatically"
              />
            </div>
            <div v-if="!vpnSetupInput.autoKeyGeneration">
              <q-input
                v-if="!vpnSetupInput.autoKeyGeneration"
                v-model="vpnSetupInput.clientPublicKey"
                outlined
                dense
                :color="darkmode ? 'white' : 'black'"
                label="Public Key"
                input-style="font-size: 14px"
                input-class="text-body2 "
                class="q-mt-md"
                no-error-icon
              />
              <q-input
                v-if="!vpnSetupInput.autoKeyGeneration"
                v-model="vpnSetupInput.clientPrivateKey"
                outlined
                dense
                :color="darkmode ? 'white' : 'black'"
                label="Private Key"
                input-style="font-size: 14px"
                input-class="text-body2 "
                class="q-mt-md"
                no-error-icon
              />
            </div>
          </div>
          <div v-if="loading" class="row justify-center items-center q-ma-md">
            <q-spinner size="4em" />
          </div>
          <q-separator class="q-mt-sm" />
          <q-card-actions align="center" class="q-mt-sm q-mb-sm row">
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
    </q-dialog>
    <q-dialog v-model="setupVPNDialogSuccessful" persistent>
      <q-card bordered class="full-width">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm">VPN Connection Data</q-toolbar-title>
          <div class="absolute-right row items-center q-mr-sm">
            <q-btn
              icon="question_mark"
              push
              class="bg-blue text-white"
              round
              size="sm"
              style="height: 15px; width: 15px"
              @click="helpVPNDialog = true"
            />
          </div>
        </q-toolbar>
        <q-separator size="1px" :color="darkmode ? 'white' : 'dark'" />
        <q-tabs
          inline-label
          v-model="setupVPNDialogTabs"
          style="height: 50px"
          align="justify"
          indicator-color="transparent"
          active-color="layout-text"
          active-bg-color="primary"
        >
          <q-separator vertical size="1px" />
          <q-tab name="info" icon="info" label="Info" />
          <q-separator vertical size="1px" />
          <q-tab name="config" icon="download" label="Download" />
          <q-separator vertical size="1px" />
        </q-tabs>
        <q-separator size="1px" />
        <q-tab-panels
          v-model="setupVPNDialogTabs"
          animated
          class="bg-transparent"
        >
          <q-tab-panel name="info">
            <div class="text-h6 text-weight-bold q-mb-sm">Your Keys</div>
            <q-input
              outlined
              readonly
              v-model="vpnSetupConnection.clientPublicKey"
              style="height: 50px"
              :color="darkmode ? 'white' : 'dark'"
              dense
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.clientPublicKey)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  Public-Key:
                </a>
              </template>
            </q-input>
            <q-input
              outlined
              readonly
              v-model="vpnSetupConnection.clientPrivateKey"
              style="height: 50px"
              :color="darkmode ? 'white' : 'dark'"
              dense
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.clientPrivateKey)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  Private-Key:
                </a>
              </template>
            </q-input>
            <q-separator />
            <div class="text-h6 text-weight-bold q-mt-md q-mb-sm">
              Interface Configuration
            </div>
            <q-input
              outlined
              readonly
              v-model="vpnSetupConnection.addresses"
              style="height: 50px"
              :color="darkmode ? 'white' : 'dark'"
              dense
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.addresses)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  Addresses:
                </a>
              </template>
            </q-input>
            <q-input
              outlined
              readonly
              v-model="vpnSetupConnection.dnsServers"
              style="height: 50px"
              :color="darkmode ? 'white' : 'dark'"
              dense
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.dnsServers)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  DNS:
                </a>
              </template>
            </q-input>
            <q-separator />
            <div class="text-h6 text-weight-bold q-mt-md q-mb-sm">
              Peer Configuration
            </div>

            <q-input
              outlined
              readonly
              :color="darkmode ? 'white' : 'dark'"
              v-model="vpnSetupConnection.presharedKey"
              style="height: 50px"
              dense
            >
              <q-btn
                flat
                :color="darkmode ? 'white' : 'dark'"
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.presharedKey)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  Preshared Key:
                </a>
              </template>
            </q-input>
            <q-input
              outlined
              readonly
              :color="darkmode ? 'white' : 'dark'"
              v-model="vpnSetupConnection.serverPublicKey"
              style="height: 50px"
              dense
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.serverPublicKey)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  Server Key:
                </a>
              </template>
            </q-input>
            <q-input
              outlined
              readonly
              v-model="vpnSetupConnection.allowedIps"
              style="height: 50px"
              dense
              :color="darkmode ? 'white' : 'dark'"
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.allowedIps)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  Allowed IPs:
                </a>
              </template>
            </q-input>
            <q-input
              outlined
              readonly
              v-model="vpnSetupConnection.endpoint"
              style="height: 50px"
              dense
              :color="darkmode ? 'white' : 'dark'"
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.endpoint)"
              />
              <template v-slot:prepend>
                <a
                  style="width: 120px"
                  class="text-body1"
                  :class="darkmode ? 'text-white' : 'text-dark'"
                >
                  Endpoint:
                </a>
              </template>
            </q-input>
          </q-tab-panel>
          <q-tab-panel name="config">
            <div class="row justify-center q-ma-md">
              <q-btn
                label="Download wg0.conf"
                push
                size="lg"
                icon="download"
                class="bg-green text-white q-mt-lg"
                @click="downloadConfiguration"
              />
            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-separator class="q-mt-sm" />
        <q-card-actions align="center" class="q-mt-sm q-mb-sm" vertical>
          <div class="text-body2 text-center text-red">
            You won't be able to recover this information.
          </div>
          <q-btn
            v-close-popup
            push
            class="bg-green text-white q-mt-md"
            icon="done"
            size="md"
            label="Ok"
            style="width: 175px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

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
        <q-card class="bg-transparent" bordered flat>
          <q-item dense>
            <q-item-section avatar class="items-left col-1">
              Nr.
            </q-item-section>
            <q-item-section class="col">
              <q-item-label> Name </q-item-label>
            </q-item-section>
            <q-item-section class="col">
              <div class="q-ml-md">Addresses (v4, v6)</div>
            </q-item-section>
          </q-item>
          <q-separator color="primary" size="2px" />
          <div
            v-if="vpnConnections.length == 0"
            class="text-center q-mt-md text-body1 q-mb-md"
          >
            No VPN setup yet. Click the + at the bottom of the screen to set one
            up.
          </div>
          <div
            :style="'max-height:' + ($q.screen.height - 240) + 'px;'"
            style="overflow: scroll"
          >
            <template v-for="(item, index) in vpnConnections" :key="item">
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
                  <q-list separator bordered>
                    <q-item
                      clickable
                      v-close-popup
                      @click="deleteVPNConnection(item)"
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

                <q-item-section avatar class="items-left col-1">
                  {{ index }}.
                </q-item-section>
                <q-item-section class="text-body1 col">
                  <q-item-label class="text-weight-bolder ellipsis">
                    {{ item.name }}
                  </q-item-label>
                </q-item-section>
                <q-item-section class="text-body2 col">
                  <div class="q-ml-md">{{ item.addresses }}</div>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    icon="more_vert"
                    flat
                    round
                    :loading="loading"
                    @click.prevent.stop
                  >
                    <q-menu>
                      <q-list separator bordered>
                        <q-item
                          clickable
                          v-close-popup
                          @click="deleteVPNConnection(item)"
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

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useQuasar } from 'quasar';
import { useLocalStore } from 'stores/localStore';
import {
  VPNConnectionType,
  VPNInfoType,
  VPNSetupInputType,
} from 'src/types/index';
import VPNHelpDialog from 'components/VPN/VPNHelpDialog.vue';
import VPNInformation from 'components/VPN/VPNInformation.vue';
import { apiGet, apiPost, apiDelete } from 'src/apiWrapper';
import * as wireguard from 'components/VPN/wireguard.js';

export default defineComponent({
  name: 'VPNView',
  components: { VPNHelpDialog, VPNInformation },

  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    const axiosConfig = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      axiosConfig,
      localStore,
      q,
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),
      loading: ref(false),

      vpnInfoDialog: ref(false),
      helpVPNDialog: ref(false),

      setupVPNDialog: ref(false),
      setupVPNDialogSuccessful: ref(false),
      setupVPNDialogTabs: ref('info'),
      vpnConnections: ref([]) as Ref<VPNInfoType[]>,
      vpnClientInfo: ref({}) as Ref<VPNInfoType>,

      vpnSetupInput: ref({
        clientPublicKey: '',
        clientPrivateKey: '',
        name: '',
        autoKeyGeneration: true,
      }) as Ref<VPNSetupInputType>,
      vpnSetupConnection: ref({}) as Ref<VPNConnectionType>,
    };
  },

  computed: {
    darkmode() {
      return this.localStore.darkmode;
    },
  },

  created() {
    this.getVPNConnections();
  },

  methods: {
    deleteVPNConnection(con: VPNInfoType) {
      this.loading = true;
      apiDelete('/vpn/client/' + con.id, this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.notify('positive', 'Deleted.');
          this.getVPNConnections();
        } else {
          this.notify('negative', apiData.errorMessage);
        }
        this.loading = false;
      });
    },

    downloadConfiguration() {
      var element = document.createElement('a');
      var config =
        '[Interface]\n' +
        'PrivateKey = ' +
        this.vpnSetupConnection.clientPrivateKey +
        '\n' +
        'Address = ' +
        this.vpnSetupConnection.addresses +
        '\n' +
        'DNS = ' +
        this.vpnSetupConnection.dnsServers +
        '\n' +
        '[Peer]\n' +
        'PresharedKey = ' +
        this.vpnSetupConnection.presharedKey +
        '\n' +
        'PublicKey = ' +
        this.vpnSetupConnection.serverPublicKey +
        '\n' +
        'AllowedIPs = ' +
        this.vpnSetupConnection.allowedIps +
        '\n' +
        'Endpoint = ' +
        this.vpnSetupConnection.endpoint;

      element.setAttribute(
        'href',
        'data:application/octet-stream;charset=utf-8,' +
          encodeURIComponent(config)
      );
      element.setAttribute('download', 'wg0.conf');

      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    },

    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      this.notify('positive', 'Copied.');
    },

    notify(type: string, message: string) {
      this.q.notify({
        type: type,
        message: message,
        progress: true,
      });
    },

    getVPNConnections() {
      this.loading = true;
      apiGet('/vpn/client', this.axiosConfig).then((apiData) => {
        if (apiData.error == false) {
          this.vpnConnections = (apiData.data as any).clients as VPNInfoType[];
          this.initialFetch = true;
          this.initialFetchSuccessful = true;
        } else {
          this.notify('negative', apiData.errorMessage);
        }
        this.loading = false;
      });
    },

    createVPNClient() {
      if (
        this.vpnSetupInput.name.length < 1 ||
        (this.vpnSetupInput.autoKeyGeneration == false &&
          this.vpnSetupInput.clientPublicKey.length < 1)
      ) {
        this.notify('negative', 'Please fill out all required fields.');
        return;
      }

      if (this.vpnSetupInput.autoKeyGeneration == true) {
        var keys = wireguard.generateKeypair();
        this.vpnSetupInput.clientPublicKey = keys.publicKey;
      }

      // don't transmit private key
      var privateKey = this.vpnSetupInput.clientPrivateKey;
      this.vpnSetupInput.clientPrivateKey = '';

      this.loading = true;
      apiPost('/vpn/client', this.vpnSetupInput, this.axiosConfig).then(
        (apiData) => {
          if (apiData.error == false) {
            this.vpnSetupConnection = apiData.data;
            if (this.vpnSetupInput.autoKeyGeneration == true) {
              // use generated keys
              this.vpnSetupConnection.clientPrivateKey = keys.privateKey;
              this.vpnSetupConnection.clientPublicKey = keys.publicKey;
            } else {
              // use keys from input
              this.vpnSetupConnection.clientPrivateKey = privateKey;
              this.vpnSetupConnection.clientPublicKey =
                this.vpnSetupInput.clientPublicKey;
            }
            this.setupVPNDialogSuccessful = true;
            this.setupVPNDialog = false;
            this.getVPNConnections();
          } else {
            this.notify('negative', apiData.errorMessage);
          }
          this.loading = false;
        }
      );
    },
  },
});
</script>
