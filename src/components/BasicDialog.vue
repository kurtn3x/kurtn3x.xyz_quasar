<template>
  <q-dialog>
    <q-card bordered style="width: 350px">
      <q-toolbar class="bg-layout-bg text-layout-text text-center">
        <q-toolbar-title class="q-ma-sm">My Title</q-toolbar-title>
      </q-toolbar>
      <div class="text-body1 text-center q-ma-md"></div>
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
          v-close-popup
          flat
          class="bg-green text-white"
          icon="done"
          size="md"
          label="Continue"
          style="width: 130px"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <q-tooltip
    class="text-h6"
    :class="darkmode ? 'bg-dark text-white' : 'bg-white text-dark'"
  >
    Text
  </q-tooltip>
</template>
