<template>
  <div class="avax_input">
    <div class="col1 hover_border">
      <button v-if="max" class="max_but" @click="maxOut">MAX</button>
      <BigNumInputShared
        ref="amt_in"
        class="amt_in"
        contenteditable="amt_in"
        :denomination="9"
        :max="max"
        placeholder="0.00"
        @update:model-value="amount_in"
      ></BigNumInputShared>
    </div>
    <p class="ticker">METAL</p>
    <div v-if="balance" class="balance">
      <div>
        <p>
          <b>{{ $t("misc.balance") }}:</b>
          {{ balance.toLocaleString() }}
        </p>
        <p>
          <b>$</b>
          {{ amountUSD.toLocaleString(2) }}
        </p>
      </div>
      <div></div>
    </div>
  </div>
</template>
<script lang="ts">
import type { Big } from "@metalblockchain/metal-wallet-sdk";
import type { BN } from "@metalblockchain/metaljs";
import type { priceDict } from "@/stores/vuex/types";
import { bnToBig } from "@metalblockchain/metal-wallet-sdk";
import BigNumInputShared from "@/components/shared/BigNumInputShared.vue";

export const AvaxInput = defineComponent({
  components: {
    BigNumInputShared,
  },
  props: {
    balance: {
      type: Object as PropType<Big | null>,
      default: null,
    },
    max: {
      type: Object as PropType<BN | null>,
      default: null,
    },
    modelValue: {
      type: Object as PropType<BN>,
      required: true,
    },
  },
  emits: ["change", "update:modelValue"],
  computed: {
    amountUSD(): Big {
      const usdPrice = this.priceDict.usd;
      const amount = bnToBig(this.modelValue, 9);
      const usdBig = amount.times(usdPrice);
      return usdBig;
    },

    priceDict(): priceDict {
      return this.$store.state.prices;
    },
  },
  methods: {
    maxOut(ev: MouseEvent) {
      ev.preventDefault();
      ev.stopPropagation();
      //@ts-ignore
      this.$refs.amt_in.maxout();
    },

    amount_in(val: BN) {
      this.$emit("update:modelValue", val);
      this.$emit("change", val);
    },
  },
});
export default AvaxInput;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.avax_input {
  display: grid;
  grid-template-columns: 1fr max-content;
  grid-gap: 0px 10px;
  color: var(--primary-color);
  width: 100%;
  height: 40px;

  .amt_in {
    color: var(--primary-color);
    font-size: 15px;
    font-family: monospace;
    flex-grow: 1;
    flex-shrink: 1;
    display: block;
    box-sizing: content-box;
    outline: none !important;
    border: none !important;
    //padding: 0 12px !important;
  }

  .ticker,
  .amt_in,
  .max_but {
    background-color: var(--bg-light);
    //border-radius: 3px;
  }
}

.balance {
  display: grid;
  column-gap: 10px;
  font-size: 14px;
  color: var(--primary-color-light);
  padding: 2px 0px;

  > div {
    display: flex;
    justify-content: space-between;
  }

  p {
    text-align: left;
    padding: 2px 0px;
  }

  p:last-child {
    text-align: right;
  }

  span {
    font-family: monospace;
    padding-left: 14px;
  }
}

.col1 {
  border-radius: 3px;
  background-color: var(--bg-light);
  border: 1px solid transparent;
  //display: flex;
  display: grid;
  grid-template-columns: max-content 1fr;
  width: 100%;
  box-sizing: border-box;
  //overflow: auto;
  padding: 8px 14px;
  position: relative;

  //&:hover {
  //    border-color: var(--primary-color-light);
  //}
  //&:focus-within {
  //    border-color: var(--secondary-color);
  //}
}

.ticker {
  border-radius: 3px;
  padding: 8px 14px;
}

p {
  text-align: center;
}
.max_but {
  font-size: 13px;
  opacity: 0.4;
  &:hover {
    opacity: 1;
  }
}

@include mixins.mobile-device {
  .balance {
    font-size: 12px;
  }
}
</style>
