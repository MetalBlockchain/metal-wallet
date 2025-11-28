<template>
  <input
    v-model="val"
    inputmode="decimal"
    :max="maxNumString"
    :min="min"
    :placeholder="placeholder"
    :step="stepNum"
    type="number"
    @change="onChange"
  />
</template>
<script lang="ts">
import {
  bigToBN,
  bnToBig,
  stringToBN,
} from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";
import Big from "big.js";

export const BigNumInputShared = defineComponent({
  props: {
    denomination: {
      type: Number,
      default: 0,
    },
    max: {
      default: null,
      type: Object as PropType<BN | null>,
    },
    min: {
      type: Number,
      default: 0,
    },
    step: {
      type: Object as PropType<BN | null>,
      default: null,
    },
    placeholder: String,
    modelValue: {
      type: Object as PropType<BN>,
    },
  },
  emits: ["update:modelValue"],
  data(): {
    val: string | null;
  } {
    return {
      val: null,
    };
  },
  computed: {
    maxNumString() {
      return this.maxNumBN ? this.bnToString(this.maxNumBN) : "";
    },
    maxNumBN() {
      return this.max;
    },
    stepNum() {
      if (!this.step) {
        return this.denomination >= 2 ? 0.01 : Math.pow(10, -this.denomination);
      }
      try {
        return this.bnToString(this.step);
      } catch (error) {
        console.error(error);
        return "0.01";
      }
    },
  },
  watch: {
    val(val) {
      if (!val) {
        this.$emit("update:modelValue", new BN(0));
        return;
      }

      try {
        const splitVal = val.toString().split(".");
        const wholeVal = splitVal[0];
        const denomVal = splitVal[1];
        if (denomVal && denomVal.length > this.denomination) {
          const newDenom = denomVal.slice(0, Math.max(0, this.denomination));
          this.val = `${wholeVal}.${newDenom}`;
          return;
        }
      } catch (error) {
        console.log(error);
      }

      if (Number.parseFloat(val) < this.min) {
        this.val = this.min.toString();
        return;
      }

      const valBn = this.stringToBN(val);
      this.$emit("update:modelValue", valBn);
    },
    value(valBn) {
      this.val = this.bnToString(valBn);
    },
  },
  methods: {
    bnToString(val: BN) {
      return bnToBig(val, this.denomination).toString();
    },
    stringToBN(strVal: string) {
      return stringToBN(strVal, this.denomination);
    },
    maxout() {
      if (this.maxNumBN != null) {
        this.val = this.bnToString(this.maxNumBN);
      }
    },
    clear() {
      this.val = null;
    },
    onChange() {
      // If number is above max amount, correct it
      const valBig = Big(this.val || "0");
      const valBN = bigToBN(valBig, this.denomination);
      if (this.maxNumBN != null && valBN.gt(this.maxNumBN)) {
        this.val = this.bnToString(this.maxNumBN);
      }
    },
  },
});
export default BigNumInputShared;
</script>
<style scoped>
input {
  text-align: right;
  outline: none;
}
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
