<template>
  <q-card bordered class="full-width">
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">VPN Setup Help</q-toolbar-title>
    </q-toolbar>
    <q-separator size="1px" />

    <q-card style="max-width: 400px">
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
        <li class="text-body1 q-mt-sm">Download the configuration.</li>
        <li class="text-body1 q-mt-sm">
          <a class="text-weight-bold text-underline">Windows/Mobile:</a> Import
          the configuration in the Wireguard-GUI and enable it.
        </li>
        <li class="text-body1 q-mt-sm">
          <a class="text-weight-bold text-underline">Linux with Terminal:</a>
          Copy the configuration (wg0.conf) to /etc/wireguard/ and start it with
          'sudo wg-quick up wg0'. Disable it with 'sudo wg-quick down wg0'.
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
