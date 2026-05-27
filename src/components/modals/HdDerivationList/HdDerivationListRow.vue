<template>
  <div class="list_row">
    <p class="col_index" style="text-align: center">{{ index }}</p>
    <p class="col_addr">
      <span>{{ address }}</span>
      &nbsp;
      <!-- TODO Why ledger type doesn't have any action -->
      <span v-if="walletType === 'ledger'" class="verify" @click="() => {}">
        {{ $t("create.verify") }}
      </span>
    </p>
    <div class="col_bal">
      <p v-if="noBalance">-</p>
      <template v-else>
        <p v-for="(bal, assetId) in cleanBalance" :key="assetId">
          {{ bal.toLocaleString(assetsDict[assetId].denomination) }}
          <span>{{ assetsDict[assetId].symbol }}</span>
        </p>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from "vue";
import type { DerivationListBalanceDict } from "@/components/modals/HdDerivationList/types";
import type { WalletType } from "@/js/wallets/types";
import Big from "big.js";
import { defineComponent } from "vue";

export const HdDerivationListRow = defineComponent({
  props: {
    index: {
      type: Number,
    },
    path: {
      type: Number,
    },
    address: {
      type: String,
    },
    balance: {
      type: Object as PropType<DerivationListBalanceDict>,
    },
  },
  computed: {
    cleanBalance(): DerivationListBalanceDict {
      const res: DerivationListBalanceDict = {};
      for (const bal in this.balance) {
        const balance = this.balance[bal];
        if (balance?.gt(Big(0))) {
          res[bal] = balance;
        }
      }
      return res;
    },
    noBalance(): boolean {
      return Object.keys(this.cleanBalance).length === 0;
    },
    assetsDict() {
      return this.$store.state.Assets.assetsDict;
    },
    wallet() {
      return this.$store.state.activeWallet as WalletType;
    },
    walletType() {
      return this.wallet.type;
    },
  },
});
export default HdDerivationListRow;
</script>
<style scoped lang="scss">
.col_index {
  color: var(--primary-color-light);
}

.col_addr {
  /*white-space: nowrap;*/
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  font-family: monospace;
  color: var(--primary-color-light);

  .verify {
    opacity: 0;
    cursor: pointer;
    color: var(--primary-color);
    transition: opacity 0.1s;
    font-size: 11px;
    padding: 2px 4px;
    background: var(--bg-light);
  }

  &:hover {
    .verify {
      opacity: 1;
      transition: opacity 0.2s;
    }
  }
}

.col_bal {
  text-align: right;
  padding-right: 15px;
  padding-left: 15px;
  font-family: monospace;
  word-break: keep-all;
  white-space: nowrap;
}

span {
  /*background-color: #ddd;*/
  /*padding: 2px 6px;*/
  border-radius: 2px;
  font-weight: bold;
}
</style>
