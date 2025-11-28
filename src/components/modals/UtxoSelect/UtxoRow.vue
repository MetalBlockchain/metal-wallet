<template>
  <tr :locked="isLocked">
    <td style="text-align: left; padding-left: 8px">
      <input v-model="isSelect" type="checkbox" @change="onSelect" />
    </td>
    <td style="opacity: 0.4">
      <template v-if="isLocked"><fa icon="lock"></fa></template>
      <template v-else></template>
    </td>
    <td class="date_col">{{ lockDateText }}</td>
    <td class="amt_col">{{ amount.toLocaleString() }}</td>
  </tr>
</template>
<script lang="ts">
import type {
  AmountOutput,
  StakeableLockOut,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import type { PropType } from "vue";
import { BN } from "@metalblockchain/metaljs";
import { PlatformVMConstants } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
import Big from "big.js";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";

export default defineComponent({
  props: {
    utxo: {
      type: Object as PropType<UTXO>,
    },
  },
  emits: ["add", "remove"],
  data() {
    return {
      isSelect: false,
    };
  },
  computed: {
    out() {
      return this.utxo?.getOutput();
    },
    amount(): Big {
      const outId = this.out?.getOutputID();
      if (outId === PlatformVMConstants.SECPXFEROUTPUTID) {
        const out = this.out as AmountOutput;
        const amtBig = bnToBig(out.getAmount(), 9);
        return amtBig;
      } else if (outId === PlatformVMConstants.STAKEABLELOCKOUTID) {
        const out = this.out as StakeableLockOut;
        const amtBig = bnToBig(out.getAmount(), 9);
        return amtBig;
      }

      return Big(0);
    },
    lockTime(): BN {
      const outId = this.out?.getOutputID();

      if (outId === PlatformVMConstants.SECPXFEROUTPUTID) {
        const out = this.out as AmountOutput;
        return out.getLocktime();
      } else if (outId === PlatformVMConstants.STAKEABLELOCKOUTID) {
        const out = this.out as StakeableLockOut;
        return out.getStakeableLocktime();
      }

      return new BN(0);
    },
    lockDateText(): string {
      if (this.lockTime.eq(new BN(0))) {
        return "-";
      }
      const date = new Date(this.lockTime.toNumber() * 1000);

      return date.toLocaleString();
    },
    isLocked(): boolean {
      const now = UnixNow();

      if (now.lt(this.lockTime)) {
        return true;
      }

      return false;
    },
  },
  methods: {
    onSelect() {
      if (this.isSelect) {
        this.$emit("add");
      } else {
        this.$emit("remove");
      }
    },
  },
});
</script>
<style scoped lang="scss">
tr {
  border-bottom: 1px solid var(--bg);
}
td {
  font-size: 14px;
  padding: 2px 0;
}
.date_col {
  color: var(--primary-color-light);
}

.amt_col {
  text-align: right;
  padding-right: 18px;
}

tr[locked] {
  .date_col {
    color: var(--primary-color);
  }
}

.amt_col,
.date_col {
  //font-family: monospace;
}
</style>
