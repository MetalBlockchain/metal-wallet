<template>
  <tr class="validator_row">
    <td class="id">
      <p v-if="validator?.name" style="font-weight: 600">
        {{ validator.name }}
      </p>
      <p>{{ validator?.nodeID }}</p>
    </td>
    <td class="amount">{{ amtText }}</td>
    <td class="amount">{{ remainingAmtText }}</td>
    <td style="text-align: center">{{ numDelegators }}</td>
    <td>{{ remainingTimeText }}</td>
    <td>{{ feeText }}%</td>
    <td>
      <button class="button_secondary" @click="select">Select</button>
    </td>
  </tr>
</template>
<script lang="ts">
import type { ValidatorListItem } from "@/stores/types/platform";
import type { PropType } from "vue";
import { BN } from "@metalblockchain/metaljs";
import moment from "moment";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";

export const ValidatorsList = defineComponent({
  props: {
    validator: {
      type: Object as PropType<ValidatorListItem>,
    },
  },
  emits: ["select"],
  computed: {
    remainingMs(): number {
      const end = this.validator?.endTime;
      if (!end) return 0;
      const remain = end.getTime() - Date.now();
      return remain;
    },
    remainingTimeText() {
      const ms = this.remainingMs;
      const duration = moment.duration(ms, "milliseconds");
      return duration.humanize(true);
    },
    stakeAmt(): BN {
      return this.validator?.validatorStake ?? new BN(0);
    },
    amtText() {
      const amt = this.stakeAmt;
      const big = bnToBig(amt, 9);
      return big.toLocaleString(0);
    },
    feeText() {
      return this.validator?.fee;
    },
    numDelegators() {
      return this.validator?.numDelegators;
    },
    totalDelegated(): BN {
      return this.validator?.delegatedStake ?? new BN(0);
    },
    remainingStake(): BN {
      return this.validator?.remainingStake ?? new BN(0);
    },
    remainingAmtText(): string {
      const big = bnToBig(this.remainingStake, 9);
      return big.toLocaleString(0);
    },
  },
  methods: {
    select() {
      this.$emit("select", this.validator);
    },
  },
});
export default ValidatorsList;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.amount {
  text-align: right;
}

button {
  padding: 3px 12px;
  font-size: 13px;
  border-radius: 3px;
}

.id {
  word-break: break-all;
}
td {
  padding: 4px 14px;
  background-color: var(--bg-light);
  border: 1px solid var(--bg);
  font-size: 13px;
}

@include mixins.medium-device {
  td {
    font-size: 10px !important;
  }
}
</style>
