<template>
  <q-toolbar class="text-primary">
    <q-btn flat round dense icon="menu" />
    <q-select
      v-model="theme"
      :options="Array.from(thememap.keys())"
      label="Theme"
    />
  </q-toolbar>
  <codemirror
    v-model="code"
    placeholder="Code goes here..."
    :style="{ height: '200px', tabIndex: -1 }"
    :autofocus="true"
    :indent-with-tab="true"
    :tab-size="2"
    :extensions="extensions"
    @ready="handleReady"
    @change="log('change', $event)"
    @focus="log('focus', $event)"
    @blur="log('blur', $event)"
  />
</template>

<script>
import { defineComponent, ref, shallowRef } from 'vue';
import { Codemirror } from 'vue-codemirror';
import { basicSetup } from 'codemirror';
import { langmap } from './langmap';
import { thememap } from './thememap';
import { keyBy } from 'lodash';

export default defineComponent({
  components: {
    Codemirror,
  },
  computed: {
    extensions() {
      var temp = [basicSetup];

      for (var [key, val] of this.thememap) {
        if (this.theme == key) {
          temp.push(val);
        }
      }

      for (var [key, val] of this.langmap) {
        if (this.lang == key) {
          temp.push(val);
        }
      }

      return temp;
    },
  },
  setup() {
    const code = ref('');

    // Codemirror EditorView instance ref
    const view = shallowRef();
    const handleReady = (payload) => {
      view.value = payload.view;
    };

    // Status is available at all times via Codemirror EditorView
    const getCodemirrorStates = () => {
      const state = view.value.state;
      const ranges = state.selection.ranges;
      const selected = ranges.reduce(
        (r, range) => r + range.to - range.from,
        0
      );
      const cursor = ranges[0].anchor;
      const length = state.doc.length;
      const lines = state.doc.lines;
      // more state info ...
      // return ...
    };

    return {
      code,
      handleReady,
      log: console.log,
      theme: ref('default'),
      lang: ref('python'),
      langmap,
      thememap,
    };
  },
});
</script>
