<template>
  <q-bar style="height: 50px; background-color: #00a4ef" class="text-light">
    <q-icon name="feed" />
    <div class="q-ml-md">DOCUMENT EDITOR</div>
    <q-space />

    <div class="q-ml-md">File: {{ filename }}</div>
    <div class="q-ml-xl">Folder: {{ filename }}</div>
    <q-space />

    <q-btn
      stretch
      flat
      label="Edit File Settings"
      icon="edit"
      @click="pdf_viewer_maximized = !pdf_viewer_maximized"
      class="text-h6"
    />
    <q-btn
      stretch
      flat
      label="Save"
      icon="save"
      @click="show_file_editor = !show_file_editor"
      class="text-h6"
    />
  </q-bar>
  <ckeditor
    :editor="editor"
    v-model="editorData"
    :config="editorConfig"
    @ready="onReady"
  ></ckeditor>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useUserStore } from 'stores/user';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useSettingsStore } from 'stores/settings';
import CKEditor from '@ckeditor/ckeditor5-vue';
import DecoupledEditor from '@ckeditor/ckeditor5-build-decoupled-document';

export default defineComponent({
  name: 'NotesView',
  components: {
    ckeditor: CKEditor.component,
  },
  setup() {
    const userStore = useUserStore();
    const settings_store = useSettingsStore();
    const q = useQuasar();

    return {
      userStore,
      settings_store,
      q,
      editor: DecoupledEditor,
      editorData: '<p>Content of the editor.</p>',
      editorConfig: {
        // The configuration of the editor.
      },
    };
  },
  methods: {
    print() {
      console.log(this.editorData);
    },
    onReady(editor) {
      // Insert the toolbar before the editable area.
      editor.ui
        .getEditableElement()
        .parentElement.insertBefore(
          editor.ui.view.toolbar.element,
          editor.ui.getEditableElement()
        );
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
