<template>
  <q-card bordered class="full-width">
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">VPN Setup Help</q-toolbar-title>
    </q-toolbar>
    <q-separator size="1px" />
    <q-tabs
      inline-label
      v-model="helpVPNDialogTabs"
      style="height: 50px"
      align="justify"
      indicator-color="transparent"
      active-color="layout-text"
      active-bg-color="primary"
    >
      <q-separator vertical size="1px" />
      <q-tab name="windows" :icon="mdiMicrosoftWindows" label="Windows" />
      <q-separator vertical size="1px" />
      <q-tab name="linux" :icon="mdiLinux" label="Linux" />
      <q-separator vertical size="1px" />
      <q-tab name="android" :icon="mdiAndroid" label="Android" />
      <q-separator vertical size="1px" />
    </q-tabs>
    <q-separator size="1px" />
    <q-tab-panels v-model="helpVPNDialogTabs" animated class="bg-transparent">
      <q-tab-panel name="windows">
        <ol>
          <li class="text-body1">
            <a
              href="https://download.wireguard.com/windows-client/wireguard-installer.exe"
              target="_blank"
              class="text-blue"
              >Download and Install Wireguard.
            </a>
          </li>
          <li class="text-body1 q-mt-sm">
            Start Wireguard. Add Tunnel → Add empty Tunnel...
          </li>
          <li class="text-body1 q-mt-sm">
            Add a name to the Wireguard-Configuration and copy the Public-Key
            under the name Input in wireguard.
          </li>
          <li class="text-body1 q-mt-sm">
            Insert the copied Public-Key in the Public-Key Input on this Website
            and add a unique name for the connection. Click Generate.
          </li>
          <li class="text-body1 q-mt-sm">
            Append the result under the windows Tab to the existing
            Configuration.
          </li>
          <li class="text-body1 q-mt-sm">Activate the connection.</li>
        </ol>
      </q-tab-panel>
      <q-tab-panel name="linux">
        <ol>
          <li class="text-body1">
            <a
              href="https://www.wireguard.com/install/"
              target="_blank"
              class="text-blue"
              >Install Wireguard depending on Operating System.
            </a>
          </li>
          <li class="text-body1 q-mt-sm">
            Generate a Public and Private-Keypair.
            <div class="q-mt-sm bg-grey-8 row items-center">
              <a
                style="font-family: 'Courier New'"
                class="text-white q-ma-xs text-body2"
                >{{ linuxCommand }}</a
              >
              <q-space />
              <q-btn
                push
                class="bg-blue text-white q-ma-xs"
                icon="content_copy"
                size="sm"
                @click="copyToClipboard(linuxCommand)"
              />
            </div>
          </li>
          <li class="text-body1 q-mt-sm">
            Copy the resulting Public-Key-Output (File peer_A.pub) to the
            Public-Key-Input on this Website. Add a name to the Connection.
            Click Generate.
          </li>
          <li class="text-body1 q-mt-sm">
            Under the Config-Tab input your Private-Key (File peer_A.key) and
            download the Configuration.
          </li>
          <li class="text-body1 q-mt-sm">
            Either use a GUI-Application to import the Config (e.g. Wireguird)
            or copy the Configuration (wg0.conf) to /etc/wireguard/.
          </li>
          <li class="text-body1 q-mt-sm">
            Activate the connection. If you copied it to /etc/wireguard/
            activate it with
            <div class="q-mt-sm bg-grey-8 row items-center">
              <a
                style="font-family: 'Courier New'"
                class="text-white q-ma-xs text-body2"
                >sudo wg-quick up wg0</a
              >
              <q-space />
              <q-btn
                push
                class="bg-blue text-white q-ma-xs"
                icon="content_copy"
                size="sm"
                @click="copyToClipboard('sudo wg-quick up wg0')"
              />
            </div>
          </li>
        </ol>
      </q-tab-panel>
      <q-tab-panel name="android">
        <ol>
          <li class="text-body1">
            <a
              href="https://play.google.com/store/apps/details?id=com.wireguard.android"
              target="_blank"
              class="text-blue"
              >Install Wireguard from Play Store.
            </a>
          </li>
          <li class="text-body1 q-mt-sm">
            Click the +. Create from Scratch. Generate a Private- and
            Public-Keypair with the <q-icon name="sync" />-Button.
          </li>
          <li class="text-body1 q-mt-sm">Copy the generated Public-Key.</li>
          <li class="text-body1 q-mt-sm">
            Insert the copied Public-Key in the Public-Key Input on this Website
            and add a unique name for the connection. Click Generate.
          </li>
          <li class="text-body1 q-mt-sm">
            Under the Config-Tab input the generated Private-Key and download
            the Configuration.
          </li>
          <li class="text-body1 q-mt-sm">
            Go back, click the + again and choose Import from file. Select the
            downloaded Configuration (wg0.conf).
          </li>
          <li class="text-body1 q-mt-sm">Activate the connection.</li>
        </ol>
      </q-tab-panel>
    </q-tab-panels>

    <q-separator class="q-mt-sm" />
    <q-card-actions align="center" class="q-mt-sm q-mb-sm" vertical>
      <q-btn
        v-close-popup
        push
        class="bg-green text-white"
        icon="done"
        size="md"
        label="Ok"
        style="width: 175px"
      />
    </q-card-actions>
  </q-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import {
  mdiLinux,
  mdiMicrosoftWindows,
  mdiAndroid,
} from '@quasar/extras/mdi-v6';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'VPNView',
  setup() {
    const linuxCommand =
      'wg genkey | (umask 0077 && tee peer_A.key) | wg pubkey > peer_A.pub && cat peer_A.pub';
    const q = useQuasar();
    return {
      q,
      linuxCommand,
      mdiLinux,
      mdiAndroid,
      mdiMicrosoftWindows,
      helpVPNDialogTabs: ref('windows'),
    };
  },
  methods: {
    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      this.q.notify({
        type: 'positive',
        message: 'Copied',
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
