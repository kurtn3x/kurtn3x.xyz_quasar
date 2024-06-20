<template>
  <q-card bordered style="width: 350px">
    <q-toolbar class="bg-layout-bg text-layout-text text-center">
      <q-toolbar-title class="q-ma-sm">{{ item.name }}</q-toolbar-title>
      <q-tooltip class="text-body1 bg-layout-bg text-layout-text">
        {{ item.name }}
      </q-tooltip>
    </q-toolbar>
    <div class="q-ma-md">
      <div>
        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Type</div>
          <div class="col q-ml-sm">{{ item.type }}</div>
        </div>

        <div v-if="item.type != 'folder'">
          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Mime</div>
            <div class="col q-ml-sm" style="line-break: anywhere">
              {{ item.mime }}
            </div>
          </div>

          <div class="text-body1 q-mt-md row">
            <div class="text-weight-bolder col-3">Size</div>
            <div class="col q-ml-sm">
              {{ item.size }}
            </div>
          </div>
        </div>

        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Created</div>
          <div class="col q-ml-sm">{{ item.created }}</div>
        </div>

        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Modified</div>
          <div class="col q-ml-sm">{{ item.modified }}</div>
        </div>

        <div class="text-body1 q-mt-md row">
          <div class="text-weight-bolder col-3">Folder</div>
          <div class="col q-ml-sm" style="line-break: anywhere">
            {{ item.path }}
          </div>
        </div>

        <div class="text-body1 q-mt-md row" v-if="item.shared == false">
          <div class="text-weight-bolder col-3">Shared</div>
          <div class="col q-ml-sm">{{ item.shared }}</div>
        </div>
        <q-card class="q-mt-md" bordered flat v-if="item.shared == true">
          <q-expansion-item
            icon="shared"
            label="Shared"
            header-class="text-weight-bolder text-body1 bg-blue text-white"
            expand-icon-class="text-white"
          >
            <q-separator />
            <div class="text-body1 q-mt-md row q-ml-sm">
              <div class="text-weight-bolder">Allow Read</div>
              <div class="q-ml-md">
                {{ item.sharedAllowAllRead }}
              </div>
            </div>
            <div class="text-body1 q-mt-md row q-ml-sm">
              <div class="text-weight-bolder text-weight-bolder">
                Allow Write
              </div>
              <div class="q-ml-md">
                {{ item.sharedAllowAllWrite }}
              </div>
            </div>
            <div class="text-body1 q-mt-md row q-ml-sm q-mb-sm">
              <div class="text-weight-bolder text-weight-bolder">
                Password Protected
              </div>
              <div class="q-ml-md">
                {{ item.sharedPasswordProtected }}
              </div>
            </div>
          </q-expansion-item>
        </q-card>
      </div>
    </div>

    <q-separator class="q-mt-sm" />

    <q-card-actions align="center" class="q-mt-sm q-mb-sm">
      <q-btn
        v-close-popup
        push
        class="bg-green text-white col"
        icon="done"
        size="md"
        label="OK"
        style="max-width: 130px"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { FolderEntryType } from 'src/types/index';

const props = defineProps({
  propItem: Object,
});

var item = props.propItem as FolderEntryType;
</script>
