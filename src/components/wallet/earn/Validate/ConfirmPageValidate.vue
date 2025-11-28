<template>
  <div class="confirmation">
    <div>
      <label>{{ $t("earn.validate.confirmation.id") }}</label>
      <p style="word-break: break-all">{{ nodeID }}</p>
    </div>
    <div>
      <label>{{ $t("earn.validate.confirmation.amount") }}</label>
      <p>{{ amtText }} METAL</p>
    </div>
    <div>
      <label>{{ $t("earn.validate.confirmation.start") }}</label>
      <p>{{ $t("earn.validate.confirmation.start_desc") }}</p>
    </div>
    <div>
      <label>{{ $t("earn.validate.confirmation.end") }}</label>
      <p>{{ end?.toLocaleString() }}</p>
    </div>
    <div>
      <label>{{ $t("earn.validate.confirmation.fee") }}</label>
      <p>{{ delegationFee }} %</p>
    </div>
    <div>
      <label
        >{{ $t("earn.validate.confirmation.reward") }} ({{ walletType }})</label
      >
      <p style="word-break: break-all">{{ rewardAddress }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { BN } from "@metalblockchain/metaljs";
import type { PropType } from "vue";
import Big from "big.js";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    nodeID: {
      type: String,
    },
    end: {
      type: Object as PropType<Date>,
    },
    delegationFee: {
      type: Number,
    },
    amount: {
      type: Object as PropType<BN>,
    },
    rewardAddress: {
      type: String,
    },
    rewardDestination: {
      type: String,
    },
  },
  computed: {
    amtBig(): Big {
      if (!this.amount) return new Big(0);
      const stakeAmt = Big(this.amount.toString()).div(Math.pow(10, 9));
      return stakeAmt;
    },
    walletType() {
      if (this.rewardDestination === "local") {
        return this.$t("earn.validate.confirmation.type_local");
      }
      return this.$t("earn.validate.confirmation.type_custom");
    },
    amtText(): string {
      const amt = this.amtBig;
      return amt.toLocaleString(9);
    },
  },
});
</script>
<style scoped lang="scss">
.confirmation {
  > div {
    background-color: var(--bg-light);
    margin: 14px 0;
    padding: 6px 14px;

    label {
      font-size: 14px;
      color: var(--primary-color-light);
    }
    p {
      font-size: 18px;
    }
  }

  .err {
    font-size: 14px;
  }
}
</style>
