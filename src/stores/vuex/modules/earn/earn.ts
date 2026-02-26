import type { Module } from "vuex";
import type { RootState } from "@/stores/types";
import type { EarnState } from "@/stores/types/earn";
import { listStakingForAddresses } from "@/js/Glacier/listStakingForAddresses";

const ledger_module: Module<EarnState, RootState> = {
  namespaced: true,
  state: {
    stakingTxs: [],
  },
  mutations: {},
  actions: {
    async refreshRewards({ state, rootState }) {
      const addrs = rootState.activeWallet?.getAllAddressesP() ?? [];
      state.stakingTxs = await listStakingForAddresses(addrs);
    },
  },
};

export default ledger_module;
