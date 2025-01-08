import type { Directive, DirectiveBinding } from "vue";
import PreviewImg from "@/components/Preview/index.vue";
import { useEventListener } from "@vueuse/core";
import { h, render } from "vue";
interface previewEl extends HTMLElement {
  srcValue: string;
}
const handleDestroy = () => {
  // 从 body 上移除组件
  render(null, document.body);
};

/** 图片预览 */
export const preview: Directive = {
  updated(el: previewEl, binding: DirectiveBinding) {
    // 添加style
    el.style.cursor = "pointer";
    const { value } = binding;
    if (value) {
      el.srcValue = value;
      const arg = binding.arg ?? "click";
      useEventListener(el, arg, () => {
        const vnode = h(PreviewImg, {
          src: value.url,
          type: value.type,
          destroy: handleDestroy,
        });
        render(vnode, document.body);
      });
    } else {
      throw new Error(
        '[Directive: copy]: need value! Like v-copy="modelValue"',
      );
    }
  },
};
