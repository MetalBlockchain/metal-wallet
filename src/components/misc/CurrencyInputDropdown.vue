<template>
  <div class="curr_in_drop">
    <div class="max_in_cont hover_border">
      <button class="max_but" :disabled="disabled" @click="maxOut">MAX</button>
      <div class="col_big_in">
        <BigNumInputShared
          ref="bigIn"
          class="bigIn"
          contenteditable="bigIn"
          :denomination="denomination"
          :disabled="disabled"
          :max="max_amount"
          :placeholder="placeholder"
          :step="stepSize"
          @update:model-value="amount_in"
        ></BigNumInputShared>
        <p :active="isAvax" class="usd_val">
          ${{ amountUSD.toLocaleString(2) }}
        </p>
      </div>
    </div>
    <BalanceDropdown
      v-if="asset_now"
      v-model="asset_now"
      :disabled="disabled"
      :disabled-assets="disabledAssets"
    ></BalanceDropdown>
    <div class="col_balance">
      <p>
        {{ $t("misc.balance") }}:
        {{ maxAmountBig.toLocaleString(denomination) }}
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import type AvaAsset from "@/js/AvaAsset";
import type { IWalletAssetsDict, priceDict } from "@/stores/types";

import { BN } from "@metalblockchain/metaljs";

import Big from "big.js";
import { defineComponent } from "vue";
import BalanceDropdown from "@/components/misc/BalancePopup/BalanceDropdown.vue";

import BigNumInputShared from "@/components/shared/BigNumInputShared.vue";
import { bnToBig } from "@/helpers/helper";
import { avm } from "@/misc/AVA";

export const CurrencyInputDropdown = defineComponent({
  components: {
    BigNumInputShared,
    BalanceDropdown,
  },
  props: {
    disabledAssets: {
      type: Array as PropType<AvaAsset[]>,
      default: () => [],
    },
    initial: {
      type: String,
      default: "",
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["change"],
  setup() {
    const amount = ref(new BN(0));
    const asset_now = ref<AvaAsset>();

    return {
      amount,
      asset_now,
    };
  },
  computed: {
    stepSize() {
      if (this.denomination > 3) {
        const stepNum = Math.pow(10, this.denomination - 2);
        return new BN(stepNum.toString());
      } else {
        const stepNum = Math.pow(10, this.denomination);
        return new BN(stepNum.toString());
      }
    },
    amountUSD(): Big {
      const usdPrice = this.priceDict.usd;
      const bigAmt = bnToBig(this.amount, this.denomination);
      const usdBig = bigAmt.times(usdPrice);
      return usdBig;
    },

    isEmpty(): boolean {
      return this.walletAssetsArray.length === 0 ? true : false;
    },

    isAvax(): boolean {
      if (this.asset_now && this.asset_now.id === this.avaxAsset?.id)
        return true;
      return false;
    },

    display(): string {
      return "";
    },

    placeholder(): string {
      if (this.isEmpty || !this.asset_now) return "0.00";
      const deno = this.asset_now.denomination;
      let res = "0";
      if (deno > 2) {
        res = "0.00";
      }
      return res;
    },

    denomination(): number {
      if (!this.asset_now) return 0;
      return this.asset_now.denomination;
    },

    walletAssetsArray(): AvaAsset[] {
      // return this.$store.getters.walletAssetsArray
      return this.$store.getters["Assets/walletAssetsArray"];
    },

    walletAssetsDict(): IWalletAssetsDict {
      // return this.$store.getters['walletAssetsDict']
      return this.$store.getters["Assets/walletAssetsDict"];
    },

    avaxAsset(): AvaAsset | null {
      return this.$store.getters["Assets/AssetAVA"];
    },

    max_amount(): null | BN {
      if (!this.asset_now) return null;
      if (!this.avaxAsset) return null;

      const assetId = this.asset_now.id;
      const balance = this.walletAssetsDict[assetId];
      if (!balance) {
        return null;
      }

      const avaxId = this.avaxAsset.id;

      // Max amount is BALANCE - FEE for AVAX
      if (assetId === avaxId) {
        const fee = avm.getTxFee();
        // console.log(fee);
        return fee.gte(balance.amount) ? new BN(0) : balance.amount.sub(fee);
      }

      if (balance.amount.isZero()) return null;
      return balance.amount;
    },

    maxAmountBig(): Big {
      if (!this.max_amount) return Big(0);
      return bnToBig(this.max_amount, this.denomination);
    },

    priceDict(): priceDict {
      return this.$store.state.prices;
    },
  },
  watch: {
    asset_now: [
      {
        handler: "drop_change",
      },
    ],
  },
  mounted() {
    if (this.isEmpty) return;
    if (this.initial) {
      const initialAsset = this.walletAssetsDict[this.initial];
      this.drop_change(initialAsset);
    } else {
      this.drop_change(this.walletAssetsArray[0]);
    }
  },
  methods: {
    maxOut() {
      (this.$refs.bigIn as typeof BigNumInputShared).maxout();
    },

    amount_in(val: BN) {
      this.amount = val;
      this.onchange();
    },

    onfocus() {
      console.log("focus");
    },
    onchange() {
      this.$emit("change", {
        asset: this.asset_now,
        amount: this.amount,
      });
    },
    drop_change(val?: AvaAsset) {
      this.asset_now = val;
      (this.$refs.bigIn as typeof BigNumInputShared).clear();
      // this.amount_in(new BN(0))
      this.onchange();
    },
  },
});
export default CurrencyInputDropdown;
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.bigIn {
  width: 100%;
  border: none !important;
  font-size: 15px;
  font-family: monospace;
}

.max_in_cont {
  position: relative;
  display: grid;
  grid-template-columns: max-content 1fr;
  padding: 8px 14px;
}

.curr_in_drop {
  display: grid;
  grid-template-columns: 1fr 90px;
  background-color: transparent;
  //font-size: 12px;
  width: 100%;
  outline: none;
  text-align: right;
  column-gap: 10px;

  > * {
    background-color: var(--bg-light);
    border-radius: 2px;
  }
}

input {
  flex-grow: 1;
  outline: none;
  text-align: right;
  flex-basis: 0px;
  width: 0px;
  color: var(--primary-color);
}

.max_but {
  opacity: 0.4;
  font-size: 13px;
  &:hover {
    opacity: 1;
  }
}

.dropdown {
  /*flex-basis: 140px;*/
  width: 100%;
  /*border-left: 1px solid #d2d2d2;*/
}

.balance {
  display: grid;
  column-gap: 10px;
  grid-template-columns: 1fr 140px;
  font-size: 14px;
  color: var(--primary-color-light);
  padding: 2px 0px;

  > div {
    display: flex;
    justify-content: space-between;
  }

  p {
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

.col_big_in {
  text-align: right;
  font-family: monospace;
  display: flex;
  flex-direction: column;
}

.col_balance {
  padding-right: 14px;
  padding-top: 2px !important;
  font-size: 15px;
  color: var(--primary-color-light);
  font-family: monospace;
  background-color: transparent;
}

.usd_val {
  color: var(--primary-color-light);
  font-size: 13px;
  max-height: 0px;
  overflow: hidden;
  transition-duration: 0.2s;

  &[active] {
    max-height: 20px;
  }
}

@include mixins.medium-device {
  .balance {
    grid-template-columns: 1fr;
  }
}

@include mixins.mobile-device {
  .balance,
  .curr_in_drop {
    grid-template-columns: 1fr 80px;
  }

  .balance {
    font-size: 12px;
  }
}
</style>
