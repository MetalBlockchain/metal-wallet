<template>
  <div class="balance_card">
    <UtxosBreakdownModal ref="utxos_modal"></UtxosBreakdownModal>
    <div class="fungible_card">
      <div class="header">
        <div class="refresh">
          <Spinner v-if="isUpdateBalance" class="spinner"></Spinner>
          <button v-else @click="updateBalance">
            <fa icon="sync"></fa>
          </button>
        </div>
        <h4>{{ $t("top.title2") }}</h4>
        <template v-if="!isBreakdown">
          <button class="breakdown_toggle" @click="toggleBreakdown">
            <fa icon="eye"></fa>
            {{ $t("top.balance.show") }}
          </button>
        </template>
        <template v-else>
          <button class="breakdown_toggle" @click="toggleBreakdown">
            <fa icon="eye-slash"></fa>
            {{ $t("top.balance.hide") }}
          </button>
        </template>
        <button class="breakdown_toggle" @click="showUTXOsModal">
          Show UTXOs
        </button>
      </div>
      <div class="balance_row">
        <p class="balance" data-cy="wallet_balance">{{ balanceText }} METAL</p>
        <div style="display: flex; flex-direction: row">
          <p class="balance_usd">
            <b>$ {{ totalBalanceUSDText }}</b>
            USD
          </p>
          <p class="exchange_rate" style="background-color: transparent">
            <b>1 METAL</b>
            =
            <b>${{ avaxPriceText }}</b>
            USD
          </p>
        </div>
      </div>
      <div class="alt_info">
        <div v-if="!isBreakdown" class="alt_non_breakdown">
          <div>
            <label>{{ $t("top.balance.available") }}</label>
            <p>{{ unlockedText }} METAL</p>
          </div>
          <div v-if="hasLocked">
            <label>{{ $t("top.locked") }}</label>
            <p>{{ balanceTextLocked }} METAL</p>
          </div>
          <div v-if="hasMultisig">
            <label>Multisig</label>
            <p>{{ balanceTextMultisig }} METAL</p>
          </div>
          <div>
            <label>{{ $t("top.balance.stake") }}</label>
            <p>{{ stakingText }} METAL</p>
          </div>
        </div>
        <div v-else class="alt_breakdown">
          <div>
            <label>{{ $t("top.balance.available") }} (X)</label>
            <p>{{ cleanAvaxBN(avmUnlocked) }} METAL</p>
            <label>{{ $t("top.balance.available") }} (P)</label>
            <p>{{ cleanAvaxBN(platformUnlocked) }} METAL</p>
            <label>{{ $t("top.balance.available") }} (C)</label>
            <p>{{ cleanAvaxBN(evmUnlocked) }} METAL</p>
          </div>
          <div v-if="hasLocked">
            <label>{{ $t("top.balance.locked") }} (X)</label>
            <p>{{ cleanAvaxBN(avmLocked) }} METAL</p>
            <label>{{ $t("top.balance.locked") }} (P)</label>
            <p>{{ cleanAvaxBN(platformLocked) }} METAL</p>
            <label>{{ $t("top.balance.locked_stake") }} (P)</label>
            <p>{{ cleanAvaxBN(platformLockedStakeable) }} METAL</p>
          </div>
          <div v-if="hasMultisig">
            <label>Multisig (X)</label>
            <p>{{ cleanAvaxBN(avmMultisig) }} METAL</p>
            <label>Multisig (P)</label>
            <p>{{ cleanAvaxBN(platformMultisig) }} METAL</p>
          </div>
          <div>
            <label>{{ $t("top.balance.stake") }}</label>
            <p>{{ stakingText }} METAL</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type AvaAsset from "@/js/AvaAsset";
import type { WalletType } from "@/js/wallets/types";
import type { priceDict } from "@/stores/vuex/types";
import { BN } from "@metalblockchain/metaljs/dist";

import { ONEAVAX } from "@metalblockchain/metaljs/dist/utils";
import Big from "big.js";
import { defineComponent } from "vue";
import Spinner from "@/components/misc/Spinner.vue";
import UtxosBreakdownModal from "@/components/modals/UtxosBreakdown/UtxosBreakdownModal.vue";
import { bnToBig } from "@/helpers/helper";

export const BalanceCard = defineComponent({
  components: {
    UtxosBreakdownModal,
    Spinner,
  },
  data() {
    return {
      isBreakdown: true,
    };
  },
  computed: {
    ava_asset(): AvaAsset | null {
      const ava = this.$store.getters["Assets/AssetAVA"];
      return ava;
    },
    avmUnlocked(): BN {
      if (!this.ava_asset) return new BN(0);
      return this.ava_asset.amount;
    },
    avmLocked(): BN {
      if (!this.ava_asset) return new BN(0);
      return this.ava_asset.amountLocked;
    },
    evmUnlocked(): BN {
      if (!this.wallet) return new BN(0);
      // convert from ^18 to ^9
      const bal = this.wallet.ethBalance;
      return bal.div(new BN(Math.pow(10, 9).toString()));
    },
    totalBalance(): BN {
      if (!this.ava_asset) return new BN(0);

      let tot = this.ava_asset.getTotalAmount();
      // add EVM balance
      tot = tot.add(this.evmUnlocked);
      return tot;
    },
    totalBalanceBig(): Big {
      if (this.ava_asset) {
        const denom = this.ava_asset.denomination;
        const bigTot = bnToBig(this.totalBalance, denom);
        return bigTot;
      }
      return Big(0);
    },
    avaxPriceText() {
      return this.priceDict.usd;
    },
    totalBalanceUSD(): Big {
      const usdPrice = this.priceDict.usd;
      const usdBig = this.totalBalanceBig.times(Big(usdPrice));
      return usdBig;
    },
    totalBalanceUSDText(): string {
      if (this.isUpdateBalance) return "--";
      return this.totalBalanceUSD.toLocaleString(2);
    },
    balanceText(): string {
      if (this.ava_asset === null) {
        return "?";
      } else {
        const denom = this.ava_asset.denomination;
        return this.totalBalanceBig.toLocaleString(denom);
      }
    },
    balanceTextLeft(): string {
      if (this.isUpdateBalance) return "--";
      const text = this.balanceText;
      if (text.includes(".")) {
        const left = text.split(".")[0];
        return left ?? "";
      }
      return text;
    },
    balanceTextRight(): string {
      if (this.isUpdateBalance) return "";
      const text = this.balanceText;
      if (text.includes(".")) {
        const right = text.split(".")[1];
        return right ?? "";
      }
      return "";
    },
    balanceTextLocked(): string {
      if (this.isUpdateBalance) return "--";

      if (this.ava_asset === null) {
        return "--";
      } else {
        const denom = this.ava_asset.denomination;
        const tot = this.platformLocked.add(this.platformLockedStakeable);
        // let otherLockedAmt = this.platformLocked.add(this.platformLockedStakeable)
        const pLocked = Big(tot.toString()).div(Math.pow(10, denom));
        let amt = this.ava_asset.getAmount(true);
        amt = amt.add(pLocked);

        return amt.toLocaleString(denom);
      }
    },
    balanceTextMultisig() {
      if (this.isUpdateBalance) return "--";

      if (this.ava_asset === null) {
        return "--";
      } else {
        const denom = this.ava_asset.denomination;
        return bnToBig(
          this.avmMultisig.add(this.platformMultisig),
          denom,
        ).toLocaleString();
      }
    },
    avmMultisig(): BN {
      return this.ava_asset === null
        ? new BN(0)
        : this.ava_asset.amountMultisig;
    },
    platformBalance() {
      return this.$store.getters["Assets/walletPlatformBalance"];
    },
    platformUnlocked(): BN {
      return this.platformBalance.available;
    },
    platformMultisig(): BN {
      return this.platformBalance.multisig;
    },
    platformLocked(): BN {
      return this.platformBalance.locked;
    },
    platformLockedStakeable(): BN {
      return this.platformBalance.lockedStakeable;
    },
    unlockedText() {
      if (this.isUpdateBalance) return "--";

      if (this.ava_asset) {
        const xUnlocked = this.ava_asset.amount;
        const pUnlocked = this.platformUnlocked;

        const denom = this.ava_asset.denomination;

        const tot = xUnlocked.add(pUnlocked).add(this.evmUnlocked);

        const amtBig = bnToBig(tot, denom);

        return amtBig.toLocaleString(denom);
      } else {
        return "--";
      }
    },
    pBalanceText() {
      if (!this.ava_asset) return "--";
      if (this.isUpdateBalance) return "--";

      const denom = this.ava_asset.denomination;
      const bal = this.platformUnlocked;
      let bigBal = Big(bal.toString());
      bigBal = bigBal.div(Math.pow(10, denom));

      return bigBal.lt(Big("1"))
        ? bigBal.toLocaleString(9)
        : bigBal.toLocaleString(3);
    },
    stakingAmount(): BN {
      return this.$store.getters["Assets/walletStakingBalance"];
    },
    stakingText() {
      const balance = this.stakingAmount;
      if (!balance) return "0";
      if (this.isUpdateBalance) return "--";

      const denom = 9;
      let bigBal = Big(balance.toString());
      bigBal = bigBal.div(Math.pow(10, denom));

      return bigBal.lt(Big("1")) ? bigBal.toString() : bigBal.toLocaleString();
    },
    wallet(): WalletType | null {
      return this.$store.state.activeWallet;
    },
    isUpdateBalance(): boolean {
      if (!this.wallet) return true;
      return this.wallet.isFetchUtxos;
    },
    priceDict(): priceDict {
      return this.$store.state.prices;
    },
    hasLocked(): boolean {
      return (
        !this.avmLocked.isZero() ||
        !this.platformLocked.isZero() ||
        !this.platformLockedStakeable.isZero()
      );
    },
    hasMultisig(): boolean {
      return !this.avmMultisig.isZero() || !this.platformMultisig.isZero();
    },
  },
  methods: {
    updateBalance(): void {
      this.$store.dispatch("Assets/updateUTXOs");
      this.$store.dispatch("History/updateTransactionHistory");
    },
    showUTXOsModal() {
      (this.$refs.utxos_modal as typeof UtxosBreakdownModal).open();
    },
    toggleBreakdown() {
      this.isBreakdown = !this.isBreakdown;
    },
    cleanAvaxBN: (val: BN) => {
      const big = Big(val.toString()).div(Big(ONEAVAX.toString()));
      return big.toLocaleString();
    },
  },
});
export default BalanceCard;
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.balance_card {
  display: grid;
  //grid-template-columns: 1fr 230px;
  column-gap: 20px;
}

.nft_card {
  border-left: 2px solid var(--bg-light);
}
.fungible_card {
  height: 100%;
  display: grid !important;
  grid-template-rows: max-content 1fr max-content;
  flex-direction: column;
}

.where_info {
  grid-row: 2;
  grid-column: 1/3;
  margin-top: 8px;
  /*max-width: 460px;*/
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;

  h4 {
    flex-grow: 1;
  }
}

h4 {
  font-weight: 700;
  color: var(--tertiary-color);
  margin-left: 10px;
}

.alert_cont {
  margin: 0;
}

.balance_row {
  align-self: center;
}
.balance {
  font-size: 2rem;
  white-space: normal;
  color: var(--secondary-color);

  span {
    font-size: 2rem;
    color: var(--secondary-color);
  }
}

.balance_usd {
  width: max-content;
  background: var(--bg-light);
  font-size: 13px;
  padding: 1px 6px;
  border-radius: 3px;
  margin-right: 6px !important;
  color: var(--tertiary-color);
}

.exchange_rate {
  width: max-content;
  background: var(--bg-light);
  font-size: 13px;
  padding: 1px 6px;
  border-radius: 3px;
  margin-right: 6px !important;
}

.refresh {
  display: flex;
  align-items: center;
  color: var(--tertiary-color);
  font-weight: 700;

  button {
    outline: none !important;
  }
  img {
    object-fit: contain;
    width: 100%;
  }

  .spinner {
    color: var(--tertiary-color) !important;
    width: 16px;
    height: 16px;
  }
}
.buts {
  width: 100%;
  text-align: right;
}
.buts button {
  font-size: 18px;
  margin: 0px 18px;
  margin-right: 0px;
  position: relative;
  outline: none !important;
}

.buts img {
  height: 20px;
  width: 20px;
  object-fit: contain;
  outline: none !important;
}
.buts button[tooltip]:hover:before {
  border-radius: 4px;
  /*left: 0;*/
  left: 0;
  transform: translateX(-50%);
  content: attr(tooltip);
  position: absolute;
  background-color: #303030;
  bottom: 100%;
  color: #ddd;
  width: max-content;
  max-width: 100px;
  font-size: 14px;
  padding: 4px 8px;
}

.alt_info > div {
  display: grid;
  grid-template-columns: repeat(4, max-content);
  column-gap: 0px;
  margin-top: 12px;
  > div {
    position: relative;
    padding: 0 24px;
    border-right: 2px solid var(--bg-light);
    &:first-of-type {
      padding-left: 0;
    }
    &:last-of-type {
      border: none;
    }
  }

  label {
    font-size: 12px;
    font-weight: 400;
    color: var(--primary-color-light);
  }

  p {
    font-size: 14px;
    font-weight: 500;
    color: var(--tertiary-color);
  }
}

.nft_card {
  padding-left: 20px;
}

.breakdown_toggle {
  color: var(--primary-color-light);
  font-size: 13px;
  outline: none !important;
  margin-left: 12px;

  &:hover {
    color: var(--secondary-color);
  }
}

@include mixins.medium-device {
  .balance_card {
    display: block;
    //grid-template-columns: 1fr 120px;
  }

  .balance {
    font-size: 1.8rem !important;
  }

  .balance_usd {
    font-size: 11px;
  }
  .nft_col {
    display: none;
  }

  .alt_info {
    font-size: 12px;
  }
}

@include mixins.mobile-device {
  .balance_card {
    grid-template-columns: none;
    display: block !important;
  }

  .nft_col {
    display: none;
  }

  .nft_card {
    padding: 0;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid var(--primary-color-light);
    border-left: none;
  }

  .balance {
    font-size: 2em !important;
  }

  .where_info {
  }

  .alt_info {
    > div {
      text-align: left;
      grid-template-columns: none;
      column-gap: 0;
    }

    .alt_non_breakdown,
    .alt_breakdown {
      > div {
        padding: 8px 0;
        border-right: none;
        border-bottom: 1px solid var(--bg-light);

        &:last-of-type {
          border: none;
        }
      }
    }
  }

  .alt_non_breakdown {
    display: none !important;
  }
}
</style>
