<template>
  <q-card bordered class="full-width">
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">VPN Setup Help</q-toolbar-title>
    </q-toolbar>
    <q-separator size="1px" />

    <q-card>
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
          Generate a Public and Private-Keypair (automatically or do it
          yourself).
        </li>
        <li class="text-body1 q-mt-sm">
          Either use a GUI-Application to import the Config (e.g. Wireguird) or
          copy the Configuration (wg0.conf) to /etc/wireguard/.
        </li>
        <li class="text-body1 q-mt-sm">
          Activate the connection. If you copied it to /etc/wireguard/ activate
          it with
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
    </q-card>

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
