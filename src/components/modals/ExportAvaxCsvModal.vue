<template>
  <modal ref="modal" class="modal_main" title="Export AVAX Transfers">
    <div class="csv_modal_body">
      <p>
        Export AVAX transactions including cross chain transfers on X,P and C
        chains.
      </p>
      <p v-if="error" class="err">{{ error }}</p>
      <v-btn
        block
        class="button_secondary"
        depressed
        :disabled="!canSubmit"
        :loading="isLoading"
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
import type { ITransactionData } from "@/stores/vuex/modules/history/types";
import {
  createCsvNormal,
  getHistoryForOwnedAddresses,
} from "@metalblockchain/metal-wallet-sdk";

import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import { downloadCSVFile } from "@/stores/vuex/modules/history/history_utils";

export const ExportAvaxCsvModal = defineComponent({
  components: {
    Modal,
  },
  data() {
    const error: Error | null = null;

    return {
      error,
      isLoading: false,
    };
  },
  computed: {
    canSubmit() {
      return true;
    },
    transactions(): ITransactionData[] {
      return this.$store.state.History.allTransactions;
    },
    wallet() {
      return this.$store.state.activeWallet;
    },
    xAddresses(): string[] {
      return this.wallet.getAllAddressesX();
    },
    xAddressesStripped(): string[] {
      return this.xAddresses.map((addr: string) => addr.split("-")[1] ?? "");
    },
    avaxID() {
      return this.$store.state.Assets.AVA_ASSET_ID;
    },
  },
  methods: {
    open(): void {
      this.error = null;
      (this.$refs.modal as typeof Modal).open();
    },
    async generateCSVFile() {
      this.isLoading = true;

      try {
        const hist = await getHistoryForOwnedAddresses(
          this.wallet.getAllAddressesX(),
          this.wallet.getAllAddressesP(),
          this.wallet.getEvmAddressBech(),
          this.wallet.getEvmAddress(),
        );

        const encoding = "data:text/csv;charset=utf-8,";
        const csvContent = createCsvNormal(hist);
        downloadCSVFile(encoding + csvContent, "avax_transfers");
      } catch (error: any) {
        this.error = error;
      }
      this.isLoading = false;
    },
    submit() {
      try {
        this.error = null;
        this.generateCSVFile();
      } catch (error: any) {
        this.error = error;
      }
    },
  },
});
export default ExportAvaxCsvModal;
</script>
<style scoped lang="scss">
.csv_modal_body {
  width: 420px;
  max-width: 100%;
  padding: 10px 20px;
}
</style>
