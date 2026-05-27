<!--Used inside the JsonPayload.vue component-->

<template>
  <div class="generic_payload_view">
    <template v-if="!isError">
      <div class="generic_view">
        <img v-show="isImage" :src="img" @load="isImage = true" />
        <video
          v-show="isVideo"
          controlsList="nodownload"
          muted
          :src="img"
          @loadedmetadata="isVideo = true"
        />
      </div>
    </template>
    <template v-else>
      <p>Failed to load generic collectible payload.</p>
    </template>
  </div>
</template>
<script lang="ts">
import type { IGenericNft } from "@/components/wallet/studio/mint/types";
import type { JSONPayload } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { defineComponent } from "vue";

export const UtfPayloadView = defineComponent({
  props: {
    payload: {
      type: Object as PropType<JSONPayload>,
    },
  },
  data(): {
    isError: boolean;
    jsonData: IGenericNft | null;
    isImage: boolean;
    isVideo: boolean;
  } {
    const jsonData: IGenericNft | null = null;

    return {
      isError: false,
      jsonData,
      isImage: false,
      isVideo: false,
    };
  },
  computed: {
    content(): string {
      return this.payload?.getContent().toString() ?? "";
    },
    desc() {
      return this.jsonData?.desc;
    },
    img() {
      return this.jsonData?.img;
    },
    title() {
      return this.jsonData?.title;
    },
  },
  watch: {
    payload: [
      {
        handler: "onPayloadChange",
      },
    ],
  },
  mounted() {
    try {
      this.jsonData = JSON.parse(this.content).avalanche;
    } catch {
      this.isError = true;
    }
  },
  methods: {
    onPayloadChange(_: JSONPayload) {
      try {
        this.jsonData = JSON.parse(this.content).avalanche;
      } catch {
        this.isError = true;
      }
    },
  },
});
export default UtfPayloadView;
</script>
<style scoped lang="scss">
.generic_payload_view {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.generic_view {
  position: relative;
  width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}
p {
  font-size: 13px;
  word-break: break-word;
  overflow: scroll;
  background-color: var(--bg-light);
  color: var(--primary-color);
}

img,
video {
  display: block;
  object-fit: cover;
  object-position: center;
  width: 100%;
  height: 100%;
  position: absolute;
}

.nft_title {
  position: absolute;
  bottom: 0;
  width: 100%;
  font-size: 13px;
  background-color: #000000aa;
  color: #fff;
  transition-duration: 0.2s;
}

.generic_view:hover {
  .desc {
    opacity: 1;
  }
  .nft_title {
    opacity: 0;
  }
}
.desc {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
  font-size: 13px;
  transition-duration: 0.2s;
  color: #fff;
  text-align: center;
  padding: 14px;
  background-color: #000000bb;
}
</style>
