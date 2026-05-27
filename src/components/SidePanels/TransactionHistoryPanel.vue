<template>
  <div class="tx_history_panel">
    <div class="history_block" :disabled="!isActivityPage"></div>
    <div class="header">
      <h2>Transactions</h2>
      <Spinner v-if="isUpdating" class="spinner"></Spinner>
    </div>
    <div v-if="!isExplorer" class="empty">
      <h4>{{ $t("transactions.error_api") }}</h4>
      <p>{{ $t("transactions.error_api_desc") }}</p>
    </div>
    <div v-else-if="isEmpty && !isUpdating" class="empty">
      <p>{{ $t("transactions.notx") }}</p>
    </div>
    <div v-else class="list no_scroll_bar">
      <tx-history-row
        v-for="tx in transactions"
        :key="tx.txHash"
        class="tx_row"
        :transaction="tx"
      ></tx-history-row>
    </div>
  </div>
</template>
<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import Spinner from "@/components/misc/Spinner.vue";
import TxHistoryRow from "@/components/SidePanels/TxHistoryRow.vue";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNetworkStore } from "@/stores/pinia/networks";
import { useRootStore } from "@/stores/pinia/root";

export const TransactionHistoryPanel = defineComponent({
  components: {
    TxHistoryRow,
    Spinner,
  },
  computed: {
    ...mapState(useRootStore, {
      explorerUrl: (store) => {
        const addr = store.address?.split("-")[1] ?? "";
        return `https://explorer.avax.network/address/${addr}`;
      },
    }),
    ...mapState(useNetworkStore, {
      isExplorer: (store) => {
        const network = store.selectedNetwork;
        if (!network) return false;
        if (network.explorerUrl) {
          return true;
        }
        return false;
      },
    }),
    ...mapState(useHistoryStore, {
      isUpdating: "isUpdating",
      transactions: "recentTransactions",
    }),

    isEmpty(): boolean {
      if (this.transactions.length === 0) {
        return true;
      }
      return false;
    },
    isActivityPage() {
      if (this.$route.fullPath.includes("/activity")) {
        return true;
      }
      return false;
    },
  },
});
export default TransactionHistoryPanel;
</script>
<style scoped lang="scss">
.tx_history_panel {
  display: grid;
  grid-template-rows: max-content 1fr;
  overflow: auto;
  position: relative;
}

.header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--bg-light);
  padding: 8px 16px;

  h2 {
    font-size: 18px;
    font-weight: 500;
    color: var(--tertiary-color);
  }

  a {
    /*background-color: var(--primary-color);*/
    /*color: #fff !important;*/
    padding: 4px 18px;
    font-size: 12px;
  }
}

.spinner {
  display: block;
  align-self: center;
  margin: 0 !important;
}
.list {
  overflow: scroll;
  padding: 8px 16px;
  padding-bottom: 20px;
}

.empty {
  font-size: 12px;
  text-align: center;
  padding: 30px;
}

.tx_row {
  border-bottom: 1px solid var(--bg-light);

  &:last-of-type {
    border: none;
  }
}
.warn {
  background-color: var(--bg-light);
  text-align: center;
  font-size: 12px;
  font-weight: bold;
  padding: 15px;
}

.history_block {
  position: absolute;
  background-color: var(--bg-wallet);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 1;
  opacity: 0.8;
  pointer-events: none;
  transition-duration: 0.2s;

  &[disabled] {
    opacity: 0;
  }
}
</style>
