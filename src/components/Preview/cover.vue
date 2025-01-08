<script setup>
import lottieCoverOther from "@/assets/lottie/animation_lkpkpzdn.json";
import ImgBlurHash from "@/components/ImgBlurHash";
import LottieCover from "@/components/Lottie/index.vue";
import { getFileType } from "@/utils/getFileType";
import { computed, ref } from "vue";

const props = defineProps({
  data: Object,
});

// type fileData = {
//   type: string;
//   url: string;
// };

// interface Props {
//   data: any;
// }

// const props = defineProps<Props>();

const showViewer = ref(true);

const type = computed(() => {
  const type = getFileType(props.data.url);
  return type;
});
const fileUrl = computed(() => {
  const { type, url } = props.data;
  const fileType = type.split("/")[0];
  if (fileType === "video") {
    return url + "?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast";
  } else if (fileType === "image") {
    const fileSuffix = url.substring(url.lastIndexOf("."));
    if (fileSuffix.toUpperCase() === ".HEIC") {
      return `${url}?x-oss-process=image/resize,l_400/format,jpg`;
    } else {
      return url;
    }
  } else {
    return url;
  }
});
</script>

<template>
  <template v-if="type === 'image'">
    <ImgBlurHash
      v-preview="{ url: data.url, type }"
      class="w-full h-full align-middle object-cover"
      :src="fileUrl"
      :blurhash="data.blurhash"
    />
  </template>
  <template v-else-if="type === 'video'">
    <ImgBlurHash
      v-preview="{ url: data.url, type }"
      class="w-full h-full align-middle object-cover"
      :src="fileUrl"
    />
  </template>

  <template v-else-if="type === 'audio'">
    <div h-full w-full f-c>
      <audio controls>
        <source :src="data.url" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  </template>
  <template v-else>
    <div class="w-full fcc">
      <LottieCover width="5em" height="5em" :json-data="lottieCoverOther" />
    </div>
  </template>
</template>
