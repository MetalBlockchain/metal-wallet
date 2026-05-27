<template>
  <div>
    <button v-if="!disabled" class="removeBut" @click="remove">
      <fa icon="times"></fa>
    </button>
    <div class="amt_in hover_border">
      <input
        v-model="quantity"
        :disabled="disabled"
        inputmode="numeric"
        :max="allUtxos.length"
        min="1"
        type="number"
      />
    </div>
    <NftPayloadView :payload="payload" :small="true"></NftPayloadView>
  </div>
</template>
<script lang="ts">
import type {
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type { PropType } from "vue";
import type { IGroupQuantity } from "@/components/wallet/studio/mint/types";
import { defineComponent } from "vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import { getPayloadFromUTXO } from "@/helpers/helper";
import { bintools } from "@/misc/AVA";

export const NftListItem = defineComponent({
  components: {
    NftPayloadView,
  },
  props: {
    sample: {
      type: Object as PropType<UTXO>,
    },
    disabled: { default: false, type: Boolean },
  },
  emits: ["change", "remove"],
  data() {
    return {
      quantity: 1,
    };
  },
  computed: {
    assetId() {
      const famId = this.sample?.getAssetID();
      if (!famId) return "";
      return bintools.cb58Encode(famId);
    },
    selectedUtxos() {
      return this.allUtxos.slice(0, this.quantity);
    },
    payload() {
      if (!this.sample) return undefined;
      return getPayloadFromUTXO(this.sample);
    },
    groupId() {
      return (this.sample?.getOutput() as NFTTransferOutput).getGroupID();
    },
    allUtxos() {
      const famId = this.sample?.getAssetID();
      if (!famId) return [];
      // let utxos: UTXO[] = this.$store.getters.walletNftDict[bintools.cb58Encode(famId)]
      const utxos: UTXO[] =
        this.$store.getters["Assets/walletNftDict"][bintools.cb58Encode(famId)];

      const filtered = utxos.filter((utxo) => {
        const gId = (utxo.getOutput() as NFTTransferOutput).getGroupID();

        if (gId === this.groupId) {
          return true;
        }
        return false;
      });
      return filtered;
    },
  },
  watch: {
    quantity: [
      {
        handler: "onQuantitChange",
      },
      {
        handler: "onQuantityChange",
      },
    ],
  },
  mounted() {
    this.emit();
  },
  methods: {
    emit() {
      const msg: IGroupQuantity = {
        id: `${this.assetId}_${this.groupId}`,
        utxos: this.selectedUtxos,
      };
      this.$emit("change", msg);
    },
    remove() {
      this.$emit("remove", this.sample);
    },
    onQuantitChange(val: number) {
      if (val < 1) {
        this.quantity = 1;
        return;
      }
    },
    onQuantityChange(val: number) {
      const max = this.allUtxos.length;

      if (val > max) {
        this.quantity = max;
      }

      this.emit();
    },
  },
});
export default NftListItem;
</script>
<style scoped lang="scss">
@use "sass:math";

$remove_w: 24px;

.removeBut {
  position: absolute;
  z-index: 1;
  top: math.div(-$remove_w, 4);
  right: math.div(-$remove_w, 4);
  width: $remove_w;
  height: $remove_w;
  background-color: var(--bg-light);
  color: var(--primary-color-light);
  border: 3px solid var(--bg);
  font-size: 12px;
  border-radius: $remove_w;

  &:hover {
    color: var(--primary-color);
  }
}

.amt_in {
  position: absolute;
  bottom: -12px;
  width: 60%;
  padding: 2px 6px;
  //border: 1px solid var(--bg);
  border-radius: 4px;
  z-index: 2;
  align-items: center;
  //border-radius: 4px;
  font-size: 12px;
  background-color: var(--primary-color);
  color: var(--bg) !important;
  display: flex;

  label {
    font-size: 11px;
    display: block;
    font-weight: bold;
    text-align: right;
    display: none;
  }

  p {
    color: var(--bg) !important;
    font-size: 12px;
  }

  > input {
    border: none !important;
    width: 100%;
    color: var(--bg) !important;
    text-align: center;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
    }
  }
}
</style>
