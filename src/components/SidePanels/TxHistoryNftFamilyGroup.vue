<template>
  <div v-if="payload" class="family_group">
    <p v-if="quantity && quantity > 1" class="count">{{ quantity }}</p>
    <div class="nft_card">
      <NftPayloadView
        class="payload_view"
        :payload="payload"
        :small="true"
      ></NftPayloadView>
    </div>
  </div>
</template>
<script lang="ts">
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import type { UTXO } from "@/stores/vuex/modules/history/types";
import { Buffer } from "@metalblockchain/metaljs";

import { PayloadTypes } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent } from "vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";

const payloadtypes = PayloadTypes.getInstance();

export const TxHistoryNftFamilyGroup = defineComponent({
  components: { NftPayloadView },
  props: {
    utxos: {
      type: Array as PropType<UTXO[]>,
    },
    assetID: {
      type: String,
    },
  },
  computed: {
    nftFamsDict() {
      return this.$store.state.Assets.nftFamsDict;
    },
    quantity() {
      return this.utxos?.length;
    },
    payload(): PayloadBase | null {
      const payload = this.utxos?.at(0)?.payload;
      if (!payload) return null;

      try {
        const parsed = this.parsePayload(payload);
        return parsed;
      } catch {
        console.error("Unable to parse payload.");
      }
      return null;
    },
  },
  created() {
    if (this.assetID && !this.nftFamsDict[this.assetID]) {
      this.$store.dispatch("Assets/addUnknownNftFamily", this.assetID);
    }
  },
  methods: {
    parsePayload(rawPayload: string): PayloadBase {
      let payload = Buffer.from(rawPayload, "base64");
      payload = Buffer.concat([Buffer.alloc(4).fill(payload.length), payload]);

      // try {
      const typeId = payloadtypes.getTypeID(payload);
      const pl: Buffer = payloadtypes.getContent(payload);
      const payloadbase: PayloadBase = payloadtypes.select(typeId, pl);
      return payloadbase;
    },
  },
});
export default TxHistoryNftFamilyGroup;
</script>
<style scoped lang="scss">
@use "sass:math";

$countW: 18px;

.count {
  position: absolute;
  top: math.div(-$countW, 2.5);
  left: math.div(-$countW, 2.5);
  width: $countW;
  height: $countW;
  border-radius: $countW;
  line-height: $countW;
  font-size: 10px;
  text-align: center;
  background-color: var(--primary-color);
  border: 1px solid var(--bg-wallet);
  color: var(--bg);
  font-weight: bold;
  z-index: 2;
}
.family_group {
  position: relative;
}

.nft_card {
  height: 35px !important;
  width: 35px !important;
  background-color: var(--bg-light);
  position: relative;
  border-radius: 4px;
  overflow: hidden;
  pointer-events: none;
}

.payload_view {
}
</style>
