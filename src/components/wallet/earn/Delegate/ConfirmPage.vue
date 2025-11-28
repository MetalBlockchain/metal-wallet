<template>
  <div class="confirmation">
    <!--        <div>-->
    <!--            <label>{{ $t('earn.delegate.confirmation.node') }}</label>-->
    <!--            <p style="word-break: break-all">{{ nodeID }}</p>-->
    <!--        </div>-->
    <div>
      <label>{{ $t("earn.delegate.confirmation.amount") }}</label>
      <p>{{ amtText }} METAL</p>
    </div>
    <div>
      <label>{{ $t("earn.delegate.confirmation.start") }}</label>
      <p>{{ $t("earn.delegate.confirmation.start_desc") }}</p>
    </div>
    <div>
      <label>{{ $t("earn.delegate.confirmation.end") }}</label>
      <p>{{ end?.toLocaleString() }}</p>
    </div>
    <div>
      <label
        >{{ $t("earn.delegate.confirmation.reward") }} ({{ walletType }})</label
      >
      <p style="word-break: break-all">{{ rewardAddress }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { BN } from "@metalblockchain/metaljs/dist";
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
      const stakeAmt = Big(this.amount?.toString() ?? "0").div(Math.pow(10, 9));
      return stakeAmt;
    },
    walletType() {
      if (this.rewardDestination === "local") {
        return "This wallet";
      }
      return "Custom";
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
