<template>
  <q-card
    bordered
    style="max-width: 400px"
  >
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
          >
            Install Wireguard depending on Operating System.
          </a>
        </li>
        <li class="text-body1 q-mt-sm">
          Generate a Public and Private-Keypair (automatically or do it
          yourself) and create the client.
        </li>
        <li class="text-body1 q-mt-sm">Download the resulting config.</li>
        <li class="text-body1 q-mt-sm">
          <a
            class="text-weight-bolder"
            style="text-decoration: underline"
          >
            Windows/Mobile/GUI:
          </a>
          Import the config in the Wireguard-GUI and enable it.
        </li>
        <li class="text-body1 q-mt-sm">
          <a
            class="text-weight-bolder"
            style="text-decoration: underline"
          >
            Linux with Terminal:
          </a>
          Copy the config to /etc/wireguard.
          <div>
            Enable it with
            <a class="text-italic text-weight-bold">sudo wg-quick up wg0</a>
          </div>
          <div>
            Disable it with
            <a class="text-italic text-weight-bold">sudo wg-quick down wg0</a>
          </div>
        </li>
      </ol>
    </q-card>

    <q-separator class="q-mt-sm" />
    <q-card-actions
      align="center"
      class="q-mt-sm q-mb-sm"
      vertical
    >
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
