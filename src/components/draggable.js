import Common from './common';

const dataMap = new WeakMap();

var selected = [];

export var selected;

function updateDragData(el, binding) {
  dataMap.set(el, binding.modifiers.image ? binding.value.data : binding.value);
}

const draggable = {
  updated(el, binding) {
    updateDragData(el, binding);
  },

  beforeUnmount(el) {
    dataMap.delete(el);
  },

  mounted(el, binding, vnode) {
    updateDragData(el, binding);

    el.setAttribute('draggable', true);

    if (binding.modifiers && binding.modifiers.move) {
      el.style.cursor = 'move';
    }

    // Only transfer the key and use an external store for the actual data
    const transferKey = Date.now() + '';

    el.addEventListener(
      'dragstart',
      function (event) {
        // for (var el of selected) {
        //   console.log(el);
        const dragData = dataMap.get(el);
        // console.log('dragdata');
        // console.log(dragData);

        Common.dragInProgressKey = transferKey;

        Common.transferredData[transferKey] = {
          dragData,
          namespace: Common.getNamespace(binding),
          onDropCallback: null, // will be set in droppable directive
        };

        event.dataTransfer.setData('text/plain', transferKey);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.dropEffect = 'move';

        if (vnode.props.onVDragStart) {
          vnode.props.onVDragStart(dragData, event);
        }
        // }
      },
      false
    );

    el.addEventListener('drag', function (event) {
      // for (var el of selected) {
      if (binding.modifiers.dynamic) {
        Common.transferredData[transferKey].namespace =
          Common.getNamespace(binding);
      }

      if (vnode.props.onVDragMove) {
        vnode.props.onVDragMove(dataMap.get(el), event);
      }
      // }
    });

    el.addEventListener('dragend', function (event) {
      Common.dragInProgressKey = null;

      if (Common.transferredData[transferKey]) {
        if (
          typeof Common.transferredData[transferKey].onDropCallback ===
          'function'
        ) {
          const callback = Common.transferredData[transferKey].onDropCallback;
          setTimeout(() => callback(), 0);
        }
        delete Common.transferredData[transferKey];
      }

      if (vnode.props.onVDragEnd) {
        vnode.props.onVDragEnd(dataMap.get(el), event);
      }
    });
  },
};

export { draggable };
