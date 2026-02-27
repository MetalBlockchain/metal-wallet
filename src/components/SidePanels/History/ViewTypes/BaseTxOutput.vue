<template>
  <div class="tx_out">
    <div class="addresses">
      <p v-for="addr in summary?.addresses" :key="addr">
        {{ direction }} {{ "X-" + addr }}
      </p>
    </div>
    <p class="amount" :profit="isProfit">
      {{ amtText }}
      <template v-if="assetDetail">
        {{ assetDetail.symbol }}
      </template>
    </p>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type { BaseTxAssetSummary } from "@/helpers/history_helper";
import type AvaAsset from "@/js/AvaAsset";
import type { AvaNftFamily } from "@/js/AvaNftFamily";
import { BN } from "@metalblockchain/metaljs";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";
import { useAssetsStore } from "@/stores/pinia/assets";

export const BaseTxOutput = defineComponent({
  props: {
    assetID: {
      type: String,
    },
    summary: {
      type: Object as PropType<BaseTxAssetSummary>,
    },
  },
  computed: {
    ...mapState(useAssetsStore, ["assetsDict", "nftFamsDict"]),
    assetDetail(): AvaAsset | AvaNftFamily | undefined {
      if (!this.assetID) return undefined;

      return this.assetsDict[this.assetID] || this.nftFamsDict[this.assetID];
    },
    payload() {
      return this.summary?.payload;
    },
    isProfit() {
      return this.summary?.amount.gte(new BN(0));
    },
    actionText() {
      return this.isProfit ? "Received" : "Sent";
    },
    direction() {
      return this.isProfit ? "from" : "to";
    },
    amtText() {
      let denomination = 0;
      if (
        this.assetDetail &&
        Object.prototype.hasOwnProperty.call(this.assetDetail, denomination)
      ) {
        denomination = (this.assetDetail as AvaAsset).denomination;
      }

      const big = bnToBig(this.summary?.amount ?? new BN(0));
      return big.toLocaleString();
    },
  },
});
export default BaseTxOutput;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.tx_out {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 12px;
}
.amount {
  text-align: right;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
  color: #992005;

  &[profit] {
    color: #20bf55;
  }
}

.addresses {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-self: center;
  p {
    overflow: hidden;
    color: var(--primary-color-light);
    white-space: nowrap;
    font-size: 12px;
    line-height: 12px;
    text-overflow: ellipsis;
  }

  label {
    line-height: 12px;
  }
}
label {
  font-size: 12px;
  color: var(--primary-color-light);
}

@include mixins.medium-device {
  .amount {
    font-size: 13px;
  }
}
</style>
