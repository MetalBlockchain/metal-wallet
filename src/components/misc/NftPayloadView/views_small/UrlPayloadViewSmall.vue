<template>
  <div class="url_payload_view">
    <img v-show="isImage" :src="url" @load="isImage = true" />
    <video
      v-show="isVideo"
      controlsList="nodownload"
      muted
      :src="url"
      @loadedmetadata="isVideo = true"
    />
    <div v-if="!isVideo && !isImage" class="unknown">
      <p><fa icon="link"></fa></p>
    </div>
  </div>
</template>
<script lang="ts">
import type { URLPayload } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    payload: {
      type: Object as PropType<URLPayload>,
    },
  },
  data() {
    const img_types = [
      "jpeg",
      "jpg",
      "gif",
      "png",
      "apng",
      "svg",
      "bmp",
      "ico",
      "webp",
    ];
    return {
      img_types,
      valid_types: img_types.concat(["pdf"]),
      isImage: false,
      isVideo: false,
    };
  },
  computed: {
    url() {
      return this.payload?.getContent().toString() ?? "";
    },
    fileType(): string | null {
      const url = this.url;

      const split = url.split(".");

      // Couldn't find extension
      if (split.length === 1) return null;

      const extension = split.at(-1);

      if (!extension || !this.valid_types.includes(extension)) return null;
      return extension;
    },
  },
});
</script>
<style scoped lang="scss">
.url_payload_view {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  //border-radius: 14px;
  //overflow: hidden;
}

img,
video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.unknown {
  background-color: var(--bg-light);
  text-align: center;
}
</style>
