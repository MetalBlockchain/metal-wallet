import type { TransactionType as GlacierTxType } from "@/js/Glacier/models";
import type { WalletType } from "@/js/wallets/types";
import { useRootStore } from "@/stores/pinia/root";
import { getGlacierHistory } from "@/stores/utils/getGlacierHistory";
import { isMainnetNetworkID } from "@/stores/utils/isMainnetNetworkID";
import { isTestnetNetworkID } from "@/stores/utils/isTestnetNetworkID";
import { useNetworkStore } from "./networks";

export interface IHistoryStore {
  recentTransactions: GlacierTxType[];
  allTransactions: GlacierTxType[];
  isUpdating: boolean;
  isError: boolean;
  isUpdatingAll: boolean;
}

function getDefaultState(): IHistoryStore {
  return {
    isUpdating: false,
    isError: false,
    isUpdatingAll: false,
    recentTransactions: [], // Used for the history sidepanel txs
    allTransactions: [], // Used for activity tab txs, paginates
  };
}

export const useHistoryStore = defineStore("history", {
  state: () => getDefaultState(),
  actions: {
    /**
     * Updates Recent transactions history
     */
    async updateTransactionHistory() {
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      if (!wallet) return;

      const networkStore = useNetworkStore();

      // If wallet is still loading delay
      const network = networkStore.selectedNetwork;

      if (!network) return;

      if (!wallet.isInit) {
        setTimeout(() => {
          this.updateTransactionHistory();
        }, 500);
        return;
      }

      // If not mainnet/testnet can not use explorer
      const isMainnet = isMainnetNetworkID(network.networkId);
      const isTestnet = isTestnetNetworkID(network.networkId);

      if (!isMainnet && !isTestnet) {
        return;
      }

      this.isUpdating = true;
      const txs = await getGlacierHistory(
        wallet as WalletType,
        network.networkId,
        isMainnet,
        30,
      );

      this.recentTransactions = txs;
      this.isUpdating = false;
    },

    async updateAllTransactionHistory() {
      this.isError = false;
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      if (!wallet) return;

      // If wallet is still loading delay
      // @ts-ignore
      const network = rootState.Network.selectedNetwork;

      if (!wallet.isInit) {
        setTimeout(() => {
          this.updateAllTransactionHistory();
        }, 500);
        return false;
      }

      // If not mainnet/testnet can not use explorer
      const isMainnet = isMainnetNetworkID(network.networkId);
      const isTestnet = isTestnetNetworkID(network.networkId);

      if (!isMainnet && !isTestnet) {
        return false;
      }

      this.isUpdatingAll = true;
      try {
        const txs = await getGlacierHistory(
          wallet as WalletType,
          network.networkId,
          isMainnet,
        );
        this.allTransactions = txs;
      } catch (error) {
        console.log(error);
        this.isError = true;
      }
      this.isUpdatingAll = false;
    },
    clear() {
      this.recentTransactions = [];
      this.allTransactions = [];
    },
  },
  getters: {
    stakingTxs(): GlacierTxType[] {
      const types = new Set([
        "AddValidatorTx",
        "AddDelegatorTx",
        "AddPermissionlessValidatorTx",
        "AddPermissionlessDelegatorTx",
      ]);
      return this.allTransactions.filter((tx) => {
        if (types.has(tx.txType)) {
          return true;
        }
        return false;
      });
    },
  },
});
