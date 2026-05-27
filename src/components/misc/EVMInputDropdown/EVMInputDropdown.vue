<template>
  <div class="evm_input_dropdown">
    <div class="col_in hover_border" :disabled="disabled">
      <template v-if="!isCollectible">
        <button class="max_but" :disabled="disabled" @click="maxOut">
          MAX
        </button>
        <div class="col_big_in">
          <BigNumInputShared
            ref="bigIn"
            class="bigIn"
            :denomination="denomination"
            :disabled="disabled"
            :max="max_amount"
            :placeholder="placeholder"
            :step="stepSize"
            @update:model-value="amount_in"
          ></BigNumInputShared>
          <p :active="token === 'native'" class="usd_val">
            ${{ usd_val.toLocaleString(2) }}
          </p>
        </div>
      </template>
      <template v-else-if="collectible">
        <ERC721View
          class="collectible_item"
          :index="collectible.id"
          :token="collectible.token"
        ></ERC721View>
        <p style="align-self: center; padding-left: 12px">
          TOKEN ID: {{ collectible.id }}
        </p>
      </template>
    </div>
    <EVMAssetDropdown
      ref="dropdown"
      :disabled="disabled"
      @change="onAssetChange"
      @change-collectible="onCollectibleChange"
    ></EVMAssetDropdown>
    <div v-if="!isCollectible" class="bal_col">
      <p class="bal">Balance: {{ balance.toLocaleString() }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import type { iErc721SelectInput } from "@/components/misc/EVMInputDropdown/types";
import type Erc20Token from "@/js/Erc20Token";
import type ERC721Token from "@/js/ERC721Token";
import type { PropType } from "vue";
import { BN } from "@metalblockchain/metaljs";
import Big from "big.js";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import ERC721View from "@/components/misc/ERC721View.vue";
import EVMAssetDropdown from "@/components/misc/EVMInputDropdown/EVMAssetDropdown.vue";
import BigNumInputShared from "@/components/shared/BigNumInputShared.vue";
import { bnToBig } from "@/helpers/helper";
import { useRootStore } from "@/stores/pinia/root";

export const EVMInputDropdown = defineComponent({
  components: {
    ERC721View,
    EVMAssetDropdown,
    BigNumInputShared,
  },
  props: {
    disabled: { default: false, type: Boolean },
    gasPrice: {
      type: Object as PropType<BN>,
    },
    gasLimit: { default: 21_000, type: Number },
  },
  emits: ["amount-change", "token-change", "collectible-change"],
  data(): {
    token: Erc20Token | "native";
    isCollectible: boolean;
    collectible: iErc721SelectInput | null;
    amt: BN;
  } {
    // const $refs: {
    //   bigIn: typeof BigNumInput;
    //   dropdown: EVMAssetDropdown;
    // } = undefined;
    const collectible: iErc721SelectInput | null = null;
    const token: Erc20Token | "native" = "native";

    return {
      token,
      isCollectible: false,
      collectible,
      amt: new BN(0),
    };
  },
  computed: {
    ...mapState(useRootStore, ["prices", "activeWallet"]),
    usd_val(): Big {
      if (this.token != "native") return Big(0);

      const price = this.prices.usd;
      const big = bnToBig(this.amt, 18);
      return big.mul(Big(price));
    },
    max_amount(): BN {
      // Subtract gas
      if (this.isNative) {
        const limit = new BN(this.gasLimit);
        const fee = limit.mul(this.gasPrice ?? new BN(0));
        return this.balanceBN.sub(fee);
      } else {
        return this.balanceBN;
      }
    },
    isNative() {
      return this.token === "native";
    },
    denomination(): number {
      return this.isNative
        ? 18
        : Number.parseInt((this.token as Erc20Token).data.decimals as string);
    },
    stepSize(): BN {
      if (this.denomination > 3) {
        const powBN = new BN(10).pow(new BN(this.denomination - 2));
        // let stepNum = Math.pow(10, this.denomination - 2)
        return powBN;
      } else {
        const powBN = new BN(10).pow(new BN(this.denomination));
        // let stepNum = Math.pow(10, this.denomination)
        return powBN;
      }
    },
    asset_now() {
      return {
        denomination: 2,
      };
    },
    placeholder(): string {
      const deno = this.denomination;
      let res = "0";
      if (deno > 2) {
        res = "0.00";
      }
      return res;
    },
    avaxBalanceBN(): BN {
      const w = this.activeWallet;
      if (!w) return new BN(0);
      return w.ethBalance;
    },
    avaxBalance(): Big {
      return bnToBig(this.avaxBalanceBN, 18);
    },
    balance(): Big {
      if (this.token === "native") {
        return this.avaxBalance;
      }
      return this.token.balanceBig;
    },
    balanceBN(): BN {
      if (this.token === "native") {
        return this.avaxBalanceBN;
      }
      return this.token.balanceBN;
    },
  },
  methods: {
    clear() {
      (this.$refs.dropdown as typeof EVMAssetDropdown).clear();
    },
    maxOut() {
      // @ts-ignore
      this.$refs.bigIn.maxout();
    },
    setToken(token: "native" | Erc20Token) {
      (this.$refs.dropdown as typeof EVMAssetDropdown).select(token);
    },
    setErc721Token(token: ERC721Token, tokenId: string) {
      (this.$refs.dropdown as typeof EVMAssetDropdown).selectERC721({
        token: token,
        id: tokenId,
      });
    },
    onAssetChange(token: Erc20Token | "native") {
      this.isCollectible = false;
      this.token = token;
      this.$nextTick(() => {
        (this.$refs.bigIn as any).clear();
      });
      this.$emit("token-change", token);
    },
    onCollectibleChange(val: iErc721SelectInput) {
      this.isCollectible = true;
      this.collectible = val;
      this.$emit("collectible-change", val);
    },
    amount_in(amt: BN) {
      this.amt = amt;
      this.$emit("amount-change", amt);
    },
  },
});
export default EVMInputDropdown;
</script>
<style scoped lang="scss">
.evm_input_dropdown {
  display: grid;
  grid-template-columns: 1fr 90px;
  column-gap: 10px;
  font-size: 15px;

  > div {
    border-radius: 3px;
    background-color: var(--bg-light);
    padding: 8px 14px;
  }
}

.col_in {
  position: relative;
  display: grid;
  grid-template-columns: max-content 1fr;
}

.col_big_in {
  text-align: right;
  font-family: monospace;
  display: flex;
  flex-direction: column;
}

.bigIn {
  border: none !important;
  color: var(--primary-color);
}

.bal_col {
  background-color: transparent !important;
  padding-top: 2px !important;
}

.bal {
  text-align: right;
  font-family: monospace;
  color: var(--primary-color-light);
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
.max_but {
  opacity: 0.4;
  font-size: 13px;
  &:hover {
    opacity: 1;
  }
}

.collectible_item {
  height: 40px;
  width: 40px;
}
</style>
