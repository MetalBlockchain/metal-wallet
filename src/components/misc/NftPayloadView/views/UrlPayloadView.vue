<template>
  <div
    class="url_payload_view"
    @mouseenter="isHover = true"
    @mouseleave="isHover = false"
  >
    <img v-show="isImage" :src="url" @load="isImage = true" />
    <video
      v-show="isVideo"
      :controls="isHover"
      controlsList="nodownload"
      loop
      muted
      :src="url"
      @loadedmetadata="isVideo = true"
    />
    <div v-if="!isImage && !isVideo" class="unknown">
      <p style="font-size: 2em">
        <fa icon="link"></fa>
      </p>
      <p class="warn">Do NOT click links you do not trust.</p>
      <a :href="url" target="_blank">{{ url }}</a>
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
      isHover: false,
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
  //border-radius: 14px;
  //overflow: hidden;
}
img,
video {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.unknown {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  a {
    margin: 14px 0;
  }
}
.unknown,
.warn {
  text-align: center;
  padding: 12px;
  word-break: break-all;
  font-size: 13px;
  span {
    color: var(--primary-color-light);
    font-size: 13px;
  }
}

.warn {
  color: var(--secondary-color);
  word-break: normal;
  font-size: 1.2em;
  font-weight: bold;
  opacity: 0.6;
}
</style>
