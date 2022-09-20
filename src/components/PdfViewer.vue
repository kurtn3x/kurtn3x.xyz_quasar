<template>
  <vue-pdf-embed :source="this.initical_doc" />
</template>

<script>
import VuePdfEmbed from 'vue-pdf-embed';
import { defineComponent, ref } from 'vue';

export default {
  name: 'PdfViewer',
  props: { initialDoc: { type: ArrayBuffer } },
  components: { VuePdfEmbed },

  setup(props) {
    return {
      initical_doc: ref(props.initialDoc),
    };
  },
};
</script>

<style>
#webviewer {
  height: 100vh;
}
</style>
