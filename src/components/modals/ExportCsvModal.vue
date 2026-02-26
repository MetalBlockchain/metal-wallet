<template>
  <modal ref="modal" class="modal_main" title="Export Rewards CSV">
    <div class="csv_modal_body">
      <p>Only rewarded transactions will be shown.</p>
      <div>
        <v-checkbox
          v-model="showValidation"
          dense
          hide-details
          label="Validation Rewards"
        ></v-checkbox>
        <v-checkbox
          v-model="showDelegation"
          dense
          hide-details
          label="Delegation Rewards"
        ></v-checkbox>
        <v-checkbox
          v-model="showFees"
          dense
          hide-details
          label="Delegation Fees Received"
        ></v-checkbox>
      </div>
      <p v-if="error" class="err">{{ error }}</p>
      <v-btn
        block
        class="button_secondary"
        depressed
        :disabled="!canSubmit"
        small
        style="margin-top: 12px"
        @click="submit"
      >
        Download CSV File
      </v-btn>
    </div>
  </modal>
</template>
<script lang="ts">
import type {
  CsvRowStakingData,
  CsvRowStakingTxType,
  ITransactionData,
} from "@/stores/types/history";
import moment from "moment";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import { bnToBig } from "@/helpers/helper";
import { getPriceAtUnixTime } from "@/helpers/price_helper";
import { useHistoryStore } from "@/stores/pinia/history";
import { useRootStore } from "@/stores/pinia/root";
import {
  createCSVContent,
  downloadCSVFile,
  getOutputTotals,
  getOwnedOutputs,
  getRewardOuts,
  getStakeAmount,
  stakingDataToCsvRow,
} from "@/stores/utils/history_utils";

export const ExportCsvModal = defineComponent({
  components: {
    Modal,
  },
  data() {
    const error: Error | null = null;

    return {
      showValidation: true,
      showDelegation: true,
      showFees: true,
      error,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      wallet: "activeWallet",
    }),
    ...mapState(useHistoryStore, {
      // TODO: Need to review this. Something seems to be wrong with types
      stakingTxs: (store) => store.stakingTxs as unknown as ITransactionData[],
      transactions: "allTransactions",
    }),
    canSubmit() {
      return this.showDelegation || this.showValidation || this.showFees;
    },
    pAddresses(): string[] {
      return this.wallet?.getAllAddressesP() ?? [];
    },
    pAddressesStripped(): string[] {
      return this.pAddresses.map((addr: string) => addr.split("-")[1] ?? "");
    },
  },
  methods: {
    open(): void {
      this.error = null;
      (this.$refs.modal as typeof Modal).open();
    },
    generateCSVData() {
      const myAddresses = this.pAddressesStripped;

      // Sort tx by stake end time
      // eslint-disable-next-line unicorn/no-array-sort
      const txsSorted = this.stakingTxs.sort((a, b) => {
        return b.validatorEnd - a.validatorEnd;
      });

      const rows: CsvRowStakingData[] = [];
      for (const tx of txsSorted) {
        const type = tx.type;
        const isRewarded = tx.rewarded;
        const txId = tx.id;

        // We dont care about txs not rewarded
        // TODO: we might care later
        if (!isRewarded) continue;

        const stakeAmount = getStakeAmount(tx);
        // Use validator end time for both delegation and validations as reward date
        const rewardMoment = moment(tx.validatorEnd * 1000);
        const startMoment = moment(tx.validatorStart * 1000);
        const durationMoment = moment.duration(rewardMoment.diff(startMoment));

        const nodeID = tx.validatorNodeID;

        const avaxPrice = getPriceAtUnixTime(rewardMoment.unix() * 1000);

        const myOuts = getOwnedOutputs(tx.outputs, myAddresses);
        const rewardOuts = getRewardOuts(myOuts);
        const rewardAmt = getOutputTotals(rewardOuts);
        const rewardAmtBig = bnToBig(rewardAmt, 9);
        const rewardAmtUsd = avaxPrice
          ? rewardAmtBig.mul(avaxPrice)
          : undefined;

        // Did this wallet receive any rewards?
        const isRewardOwner = rewardOuts.length > 0;

        // Did we send this staking transaction
        const ins = tx.inputs || [];
        const inputOuts = ins.map((input) => input.output);
        const myInputs = getOwnedOutputs(inputOuts, myAddresses);
        const isInputOwner = myInputs.length > 0;

        if (type === "add_delegator") {
          // Skip if user did not want delegation / fee rewards
          if (!this.showDelegation && !this.showFees) continue;

          // If user does not want delegation fees received, continue
          if (!isInputOwner && !this.showFees) continue;
          // If user does not want delegation rewards, continue
          if (isInputOwner && !this.showDelegation) continue;

          const type: CsvRowStakingTxType = isInputOwner
            ? "add_delegator"
            : "fee_received";

          //TODO: What if reward went to another wallet?
          // if (rewardOuts.length === 0) {
          // }

          rows.push({
            txId: txId,
            txType: type,
            stakeDate: startMoment,
            stakeDuration: durationMoment,
            stakeAmount: bnToBig(stakeAmount, 9),
            rewardDate: rewardMoment,
            rewardAmtAvax: rewardAmtBig,
            rewardAmtUsd: rewardAmtUsd,
            avaxPrice: avaxPrice,
            nodeID: nodeID,
            isRewardOwner: isRewardOwner,
            isInputOwner: isInputOwner,
            rewardDateUnix: tx.validatorEnd,
          });
        } else {
          // Skip if user did not want validation rewards
          if (!this.showValidation) continue;

          rows.push({
            txId: txId,
            txType: "add_validator",
            stakeDate: startMoment,
            stakeDuration: durationMoment,
            stakeAmount: bnToBig(stakeAmount, 9),
            rewardDate: rewardMoment,
            rewardAmtAvax: rewardAmtBig,
            rewardAmtUsd: rewardAmtUsd,
            avaxPrice: avaxPrice,
            nodeID: nodeID,
            isRewardOwner: isRewardOwner,
            isInputOwner: isInputOwner,
            rewardDateUnix: tx.validatorEnd,
          });
        }
      }

      const headers = [
        "Tx ID",
        "Type",
        "Node ID",
        "Stake Amount",
        "Stake Start Date",
        "Stake Duration",
        "Reward Date",
        "Reward Timestamp (UNIX)",
        "METAL Price at Reward Date",
        "Reward Received (METAL)",
        "Reward Received (USD)",
      ];

      // Convert data to valid CSV row string
      const rowArrays = rows.map((rowData) => stakingDataToCsvRow(rowData));

      const allRows = [headers, ...rowArrays];
      const csvContent = createCSVContent(allRows);

      downloadCSVFile(csvContent, "staking_rewards");
    },
    submit() {
      try {
        this.error = null;
        this.generateCSVData();
      } catch (error: any) {
        this.error = error;
      }
    },
  },
});
export default ExportCsvModal;
</script>
<style scoped lang="scss">
.csv_modal_body {
  width: 420px;
  max-width: 100%;
  padding: 10px 20px;
}
</style>
