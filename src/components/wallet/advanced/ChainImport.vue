<template>
  <div class="chain_import">
    <h2>{{ $t("advanced.import.title") }}</h2>
    <p
      style="margin-bottom: 14px !important; font-size: 14px; font-weight: 500"
    >
      {{ $t("advanced.import.desc") }}
    </p>
    <div v-if="isSuccess" class="is_success">
      <label>Tx ID</label>
      <p class="tx_id">{{ txId }}</p>
    </div>
    <p v-else-if="err" class="err">{{ err }}</p>
    <template v-if="!isLoading">
      <v-btn
        block
        class="button_secondary"
        depressed
        small
        @click="atomicImportX('P')"
      >
        Import X (From P)
      </v-btn>
      <v-btn
        block
        class="button_secondary"
        depressed
        small
        @click="atomicImportX('C')"
      >
        Import X (From C)
      </v-btn>
      <v-btn
        block
        class="button_secondary"
        depressed
        small
        @click="atomicImportP('X')"
      >
        Import P (From X)
      </v-btn>
      <v-btn
        block
        class="button_secondary"
        depressed
        small
        @click="atomicImportP('C')"
      >
        Import P (From C)
      </v-btn>
      <v-btn
        v-if="isEVMSupported"
        block
        class="button_secondary"
        depressed
        small
        @click="atomicImportC('X')"
      >
        Import C (from X)
      </v-btn>
      <v-btn
        block
        class="button_secondary"
        depressed
        small
        @click="atomicImportC('P')"
      >
        Import C (from P)
      </v-btn>
    </template>
    <Spinner v-else class="spinner"></Spinner>
  </div>
</template>
<script lang="ts">
import type {
  ExportChainsC,
  ExportChainsP,
  ExportChainsX,
} from "@metalblockchain/metal-wallet-sdk";
import { avaxCtoX, GasHelper } from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import Spinner from "@/components/misc/Spinner.vue";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import { useRootStore } from "@/stores/pinia/root";

export const ChainImport = defineComponent({
  components: { Spinner },
  data() {
    return {
      err: "",
      isSuccess: false,
      isLoading: false,
      txId: "",
    };
  },
  computed: {
    ...mapState(useRootStore, {
      wallet: (store) => {
        return store.activeWallet;
      },
    }),
    isEVMSupported() {
      if (!this.wallet) return false;
      return this.wallet.ethAddress;
    },
  },
  deactivated() {
    this.err = "";
    this.txId = "";
    this.isSuccess = false;
  },
  methods: {
    ...mapActions(useAssetsStore, ["updateUTXOs"]),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    ...mapActions(useHistoryStore, ["updateTransactionHistory"]),
    async atomicImportX(sourceChain: ExportChainsX) {
      this.beforeSubmit();
      if (!this.wallet) return;

      // // Import from C
      try {
        const txId = await this.wallet.importToXChain(sourceChain);
        this.onSuccess(txId);
      } catch (error: any) {
        if (this.isSuccess) return;
        this.onError(error);
      }
    },
    async atomicImportP(source: ExportChainsP) {
      this.beforeSubmit();
      if (!this.wallet) return;
      try {
        const txId = await this.wallet.importToPlatformChain(source);
        this.onSuccess(txId);
      } catch (error: any) {
        this.onError(error);
      }
    },
    async atomicImportC(source: ExportChainsC) {
      this.beforeSubmit();
      if (!this.wallet) return;
      try {
        const utxoSet = await this.wallet.evmGetAtomicUTXOs(source);
        const utxos = utxoSet.getAllUTXOs();

        const numIns = utxos.length;
        const baseFee = await GasHelper.getBaseFeeRecommended();

        if (numIns === 0) {
          throw new Error("Nothing to import.");
        }

        // Calculate number of signatures
        const numSigs = utxos.reduce((acc, utxo) => {
          return acc + utxo.getOutput().getAddresses().length;
        }, 0);

        const gas = GasHelper.estimateImportGasFeeFromMockTx(numIns, numSigs);

        let totFee = baseFee.mul(new BN(gas));
        if (totFee.lt(new BN("1000000000"))) {
          totFee = new BN("1000000000");
        }
        const txId = await this.wallet.importToCChain(source, avaxCtoX(totFee));
        this.onSuccess(txId);
      } catch (error: any) {
        this.onError(error);
      }
    },
    beforeSubmit() {
      this.isLoading = true;
      this.err = "";
      this.isSuccess = false;
      this.txId = "";
    },
    onSuccess(txId: string) {
      this.isLoading = false;
      this.err = "";
      this.isSuccess = true;
      this.txId = txId;

      this.addNotification({
        type: "success",
        title: "Import Success",
        message: txId,
      });

      setTimeout(() => {
        this.updateUTXOs();
        this.updateTransactionHistory();
      }, 3000);
    },
    onError(err: Error) {
      this.isLoading = false;
      if (err.message.includes("No atomic")) {
        this.err = "Nothing found to import.";
        return;
      } else {
        this.err = err.message;
      }
    },
  },
});
export default ChainImport;
</script>
<style scoped lang="scss">
h2 {
  font-size: 20px;
  font-weight: 500;
  color: var(--tertiary-color);
  margin-bottom: 16px;
}
.v-btn {
  margin: 8px 0;
}

.is_success {
  label {
    color: var(--primary-color-light);
  }
}

.spinner {
  color: var(--primary-color) !important;
  margin: 14px auto !important;
}

.tx_id {
  font-size: 13px;
  word-break: break-all;
}
</style>
