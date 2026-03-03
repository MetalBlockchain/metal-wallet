<template>
  <div class="swap_form">
    <div>
      <label>{{ $t("cross_chain.form.source") }}</label>
      <select
        v-model="sourceChain"
        class="hover_border"
        @input="onChangeSource"
      >
        <option
          v-for="option in sourceOptions"
          :key="option"
          :disabled="isConfirm"
          :value="option"
        >
          {{ chainNames[option] }}
        </option>
      </select>
    </div>
    <div>
      <label>{{ $t("cross_chain.form.destination") }}</label>
      <p v-if="!isEVMSupported" class="ledger_warn">
        C Chain is currently not supported on Ledger devices.
      </p>
      <select
        v-model="targetChain"
        class="hover_border"
        @input="onChangeDestination"
      >
        <option
          v-for="option in destinationOptions"
          :key="option"
          :disabled="isConfirm"
          :value="option"
        >
          {{ chainNames[option] }}
        </option>
      </select>
    </div>

    <div v-if="!isConfirm">
      <label>{{ $t("earn.transfer.amount") }}</label>

      <AvaxInput
        v-model="amt"
        :balance="balance"
        :max="maxAmt"
        @update:model-value="onAmtChange"
      ></AvaxInput>
    </div>
    <div v-else class="confirmation_val">
      <label>{{ $t("earn.transfer.amount") }}</label>
      <p>{{ formAmtText }} METAL</p>
    </div>
  </div>
</template>

<script lang="ts">
import type Big from "big.js";
import type { PropType } from "vue";
import type { ChainSwapFormData } from "@/components/wallet/earn/ChainTransfer/types";
import type { ChainIdType } from "@/constants";
import { BN } from "@metalblockchain/metaljs";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import AvaxInput from "@/components/misc/AvaxInput.vue";
import { bnToBig } from "@/helpers/helper";
import { useRootStore } from "@/stores/pinia/root";

const chainTypes: ChainIdType[] = ["X", "P", "C"];
const chainNames = {
  X: "X Chain",
  C: "C Chain",
  P: "P Chain",
};

export const Form = defineComponent({
  components: {
    AvaxInput,
  },
  props: {
    balance: {
      type: Object as PropType<Big>,
    },
    maxAmt: {
      type: Object as PropType<BN>,
    },
    isConfirm: {
      type: Boolean,
    },
  },
  emits: ["change"],
  data(): {
    amt: BN;
    targetChain: ChainIdType;
    sourceChain: ChainIdType;
  } {
    const amt: BN = new BN(0);
    const targetChain: ChainIdType = "P";
    const sourceChain: ChainIdType = "X";

    return {
      sourceChain,
      targetChain,
      amt,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      isEVMSupported: (store) => {
        if (store.activeWallet) {
          return !!store.activeWallet.ethAddress;
        }
        return false;
      },
    }),
    chainNames() {
      return chainNames;
    },
    formAmtText() {
      return bnToBig(this.amt, 9).toLocaleString();
    },
    sourceOptions(): ChainIdType[] {
      if (!this.isEVMSupported) {
        return ["X", "P"];
      }

      const all = [...chainTypes];
      return all;
    },
    destinationOptions(): ChainIdType[] {
      return {
        X: ["P", "C"],
        P: ["X", "C"],
        C: ["X", "P"],
      }[this.sourceChain] as ChainIdType[];
    },
  },
  watch: {
    destinationOptions: [
      {
        handler: "onDestinationsChange",
      },
    ],
  },
  mounted() {
    this.onChange();
  },
  methods: {
    clear() {
      this.amt = new BN(0);
      this.onChange();
    },
    onChangeSource(ev: any) {
      const val: ChainIdType = ev.target.value;
      this.sourceChain = val;
      this.onChange();
    },
    onChangeDestination(ev: any) {
      const val: ChainIdType = ev.target.value;
      this.targetChain = val;
      this.onChange();
    },
    onAmtChange() {
      this.onChange();
    },
    onChange() {
      const data: ChainSwapFormData = {
        sourceChain: this.sourceChain,
        destinationChain: this.targetChain,
        amount: this.amt,
      };
      this.$emit("change", data);
    },
    onDestinationsChange() {
      const val = this.destinationOptions[0];
      if (val) {
        this.targetChain = val;
        this.onChange();
      }
    },
  },
});
export default Form;
</script>
<style scoped lang="scss">
.swap_form {
  > div {
    flex-direction: column;
    display: flex;
    margin: 13px 0;
  }

  padding-bottom: 14px;
}
label {
  color: var(--tertiary-color);
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px !important;
}

select {
  width: 100%;
  color: var(--primary-color);
  background-color: var(--bg-light);
  border: 1px solid transparent;
  border-radius: 4px;
  padding: 16px 12px;
  font-size: 14px;
  outline: none;
  transition-duration: 0.1s;
  cursor: pointer;

  //&:hover {
  //    border-color: var(--primary-color-light);
  //}
  //
  //&:focus {
  //    border-color: var(--secondary-color);
  //}
}

.balance {
  font-size: 13px;
  color: var(--primary-color-light);
  span {
    float: right;
  }
  margin-top: 4px !important;
}

.confirmation_val {
  p {
    padding: 6px 12px;
    text-align: right;
    background-color: var(--bg-light);
  }
}

.ledger_warn {
  color: var(--info);
  font-size: 13px;
  margin-bottom: 4px !important;
}
</style>
