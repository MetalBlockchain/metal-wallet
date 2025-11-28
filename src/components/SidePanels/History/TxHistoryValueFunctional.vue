<template>
  <div class="utxo" :income="!!amount">
    <p class="action">
      {{ $options.getActionText(type, amount, operationDirection) }}
    </p>
    <p
      class="amount"
      :style="{
        color: $options.getColor(type, amount),
      }"
    >
      {{ amount }}
      <!--            {{ amountText }} {{ symbolText }}-->
    </p>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export const TxHistoryValueFunctional = defineComponent({
  props: {
    amount: { type: Number },
    assetId: { type: String },
    type: { type: String },
    operationDirection: { type: String },
  },
  methods: {
    getColor(type: string, amount: number) {
      // if (this.type === 'operation') return this.operationColor
      if (type === "add_validator") return "#112EBD";
      if (type === "add_delegator") return "#112EBD";

      if (amount > 0) {
        return "#6bc688";
      } else if (amount === 0) {
        return "#999";
      } else {
        return "#992005";
      }
    },

    getActionText(type: string, amount: number, operationDirection: string) {
      const isIncome = amount > 0;

      switch (type) {
        case "base": {
          if (isIncome) {
            return "Received";
          }
          return "Sent";
        }
        case "operation": {
          return operationDirection;
        }
        default: {
          // Capitalize first letter
          return type
            .split("_")
            .map((value) => value[0]?.toUpperCase() + value.slice(1))
            .join(" ");
        }
      }
    },
  },
});
export default TxHistoryValueFunctional;
</script>
<style scoped lang="scss">
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
  color: main.$primary-color-light;
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
