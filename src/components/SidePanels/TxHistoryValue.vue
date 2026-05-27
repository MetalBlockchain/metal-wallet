<template>
  <div class="utxo" :income="isIncome">
    <p class="action">{{ actionText }}</p>
    <p
      class="amount"
      :style="{
        color: color,
      }"
    >
      {{ amountText }} {{ symbolText }}
    </p>
  </div>
</template>
<script lang="ts">
import type AvaAsset from "@/js/AvaAsset";
import type { AvaNftFamily } from "@/js/AvaNftFamily";
import type { TransactionType } from "@/stores/types/history";
import type { PropType } from "vue";
import Big from "big.js";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { useAssetsStore } from "@/stores/pinia/assets";

export const TxHistoryValue = defineComponent({
  props: {
    amount: {
      type: Number,
    },
    assetId: {
      type: String,
    },
    type: {
      type: Object as PropType<TransactionType>,
    },
    operationDirection: {
      type: Object as PropType<"Sent" | "Received">,
    },
  },
  computed: {
    ...mapState(useAssetsStore, {
      ava_asset: "AssetAVA",
      assetsDict: "assetsDict",
      nftFamsDict: "nftFamsDict",
    }),
    asset(): AvaAsset | AvaNftFamily | undefined {
      if (!this.assetId) return undefined;

      return this.assetsDict[this.assetId] || this.nftFamsDict[this.assetId];
    },
    color(): string {
      // if (this.type === 'operation') return this.operationColor
      if (this.type === "add_validator") return "#008dc5";
      if (this.type === "add_delegator") return "#008dc5";

      if (this.amount && this.amount > 0) {
        return "#6BC688";
      } else if (this.amount === 0) {
        return "#999";
      } else {
        return "#d04c4c";
      }
    },
    isIncome(): boolean {
      if (this.amount && this.amount > 0) {
        return true;
      }
      return false;
    },
    actionText(): string {
      switch (this.type) {
        case "pvm_import": {
          return "Import (P)";
        }
        case "import": {
          return "Import (X)";
        }
        case "pvm_export": {
          return "Export (P)";
        }
        case "export": {
          return "Export (X)";
        }
        case "base": {
          if (this.isIncome) {
            return "Received";
          }
          return "Sent";
        }
        case "operation": {
          return this.operationDirection ?? "";
        }
        default: {
          // Capitalize first letter
          return this.type
            ? this.type
                .split("_")
                .map((value) => value?.at(0)?.toUpperCase() + value.slice(1))
                .join(" ")
            : "";
        }
      }
    },
    amountText(): string {
      const asset = this.asset;
      if (!this.amount) return "";

      if (!asset) return this.amount.toString();

      try {
        let denomination = 0;
        if (
          this.asset &&
          Object.prototype.hasOwnProperty.call(this.asset, denomination)
        ) {
          denomination = (this.asset as AvaAsset).denomination;
        }
        const val = Big(this.amount).div(Math.pow(10, denomination));
        return val.toLocaleString();
      } catch {
        return "";
      }
    },
    symbolText(): string {
      const asset = this.asset;
      if (!this.assetId) return "";

      if (!asset) return this.assetId.slice(0, 4);

      return asset.symbol;
    },
  },
  created() {
    if (this.type === "base" && !this.asset && this.assetId) {
      this.addUnknownAsset(this.assetId);
    }
  },
  methods: {
    ...mapActions(useAssetsStore, ["addUnknownAsset"]),
  },
});
export default TxHistoryValue;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.utxo {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 10px;

  > * {
    align-self: center;
  }

  &:not(:first-child) {
    .action {
      visibility: hidden;
    }
  }
}

.action {
  font-size: 12px;
  color: vars.$primary-color-light;
}
.amount {
  text-align: right;
  white-space: nowrap;
  font-size: 15px;
}

@include mixins.medium-device {
  .amount {
    font-size: 14px;
  }
}
</style>
