<template>
  <ckeditor
    :editor="editor"
    v-model="editorData"
    :config="editorConfig"
    @ready="onReady"
  ></ckeditor>
  <q-btn label="LOL" size="xl" @click="print" />
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
