<!--Used inside the JsonPayload.vue component-->

<template>
  <div class="generic_payload_view">
    <div
      v-if="!isError"
      class="payload_rows"
      @mouseenter="isHover = true"
      @mouseleave="isHover = false"
    >
      <div class="generic_view">
        <img v-show="isImage" :src="img" @load="isImage = true" />
        <video
          v-show="isVideo"
          :controls="isHover"
          controlsList="nodownload"
          loop
          muted
          :src="img"
          @loadedmetadata="onVideoMeta"
        />
      </div>
    </div>
    <div v-else>
      <p>Failed to load generic collectible payload.</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { JSONPayload } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import type { IGenericNft } from "@/components/wallet/studio/mint/types";
import { defineComponent } from "vue";

export const UtfPayloadView = defineComponent({
  props: {
    payload: {
      type: Object as PropType<JSONPayload>,
    },
  },
  data(): {
    isVideo: boolean;
    isImage: boolean;
    isAudio: boolean;
    isError: boolean;
    jsonData: IGenericNft | null;
    isHover: boolean;
  } {
    const jsonData: IGenericNft | null = null;
    return {
      isVideo: false,
      isImage: false,
      isAudio: false,
      isError: false,
      jsonData,
      isHover: false,
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
    onVideoMeta(_: any) {
      this.isVideo = true;
    },
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
  position: relative;
}
.generic_view {
  position: relative;
  width: 100%;
  //height: 100%;
  flex-grow: 1;
  overflow: auto;
}

.generic_meta {
  position: absolute;
  border-top: 2px solid var(--bg-light);
  padding: 16px 12px;
  height: 100%;
  width: 100%;
  background-color: #000d;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

img,
video {
  display: block;
  object-fit: contain;
  width: 100%;
  height: 100%;
  outline: none;
  //position: absolute;
}

.payload_rows {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nft_title {
  font-size: 1.2em;
  text-align: left;
  font-weight: bold;
}

.desc {
  margin-top: 4px;
  font-size: 13px;
}
</style>
