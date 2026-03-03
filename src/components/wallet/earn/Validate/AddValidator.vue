<template>
  <div>
    <div class="cols">
      <form @submit.prevent="">
        <transition-group mode="out-in" name="fade">
          <div v-show="!isConfirm" key="form" class="ins_col">
            <div style="margin-bottom: 30px">
              <h4>{{ $t("earn.validate.label_1") }}</h4>
              <input
                v-model="nodeId"
                placeholder="NodeID-"
                style="width: 100%"
                type="text"
              />
            </div>
            <div style="margin: 30px 0">
              <h4>Proof of Possession</h4>
              <p class="desc">
                The public key portion of the proof of possession:
              </p>
              <input
                v-model="signerPublicKey"
                placeholder="Public Key"
                style="width: 100%; margin-bottom: 10px"
                type="text"
              />
              <p class="desc">
                The signature portion of the proof of possession:
              </p>
              <input
                v-model="signerSignature"
                placeholder="Signature"
                style="width: 100%"
                type="text"
              />
            </div>
            <div style="margin: 30px 0">
              <h4>{{ $t("earn.validate.duration.label") }}</h4>
              <p class="desc">
                {{ $t("earn.validate.duration.desc") }}
              </p>
              <DateForm @change-end="setEnd"></DateForm>
            </div>
            <div style="margin: 30px 0">
              <h4>{{ $t("earn.validate.amount.label") }}</h4>
              <p class="desc">
                {{ $t("earn.validate.amount.desc") }}
              </p>
              <p v-if="showMaxTxSizeWarning" class="desc amount_warning">
                The maximum amount that fits into this transaction is
                <b>{{ bnToAvaxP(maxTxSizeAmount) }} AVAX</b>
              </p>
              <AvaxInput
                v-model="stakeAmt"
                class="amt_in"
                :max="maxFormAmount"
              ></AvaxInput>
            </div>
            <div style="margin: 30px 0">
              <h4>{{ $t("earn.validate.fee.label") }}</h4>
              <p class="desc">
                {{ $t("earn.validate.fee.desc") }}
              </p>
              <input
                v-model="delegationFee"
                max="100"
                :min="minFee"
                step="0.01"
                type="number"
                @change="onFeeChange"
              />
            </div>
            <div
              class="reward_in"
              style="margin: 30px 0"
              :type="rewardDestination"
            >
              <h4>{{ $t("earn.validate.reward.label") }}</h4>
              <p class="desc">
                {{ $t("earn.validate.reward.desc") }}
              </p>
              <div class="reward_tabs">
                <button
                  :selected="rewardDestination === 'local'"
                  @click="rewardSelect('local')"
                >
                  {{ $t("earn.delegate.form.reward.chip_1") }}
                </button>
                <span>or</span>
                <button
                  :selected="rewardDestination === 'custom'"
                  @click="rewardSelect('custom')"
                >
                  {{ $t("earn.delegate.form.reward.chip_2") }}
                </button>
              </div>
              <QrInput
                v-model="rewardIn"
                class="reward_addr_in"
                placeholder="Reward Address"
                style="height: 40px; border-radius: 2px"
              ></QrInput>
            </div>
            <Expandable>
              <template #triggerOn>
                <p>
                  {{ $t("earn.shared.advanced.toggle_on") }}
                </p>
              </template>
              <template #triggerOff>
                <p>
                  {{ $t("earn.shared.advanced.toggle_off") }}
                </p>
              </template>
              <template #content>
                <UtxoSelectForm
                  v-model="formUtxos"
                  style="margin: 10px 0"
                ></UtxoSelectForm>
              </template>
            </Expandable>
          </div>
          <ConfirmPage
            v-show="isConfirm"
            key="confirm"
            :amount="formAmt"
            :delegation-fee="delegationFee"
            :end="formEnd"
            :node-i-d="nodeId"
            :reward-address="rewardIn"
            :reward-destination="rewardDestination"
          ></ConfirmPage>
        </transition-group>
        <div>
          <div v-if="!isSuccess" class="summary">
            <CurrencySelect v-model="currency_type"></CurrencySelect>
            <div>
              <label>
                {{ $t("earn.validate.summary.max_del") }}
                <Tooltip
                  style="display: inline-block"
                  :text="$t('earn.validate.summary.max_del_tooltip')"
                >
                  <fa icon="question-circle"></fa>
                </Tooltip>
              </label>
              <p v-if="currency_type === 'AVAX'">
                {{ maxDelegationText }} METAL
              </p>
              <p v-if="currency_type === 'USD'">
                ${{ maxDelegationUsdText }} USD
              </p>
            </div>
            <div>
              <label>{{ $t("earn.validate.summary.duration") }} *</label>
              <p>{{ durationText }}</p>
            </div>
            <div>
              <label>{{ $t("earn.validate.summary.rewards") }}</label>
              <p v-if="currency_type === 'AVAX'">
                {{ estimatedReward.toLocaleString(2) }} METAL
              </p>
              <p v-if="currency_type === 'USD'">
                ${{ estimatedRewardUSD.toLocaleString(2) }} USD
              </p>
            </div>
            <div class="submit_box">
              <label style="margin: 8px 0 !important">
                * {{ $t("earn.validate.summary.warn") }}
              </label>
              <p v-if="warnShortDuration" class="err">
                {{ $t("earn.validate.errs.duration_warn") }}
              </p>
              <p class="err">{{ err }}</p>
              <v-btn
                v-if="!isConfirm"
                block
                class="button_secondary"
                depressed
                :disabled="!canSubmit"
                :loading="isLoading"
                @click="confirm"
              >
                {{ $t("earn.validate.confirm") }}
              </v-btn>
              <template v-else>
                <v-btn
                  block
                  class="button_secondary"
                  depressed
                  :loading="isLoading"
                  @click="submit"
                >
                  {{ $t("earn.validate.submit") }}
                </v-btn>
                <v-btn
                  block
                  style="color: var(--primary-color); margin-top: 20px"
                  text
                  @click="cancelConfirm"
                >
                  {{ $t("earn.validate.cancel") }}
                </v-btn>
              </template>
            </div>
          </div>
          <div v-else class="success_cont">
            <h2>{{ $t("earn.validate.success.title") }}</h2>
            <p>{{ $t("earn.validate.success.desc") }}</p>
            <p class="tx_id">Tx ID: {{ txId }}</p>
            <div class="tx_status">
              <div>
                <label>{{ $t("earn.validate.success.status") }}</label>
                <p v-if="!txStatus">Waiting..</p>
                <p v-else>{{ txStatus }}</p>
              </div>
              <div class="status_icon">
                <Spinner
                  v-if="!txStatus"
                  style="color: var(--primary-color)"
                ></Spinner>
                <p
                  v-if="txStatus === 'Committed'"
                  style="color: var(--success)"
                >
                  <fa icon="check-circle"></fa>
                </p>
                <p v-if="txStatus === 'Dropped'" style="color: var(--error)">
                  <fa icon="times-circle"></fa>
                </p>
              </div>
            </div>
            <div v-if="txReason" class="reason_cont">
              <label>{{ $t("earn.validate.success.reason") }}</label>
              <p>{{ txReason }}</p>
            </div>
            <v-btn
              v-if="txStatus"
              block
              class="button_secondary"
              depressed
              @click="cancel"
            >
              Back to Earn
            </v-btn>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import type {
  AmountOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/platformvm";

import { bnToAvaxP } from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";
import { UTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm";
import Big from "big.js";
import moment from "moment";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import AvaxInput from "@/components/misc/AvaxInput.vue";
import CurrencySelect from "@/components/misc/CurrencySelect/CurrencySelect.vue";
import Expandable from "@/components/misc/Expandable.vue";
import Spinner from "@/components/misc/Spinner.vue";
import Tooltip from "@/components/misc/Tooltip.vue";
import QrInput from "@/components/shared/QrInput.vue";
import DateForm from "@/components/wallet/earn/DateForm.vue";
import UtxoSelectForm from "@/components/wallet/earn/UtxoSelectForm.vue";
import ConfirmPage from "@/components/wallet/earn/Validate/ConfirmPageValidate.vue";
import { bnToBig, calculateStakingReward } from "@/helpers/helper";
import { sortUTxoSetP } from "@/helpers/sortUTXOs";
import { selectMaxUtxoForStaking } from "@/helpers/utxoSelection/selectMaxUtxoForStaking";
import { bintools, pChain } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import { usePlatformStore } from "@/stores/pinia/platform";
import { useRootStore } from "@/stores/pinia/root";

const MIN_MS = 60_000;
const HOUR_MS = MIN_MS * 60;
const DAY_MS = HOUR_MS * 24;

const MAX_STAKE_DURATION = DAY_MS * 365;

export const AddValidator = defineComponent({
  name: "AddValidator",
  components: {
    Tooltip,
    AvaxInput,
    QrInput,
    ConfirmPage,
    CurrencySelect,
    Spinner,
    DateForm,
    Expandable,
    UtxoSelectForm,
  },
  emits: ["cancel"],
  data(): {
    startDate: string;
    endDate: string;
    delegationFee: string;
    nodeId: string;
    signerPublicKey: string;
    signerSignature: string;
    rewardIn: string;
    rewardDestination: string;
    isLoading: boolean;
    isConfirm: boolean;
    err: string;
    stakeAmt: BN;
    minFee: number;
    formNodeId: string;
    formSignerPublicKey: string;
    formSignerSignature: string;
    formAmt: BN;
    formEnd: Date;
    formFee: number;
    formRewardAddr: string;
    formUtxos: UTXO[];
    txId: string;
    txStatus: null | string;
    txReason: null | string;
    isSuccess: boolean;
    currency_type: string;
    maxTxSizeAmount: BN;
    bnToAvaxP: typeof bnToAvaxP;
  } {
    const txReason: null | string = null;
    const txStatus: string | null = null;
    const formUtxos: UTXO[] = [];
    const formEnd: Date = new Date();
    const formAmt: BN = new BN(0);
    const stakeAmt: BN = new BN(0);
    const endDate: string = new Date().toISOString();
    const startDate: string = new Date(Date.now() + MIN_MS * 15).toISOString();

    return {
      startDate,
      endDate,
      delegationFee: "2.0",
      nodeId: "",
      signerPublicKey: "",
      signerSignature: "",
      rewardIn: "",
      rewardDestination: "local",
      isLoading: false,
      isConfirm: false,
      err: "",
      stakeAmt,
      minFee: 2,
      formNodeId: "",
      formSignerPublicKey: "",
      formSignerSignature: "",
      formAmt,
      formEnd,
      formFee: 0,
      formRewardAddr: "",
      formUtxos,
      txId: "",
      txStatus,
      txReason,
      isSuccess: false,
      currency_type: "AVAX",
      maxTxSizeAmount: new BN(0),
      bnToAvaxP: bnToAvaxP,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      wallet: (store) => store.activeWallet,
      rewardAddressLocal: (store) =>
        store.activeWallet?.getPlatformRewardAddress() ?? "",
      avaxPrice: (store) => Big(store.prices.usd),
    }),
    ...mapState(useAssetsStore, {
      platformUnlocked: (store) => store.walletPlatformBalance.available,
      platformLockedStakeable: (store) =>
        store.walletPlatformBalanceLockedStakeable,
    }),
    ...mapState(usePlatformStore, {
      currentSupply: "currentSupply",
      minStakeAmt: (store) => store.minStake,
    }),

    warnShortDuration(): boolean {
      const dur = this.stakeDuration;

      // If duration is less than 16 days give a warning
      if (dur <= DAY_MS * 16) {
        return true;
      }
      return false;
    },
    stakeDuration(): number {
      const start = new Date(this.startDate);
      let end = new Date(this.endDate);

      if (this.isConfirm) {
        end = this.formEnd;
      }

      const diff = end.getTime() - start.getTime();
      return diff;
    },
    durationText() {
      const d = moment.duration(this.stakeDuration, "milliseconds");
      const days = Math.floor(d.asDays());
      return `${days} days ${d.hours()} hours ${d.minutes()} minutes`;
    },
    denomination() {
      return 9;
    },
    feeAmt(): BN {
      return pChain.getTxFee();
    },
    utxosBalance(): BN {
      return this.formUtxos.reduce((acc, val) => {
        const out = val.getOutput() as AmountOutput;
        return acc.add(out.getAmount());
      }, new BN(0));
    },
    maxAmt(): BN {
      const pAmt = this.utxosBalance;

      // absolute max stake
      const mult = new BN(10).pow(new BN(6 + 9));
      const absMaxStake = new BN(3).mul(mult);

      // If above stake limit
      if (pAmt.gt(absMaxStake)) {
        return absMaxStake;
      }

      // let res = pAmt.sub(fee);
      const ZERO = new BN("0");
      return pAmt.gt(ZERO) ? pAmt : ZERO;
    },

    showMaxTxSizeWarning() {
      return this.maxTxSizeAmount.lt(this.maxAmt);
    },
    maxFormAmount() {
      return this.showMaxTxSizeWarning ? this.maxTxSizeAmount : this.maxAmt;
    },
    maxDelegationAmt(): BN {
      const stakeAmt = this.stakeAmt;

      const maxRelative = stakeAmt.mul(new BN(5));

      // absolute max stake
      const mult = new BN(10).pow(new BN(6 + 9));
      const absMaxStake = new BN(3).mul(mult);

      const res = maxRelative.lt(absMaxStake)
        ? maxRelative.sub(stakeAmt)
        : absMaxStake.sub(stakeAmt);

      return BN.max(res, new BN(0));
    },
    maxDelegationText() {
      return bnToBig(this.maxDelegationAmt, 9).toLocaleString(9);
    },
    maxDelegationUsdText() {
      const big = bnToBig(this.maxDelegationAmt, 9);
      const res = big.times(this.avaxPrice);
      return res.toLocaleString(2);
    },

    estimatedReward(): Big {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const duration = end.getTime() - start.getTime(); // in ms

      const estimation = calculateStakingReward(
        this.stakeAmt,
        duration / 1000,
        this.currentSupply,
      );
      const res = bnToBig(estimation, 9);

      return res;
    },
    estimatedRewardUSD() {
      return this.estimatedReward.times(this.avaxPrice);
    },
    canSubmit() {
      if (!this.nodeId || !this.signerPublicKey || !this.signerSignature) {
        return false;
      }

      if (this.stakeAmt.isZero()) {
        return false;
      }

      if (!this.rewardIn) {
        return false;
      }

      return true;
    },
  },
  watch: {
    formUtxos: [
      {
        handler: "onFormUtxosChange",
      },
    ],
    maxAmt: [
      {
        handler: "onFormUtxosChange",
      },
    ],
  },
  mounted() {
    this.rewardSelect("local");
  },
  methods: {
    ...mapActions(useAssetsStore, ["updateUTXOs"]),
    ...mapActions(useHistoryStore, ["updateTransactionHistory"]),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    onFeeChange() {
      const num = Number.parseFloat(this.delegationFee);
      if (num < this.minFee) {
        this.delegationFee = this.minFee.toString();
      } else if (num > 100) {
        this.delegationFee = "100";
      }
    },
    setEnd(val: string) {
      this.endDate = val;
    },
    rewardSelect(val: "local" | "custom") {
      this.rewardIn = val === "local" ? this.rewardAddressLocal : "";
      this.rewardDestination = val;
    },
    updateFormData() {
      this.formNodeId = this.nodeId.trim();
      this.formSignerPublicKey = this.signerPublicKey.trim();
      this.formSignerSignature = this.signerSignature.trim();
      this.formAmt = this.stakeAmt;
      this.formEnd = new Date(this.endDate);
      this.formRewardAddr = this.rewardIn;
      this.formFee = Number.parseFloat(this.delegationFee);
    },
    confirm() {
      if (!this.formCheck()) return;
      this.updateFormData();
      this.isConfirm = true;
    },
    cancelConfirm() {
      this.isConfirm = false;
    },
    cancel() {
      this.$emit("cancel");
    },
    formCheck(): boolean {
      this.err = "";

      // Reward Address
      if (this.rewardDestination !== "local") {
        const rewardAddr = this.rewardIn;

        // If it doesnt start with P
        if (rewardAddr[0] !== "P") {
          this.err = this.$t("earn.validate.errs.address") as string;
          return false;
        }

        // not a valid address
        try {
          bintools.stringToAddress(rewardAddr);
        } catch {
          this.err = this.$t("earn.validate.errs.address") as string;
          return false;
        }
      }

      // Not a valid Node ID
      if (!this.nodeId.includes("NodeID-")) {
        this.err = this.$t("earn.validate.errs.id") as string;
        return false;
      }

      // Delegation Fee
      if (Number.parseFloat(this.delegationFee) < this.minFee) {
        this.err = this.$t("earn.validate.errs.fee", [this.minFee]) as string;
        return false;
      }

      // Stake amount
      if (this.stakeAmt.lt(this.minStakeAmt)) {
        const big = Big(this.minStakeAmt.toString()).div(Math.pow(10, 9));
        this.err = this.$t("earn.validate.errs.amount", [
          big.toLocaleString(),
        ]) as string;
        return false;
      }

      return true;
    },
    async submit() {
      if (!this.formCheck()) return;

      const wallet = this.wallet;
      if (!wallet) return;

      // Start delegation in 5 minutes
      let startDate = new Date(Date.now() + 5 * MIN_MS);
      const endMs = this.formEnd.getTime();
      const startMs = startDate.getTime();

      // If End date - start date is greater than max stake duration, adjust start date
      if (endMs - startMs > MAX_STAKE_DURATION) {
        startDate = new Date(endMs - MAX_STAKE_DURATION);
      }

      try {
        this.isLoading = true;
        this.err = "";
        const txId = await wallet.validate(
          this.formNodeId,
          this.formAmt,
          startDate,
          this.formEnd,
          this.formFee,
          this.formSignerPublicKey,
          this.formSignerSignature,
          this.formRewardAddr,
          this.formUtxos as any,
        );
        this.isLoading = false;
        this.onTxSubmit(txId);
      } catch (error) {
        this.isLoading = false;
        this.onerror(error);
      }
    },
    onTxSubmit(txId: string) {
      this.txId = txId;
      this.isSuccess = true;
      this.updateTxStatus(txId);
    },
    onsuccess() {
      this.addNotification({
        type: "success",
        title: "Validator Added",
        message: "Your tokens are now locked to stake.",
      });

      // Update History
      setTimeout(() => {
        this.updateUTXOs();
        this.updateTransactionHistory();
      }, 3000);
    },
    async updateTxStatus(txId: string) {
      const res = await pChain.getTxStatus(txId);

      let status;
      let reason = null;
      if (typeof res === "string") {
        status = res;
      } else {
        status = res.status;
        reason = res.reason;
      }

      if (!status || status === "Processing" || status === "Unknown") {
        setTimeout(() => {
          this.updateTxStatus(txId);
        }, 5000);
      } else {
        this.txStatus = status;
        this.txReason = reason;

        if (status === "Committed") {
          this.onsuccess();
        }
      }
    },
    onerror(err: any) {
      const msg: string = err.message;
      console.error(err);

      if (msg.includes("startTime")) {
        this.err = this.$t("earn.validate.errs.date") as string;
      } else if (msg.includes("must be at least")) {
        const minAmt = this.minStakeAmt;
        const big = Big(minAmt.toString()).div(Math.pow(10, 9));
        this.err = this.$t("earn.validate.errs.amount", [
          big.toLocaleString(),
        ]) as string;
      } else if (msg.includes("nodeID")) {
        this.err = this.$t("earn.validate.errs.id") as string;
      } else if (msg.includes("address format")) {
        this.err = this.$t("earn.validate.errs.address") as string;
      } else {
        this.err = err.message;
      }

      this.addNotification({
        type: "error",
        title: "Validation Failed",
        message: "Failed to add validator.",
      });
    },
    onFormUtxosChange() {
      if (!this.wallet) return;

      // Amount of the biggest transaction that can be created with the selected UTXOs
      const set = new UTXOSet();
      set.addArray(this.formUtxos as any);

      const fromAddresses = this.wallet.getAllAddressesP();
      const changeAddress = this.wallet.getChangeAddressPlatform();
      const sorted = sortUTxoSetP(set, false);
      selectMaxUtxoForStaking(
        sorted,
        this.maxAmt,
        fromAddresses,
        changeAddress,
        changeAddress,
        changeAddress,
        true,
      ).then((res) => {
        this.maxTxSizeAmount = res.amount;
      });
    },
  },
});
export default AddValidator;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
.cols {
  /*display: grid;*/
  /*grid-template-columns: 1fr 1fr;*/
}

form {
  display: grid;
  grid-template-columns: 1fr 340px;
  column-gap: 90px;
}
.ins_col {
  max-width: 490px;
  padding-bottom: 8vh;
}
.amt {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid #999;
  padding: 4px 14px;
}
.bigIn {
  flex-grow: 1;
}

input {
  color: var(--primary-color);
  background-color: var(--bg-light);
  padding: 6px 14px;
}

.desc {
  font-size: 13px;
  margin-bottom: 8px !important;
  color: var(--primary-color-light);
}

h4 {
  font-weight: bold;
}

label {
  margin-top: 6px;
  color: var(--primary-color-light);
  font-size: 14px;
  margin-bottom: 3px;
}

.dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 15px;

  label > span {
    float: right;
    opacity: 0.4;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
  }
}

.submit_box {
  .v-btn {
    margin-top: 14px;
  }
}

.summary {
  border-left: 2px solid var(--bg-light);
  padding-left: 30px;
  > div {
    margin-bottom: 14px;
    p {
      font-size: 24px;
    }
  }

  .err {
    margin: 14px 0 !important;
    font-size: 14px;
  }
}

.success_cont {
  .check {
    font-size: 4em;
    color: var(--success);
  }

  .tx_id {
    font-size: 13px;
    color: var(--primary-color-light);
    word-break: break-all;
    margin: 14px 0 !important;
    font-weight: bold;
  }
}

.reward_in {
  transition-duration: 0.2s;
  &[type="local"] {
    .reward_addr_in {
      opacity: 0.3;
      user-select: none;
      pointer-events: none;
    }
  }
}

.reward_tabs {
  margin-bottom: 8px;
  font-size: 13px;
  button {
    color: var(--primary-color-light);

    &:hover {
      color: var(--primary-color);
    }

    &[selected] {
      color: var(--secondary-color);
    }
  }

  span {
    margin: 0px 12px;
  }
}

.amount_warning {
  color: var(--warning);
}

.tx_status {
  display: flex;
  justify-content: space-between;

  .status_icon {
    align-items: center;
    display: flex;
    font-size: 24px;
  }
}

.tx_status,
.reason_cont {
  background-color: var(--bg-light);
  padding: 4px 12px;
  margin-bottom: 6px;
}

@include mixins.mobile-device {
  form {
    grid-template-columns: 1fr;
  }

  .dates {
    grid-template-columns: 1fr;
  }

  .amt_in {
    width: 100%;
  }

  .summary {
    border-left: none;
    border-top: 2px solid var(--bg-light);
    padding-left: 0;
    padding-top: 30px;
  }
}
</style>
