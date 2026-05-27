<template>
  <div class="family_group">
    <NftCard
      :group-i-d="groupID"
      :payload="payload"
      :quantity="quantity"
      :utxo="utxosFirst"
    ></NftCard>
  </div>
</template>
<script lang="ts">
import type { Buffer } from "@metalblockchain/metaljs";
import type {
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { PayloadTypes } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent } from "vue";
import NftCard from "@/components/wallet/portfolio/NftCard.vue";

const payloadtypes = PayloadTypes.getInstance();
export const CollectibleFamilyGroup = defineComponent({
  components: { NftCard },
  props: {
    utxos: {
      type: Array as PropType<UTXO[]>,
    },
  },
  computed: {
    quantity() {
      return this.utxos?.length;
    },
    utxosFirst() {
      if (!this.utxos?.length) return undefined;
      return this.utxos[0];
    },
    groupID() {
      const val = this.utxosFirst;
      if (!val) return undefined;
      const output = val.getOutput() as NFTTransferOutput;
      return output.getGroupID();
    },
    payload(): PayloadBase | undefined {
      const val = this.utxosFirst;
      if (!val) return undefined;
      const out = val.getOutput() as NFTTransferOutput;
      const payload = out.getPayloadBuffer();

      const typeId = payloadtypes.getTypeID(payload);
      const pl: Buffer = payloadtypes.getContent(payload);
      const payloadbase: PayloadBase = payloadtypes.select(typeId, pl);

      return payloadbase;
    },
  },
});
export default CollectibleFamilyGroup;
</script>
<style scoped lang="scss">
.family_group {
  position: relative;
}

.back {
  backface-visibility: hidden;
  transform: rotateY(180deg);
  background-color: var(--bg-light);
}

.front {
  max-height: 100%;
  height: 100%;
  z-index: 1;
}

.front,
.back {
  backface-visibility: hidden;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  //border-radius: 14px;
  overflow: auto;
  //box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
}

.back {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}
</style>
