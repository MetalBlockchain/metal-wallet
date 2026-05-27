<template>
  <BaseNftCard :mini="mini" :raw-card="rawCard" :utxo-id="utxo?.getUTXOID()">
    <template #card>
      <UrlPayloadView :payload="payloadAsURL"></UrlPayloadView>
    </template>

    <template #deck>
      <div v-if="fileType === 'pdf'" class="pdf">
        <a class="" :href="url" target="_blank">Open Document</a>
      </div>
      <div v-else-if="fileType == ''" class="unknown">
        <a class="" :href="url" target="_blank">Open URL</a>
      </div>
    </template>

    <template #mini>
      <img v-if="img_types.includes(fileType)" class="img_mini" :src="url" />
      <p v-else><fa icon="link"></fa></p>
    </template>
  </BaseNftCard>
</template>
<script lang="ts">
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  PayloadBase,
  URLPayload,
} from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import UrlPayloadView from "@/components/misc/NftPayloadView/views/UrlPayloadView.vue";
import BaseNftCard from "@/components/NftCards/BaseNftCard.vue";

export const URL_NFT = defineComponent({
  components: {
    BaseNftCard,
    UrlPayloadView,
  },
  props: {
    payload: {
      type: Object as PropType<PayloadBase>,
    },
    mini: { default: false, type: Boolean },
    rawCard: { default: false, type: Boolean },
    utxo: {
      type: Object as PropType<UTXO>,
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
    ];
    return {
      img_types,
      valid_types: img_types.concat(["pdf"]),
    };
  },
  computed: {
    url(): string {
      return this.payload?.getContent().toString("utf8") ?? "";
    },
    payloadAsURL(): URLPayload {
      return this.payload as URLPayload;
    },
    fileType(): string {
      const url = this.url;

      const split = url.split(".");

      // Couldn't find extension
      if (split.length === 1) return "";

      const extension = split.at(-1);
      if (!extension || !this.valid_types.includes(extension)) return "";
      return extension;
    },
  },
});
export default URL_NFT;
</script>
<style scoped lang="scss">
.url_nft {
  height: max-content;
  display: flex;
  justify-content: center;
  align-items: center;
}
img {
  width: 100%;
  /*height: 100%;*/
  object-fit: cover;
}

.unknown {
  padding: 15px 12px;
}

.img_mini {
  width: auto;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.type {
  display: block;
  margin: 0px auto !important;
  font-size: 12px;
  background-color: var(--primary-color-light);
  color: var(--bg) !important;
  width: max-content;
  padding: 0px 4px;
  border-radius: 6px;
  margin-top: 6px !important;
}

.pdf,
.unknown {
  padding: 10px;
  p {
    font-size: 0.8rem;
    color: #999;
    margin: 0;
  }

  a {
    word-break: break-word;
    display: block;
    width: max-content;
    padding: 3px 9px;
    border-radius: 4px;
    color: var(--primary-color-light);
    background-color: var(--bg-light);
    text-decoration: none;
    font-size: 0.9rem;
    margin: 0px auto;

    &:hover {
      color: var(--primary-color);
      background-color: var(--bg-light);
    }
    /*background-color: var(--primary-color);*/
  }
}
</style>
