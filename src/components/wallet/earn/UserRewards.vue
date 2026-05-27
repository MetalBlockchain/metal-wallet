<template>
  <div>
    <template v-if="totLength > 0">
      <div>
        <label>{{ $t("earn.rewards.total") }}</label>
        <p class="amt">{{ totalRewardBig.toLocaleString(9) }} METAL</p>
      </div>
      <div v-if="validatorTxs.length > 0">
        <h3>{{ $t("earn.rewards.validation") }}</h3>
        <UserRewardRow
          v-for="v in validatorTxs"
          :key="v.txHash"
          class="reward_row"
          :tx="v"
        ></UserRewardRow>
      </div>

      <div v-if="delegatorTxs.length > 0">
        <h3>{{ $t("earn.rewards.delegation") }}</h3>
        <UserRewardRow
          v-for="v in delegatorTxs"
          :key="v.txHash"
          class="reward_row"
          :tx="v"
        ></UserRewardRow>
      </div>
    </template>
    <template v-else>
      <p style="text-align: center">{{ $t("earn.rewards.empty") }}</p>
    </template>
  </div>
</template>
<script lang="ts">
import type Big from "big.js";
import { BN } from "@metalblockchain/metaljs";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import UserRewardRow from "@/components/wallet/earn/UserRewardRow.vue";
import { bnToBig } from "@/helpers/helper";
import { useEarnStore } from "@/stores/pinia/earn";
import { useRootStore } from "@/stores/pinia/root";

const VALIDATOR_ALLOWED_TX_TYPE = new Set([
  "AddValidatorTx",
  "AddPermissionlessValidatorTx",
]);

const DELEGATOR_ALLOWED_TX_TYPE = new Set([
  "AddDelegatorTx",
  "AddPermissionlessDelegatorTx",
]);

export const UserRewards = defineComponent({
  components: {
    UserRewardRow,
  },
  data(): {
    updateInterval: ReturnType<typeof setInterval> | undefined;
  } {
    const updateInterval: ReturnType<typeof setInterval> | undefined =
      undefined;

    return {
      updateInterval,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      userAddresses: (store) => {
        const wallet = store.activeWallet;
        if (!wallet) return [];

        return wallet.getAllAddressesP();
      },
    }),
    ...mapState(useEarnStore, {
      stakingTxs: (store) => {
        return store.stakingTxs;
      },
    }),

    validatorTxs() {
      return this.stakingTxs.filter((tx) =>
        VALIDATOR_ALLOWED_TX_TYPE.has(tx.txType),
      );
    },
    delegatorTxs() {
      return this.stakingTxs.filter((tx) =>
        DELEGATOR_ALLOWED_TX_TYPE.has(tx.txType),
      );
    },
    totLength() {
      return this.validatorTxs.length + this.delegatorTxs.length;
    },
    totalReward() {
      const tot = this.stakingTxs.reduce((acc, val) => {
        return acc.add(new BN(val.estimatedReward ?? 0));
      }, new BN(0));
      return tot;
    },
    totalRewardBig(): Big {
      return bnToBig(this.totalReward, 9);
    },
  },
  created() {
    this.refreshRewards();

    // Update every 5 minutes
    this.updateInterval = setInterval(
      () => {
        this.refreshRewards();
      },
      5 * 60 * 1000,
    );
  },
  unmounted() {
    // Clear interval if exists
    this.updateInterval && clearInterval(this.updateInterval);
  },
  methods: {
    ...mapActions(useEarnStore, ["refreshRewards"]),
  },
});
export default UserRewards;
</script>
<style scoped lang="scss">
.user_rewards {
  padding-bottom: 5vh;
}

.reward_row {
  margin-bottom: 12px;
}

h3 {
  margin-top: 0.3em;
  font-size: 2em;
  color: var(--primary-color-light);
  font-weight: lighter;
}

label {
  margin-top: 6px;
  color: var(--primary-color-light);
  font-size: 14px;
  margin-bottom: 3px;
}

.amt {
  font-size: 2em;
}
</style>
