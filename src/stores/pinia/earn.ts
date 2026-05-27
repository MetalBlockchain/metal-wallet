import type { PChainTransaction } from "@metalblockchain/glacier-sdk";

import { listStakingForAddresses } from "@/js/Glacier/listStakingForAddresses";
import { useRootStore } from "@/stores/pinia/root";

export interface IEarnStore {
  stakingTxs: PChainTransaction[];
}

function getDefaultState(): IEarnStore {
  return {
    stakingTxs: [],
  };
}

export const useEarnStore = defineStore("earn", {
  state: () => getDefaultState(),
  actions: {
    async refreshRewards() {
      const rootStore = useRootStore();

      const addrs = rootStore.activeWallet?.getAllAddressesP() ?? [];
      this.stakingTxs = await listStakingForAddresses(addrs);
    },
  },
});
