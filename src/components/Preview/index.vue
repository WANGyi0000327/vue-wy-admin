<script setup>
import { ElImageViewer } from "element-plus";
import { onMounted, ref } from "vue";
import Player from "xgplayer";
import "xgplayer/dist/index.min.css";

const props = defineProps({
  src: { type: String, default: "" },
  type: { type: String, default: "" },
  destroy: { type: Function },
});

// interface Props {
//   src: string;
//   type?: string;
//   destroy: Function;
// }

// const props = withDefaults(defineProps<Props>(), {
//   src: "",
//   type: ""
// });

const showViewer = ref(true);
const handleOnClose = () => {
  showViewer.value = false;
  props.destroy();
};

onMounted(() => {
  if (props.type === "video") {
    new Player({
      id: "mse",
      lang: "zh",
      // 默认静音
      volume: 0,
      autoplay: false,
      screenShot: true,
      videoAttributes: {
        crossOrigin: "anonymous",
      },
      url: props.src,
      poster: `${props.src}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`,

      //传入倍速可选数组
      playbackRate: [0.5, 0.75, 1, 1.5, 2],
      // height: "100%",
      width: "100%",
    });
  }
});
</script>

<template>
  <template v-if="type === 'image'">
    <div v-if="showViewer">
      <ElImageViewer
        :initial-index="0"
        :onClose="handleOnClose"
        :url-list="[src]"
      />
    </div>
  </template>
  <template v-else>
    <div
      class="absolute top-0 z-99999 h-full w-full box-border p-10 video-mask"
    >
      <div class="relative w-full h-full fcc">
        <div id="mse" />
        <div
          class="absolute right-0 top-0 text-8 text-white icon-btn i-carbon:close-filled"
          @click="handleOnClose"
        />
      </div>
    </div>
  </template>
</template>

<style scoped>
#mse {
  flex: auto;

  /* background: red; */
}

/* 遮罩层 */
.video-mask {
  background-color: rgb(0 0 0 / 80%);
}
</style>
