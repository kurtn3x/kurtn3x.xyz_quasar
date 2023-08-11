<template>
  <div v-if="!initialFetch" class="absolute-center">
    <q-spinner color="primary" size="10em" />
  </div>
  <div v-if="initialFetch && !initialFetchSuccessful">
    <div class="text-center text-h5 q-mt-md">Something went wrong.</div>
  </div>
  <div v-if="initialFetch && initialFetchSuccessful">
    <q-dialog v-model="fastSetupVPNDialog">
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
            v-model="vpnSetupName"
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
            v-model="vpnSetupPublicKey"
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
          <q-separator class="q-mt-md" />
          <q-card-actions align="center" class="q-ma-sm">
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
        </div>
      </q-card>
    </q-dialog>
    <q-dialog
      v-model="fastSetupVPNDialogSuccessful"
      persistent
      @hide="
        vpnSetupName = '';
        vpnSetupPublicKey = '';
        vpnSetupPrivateKey = '';
        vpnSetupAddresses = '';
        vpnSetupServerPublicKey = '';
        vpnSetupPSK = '';
      "
    >
      <q-card bordered class="full-width">
        <q-tabs
          inline-label
          v-model="fastSetupVPNDialogTabs"
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

        <q-tab-panels
          v-model="fastSetupVPNDialogTabs"
          animated
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
                v-model="vpnSetupPrivateKey"
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
              v-model="vpnSetupAddresses"
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
                @click="copyToClipboard(vpnSetupAddresses)"
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
              v-model="vpnStaticDNS"
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
                @click="copyToClipboard(vpnStaticDNS)"
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
              v-model="vpnSetupPSK"
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
                @click="copyToClipboard(vpnSetupPSK)"
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
              v-model="vpnSetupServerPublicKey"
              style="height: 50px"
              dense
            >
              <q-btn
                flat
                round
                icon="content_copy"
                class="absolute-right"
                size="md"
                @click="copyToClipboard(vpnSetupServerPublicKey)"
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
              v-model="vpnStaticAllowedIPs"
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
                @click="copyToClipboard(vpnStaticAllowedIPs)"
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
              v-model="vpnStaticEndpoint"
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
                @click="copyToClipboard(vpnStaticEndpoint)"
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
        <q-card-actions align="center" class="q-ma-sm" vertical>
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
            >Info for {{ vpnInfoName }}</q-toolbar-title
          >
        </q-toolbar>
        <div class="q-ma-sm">
          <div class="row q-mt-md">
            <div class="col text-weight-bold">Name</div>
            <div class="col-10">{{ vpnInfoName }}</div>
          </div>
          <div class="row q-mt-md">
            <div class="col text-weight-bold">IPv4</div>
            <div class="col-10">{{ vpnInfoIPV4 }}</div>
          </div>
          <div class="row q-mt-md">
            <div class="col text-weight-bold">IPv6</div>
            <div class="col-10">{{ vpnInfoIPV6 }}</div>
          </div>
          <div class="row q-mt-md">
            <div class="col text-weight-bold">Added</div>
            <div class="col-10">{{ vpnInfoCreated }}</div>
          </div>
          <div class="row q-mt-md">
            <div class="col-4 text-weight-bold">Public Key</div>
            <div>
              {{ vpnInfoPublicKey }}
            </div>
          </div>
        </div>

        <q-separator />
        <q-card-actions align="center" class="q-ma-sm">
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
          @click="fastSetupVPNDialog = !fastSetupVPNDialog"
        />
      </q-page-sticky>
      <q-list bordered separator class="q-mt-md">
        <template v-for="item in vpnConnections" :key="item">
          <q-item>
            <q-item-section class="text-body1">
              <q-item-label overline> Name: {{ item.name }} </q-item-label>
              <div class="row">
                <div class="col">{{ item.ipv4 }}</div>
                <div class="col">{{ item.ipv6 }}</div>
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
                    vpnInfoName = item.name;
                    vpnInfoIPV4 = item.ipv4;
                    vpnInfoIPV6 = item.ipv6;
                    vpnInfoPublicKey = item.client_publickey;
                    vpnInfoCreated = item.created;
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

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import { mdiAndroid } from '@quasar/extras/mdi-v6';
import { mdiMicrosoftWindows } from '@quasar/extras/mdi-v6';
import { mdiLinux } from '@quasar/extras/mdi-v6';

export default defineComponent({
  name: 'VPNView',
  setup() {
    const userStore = useUserStore();
    const settingsStore = useSettingsStore();
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
      mdiLinux,
      axios_config,
      userStore,
      settingsStore,
      q,
      initialFetch: ref(false),
      initialFetchSuccessful: ref(false),
      loading: ref(false),
      vpnConnections: ref([]),
      fastSetupVPNDialog: ref(false),
      fastSetupVPNDialogSuccessful: ref(false),
      fastSetupVPNDialogTabs: ref('windows'),

      vpnSetupPublicKey: ref(''),
      vpnSetupName: ref(''),
      vpnSetupPrivateKey: ref('Your private Key'),
      vpnSetupAddresses: ref(''),
      vpnSetupServerPublicKey: ref(''),
      vpnSetupPSK: ref(''),

      vpnStaticDNS: ref('10.0.0.1, fde9:9757:b59b::1'),
      vpnStaticAllowedIPs: ref('0.0.0.0/0, ::/0'),
      vpnStaticEndpoint: ref('193.218.118.184:51820'),

      vpnInfoDialog: ref(false),
      vpnInfoName: ref(''),
      vpnInfoIPV4: ref(''),
      vpnInfoIPV6: ref(''),
      vpnInfoPublicKey: ref(''),
      vpnInfoCreated: ref(''),
    };
  },

  computed: {
    serverConfig() {
      return (
        'Address = ' +
        this.vpnSetupAddresses +
        '\n' +
        'DNS = ' +
        this.vpnStaticDNS +
        '\n' +
        '[Peer]\n' +
        'PresharedKey = ' +
        this.vpnSetupPSK +
        '\n' +
        'PublicKey = ' +
        this.vpnSetupServerPublicKey +
        '\n' +
        'AllowedIPs = ' +
        this.vpnStaticAllowedIPs +
        '\n' +
        'Endpoint = ' +
        this.vpnStaticEndpoint
      );
    },
    darkmode() {
      return this.settingsStore.darkmode;
    },
  },

  created() {
    this.getVPNConnections();
  },

  methods: {
    deleteVPNConnection(con) {
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
        this.vpnSetupPrivateKey +
        '\n' +
        'Address = ' +
        this.vpnSetupAddresses +
        '\n' +
        'DNS = ' +
        this.vpnStaticDNS +
        '\n' +
        '[Peer]\n' +
        'PresharedKey = ' +
        this.vpnSetupPSK +
        '\n' +
        'PublicKey = ' +
        this.vpnSetupServerPublicKey +
        '\n' +
        'AllowedIPs = ' +
        this.vpnStaticAllowedIPs +
        '\n' +
        'Endpoint = ' +
        this.vpnStaticEndpoint;

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

    copyToClipboard(text) {
      navigator.clipboard.writeText(text);
      this.notify('positive', 'Copied.');
    },

    notify(type, message) {
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
            this.vpnConnections = response.data.clients;
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
      if (this.vpnSetupName.length < 1 || this.vpnSetupPublicKey.length < 1) {
        this.notify('negative', 'Please fill out all required fields.');
        return;
      }
      var data = {
        name: this.vpnSetupName,
        public_key: this.vpnSetupPublicKey,
      };
      this.loading = true;
      api
        .post('/vpn_torrent/create/vpn', data, this.axios_config)
        .then((response) => {
          if (response.status == 200) {
            this.fastSetupVPNDialogSuccessful = true;
            this.fastSetupVPNDialog = false;
            this.vpnSetupAddresses =
              response.data.ipv4 + '/8,' + response.data.ipv6 + '/64';
            this.vpnSetupServerPublicKey = response.data.server_key;
            this.vpnSetupPSK = response.data.psk;
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
