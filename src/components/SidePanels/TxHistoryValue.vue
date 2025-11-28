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
import type { PropType } from "vue";
import type AvaAsset from "@/js/AvaAsset";
import type { TransactionType } from "@/stores/vuex/modules/history/types";
import Big from "big.js";
import { defineComponent } from "vue";

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
    asset() {
      if (!this.assetId) return null;
      return (
        this.$store.state.Assets.assetsDict[this.assetId] ||
        this.$store.state.Assets.nftFamsDict[this.assetId]
      );
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
        const val = Big(this.amount).div(Math.pow(10, asset.denomination));
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
    ava_asset(): AvaAsset | null {
      const ava = this.$store.getters["Assets/AssetAVA"];
      return ava;
    },
  },
  created() {
    if (this.type === "base" && !this.asset) {
      this.$store.dispatch("Assets/addUnknownAsset", this.assetId);
    }
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
