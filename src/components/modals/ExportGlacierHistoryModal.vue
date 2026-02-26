<template>
  <modal ref="modal" class="modal_main" title="Export Transaction History">
    <div class="csv_modal_body">
      <div>
        <label>Include Chains</label>
        <MultiSelect
          v-model="includeChains"
          :disabled="!!operationID"
          :keys="initialSelection"
          :labels="['X-Chain', 'P-Chain', 'C-Chain']"
          style="margin: 0px auto"
        ></MultiSelect>
        <label>Date Range</label>
        <RadioButtons
          v-model="timeframe"
          :disabled="!!operationID"
          :keys="timeframeOptions"
          :labels="timeframeOptions"
        ></RadioButtons>
        <div>
          <div>
            <label>From</label>
            <DateTimePicker
              v-model="formStartISO"
              class="date"
              :disabled="!!operationID || timeframe !== 'Custom'"
              :max-datetime="startDateMax"
              :min-datetime="startDateMin"
            ></DateTimePicker>
          </div>
          <div>
            <label>Until</label>
            <DateTimePicker
              v-model="formEndISO"
              class="date"
              :disabled="!!operationID || timeframe !== 'Custom'"
              :max-datetime="endDateMax"
              :min-datetime="endDateMin"
            ></DateTimePicker>
          </div>
        </div>
      </div>
      <v-btn
        v-if="!operationID"
        block
        class="button_secondary"
        depressed
        :disabled="!canSubmit"
        style="margin-top: 12px"
        @click="submit"
      >
        Generate
      </v-btn>
      <div style="justify-content: center; display: flex; padding: 1em">
        <Spinner v-if="loading"></Spinner>
        <p v-if="error" class="err">{{ error }}</p>
        <p v-if="downloadURL">Your file is ready to download.</p>
      </div>
      <template v-if="downloadURL || error">
        <v-btn
          v-if="downloadURL"
          block
          class="button_primary"
          depressed
          :disabled="!downloadURL"
          download
          :href="downloadURL"
        >
          Download
        </v-btn>
        <v-btn
          block
          class="restart_button"
          depressed
          variant="text"
          @click="reset"
        >
          Start Over
        </v-btn>
      </template>
    </div>
  </modal>
</template>
<script lang="ts">
import type { WalletType } from "@/js/wallets/types";
import { BlockchainId, OperationStatus } from "@metalblockchain/glacier-sdk";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import Spinner from "@/components/misc/Spinner.vue";
import Modal from "@/components/modals/Modal.vue";
import { setTimeoutInterval } from "@/helpers/setTimeoutInterval";
import glacier from "@/js/Glacier/Glacier";
import { useRootStore } from "@/stores/pinia/root";
import MultiSelect from "../misc/MultiSelect.vue";
import RadioButtons from "../misc/RadioButtons.vue";

const DAY = 24 * 60 * 60 * 1000;
const MONTH = 30 * DAY;

const TIMEOUT_SECONDS = 15;

type Timeframe =
  | "Last 3 Months"
  | "Last 6 Months"
  | "This Year"
  | "Last Year"
  | "All"
  | "Custom";

export const ExportGlacierHistoryModal = defineComponent({
  components: {
    Modal,
    MultiSelect,
    Spinner,
    RadioButtons,
  },
  data(): {
    operationID: string | null;
    downloadURL: string | null;
    loading: boolean;
    error: Error | null;
    endDate: Date;
    startDate: Date;
    timeframeOptions: Timeframe[];
    timeframe: Timeframe;
    includeChains: BlockchainId[];
    formEndISO: string;
    formStartISO: string;
    intervalPromise: Promise<void> | undefined;
  } {
    const endDate: Date = new Date();
    const startDate: Date = new Date(endDate.getTime() - DAY);
    const intervalPromise: Promise<void> | undefined = undefined;
    const formStartISO: string = startDate.toISOString();
    const formEndISO: string = endDate.toISOString();
    const includeChains: BlockchainId[] = [
      BlockchainId.X_CHAIN,
      BlockchainId.P_CHAIN,
      BlockchainId.C_CHAIN,
    ];
    const timeframe: Timeframe = "Last 3 Months";
    const timeframeOptions: Timeframe[] = [
      "Last 3 Months",
      "Last 6 Months",
      "This Year",
      "Last Year",
      "All",
      "Custom",
    ];

    const error: Error | null = null;
    const downloadURL: string | null = null;
    const operationID: string | null = null;

    return {
      operationID,
      downloadURL,
      loading: false,
      error,
      endDate,
      startDate,
      timeframeOptions,
      timeframe,
      includeChains,
      formEndISO,
      formStartISO,
      intervalPromise,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      wallet: "activeWallet",
    }),
    initialSelection() {
      return [BlockchainId.X_CHAIN, BlockchainId.P_CHAIN, BlockchainId.C_CHAIN];
    },
    canSubmit() {
      return this.includeChains.length;
    },
    startDateMax() {
      return new Date(this.formEndDate.getTime() - DAY).toISOString();
    },
    startDateMin() {
      return new Date(1_591_236_400).toISOString();
    },
    endDateMax() {
      return new Date().toISOString();
    },
    endDateMin() {
      return new Date(1_591_236_400).toISOString();
    },
    formStartDate() {
      return new Date(this.formStartISO);
    },
    formEndDate() {
      return new Date(this.formEndISO);
    },
    dateNow() {
      return new Date();
    },
    last3Months() {
      const date = new Date(this.dateNow.getTime() - 3 * MONTH);
      return date;
    },
    last6Months() {
      const date = new Date(this.dateNow.getTime() - 6 * MONTH);
      return date;
    },
    thisYear() {
      const date = new Date(`${this.dateNow.getFullYear()}-01-01`);
      return date;
    },
    lastYear() {
      const date = new Date(`${this.thisYear.getFullYear() - 1}-01-01`);
      return date;
    },
    dateAll() {
      const date = new Date(`2020-09-01`);
      return date;
    },
  },
  watch: {
    timeframe: [{ immediate: true, handler: "onTimeframe" }],
  },
  methods: {
    open(): void {
      this.reset();
      (this.$refs.modal as typeof Modal).open();
    },
    async checkStatus(): Promise<boolean> {
      if (!this.operationID || this.downloadURL) return true;

      const res = await glacier.operations.getOperationResult({
        operationId: this.operationID,
      });

      if (res.operationStatus == OperationStatus.COMPLETED) {
        this.downloadURL = res.metadata.downloadUrl || null;
        this.loading = false;
        return true;
      } else if (res.operationStatus == OperationStatus.FAILED) {
        this.onError(new Error(res.message));
        return true;
      } else if (res.operationStatus !== OperationStatus.RUNNING) {
        this.loading = false;
        return true;
      }
      return false;
    },
    onError(error: any) {
      this.loading = false;
      this.error = error;
    },
    generateCSVData() {
      const w = this.wallet;
      if (!w) return;
      w.startTxExportJob(
        this.formStartDate,
        this.formEndDate,
        this.includeChains,
      ).then((res: any) => {
        this.operationID = res.operationId;
        this.loading = true;

        this.intervalPromise = setTimeoutInterval(
          this.checkStatus,
          2000,
          TIMEOUT_SECONDS * 1000,
        ).catch((error) => {
          this.onError(error);
        });
      });
    },
    submit() {
      try {
        this.error = null;
        this.generateCSVData();
      } catch (error: any) {
        this.error = error;
      }
    },
    reset() {
      this.error = null;
      this.operationID = null;
      this.downloadURL = null;
      this.loading = false;
    },
    onTimeframe(val: Timeframe) {
      switch (val) {
        case "Last 3 Months": {
          this.formStartISO = this.last3Months.toISOString();
          this.formEndISO = this.dateNow.toISOString();
          break;
        }
        case "Last 6 Months": {
          this.formStartISO = this.last6Months.toISOString();
          this.formEndISO = this.dateNow.toISOString();
          break;
        }
        case "This Year": {
          this.formStartISO = this.thisYear.toISOString();
          this.formEndISO = this.dateNow.toISOString();
          break;
        }
        case "Last Year": {
          this.formStartISO = this.lastYear.toISOString();
          this.formEndISO = this.thisYear.toISOString();
          break;
        }
        case "All": {
          this.formStartISO = this.dateAll.toISOString();
          this.formEndISO = this.dateNow.toISOString();
          break;
        }
      }
    },
  },
});
export default ExportGlacierHistoryModal;
</script>
<style scoped lang="scss">
.csv_modal_body {
  width: 480px;
  max-width: 100%;
  padding: 10px 20px;

  label {
    font-size: 0.7em;
    font-weight: bold;
  }
}

.restart_button {
  margin-top: 0.5em;
  background-color: transparent !important;
  color: var(--primary-color);
}
</style>
