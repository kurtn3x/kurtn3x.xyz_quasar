<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <q-dialog v-model="setupVPNDialog">
      <q-card bordered style="max-width: 400px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm"
            >Setup VPN Connection</q-toolbar-title
          >
        </q-toolbar>
        <div class="text-body1 q-ma-md">
          <div class="text-center text-body2">
            Generate a private & public-keypair. Input a name & the public key
            below.
          </div>
          <q-input
            v-model="vpnSetupInput.name"
            outlined
            dense
            :color="darkmode ? 'white' : 'black'"
            label="VPN Connection Name"
            input-style="font-size: 14px"
            input-class="text-body2 "
            class="q-mt-md"
            no-error-icon
          />

          <q-input
            v-model="vpnSetupInput.publicKey"
            outlined
            dense
            :color="darkmode ? 'white' : 'black'"
            label="Public Key"
            input-style="font-size: 14px"
            input-class="text-body2 "
            class="q-mt-md"
            no-error-icon
          />
          <div class="row justify-center q-mt-md" v-if="loading">
            <q-spinner size="2em" />
          </div>
          <div v-if="loading" class="text-center text-body1 q-mt-sm q-mb-md">
            Generating Client Data... Please Wait.
          </div>
        </div>
        <q-separator class="q-mt-sm" />
        <q-card-actions align="center" class="q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            flat
            icon="close"
            label="Cancel"
            class="bg-red text-white"
            style="width: 130px"
          />
          <q-btn
            flat
            class="bg-green text-white"
            icon="done"
            size="md"
            label="Continue"
            @click="createVPNClient"
            style="width: 130px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="setupVPNDialogSuccessful" persistent>
      <q-card bordered class="full-width">
        <q-tabs
          inline-label
          v-model="setupVPNDialogTabs"
          style="height: 50px"
          align="justify"
          indicator-color="transparent"
          active-color="layout-text"
          active-bg-color="layout-bg"
        >
          <q-tab name="windows" :icon="mdiMicrosoftWindows" label="Windows" />
          <q-tab name="android" :icon="mdiAndroid" label="Mobile" />
          <q-tab name="info" icon="info" label="Info" />
        </q-tabs>
        <q-separator size="2px" color="primary" />
        <q-tab-panels
          v-model="setupVPNDialogTabs"
          animated
          class="bg-transparent"
          style="height: 270px"
        >
          <q-tab-panel name="windows">
            <div class="text-center text-body1">
              Append following configuration to your generated config.
              <br />
              Do not overwrite the existing lines.
            </div>

            <q-input
              label="wg0.conf"
              input-class="q-mt-sm"
              input-style="font-family:'Courier New'; resize: none; height: 150px; font-size:10pt"
              v-model="serverConfig"
              :color="darkmode ? 'white' : 'black'"
              outlined
              type="textarea"
              readonly
              dense
              class="q-mt-md"
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="q-pa-none q-ma-none absolute-right"
                size="md"
                style="height: 40px"
                @click="copyToClipboard(serverConfig)"
              />
            </q-input>
          </q-tab-panel>
          <q-tab-panel name="android">
            <div class="text-center text-body1 q-mt-lg">
              Copy your hidden private key and input it below. <br />
              You can than download the configuration and import the file.
            </div>
            <div class="row justify-center">
              <q-input
                v-model="vpnSetupConnection.privateKey"
                outlined
                :color="darkmode ? 'white' : 'black'"
                dense
                label="Your Private Key (not shared to anyone)"
                input-style="font-size: 14px"
                input-class="text-body2 "
                class="q-mt-md"
                no-error-icon
                style="min-width: 350px"
              />
              <q-btn
                label="Download Configuration"
                unelevated
                class="bg-green text-white q-mt-md"
                @click="downloadConfiguration"
              />
            </div>
          </q-tab-panel>
          <q-tab-panel name="info">
            <div class="text-h6 text-weight-bold q-mb-sm">
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
              v-model="vpnSetupConnection.dnsServer"
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
                @click="copyToClipboard(vpnSetupConnection.dnsServer)"
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
              v-model="vpnSetupConnection.serverKey"
              style="height: 50px"
              dense
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupConnection.serverKey)"
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
              v-model="vpnSetupConnection.allowedIPs"
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
                @click="copyToClipboard(vpnSetupConnection.allowedIPs)"
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
        </q-tab-panels>

        <q-separator class="q-mt-sm" />
        <q-card-actions align="center" class="q-mt-sm q-mb-sm" vertical>
          <div class="text-body2 text-center text-red" style="font-size: 10pt">
            You won't be able to recover this information.
          </div>
          <q-btn
            v-close-popup
            flat
            class="bg-primary text-white q-mt-md"
            icon="done"
            size="md"
            label="Ok"
            style="width: 130px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="vpnInfoDialog">
      <q-card bordered style="width: 400px">
        <q-toolbar class="bg-layout-bg text-layout-text text-center">
          <q-toolbar-title class="q-ma-sm"
            >Info for {{ vpnClientInfo.name }}</q-toolbar-title
          >
        </q-toolbar>
        <div class="q-ma-md">
          <div class="row q-mt-md">
            <div class="col-3 text-weight-bold">Name</div>
            <div class="col-7">{{ vpnClientInfo.name }}</div>
          </div>
          <div class="row q-mt-md">
            <div class="col-3 text-weight-bold">Addresses</div>
            <div class="col-7">{{ vpnClientInfo.addresses }}</div>
          </div>
          <div class="row q-mt-md">
            <div class="col-3 text-weight-bold">Created</div>
            <div class="col-7">{{ vpnClientInfo.created }}</div>
          </div>
          <div class="row q-mt-md">
            <div class="col-3 text-weight-bold">Public Key</div>
            <div class="col-7 ellipsis">
              {{ vpnClientInfo.client_publickey }}
              <q-tooltip
                :class="darkmode ? 'bg-dark text-white' : 'bg-white text-dark'"
                class="text-caption"
              >
                {{ vpnClientInfo.client_publickey }}
              </q-tooltip>
            </div>
          </div>
        </div>

        <q-separator class="q-mt-sm" />
        <q-card-actions align="center" class="q-mt-sm q-mb-sm">
          <q-btn
            v-close-popup
            flat
            class="bg-green text-white"
            icon="done"
            size="md"
            label="Ok"
            style="width: 130px"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <div class="q-ma-sm">
      <div class="text-center text-h5 q-mt-md text-weight-bold">
        My VPN Connections
      </div>

      <q-page-sticky position="bottom" :offset="[0, 20]">
        <q-btn
          unelevated
          icon="add"
          active-icon="add"
          direction="up"
          color="green"
          round
          padding="sm"
          style="height: 60px; width: 60px"
          @click="setupVPNDialog = !setupVPNDialog"
        />
      </q-page-sticky>
      <q-list bordered separator class="q-mt-md">
        <template v-for="item in vpnConnections" :key="item">
          <q-item>
            <q-item-section class="text-body1">
              <q-item-label overline> Name: {{ item.name }} </q-item-label>
              <div class="row">
                <div class="col">{{ item.addresses }}</div>
              </div>
            </q-item-section>
            <q-item-section side class="row">
              <div class="row">
                <q-btn
                  size="sm"
                  icon="info"
                  class="q-ml-md bg-grey text-white"
                  unelevated
                  round
                  @click="
                    vpnInfoDialog = true;
                    vpnClientInfo = item;
                  "
                />
                <q-btn
                  size="sm"
                  icon="close"
                  class="q-ml-md bg-red text-white"
                  unelevated
                  round
                  @click="deleteVPNConnection(item)"
                />
              </div>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useLocalStore } from 'stores/localStore';
import { mdiAndroid } from '@quasar/extras/mdi-v6';
import { mdiMicrosoftWindows } from '@quasar/extras/mdi-v6';
import {
  VPNSetupInputType,
  VPNSetupConnectionType,
  VPNClientInfoType,
} from 'src/types/index';

export default defineComponent({
  name: 'VPNView',
  setup() {
    const localStore = useLocalStore();
    const q = useQuasar();

    const axios_config = {
      withCredentials: true,
      headers: {
        'X-CSRFToken': q.cookies.get('csrftoken'),
      },
    };

    return {
      mdiAndroid,
      mdiMicrosoftWindows,
      axios_config,
      localStore,
      q,
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),
      loading: ref(false),
      setupVPNDialog: ref(false),
      vpnInfoDialog: ref(false),

      setupVPNDialogSuccessful: ref(false),
      setupVPNDialogTabs: ref('windows'),

      vpnConnections: ref([]) as Ref<VPNClientInfoType[]>,
      vpnSetupInput: ref({ publicKey: '', name: '' }) as Ref<VPNSetupInputType>,
      vpnSetupConnection: ref() as Ref<VPNSetupConnectionType>,
      vpnClientInfo: ref({}) as Ref<VPNClientInfoType>,
    };
  },

  computed: {
    serverConfig() {
      return (
        'Address = ' +
        this.vpnSetupConnection.addresses +
        '\n' +
        'DNS = ' +
        this.vpnSetupConnection.dnsServer +
        '\n' +
        '[Peer]\n' +
        'PresharedKey = ' +
        this.vpnSetupConnection.presharedKey +
        '\n' +
        'PublicKey = ' +
        this.vpnSetupConnection.serverKey +
        '\n' +
        'AllowedIPs = ' +
        this.vpnSetupConnection.allowedIPs +
        '\n' +
        'Endpoint = ' +
        this.vpnSetupConnection.endpoint
      );
    },
    darkmode() {
      return this.localStore.darkmode;
    },
  },

  created() {
    this.getVPNConnections();
  },

  methods: {
    deleteVPNConnection(con: VPNClientInfoType) {
      api
        .delete('/vpn_torrent/delete/vpn/' + con.id, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.notify('positive', 'Deleted.');
            this.getVPNConnections();
          } else {
            this.notify('negative', response.data.error);
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
        });
    },

    downloadConfiguration() {
      var element = document.createElement('a');
      var config =
        '[Interface]\n' +
        'PrivateKey = ' +
        this.vpnSetupConnection.privateKey +
        '\n' +
        'Address = ' +
        this.vpnSetupConnection.addresses +
        '\n' +
        'DNS = ' +
        this.vpnSetupConnection.dnsServer +
        '\n' +
        '[Peer]\n' +
        'PresharedKey = ' +
        this.vpnSetupConnection.presharedKey +
        '\n' +
        'PublicKey = ' +
        this.vpnSetupConnection.serverKey +
        '\n' +
        'AllowedIPs = ' +
        this.vpnSetupConnection.allowedIPs +
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
        multiLine: true,
      });
    },

    getVPNConnections() {
      this.loading = true;
      api
        .get('/vpn_torrent/list/vpn', this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.vpnConnections = response.data.clients as VPNClientInfoType[];
            this.initialFetch = true;
            this.initialFetchSuccessful = true;
            this.loading = false;
          } else {
            this.initialFetch = true;
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          this.initialFetch = true;
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
          this.loading = false;
        });
    },

    createVPNClient() {
      if (
        this.vpnSetupInput.name.length < 1 ||
        this.vpnSetupInput.publicKey.length < 1
      ) {
        this.notify('negative', 'Please fill out all required fields.');
        return;
      }

      this.loading = true;
      api
        .post('/vpn_torrent/create/vpn', this.vpnSetupInput, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.setupVPNDialogSuccessful = true;
            this.setupVPNDialog = false;
            this.vpnSetupConnection = response.data;
            this.loading = false;
            this.getVPNConnections();
          } else {
            this.notify('negative', response.data.error);
            this.loading = false;
          }
        })
        .catch((error) => {
          if (error.response) {
            this.notify('negative', error.response.data.error);
          } else {
            console.log(error);
          }
          this.loading = false;
        });
    },
  },
});
</script>

<style scoped>
.disable-select {
  user-select: none; /* supported by Chrome and Opera */
  -webkit-user-select: none; /* Safari */
  -khtml-user-select: none; /* Konqueror HTML */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* Internet Explorer/Edge */
}
</style>
