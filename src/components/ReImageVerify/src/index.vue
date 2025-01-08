<script setup>
import { watch } from "vue";
import { useImageVerify } from "./hooks";

defineOptions({
  name: "ReImageVerify",
});

const props = defineProps({
  code: { type: String, default: "" },
});

const emit = defineEmits(["update:code"]);

const { domRef, imgCode, setImgCode, getImgCode } = useImageVerify();

watch(
  () => props.code,
  (newValue) => {
    setImgCode(newValue);
  },
);
watch(imgCode, (newValue) => {
  emit("update:code", newValue);
});

defineExpose({ getImgCode });
</script>

<template>
  <canvas
    ref="domRef"
    width="120"
    height="40"
    class="cursor-pointer"
    @click="getImgCode"
  />
</template>
