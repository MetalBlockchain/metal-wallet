<template>
  <div class="add_delegator">
    <NodeSelection
      v-if="!selected"
      class="node_selection"
      @select="onselect"
    ></NodeSelection>
    <div v-else class="cols">
      <div class="node_col">
        <button class="close_but button_secondary" @click="selected = null">
          <fa icon="sync"></fa>
          Change Node
        </button>
        <NodeCard :node="selected"></NodeCard>
      </div>
      <transition-group mode="out-in" name="fade">
        <div v-show="!isConfirm" key="form" class="ins_col">
          <div style="margin-bottom: 30px">
            <h4>{{ $t("earn.delegate.form.period.label") }}</h4>
            <p class="desc">
              {{ $t("earn.delegate.form.period.desc") }}
            </p>
            <DateForm
              :max-end-date="endMaxDate"
              @change_end="setEnd"
            ></DateForm>
          </div>
          <div style="margin: 30px 0; margin-bottom: 50px">
            <h4>{{ $t("earn.delegate.form.amount.label") }}</h4>
            <p class="desc">
              {{ $t("earn.delegate.form.amount.desc") }}
            </p>
            <p v-if="showMaxTxSizeWarning" class="desc amount_warning">
              The maximum amount that fits into this transaction is
              <b>{{ maxTxSizeString }} AVAX</b>
            </p>
            <AvaxInput
              v-model="stakeAmt"
              :balance="utxosBalanceBig"
              class="amt_in"
              :max="maxFormAmount"
            ></AvaxInput>
          </div>
          <div
            class="reward_in"
            style="margin: 30px 0"
            :type="rewardDestination"
          >
            <h4>{{ $t("earn.delegate.form.reward.label") }}</h4>
            <p class="desc">
              {{ $t("earn.delegate.form.reward.desc") }}
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
          :end="formEnd"
          :node-i-d="formNodeID"
          :reward-address="formRewardAddr"
          :reward-destination="rewardDestination"
        ></ConfirmPage>
      </transition-group>
      <div>
        <div v-if="!isSuccess" class="summary">
          <CurrencySelect
            v-model="currency_type"
            currency="currency_sel"
          ></CurrencySelect>
          <div>
            <label>{{ $t("earn.delegate.summary.duration") }} *</label>
            <p>{{ stakingDurationText }}</p>
          </div>
          <div>
            <label>{{ $t("earn.delegate.summary.reward") }}</label>
            <p v-if="currency_type === 'AVAX'">
              {{ estimatedReward.toLocaleString(2) }} METAL
            </p>
            <p v-if="currency_type === 'USD'">
              ${{ estimatedRewardUSD.toLocaleString(2) }} USD
            </p>
          </div>
          <div>
            <label>{{ $t("earn.delegate.summary.fee") }}</label>
            <p v-if="currency_type === 'AVAX'">
              {{ totalFeeBig.toLocaleString(2) }} METAL
            </p>
            <p v-if="currency_type === 'USD'">
              ${{ totalFeeUsdBig.toLocaleString(2) }} USD
            </p>
          </div>

          <div>
            <label style="margin: 8px 0 !important">
              * {{ $t("earn.delegate.summary.warn") }}
            </label>
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
              {{ $t("earn.delegate.confirm") }}
            </v-btn>
            <template v-else>
              <v-btn
                block
                class="button_secondary"
                depressed
                :loading="isLoading"
                @click="submit"
              >
                {{ $t("earn.delegate.submit") }}
              </v-btn>
              <v-btn
                block
                style="color: var(--primary-color); margin-top: 20px"
                text
                @click="cancelConfirm"
              >
                {{ $t("earn.delegate.cancel") }}
              </v-btn>
            </template>
          </div>
        </div>
        <div v-else class="success_cont">
          <h2>{{ $t("earn.delegate.success.title") }}</h2>
          <p>{{ $t("earn.delegate.success.desc") }}</p>
          <p class="tx_id">Tx ID: {{ txId }}</p>
          <div class="tx_status">
            <div>
              <label>{{ $t("earn.delegate.success.status") }}</label>
              <p v-if="!txStatus">Waiting..</p>
              <p v-else>{{ txStatus }}</p>
            </div>
            <div class="status_icon">
              <Spinner v-if="!txStatus"></Spinner>
              <p v-if="txStatus === 'Committed'" style="color: var(--success)">
                <fa icon="check-circle"></fa>
              </p>
              <p v-if="txStatus === 'Dropped'" style="color: var(--error)">
                <fa icon="times-circle"></fa>
              </p>
            </div>
          </div>
          <div v-if="txReason" class="reason_cont">
            <label>{{ $t("earn.delegate.success.reason") }}</label>
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
    </div>
  </div>
</template>
<script lang="ts">
import type {
  AmountOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { WalletType } from "@/js/wallets/types";
import type { ValidatorListItem } from "@/stores/vuex/modules/platform/types";

import { bnToAvaxP } from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";

import { UTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm";
import Big from "big.js";
import moment from "moment";
import { defineComponent } from "vue";
import AvaxInput from "@/components/misc/AvaxInput.vue";
import CurrencySelect from "@/components/misc/CurrencySelect/CurrencySelect.vue";
import Expandable from "@/components/misc/Expandable.vue";
import Spinner from "@/components/misc/Spinner.vue";
import QrInput from "@/components/shared/QrInput.vue";
import DateForm from "@/components/wallet/earn/DateForm.vue";

import ConfirmPage from "@/components/wallet/earn/Delegate/ConfirmPage.vue";
import NodeCard from "@/components/wallet/earn/Delegate/NodeCard.vue";
import NodeSelection from "@/components/wallet/earn/Delegate/NodeSelection.vue";
import UtxoSelectForm from "@/components/wallet/earn/UtxoSelectForm.vue";
import { bnToBig, calculateStakingReward } from "@/helpers/helper";
import { sortUTxoSetP } from "@/helpers/sortUTXOs";
import { selectMaxUtxoForStaking } from "@/helpers/utxoSelection/selectMaxUtxoForStaking";
import { bintools, pChain } from "@/misc/AVA";

const MIN_MS = 60_000;
const HOUR_MS = MIN_MS * 60;
const DAY_MS = HOUR_MS * 24;

export const AddDelegator = defineComponent({
  components: {
    NodeCard,
    UtxoSelectForm,
    DateForm,
    Spinner,
    CurrencySelect,
    NodeSelection,
    AvaxInput,
    QrInput,
    ConfirmPage,
    Expandable,
  },
  emits: ["cancel"],
  data(): {
    search: string;
    selected: ValidatorListItem | null;
    stakeAmt: BN;
    startDate: string;
    endDate: string;
    rewardIn: string;
    rewardDestination: string;
    err: string;
    isLoading: boolean;
    isConfirm: boolean;
    isSuccess: boolean;
    txId: string;
    txStatus: string;
    txReason: null | string;
    formNodeID: string;
    formUtxos: UTXO[];
    formAmt: BN;
    formEnd: Date;
    formRewardAddr: string;
    currency_type: string;
    maxTxSizeAmount: BN | null;
  } {
    const maxTxSizeAmount: BN | null = null;
    const formEnd: Date = new Date();
    const formUtxos: UTXO[] = [];
    const txReason: null | string = null;
    const endDate: string = new Date().toISOString();
    const startDate: string = new Date(Date.now() + MIN_MS * 15).toISOString();
    const stakeAmt: BN = new BN(0);
    const selected: ValidatorListItem | null = null;

    return {
      search: "",
      selected,
      stakeAmt,
      startDate,
      endDate,
      rewardIn: "",
      rewardDestination: "local",
      err: "",
      isLoading: false,
      isConfirm: false,
      isSuccess: false,
      txId: "",
      txStatus: "",
      txReason,
      formNodeID: "",
      formUtxos,
      formAmt: new BN(0),
      formEnd,
      formRewardAddr: "",
      currency_type: "AVAX",
      maxTxSizeAmount,
    };
  },
  computed: {
    wallet(): WalletType {
      return this.$store.state.activeWallet;
    },
    estimatedReward(): Big {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const duration = end.getTime() - start.getTime(); // in ms

      const currentSupply = this.$store.state.Platform.currentSupply;

      const estimation = calculateStakingReward(
        this.stakeAmt,
        duration / 1000,
        currentSupply,
      );
      const res = Big(estimation.toString()).div(Math.pow(10, 9));
      return res;
    },
    estimatedRewardUSD() {
      return this.estimatedReward.times(this.avaxPrice);
    },
    avaxPrice(): Big {
      return Big(this.$store.state.prices.usd);
    },
    rewardAddressLocal() {
      const wallet: MnemonicWallet = this.$store.state.activeWallet;
      return wallet.getPlatformRewardAddress();
    },
    canSubmit(): boolean {
      if (this.stakeAmt.isZero()) {
        return false;
      }
      return true;
    },
    endMaxDate(): string | undefined {
      if (!this.selected) return undefined;

      return this.selected.endTime.toISOString();
    },
    stakingDuration(): number {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const dur = end.getTime() - start.getTime();
      return dur;
    },
    stakingDurationText(): string {
      const dur = this.stakingDuration;
      const d = moment.duration(dur, "milliseconds");
      // return d.humanize()
      const days = Math.floor(d.asDays());
      return `${days} days ${d.hours()} hours ${d.minutes()} minutes`;
    },
    minStake(): BN {
      return this.$store.state.Platform.minStakeDelegation;
    },
    delegationFee(): number {
      if (!this.selected) return 0;
      return this.selected.fee;
    },
    totalFee(): BN {
      const delegationFee = Big(this.delegationFee).div(Big(100));
      const cut = this.estimatedReward.times(delegationFee);

      const txFee: BN = pChain.getTxFee();
      const cutBN = new BN(cut.times(Math.pow(10, 9)).toFixed(0));
      const totFee = txFee.add(cutBN);
      return totFee;
    },
    totalFeeBig() {
      return bnToBig(this.totalFee, 9);
    },
    totalFeeUsdBig() {
      return this.totalFeeBig.times(this.avaxPrice);
    },
    txFee(): BN {
      return pChain.getTxFee();
    },
    txFeeBig(): Big {
      return bnToBig(this.txFee, 9);
    },
    feeText(): string {
      const big = this.totalFeeBig;
      return big.toLocaleString(0);
    },
    minAmt(): BN {
      return this.minStake.add(this.txFee);
    },
    remainingAmt(): BN {
      if (!this.selected) return new BN(0);
      // let totDel: BN = this.$store.getters["Platform/validatorTotalDelegated"](this.selected.nodeID);
      const nodeMaxStake: BN = this.$store.getters[
        "Platform/validatorMaxStake"
      ](this.selected);

      const totDel = this.selected.delegatedStake;
      const valAmt = this.selected.validatorStake;
      return nodeMaxStake.sub(totDel).sub(valAmt);
    },
    remainingAmtText() {
      const bn = this.remainingAmt;
      return bnToBig(bn, 9).toLocaleString();
    },
    utxosBalance(): BN {
      return this.formUtxos.reduce((acc, val) => {
        const out = val.getOutput() as AmountOutput;
        return acc.add(out.getAmount());
      }, new BN(0));
    },
    utxosBalanceBig(): Big {
      return bnToBig(this.utxosBalance, 9);
    },
    maxTxSizeString() {
      return this.maxTxSizeAmount ? bnToAvaxP(this.maxTxSizeAmount) : false;
    },
    maxAmt(): BN {
      const zero = new BN(0);

      const totAvailable = this.utxosBalance;

      if (zero.gt(totAvailable)) return zero;

      if (totAvailable.gt(this.remainingAmt)) return this.remainingAmt;

      return totAvailable;
    },
    showMaxTxSizeWarning() {
      return this.maxTxSizeAmount && this.maxTxSizeAmount.lt(this.maxAmt);
    },
    maxFormAmount() {
      return this.showMaxTxSizeWarning ? this.maxTxSizeAmount : this.maxAmt;
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
    bnToAvaxP,
    setEnd(val: string) {
      this.endDate = val;
    },
    onselect(val: ValidatorListItem) {
      this.search = "";
      this.selected = val;
    },
    async submit() {
      if (!this.formCheck()) {
        return;
      }
      this.isLoading = true;
      this.err = "";

      const wallet: WalletType = this.$store.state.activeWallet;

      // Start delegation in 5 minutes
      const startDate = new Date(Date.now() + 5 * MIN_MS);

      try {
        this.isLoading = false;
        const txId = await wallet.delegate(
          this.formNodeID,
          this.formAmt,
          startDate,
          this.formEnd,
          this.formRewardAddr,
          this.formUtxos as any,
        );
        this.isSuccess = true;
        this.txId = txId;
        this.updateTxStatus(txId);
      } catch (error) {
        this.onerror(error);
        this.isLoading = false;
      }
    },
    onsuccess(_: string) {
      this.$store.dispatch("Notifications/add", {
        type: "success",
        title: "Delegator Added",
        message: "Your tokens are now locked for staking.",
      });

      // Update History
      setTimeout(() => {
        this.$store.dispatch("Assets/updateUTXOs");
        this.$store.dispatch("History/updateTransactionHistory");
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
          this.onsuccess(txId);
        }
      }
    },
    onerror(e: any) {
      console.error(e);
      const msg: string = e.message;

      if (msg.includes("startTime")) {
        this.err = this.$t("earn.delegate.errs.start_end") as string;
        // this.err = "Start date must be in the future and end date must be after start date."
      } else if (msg.includes("address format")) {
        this.err = this.$t("earn.delegate.errs.invalid_addr") as string;
        // this.err = "Invalid address format. Your address must start with \"P-\"";
      } else {
        this.err = e.message;
      }
      this.$store.dispatch("Notifications/add", {
        type: "error",
        title: "Delegation Failed",
        message: "Failed to delegate tokens.",
      });
    },
    rewardSelect(val: "local" | "custom") {
      this.rewardIn = val === "local" ? this.rewardAddressLocal : "";
      this.rewardDestination = val;
    },
    formCheck(): boolean {
      this.err = "";

      if (!this.selected) {
        this.err = this.$t("earn.delegate.errs.no_node") as string;
        // this.err = "You must specify a validator."
        return false;
      }

      const startTime = new Date(this.startDate).getTime();
      const endTime = new Date(this.endDate).getTime();
      const now = Date.now();
      const diffTime = endTime - startTime;

      if (startTime <= now) {
        this.err = this.$t("earn.delegate.errs.start_now") as string;
        return false;
      }

      // TODO: UPDATE THIS WITH REAL VALUE
      if (diffTime < DAY_MS * 14) {
        this.err = this.$t("earn.delegate.errs.min_dur") as string;
        return false;
      }

      if (diffTime > DAY_MS * 365) {
        this.err = this.$t("earn.delegate.errs.max_dur") as string;
        return false;
      }

      const validatorEndtime = this.selected.endTime.getTime();

      if (endTime > validatorEndtime) {
        this.err = this.$t("earn.delegate.errs.val_end") as string;
        return false;
      }

      // Reward address check
      if (this.rewardDestination != "local" && !this.rewardIn) {
        this.err = this.$t("earn.delegate.errs.no_addr") as string;
        return false;
      }

      // Validate reward address
      try {
        bintools.stringToAddress(this.rewardIn);
      } catch {
        this.err = this.$t("earn.delegate.errs.invalid_addr") as string;
        // this.err = "Invalid reward address."
        return false;
      }

      // Stake amount check
      if (this.stakeAmt.lt(this.minStake)) {
        const big = bnToBig(this.minStake, 9);
        this.err = this.$t("earn.delegate.errs.amt", [
          big.toLocaleString(),
        ]) as string;
        return false;
      }

      return true;
    },
    updateFormData() {
      this.formNodeID = this.selected!.nodeID;
      this.formAmt = this.stakeAmt;
      this.formEnd = new Date(this.endDate);
      this.formRewardAddr = this.rewardIn;
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
    onFormUtxosChange() {
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
        false,
      )
        .then((res) => {
          this.maxTxSizeAmount = res.amount;
        })
        .catch(() => {
          this.maxTxSizeAmount = null;
        });
    },
  },
});
export default AddDelegator;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.add_delegator {
  height: 100%;
  padding-bottom: 5vh;
}

.node_selection {
  height: 100%;
}

.cols {
  display: grid;
  grid-template-columns: max-content 1fr 340px;
  column-gap: 2vw;
}

.ins_col {
  margin: 0px auto;
  align-self: flex-end;
  justify-self: flex-end;
  max-width: 490px;
  padding-bottom: 8vh;
}

form {
  width: 100%;
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

.close_but {
  padding: 2px 14px;
  font-size: 13px;
  border-radius: 6px;
  margin-bottom: 14px;
}

.node_col {
  max-width: 390px;
}
.selected {
  display: flex;
  flex-wrap: wrap;
  //width: max-content;
  //display: grid;
  position: relative;
  grid-template-columns: max-content max-content max-content;
  column-gap: 14px;
  background-color: var(--bg-light);
  border-radius: 6px;
  padding: 4px 0;
  padding-left: 34px;
  padding-right: 14px;

  .id_box {
    //grid-column: 1/3;
  }

  button {
    opacity: 0.4;
    &:hover {
      opacity: 1;
    }
  }
}

.amt_in {
  width: 100%;
}

.dates {
  display: flex;
  > div {
    flex-grow: 1;
    margin-right: 15px;
  }

  label > span {
    float: right;
    opacity: 0.4;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
  }
}

.reward_in {
  width: 100%;
  transition-duration: 0.2s;
  &[type="local"] {
    .reward_addr_in {
      opacity: 0.3;
      user-select: none;
      cursor: not-allowed;
      pointer-events: none;
      width: 100%;
      height: 40px;
      border-radius: 2px;
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

.desc {
  font-size: 13px;
  margin-bottom: 8px !important;
  color: var(--primary-color-light);
}

.amount_warning {
  color: var(--warning);
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

  .v-btn {
    margin-top: 14px;
  }
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

@include mixins.medium-device {
  .summary {
    > div {
      margin-bottom: 10px;
      p {
        font-size: 18px;
      }
    }
  }

  .cols {
    grid-template-columns: 220px 2fr 240px;
  }
}

@include mixins.mobile-device {
  .cols {
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

  .ins_col {
    width: 100%;
    max-width: 100%;
  }

  .close_but {
    width: 100%;
    padding: 12px;
  }

  .node_col {
    margin-bottom: 24px;
  }
}
</style>
