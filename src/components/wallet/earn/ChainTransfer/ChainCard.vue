<template>
  <div class="chain_card">
    <div class="input_group">
      <h4 v-if="isSource">{{ $t("cross_chain.card.source") }}</h4>
      <h4 v-else>{{ $t("cross_chain.card.destination") }}</h4>
      <p class="chain_alias" style="font-size: 3em">{{ chain }}</p>
    </div>
    <div>
      <div class="input_group">
        <label>{{ $t("cross_chain.card.name") }}</label>
        <p>{{ chain ? chainNames[chain] : "" }}</p>
      </div>
      <div class="input_group">
        <label>{{ $t("cross_chain.card.balance") }}</label>
        <p class="balance">{{ balanceText }}</p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type { ChainIdType } from "@/constants";
import type AvaAsset from "@/js/AvaAsset";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { WalletType } from "@/js/wallets/types";

import { BN } from "@metalblockchain/metaljs";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";

const chainNames = {
  X: "Exchange Chain",
  C: "Contract Chain",
  P: "Platform Chain",
};

export const ChainCard = defineComponent({
  props: {
    chain: {
      type: String as PropType<ChainIdType>,
    },
    isSource: { default: true, type: Boolean },
  },
  emits: ["change"],
  computed: {
    chainNames() {
      return chainNames;
    },
    ava_asset(): AvaAsset | null {
      const ava = this.$store.getters["Assets/AssetAVA"];
      return ava;
    },
    wallet(): WalletType {
      const wallet: MnemonicWallet = this.$store.state.activeWallet;
      return wallet;
    },
    platformUnlocked(): BN {
      return this.$store.getters["Assets/walletPlatformBalance"].available;
    },
    avmUnlocked(): BN {
      if (!this.ava_asset) return new BN(0);
      return this.ava_asset.amount;
    },
    evmUnlocked(): BN {
      const balRaw = this.wallet.ethBalance;
      return balRaw.div(new BN(Math.pow(10, 9)));
    },
    balance() {
      if (this.chain === "X") {
        return this.avmUnlocked;
      } else if (this.chain === "P") {
        return this.platformUnlocked;
      } else {
        return this.evmUnlocked;
      }
    },
    balanceBig() {
      return bnToBig(this.balance, 9);
    },
    balanceText() {
      return this.balanceBig.toLocaleString();
    },
  },
  methods: {
    onChange(ev: any) {
      const val: ChainIdType = ev.target.value;
      this.$emit("change", val);
    },
  },
});
export default ChainCard;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

label {
  text-align: left;
  color: var(--primary-color-light);
  font-size: 13px;
}

.chain_card {
  //height: max-content;
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 14px;
}

.input_group {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
}

p {
  font-size: 14px;
  word-break: break-all;
}

@include mixins.mobile-device {
  .chain_card {
    display: block;
  }
  h4,
  .chain_alias {
    text-align: center;
  }
}
</style>
