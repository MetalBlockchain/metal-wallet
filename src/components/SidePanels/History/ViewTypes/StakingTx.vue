<template>
  <div class="staking_tx">
    <div class="data_row">
      <p>{{ actionText }}</p>
      <p class="amt">{{ amtText }} METAL</p>
    </div>
    <template v-if="isRewarded">
      <!--If received validator reward and validator tx-->
      <div v-if="isValidator && receivedValidatorReward" class="data_row">
        <p>
          <span class="rewarded"><fa icon="check-square"></fa></span>
          {{ $t("transactions.reward_amount") }}
        </p>
        <p class="amt">{{ formatRewardAmount(validatorRewardAmount) }} METAL</p>
      </div>
      <!--If received validator reward and delegator tx-->
      <div v-if="!isValidator && receivedValidatorReward" class="data_row">
        <p>
          <span class="rewarded"><fa icon="check-square"></fa></span>
          {{ $t("transactions.fee_amount") }}
        </p>
        <p class="amt">{{ formatRewardAmount(validatorRewardAmount) }} METAL</p>
      </div>
      <!--If received delegator reward and delegator tx-->
      <div v-if="!isValidator && receivedDelegatorReward" class="data_row">
        <p>
          <span class="rewarded"><fa icon="check-square"></fa></span>
          {{ $t("transactions.reward_amount") }}
        </p>
        <p class="amt">{{ formatRewardAmount(delegatorRewardAmount) }} METAL</p>
      </div>
    </template>
    <div v-else>
      <div v-if="isStarted" class="time_bar">
        <div
          class="bar_row"
          :style="{
            width: `${timeBarPerc}%`,
          }"
        ></div>
      </div>
      <div v-if="!isStarted" class="data_row date_row">
        <p>{{ $t("transactions.start") }}</p>
        <p>
          {{ startDate.toLocaleDateString() }}
          {{ startDate.toLocaleTimeString() }}
        </p>
      </div>
      <template v-else>
        <div class="data_row reward_row">
          <p>{{ $t("transactions.end") }}</p>
          <p>
            {{ endDate.toLocaleDateString() }}
            {{ endDate.toLocaleTimeString() }}
          </p>
        </div>
        <div class="data_row reward_row">
          <p>{{ $t("transactions.reward_pending") }}</p>
          <p class="amt">{{ formatRewardAmount(potentialReward) }} METAL</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import type {
  PChainTransaction,
  PChainUtxo,
} from "@metalblockchain/glacier-sdk";
import type { PropType } from "vue";
import type { WalletType } from "@/js/wallets/types";
import { RewardType } from "@metalblockchain/glacier-sdk";
import { BN } from "@metalblockchain/metaljs";
import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";
import { filterOwnedAddresses } from "./filterOwnedAddresses";

export const StakingTx = defineComponent({
  props: {
    transaction: {
      type: Object as PropType<PChainTransaction>,
    },
  },
  data() {
    return {
      isStarted: false,
    };
  },
  computed: {
    startTime() {
      return this.transaction?.startTimestamp || 0;
    },
    endtime() {
      return this.transaction?.endTimestamp || 0;
    },
    startDate() {
      return new Date(this.startTime * 1000);
    },
    endDate() {
      return new Date(this.endtime * 1000);
    },
    timeBarPerc() {
      if (!this.isStarted) return 0;
      const now = UnixNow();
      // if (this.endtime) {
      const dur = this.endtime - this.startTime;
      return ((now.toNumber() - this.startTime) / dur) * 100;
    },
    isValidator() {
      if (!this.transaction) return false;
      return ["AddValidatorTx", "AddPermissionlessValidatorTx"].includes(
        this.transaction.txType,
      );
    },
    actionText() {
      return this.isValidator ? "Add Validator" : "Add Delegator";
    },
    stakeAmt(): BN {
      const tot = (this.transaction?.emittedUtxos ?? []).reduce((acc, out) => {
        return out.staked ? acc.add(new BN(out.amount)) : acc;
      }, new BN(0));
      return tot;
    },
    wallet(): WalletType {
      return this.$store.state.activeWallet;
    },
    pAddrsClean(): string[] {
      const pAddrs = this.wallet.getAllAddressesP();
      return pAddrs
        .map((addr) => addr.split("-")[1])
        .filter((v) => v !== undefined);
    },
    amtText() {
      const big = bnToBig(this.stakeAmt, 9);
      return big.toLocaleString();
    },
    validatorRewards(): PChainUtxo[] | undefined {
      return (this.transaction?.emittedUtxos || []).filter((utxo) => {
        return (
          utxo.rewardType?.toLowerCase() === RewardType.VALIDATOR.toLowerCase()
        );
      });
    },
    delegatorRewards(): PChainUtxo[] | undefined {
      return (this.transaction?.emittedUtxos || []).filter((utxo) => {
        return (
          utxo.rewardType?.toLowerCase() === RewardType.DELEGATOR.toLowerCase()
        );
      });
    },
    validatorRewardAmount() {
      return (this.validatorRewards || []).reduce((acc, out) => {
        return out.amount ? acc.add(new BN(out.amount)) : acc;
      }, new BN(0));
    },
    delegatorRewardAmount() {
      return (this.delegatorRewards || []).reduce((acc, out) => {
        return out.amount ? acc.add(new BN(out.amount)) : acc;
      }, new BN(0));
    },
    potentialReward() {
      return this.transaction?.estimatedReward
        ? new BN(this.transaction.estimatedReward)
        : new BN(0);
    },
    receivedDelegatorReward() {
      if (this.isValidator || !this.delegatorRewards) return false;

      const rewardedAddresses: string[] = [];

      for (const delegatorReward of this.delegatorRewards || []) {
        rewardedAddresses.push(...delegatorReward.addresses);
      }

      const addrs = filterOwnedAddresses(this.pAddrsClean, rewardedAddresses);
      return addrs.length;
    },
    receivedValidatorReward() {
      if (!this.isValidator || !this.validatorRewards) return false;

      const rewardedAddresses: string[] = [];

      for (const validatorReward of this.validatorRewards || []) {
        rewardedAddresses.push(...validatorReward.addresses);
      }

      const addrs = filterOwnedAddresses(this.pAddrsClean, rewardedAddresses);
      return addrs.length;
    },
    isRewarded() {
      return this.transaction?.rewardTx !== undefined;
    },
  },
  mounted() {
    this.updateStartStatus();
  },
  methods: {
    updateStartStatus() {
      const now = UnixNow();
      this.isStarted = now.toNumber() > this.startTime;

      if (!this.isStarted) {
        setTimeout(() => {
          this.updateStartStatus();
        }, 5000);
      }
    },
    formatRewardAmount(amount: BN) {
      return bnToBig(amount, 9);
    },
  },
});
export default StakingTx;
</script>
<style scoped lang="scss">
.data_row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  column-gap: 1em;
  color: var(--primary-color-light);
}

.bar_row {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 24px;
}
.amt {
  text-align: right;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary-color);
}

.time_bar {
  background-color: var(--bg-wallet);
  border-radius: 8px;
  height: 4px;
  margin: 4px 0;
  width: 100%;
  overflow: hidden;
  position: relative;
  align-self: center;

  > div {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    background-color: var(--secondary-color);
  }

  p {
    width: 100%;
    text-align: center;
    position: relative;
    z-index: 2;
    font-size: 12px;
    line-height: 14px;
    color: var(--primary-color);
  }
}
span.rewarded {
  color: var(--success);
}
.not_rewarded span {
  color: var(--error);
}
</style>
