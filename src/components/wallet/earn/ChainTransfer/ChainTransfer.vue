<template>
  <div>
    <div class="cols">
      <div class="form">
        <ChainSwapForm
          ref="form"
          :balance="balanceBig"
          :is-confirm="isConfirm"
          :max-amt="formMaxAmt"
          @change="onFormChange"
        ></ChainSwapForm>

        <div v-if="!isSuccess && !isLoading">
          <div v-if="!isImportErr" class="fees">
            <h4>{{ $t("earn.transfer.fee") }}</h4>

            <p>
              Export Fee
              <span>{{ exportFee.toLocaleString() }} METAL</span>
            </p>
            <p>
              Import Fee
              <span>{{ importFee.toLocaleString() }} METAL</span>
            </p>
            <p>
              <b>
                Total
                <span>{{ fee.toLocaleString() }} METAL</span>
              </b>
            </p>
          </div>
          <div>
            <p class="err">{{ err }}</p>
            <template v-if="isImportErr">
              <p>
                {{ $t("earn.transfer.err_desc") }}
              </p>
              <v-btn
                block
                class="button_secondary"
                depressed
                small
                @click="startAgain"
              >
                {{ $t("earn.transfer.success.again") }}
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                v-if="!isConfirm"
                block
                class="button_secondary"
                data-cy="confirm"
                depressed
                :disabled="!canSubmit"
                :loading="isLoading"
                @click="confirm"
              >
                {{ $t("earn.transfer.confirm") }}
              </v-btn>
              <template v-else>
                <v-btn
                  block
                  class="button_secondary"
                  data-cy="submit"
                  depressed
                  :loading="isLoading"
                  @click="submit"
                >
                  {{ $t("earn.transfer.submit") }}
                </v-btn>
                <v-btn
                  v-if="!isLoading"
                  block
                  data-cy="cancel"
                  depressed
                  style="
                    color: var(--secondary-color);
                    margin: 12px 0 !important;
                  "
                  text
                  @click="cancelConfirm"
                >
                  {{ $t("earn.transfer.cancel") }}
                </v-btn>
              </template>
            </template>
          </div>
        </div>
        <div v-if="isSuccess" class="complete">
          <h4>{{ $t("earn.transfer.success.title") }}</h4>
          <p style="color: var(--success); margin: 12px 0 !important">
            <fa icon="check-circle"></fa>
            {{ $t("earn.transfer.success.message") }}
          </p>
          <v-btn
            block
            class="button_secondary"
            depressed
            small
            @click="startAgain"
          >
            {{ $t("earn.transfer.success.again") }}
          </v-btn>
        </div>
      </div>
      <div class="right_col">
        <ChainCard :chain="sourceChain"></ChainCard>
        <ChainCard :chain="targetChain" :is-source="false"></ChainCard>
        <TxStateCard
          :reason="exportReason"
          :state="exportState"
          :status="exportStatus"
          :tx-id="exportId"
        ></TxStateCard>
        <TxStateCard
          :is-export="false"
          :reason="importReason"
          :state="importState"
          :status="importStatus"
          :tx-id="importId"
        ></TxStateCard>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { ChainSwapFormData } from "@/components/wallet/earn/ChainTransfer/types";
import type { ChainIdType } from "@/constants";
import type {
  ExportChainsC,
  ExportChainsP,
  ExportChainsX,
} from "@metalblockchain/metal-wallet-sdk";
import type {
  FeeConfig,
  FeeState,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import {
  avaxCtoX,
  Big,
  bigToBN,
  bnToAvaxX,
  bnToBig,
  bnToBigAvaxC,
  bnToBigAvaxX,
  GasHelper,
  TxHelper,
} from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import ChainCard from "@/components/wallet/earn/ChainTransfer/ChainCard.vue";
import ChainSwapForm from "@/components/wallet/earn/ChainTransfer/Form.vue";
import TxStateCard from "@/components/wallet/earn/ChainTransfer/TxState.vue";
import { TxState } from "@/components/wallet/earn/ChainTransfer/types";
import { sortUTxoSetP } from "@/helpers/sortUTXOs";
import { selectMaxUtxoForExportP } from "@/helpers/utxoSelection/selectMaxUtxoForExportP";
import { avm, cChain, pChain } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import { useRootStore } from "@/stores/pinia/root";

const IMPORT_DELAY = 5000; // in ms
const BALANCE_DELAY = 2000; // in ms

export const ChainTransfer = defineComponent({
  name: "ChainTransfer",
  components: {
    ChainCard,
    ChainSwapForm,
    TxStateCard,
  },
  data(): {
    sourceChain: ChainIdType;
    targetChain: ChainIdType;
    isLoading: boolean;
    amt: BN;
    err: string;
    isImportErr: boolean;
    isConfirm: boolean;
    isSuccess: boolean;
    formAmt: BN;
    baseFee: BN;
    importFee: Big;
    exportFee: Big;
    exportId: string;
    exportState: TxState;
    exportStatus: string | null;
    exportReason: string | null;
    importId: string;
    importState: TxState;
    importStatus: string | null;
    importReason: string | null;
    txMaxAmount: BN | undefined;
    feeConfig: FeeConfig | undefined;
    feeState: FeeState | undefined;
  } {
    const feeState: FeeState | undefined = undefined;
    const feeConfig: FeeConfig | undefined = undefined;
    const txMaxAmount: BN | undefined = undefined;
    const importReason: string | null = null;
    const importStatus: string | null = null;
    const importState: TxState = TxState.waiting;
    const exportReason: string | null = null;
    const exportStatus: string | null = null;
    const exportState: TxState = TxState.waiting;
    const exportFee: Big = new Big(0);
    const importFee: Big = new Big(0);
    const baseFee: BN = new BN(0);
    const formAmt: BN = new BN(0);
    const amt: BN = new BN(0);
    const targetChain: ChainIdType = "P";
    const sourceChain: ChainIdType = "X";

    return {
      sourceChain,
      targetChain,
      isLoading: false,
      amt,
      err: "",
      isImportErr: false,
      isConfirm: false,
      isSuccess: false,
      formAmt,
      baseFee,
      importFee,
      exportFee,
      exportId: "",
      exportState,
      exportStatus,
      exportReason,
      importId: "",
      importState,
      importStatus,
      importReason,
      txMaxAmount,
      feeConfig,
      feeState,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      wallet: (store) => store.activeWallet,
    }),
    ...mapState(useAssetsStore, {
      avmUnlocked: (store) => {
        if (!store.AssetAVA) return new BN(0);
        return store.AssetAVA.amount;
      },
      platformUnlocked: (store) => {
        return store.walletPlatformBalance.available;
      },
    }),
    evmUnlocked(): BN {
      if (!this.wallet) return new BN(0);
      const balRaw = this.wallet.ethBalance;
      return avaxCtoX(balRaw);
    },
    balanceBN(): BN {
      if (this.sourceChain === "P") {
        return this.platformUnlocked;
      } else if (this.sourceChain === "C") {
        return this.evmUnlocked;
      } else {
        return this.avmUnlocked;
      }
    },
    balanceBig(): Big {
      return bnToBig(this.balanceBN, 9);
    },
    formAmtText() {
      return bnToAvaxX(this.formAmt);
    },
    fee(): Big {
      return this.exportFee.add(this.importFee);
    },
    feeBN(): BN {
      return this.importFeeBN.add(this.exportFeeBN);
    },
    importFeeBN(): BN {
      return bigToBN(this.importFee, 9);
    },
    exportFeeBN(): BN {
      return bigToBN(this.exportFee, 9);
    },
    maxAmt(): BN {
      const max = this.balanceBN.sub(this.feeBN);

      return max.isNeg() || max.isZero() ? new BN(0) : max;
    },
    formMaxAmt() {
      const amt = this.txMaxAmount
        ? BN.min(this.maxAmt, this.txMaxAmount)
        : this.maxAmt;
      return BN.max(amt, new BN(0));
    },

    canSubmit() {
      if (this.amt.eq(new BN(0))) {
        return false;
      }

      if (this.amt.gt(this.formMaxAmt)) {
        return false;
      }

      return true;
    },
  },
  watch: {
    sourceChain: [
      {
        handler: "onChainChange",
      },
      {
        handler: "onChange",
      },
      {
        handler: "updateMaxTxSize",
      },
    ],
    targetChain: [
      {
        handler: "onChainChange",
      },
      {
        handler: "onChange",
      },
      {
        handler: "updateMaxTxSize",
      },
    ],
    amt: [
      {
        handler: "onChange",
      },
    ],
    balanceBN: [
      {
        handler: "updateMaxTxSize",
      },
    ],
    feeBN: [
      {
        handler: "updateMaxTxSize",
      },
    ],
    wallet: [
      {
        handler: "updateMaxTxSize",
      },
    ],
  },
  created() {
    this.updateBaseFee();
    this.getFeeVariables();
  },
  methods: {
    ...mapActions(useAssetsStore, ["updateUTXOs"]),
    ...mapActions(useHistoryStore, ["updateTransactionHistory"]),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    getFee(chain: ChainIdType, isExport: boolean): Big {
      if (chain === "X") {
        return bnToBigAvaxX(avm.getTxFee());
      } else if (chain === "P") {
        return bnToBigAvaxX(new BN(0));
      } else {
        if (!this.wallet) return bnToBigAvaxX(new BN(0));

        const fee = isExport
          ? GasHelper.estimateExportGasFeeFromMockTx(
              this.targetChain as ExportChainsC,
              this.amt,
              this.wallet.getEvmAddress(),
              this.wallet.getCurrentAddressPlatform(),
            )
          : GasHelper.estimateImportGasFeeFromMockTx(1, 1);

        let totFeeWei = this.baseFee.mul(new BN(fee));

        if (totFeeWei.lt(new BN("1000000000"))) {
          totFeeWei = new BN("1000000000");
        }

        return bnToBigAvaxC(totFeeWei);
      }
    },
    onFormChange(data: ChainSwapFormData) {
      this.amt = data.amount;
      this.sourceChain = data.sourceChain;
      this.targetChain = data.destinationChain;
    },
    confirm() {
      this.formAmt = this.amt.clone();
      this.isConfirm = true;
    },
    cancelConfirm() {
      this.isConfirm = false;
      this.formAmt = new BN(0);
    },
    async updateBaseFee() {
      this.baseFee = await GasHelper.getBaseFeeRecommended();
    },
    async getFeeVariables() {
      pChain.getFeeConfig().then((feeConfig) => {
        this.feeConfig = feeConfig;
      });
      pChain.getFeeState().then((feeState) => {
        this.feeState = feeState;
      });
    },
    async submit() {
      this.err = "";
      this.isLoading = true;
      this.isImportErr = false;

      try {
        this.chainExport(
          this.formAmt,
          this.sourceChain,
          this.targetChain,
        ).catch((error) => {
          this.onerror(error);
        });
      } catch (error) {
        this.onerror(error);
      }
    },
    async chainExport(
      amt: BN,
      sourceChain: ChainIdType,
      destinationChain: ChainIdType,
    ) {
      const wallet = this.wallet;
      if (wallet) {
        let exportTxId;
        this.exportState = TxState.started;

        switch (sourceChain) {
          case "X": {
            exportTxId = await wallet.exportFromXChain(
              amt,
              destinationChain as ExportChainsX,
              this.importFeeBN,
            );
            break;
          }
          case "P": {
            exportTxId = await wallet.exportFromPChain(
              amt,
              destinationChain as ExportChainsP,
              this.importFeeBN,
            );
            break;
          }
          case "C": {
            exportTxId = await wallet.exportFromCChain(
              amt,
              destinationChain as ExportChainsC,
              this.exportFeeBN,
            );
            break;
          }
        }

        this.exportId = exportTxId;
        this.waitExportStatus(exportTxId);
      }
    },
    async waitExportStatus(txId: string, remainingTries = 15) {
      let status;
      if (this.sourceChain === "X") {
        status = await avm.getTxStatus(txId);
      } else if (this.sourceChain === "P") {
        const resp = await pChain.getTxStatus(txId);
        if (typeof resp === "string") {
          status = resp;
        } else {
          status = resp.status;
          this.exportReason = resp.reason;
        }
      } else {
        const resp = await cChain.getAtomicTxStatus(txId);
        status = resp;
      }
      this.exportStatus = status;

      if (status === "Unknown" || status === "Processing") {
        // If out of tries
        if (remainingTries <= 0) {
          this.exportState = TxState.failed;
          this.exportStatus = "Timeout";
          return false;
        }

        // if not confirmed ask again
        setTimeout(() => {
          this.waitExportStatus(txId, remainingTries - 1);
        }, 1000);
        return false;
      } else if (status === "Dropped") {
        // If dropped stop the process
        this.exportState = TxState.failed;
        return false;
      } else {
        // If success start import
        this.exportState = TxState.success;

        // Because the API nodes are behind a load balancer we are waiting for all api nodes to update
        this.importState = TxState.started;
        this.importStatus = "Waiting";
        setTimeout(() => {
          this.chainImport();
        }, IMPORT_DELAY);
      }

      return true;
    },
    async chainImport(canRetry = true) {
      const wallet = this.wallet;
      if (wallet) {
        let importTxId;
        try {
          if (this.targetChain === "P") {
            importTxId = await wallet.importToPlatformChain(
              this.sourceChain as ExportChainsP,
            );
          } else if (this.targetChain === "X") {
            importTxId = await wallet.importToXChain(
              this.sourceChain as ExportChainsX,
            );
          } else {
            //TODO: Import only the exported UTXO

            importTxId = await wallet.importToCChain(
              this.sourceChain as ExportChainsC,
              this.importFeeBN,
            );
          }
        } catch (error) {
          // Retry import one more time
          if (canRetry) {
            setTimeout(() => {
              this.chainImport(false);
            }, IMPORT_DELAY);
            return;
          }
          this.onerror(error);
          this.onErrorImport(error);
          return;
        }

        this.importId = importTxId;
        this.importState = TxState.started;

        this.waitImportStatus(importTxId);
      }
    },
    async waitImportStatus(txId: string) {
      let status;

      if (this.targetChain === "X") {
        status = await avm.getTxStatus(txId);
      } else if (this.targetChain === "P") {
        const resp = await pChain.getTxStatus(txId);
        status = typeof resp === "string" ? resp : resp.status;
      } else {
        const resp = await cChain.getAtomicTxStatus(txId);
        status = resp;
      }

      this.importStatus = status;

      if (status === "Unknown" || status === "Processing") {
        // if not confirmed ask again
        setTimeout(() => {
          this.waitImportStatus(txId);
        }, 1000);
        return false;
      } else if (status === "Dropped") {
        // If dropped stop the process
        this.importState = TxState.failed;
        return false;
      } else {
        // If success display success page
        this.importState = TxState.success;
        this.onsuccess();
      }

      return true;
    },
    onerror(err: any) {
      console.error(err);
      this.isLoading = false;
      this.err = err;
      this.addNotification({
        type: "error",
        title: "Transfer Failed",
        message: err,
      });
    },
    onErrorImport(_: any) {
      this.importState = TxState.failed;
      this.isImportErr = true;
    },
    startAgain() {
      (this.$refs.form as typeof ChainSwapForm).clear();

      this.err = "";
      this.isImportErr = false;
      this.isConfirm = false;
      this.isLoading = false;
      this.isSuccess = false;

      this.exportId = "";
      this.exportState = TxState.waiting;
      this.exportStatus = null;
      this.exportReason = null;

      this.importId = "";
      this.importState = TxState.waiting;
      this.importStatus = null;
      this.importReason = null;
    },
    onsuccess() {
      // Clear Form
      this.isSuccess = true;
      this.addNotification({
        type: "success",
        title: "Transfer Complete",
        message: "Funds transferred between chains.",
      });

      setTimeout(() => {
        this.updateUTXOs();
        this.updateTransactionHistory();
      }, BALANCE_DELAY);
    },
    onChainChange() {
      if (this.sourceChain === "C" || this.targetChain === "C") {
        this.updateBaseFee();
      }
    },
    onChange() {
      if (this.targetChain == "P" && this.amt.gt(new BN(0))) {
        TxHelper.calculatePlatformImportFee().then((fee: any) => {
          this.importFee = bnToBig(fee, 9);
        });
      } else {
        this.importFee = this.getFee(this.targetChain, false);
      }

      if (this.sourceChain == "P" && this.amt.gt(new BN(0)) && this.wallet) {
        const utxos = this.wallet.getPlatformUTXOSet();
        const fromAddrs = this.wallet.getAllAddressesP();
        const destinationAddr =
          this.targetChain === "C"
            ? this.wallet.getEvmAddressBech()
            : this.wallet.getCurrentAddressAvm();
        const pChangeAddr = this.wallet.getCurrentAddressPlatform();

        TxHelper.calculatePlatformExportFee(
          utxos,
          fromAddrs,
          destinationAddr,
          this.amt,
          pChangeAddr,
          this.targetChain as ExportChainsP,
        ).then((fee: any) => {
          this.exportFee = bnToBig(fee, 9);
        });
      } else {
        this.exportFee = this.getFee(this.sourceChain, true);
      }
    },
    updateMaxTxSize() {
      if (
        this.sourceChain !== "P" ||
        this.targetChain === "P" ||
        !this.wallet
      ) {
        this.txMaxAmount = undefined;
        return;
      }

      const utxoSet = this.wallet.getPlatformUTXOSet();
      const sortedSet = sortUTxoSetP(utxoSet, false);

      const res = selectMaxUtxoForExportP(sortedSet.getAllUTXOs());
      // The maximum form amount is = max possible export amount - export and import fees
      this.txMaxAmount = res.amount.sub(this.feeBN);
    },
  },
});
export default ChainTransfer;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.cols {
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 5vw;
}

.right_col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 14px;
  row-gap: 2px;
  padding-top: 14px;
  height: max-content;
  //height: 100%;
  > div {
    //height: max-content;
    background-color: var(--bg-light);
    border-radius: 4px;
    padding: 12px 18px;
    box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.1);
  }
}

.form {
  max-width: 100%;
  width: 360px;
  padding-bottom: 14px;
  //justify-self: center;
  > div {
    margin: 14px 0;
  }
}
.dropdown {
  background-color: var(--bg-light);
}

.chain {
  font-size: 32px;
  text-align: center;
  justify-content: center;
}
.chains {
  position: relative;
  //text-align: center;
  display: grid;
  grid-template-rows: max-content max-content;
  row-gap: 14px;
  //margin: 0 !important;
  //column-gap: 4px;
  //grid-template-columns: 1fr 1fr;
}

.chain_cont {
  background-color: var(--bg-light);
  padding: 14px;
}

.switch_but {
  position: absolute;
  left: 50%;
  border: 3px solid var(--bg-wallet-light);
  transform: translateX(-50%);
}

label {
  color: var(--primary-color-light);
}

.meta {
  display: grid;
  grid-template-columns: max-content max-content;
  column-gap: 2em;
}

h2 {
  font-weight: lighter;
  font-size: 2em;
}
.import_err {
  max-width: 320px;
  //margin: 10vh auto;
  color: var(--primary-color);

  p {
    margin: 6px 0 !important;
    margin-bottom: 14px !important;
    color: var(--primary-color-light);
  }
}

.loading_col {
  max-width: 320px;

  > div {
    position: relative;
    background-color: var(--bg-light);
    padding: 14px;
    margin-bottom: 6px;

    &[state="0"] {
      opacity: 0.2;
    }

    &[state="2"] {
      .status_icon {
        color: var(--success);
      }
    }

    &[state="-1"] {
      .status_icon {
        color: var(--error);
      }
    }

    p {
      word-break: break-all;
      font-size: 13px;
    }
  }

  label {
    font-weight: bold;
    font-size: 12px;
  }

  /*.status_icon{*/
  /*    position: absolute;*/
  /*    top: 8px;*/
  /*    right: 12px;*/
  /*}*/

  .loading_header {
    display: flex;
    justify-content: space-between;
  }

  .spinner {
    color: var(--primary-color) !important;
  }
}

.fees {
  margin: 14px 0;
  border-top: 1px solid var(--bg-light);
  padding-top: 14px;
}

.fees p {
  text-align: left;
  font-size: 13px;
  color: var(--primary-color-light);
}

.fees span {
  float: right;
}

.complete {
  margin-top: 30px;
  > div {
    background-color: var(--bg-light);
    padding: 14px;
    margin: 4px 0;
  }

  .desc {
    margin: 6px 0 !important;
    color: var(--primary-color-light);
  }

  p {
    word-break: keep-all !important;
  }
}

@include mixins.medium-device {
  .cols {
    //display: grid;
    //grid-template-columns: 1fr 2fr;
    grid-template-columns: none;
    //column-gap: 2vw;
  }
  .right_col {
    //grid-template-columns: 1fr 1fr;
    //row-gap: 14px;
    //display: none;
    grid-column: 1;
    grid-row: 1;
  }
}

@include mixins.mobile-device {
  .cols {
    display: block;
    padding-bottom: 3vh;
  }

  .form {
    width: 100%;
  }
  .chains {
    row-gap: 4px;
    grid-template-columns: none;
    grid-template-rows: max-content max-content;
  }
}
</style>
