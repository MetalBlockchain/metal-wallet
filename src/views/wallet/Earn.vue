<template>
  <div class="earn_page">
    <div class="header">
      <div class="header_title">
        <h1>{{ $t("earn.title") }}</h1>
        <hr />
      </div>
      <h1 v-if="pageNow" class="subtitle">
        / {{ subtitle }}
        <span @click="cancel"><fa icon="times"></fa></span>
      </h1>
    </div>
    <transition mode="out-in" name="fade">
      <div v-if="!pageNow">
        <p class="earn_desc">{{ $t("earn.desc") }}</p>
        <div class="options">
          <div>
            <h4 class="title">
              {{ $t("earn.validate_card.title") }}
            </h4>
            <p style="flex-grow: 1">
              {{ $t("earn.validate_card.desc") }}
            </p>
            <p v-if="!canValidate" class="no_balance">
              {{ $t("earn.warning_1", [minStakeAmt.toLocaleString()]) }}
            </p>
            <v-btn
              class="button_secondary"
              data-cy="validate"
              depressed
              :disabled="!canValidate"
              small
              @click="addValidator"
            >
              {{ $t("earn.validate_card.submit") }}
            </v-btn>
          </div>
          <div>
            <h4 class="title">
              {{ $t("earn.delegate_card.title") }}
            </h4>
            <p style="flex-grow: 1">
              {{ $t("earn.delegate_card.desc") }}
            </p>
            <p v-if="!canDelegate" class="no_balance">
              {{ $t("earn.warning_2", [minDelegationAmt.toLocaleString()]) }}
            </p>
            <v-btn
              class="button_secondary"
              data-cy="delegate"
              depressed
              :disabled="!canDelegate"
              small
              @click="addDelegator"
            >
              {{ $t("earn.delegate_card.submit") }}
            </v-btn>
          </div>
          <div>
            <h4 class="title">
              {{ $t("earn.rewards_card.title") }}
            </h4>
            <p style="flex-grow: 1">
              {{ $t("earn.rewards_card.desc") }}
            </p>
            <v-btn
              class="button_secondary"
              data-cy="rewards"
              depressed
              small
              @click="viewRewards"
            >
              {{ $t("earn.rewards_card.submit") }}
            </v-btn>
          </div>
        </div>
        <!--                <v-btn @click="viewRewards" depressed small>View Estimated Rewards</v-btn>-->
      </div>
      <div v-else>
        <component :is="pageNow" class="comp" @cancel="cancel"></component>
      </div>
    </transition>
  </div>
</template>
<script lang="ts">
import type { BN } from "@metalblockchain/metaljs/dist";
import type Big from "big.js";
import { mapState } from "pinia";
import { defineComponent, markRaw } from "vue";
import AddDelegator from "@/components/wallet/earn/Delegate/AddDelegator.vue";
import UserRewards from "@/components/wallet/earn/UserRewards.vue";
import AddValidator from "@/components/wallet/earn/Validate/AddValidator.vue";
import { bnToBig } from "@/helpers/helper";
import { useAssetsStore } from "@/stores/pinia/assets";
import { usePlatformStore } from "@/stores/pinia/platform";

export const Earn = defineComponent({
  name: "Earn",
  components: {
    UserRewards,
    AddValidator,
    AddDelegator,
  },
  data() {
    const intervalID: any = null;
    const pageNow: any = null;

    return {
      pageNow,
      subtitle: "",
      intervalID,
    };
  },
  computed: {
    ...mapState(useAssetsStore, {
      platformLockedStakeable: "walletPlatformBalanceLockedStakeable",
      platformUnlocked: (store) => store.walletPlatformBalance.available,
    }),
    ...mapState(usePlatformStore, ["minStakeDelegation", "minStake"]),
    totBal(): BN {
      return this.platformUnlocked.add(this.platformLockedStakeable);
    },
    pNoBalance() {
      return this.platformUnlocked.add(this.platformLockedStakeable).isZero();
    },
    canDelegate(): boolean {
      const bn = this.minStakeDelegation;
      if (this.totBal.lt(bn)) {
        return false;
      }
      return true;
    },
    canValidate(): boolean {
      const bn = this.minStake;
      if (this.totBal.lt(bn)) {
        return false;
      }
      return true;
    },
    minStakeAmt(): Big {
      const bn = this.minStake;
      return bnToBig(bn, 9);
    },
    minDelegationAmt(): Big {
      const bn = this.minStakeDelegation;
      return bnToBig(bn, 9);
    },
  },
  deactivated() {
    this.cancel();
  },
  unmounted() {
    clearInterval(this.intervalID);
  },
  methods: {
    addValidator() {
      this.pageNow = markRaw(AddValidator);
      this.subtitle = this.$t("earn.subtitle1") as string;
    },
    addDelegator() {
      this.pageNow = markRaw(AddDelegator);
      this.subtitle = this.$t("earn.subtitle2") as string;
    },
    transfer() {
      this.$router.replace("/wallet/cross_chain");
    },
    viewRewards() {
      this.pageNow = markRaw(UserRewards);
      this.subtitle = this.$t("earn.subtitle4") as string;
    },
    cancel() {
      this.pageNow = null;
      this.subtitle = "";
    },
  },
});
export default Earn;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
.earn_page {
  display: grid;
  grid-template-rows: max-content 1fr;
}
.earn_desc {
  font-size: 14px;
  font-weight: 400;
}
.header {
  display: flex;
  /*justify-content: space-between;*/
  /*align-items: center;*/
  align-items: center;

  .header_title {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 18px;
    width: 100%;

    h1 {
      font-size: 20px;
      font-weight: 500;
      white-space: nowrap;
      margin-right: 12px;
      color: var(--tertiary-color);
    }

    hr {
      flex: 0 1 100%;
      border: 1px solid var(--border-secondary-light);
    }
  }

  .subtitle {
    margin-left: 0.5em;
    font-size: 20px;
    color: var(--primary-color-light);
    font-weight: 400;
  }

  span {
    margin-left: 1em;

    &:hover {
      color: var(--primary-color);
      cursor: pointer;
    }
  }
}
.options {
  margin: 30px 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 14px;
  row-gap: 14px;
  //display: flex;
  //justify-content: space-evenly;
  //padding: 60px;

  > div {
    width: 100%;
    justify-self: center;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    //max-width: 260px;
    padding: 30px;
    border-radius: 16px;
    border: 1px solid var(--border-secondary-light);
    overflow: auto;
  }

  h4 {
    font-size: 20px !important;
    font-weight: 600;
    color: var(--tertiary-color);
  }

  p {
    /*color: var(--primary-color-light);*/
    font-size: 14px;
    font-weight: 400;
    margin: 14px 0 !important;
  }

  .no_balance {
    color: var(--error);
  }

  .v-btn {
    margin-top: 14px;
  }
}

span {
  color: var(--primary-color-light);
  opacity: 0.5;
  float: right;
  font-weight: lighter;
}

.cancel {
  font-size: 13px;
  color: var(--secondary-color);
  justify-self: flex-end;
}

.comp {
  margin-top: 14px;
}

@include mixins.medium-device {
  .options {
    grid-template-columns: 1fr 1fr;
  }
}

@include mixins.mobile-device {
  .options {
    grid-template-columns: none;
    grid-row-gap: 15px;
  }
}
</style>
