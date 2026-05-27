import type { Module } from "vuex";
import type { NetworkState } from "@/stores/vuex/modules/network/types";
import type { RootState } from "@/stores/vuex/types";

import {
  getConfigFromUrl,
  setNetworkAsync,
} from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";
import { AvaNetwork } from "@/js/AvaNetwork";
import { ava, avm, cChain, infoApi, pChain } from "@/misc/AVA";
import { web3 } from "@/misc/evm";
import { explorer_api } from "@/misc/explorer_api";
import { setSocketNetwork } from "@/providers";
import router from "@/router";
import {
  MainnetConfig,
  TestnetConfig,
} from "@/stores/vuex/modules/network/constants";

const network_module: Module<NetworkState, RootState> = {
  namespaced: true,
  state: {
    status: "disconnected", // disconnected | connecting | connected
    networks: [],
    networksCustom: [],
    selectedNetwork: null,
    txFee: new BN(0),
  },
  mutations: {
    addNetwork(state, net: AvaNetwork) {
      state.networks.push(net);
    },
  },
  getters: {
    allNetworks(state) {
      return state.networks.concat(state.networksCustom);
    },
  },
  actions: {
    addCustomNetwork({ state, dispatch }, net: AvaNetwork) {
      // Check if network alerady exists
      const networks = state.networksCustom;
      // Do not add if there is a network already with the same url
      for (const network of networks) {
        if (network) {
          const url = network.url;
          if (net.url === url) {
            return;
          }
        }
      }
      state.networksCustom.push(net);
      dispatch("save");
    },

    async removeCustomNetwork({ state, dispatch }, net: AvaNetwork) {
      const index = state.networksCustom.indexOf(net);
      state.networksCustom.splice(index, 1);
      await dispatch("save");
    },
    saveSelectedNetwork({ state }) {
      const data = JSON.stringify(state.selectedNetwork?.url);
      localStorage.setItem("network_selected", data);
    },
    async loadSelectedNetwork({ dispatch, getters }): Promise<boolean> {
      const data = localStorage.getItem("network_selected");
      if (!data) return false;
      try {
        // let net: AvaNetwork = JSON.parse(data);
        const nets: AvaNetwork[] = getters.allNetworks;

        for (const net of nets) {
          if (net && JSON.stringify(net.url) === data) {
            dispatch("setNetwork", net);
            return true;
          }
        }
        return false;
      } catch {
        return false;
      }
    },

    // Save custom networks to local storage
    save({ state }) {
      const data = JSON.stringify(state.networksCustom);
      localStorage.setItem("networks", data);
    },
    // Load custom networks from local storage
    load({ dispatch }) {
      const data = localStorage.getItem("networks");

      if (data) {
        const networks: AvaNetwork[] = JSON.parse(data);

        for (const n of networks) {
          const newCustom = new AvaNetwork(
            n.name,
            n.url,
            //@ts-ignore
            Number.parseInt(n.networkId),
            n.explorerUrl,
            n.explorerSiteUrl,
            n.readonly,
          );
          dispatch("addCustomNetwork", newCustom);
        }
      }
    },
    async setNetwork({ state, dispatch, commit, rootState }, net: AvaNetwork) {
      state.status = "connecting";

      // Chose if the network should use credentials
      await net.updateCredentials();
      ava.setRequestConfig("withCredentials", net.withCredentials);
      ava.setAddress(net.ip, net.port, net.protocol);
      ava.setNetworkID(net.networkId);

      // Reset transaction history
      commit("History/clear", null, { root: true });

      // Query the network to get network id
      const chainIdX = await infoApi.getBlockchainID("X");
      const chainIdP = await infoApi.getBlockchainID("P");
      const chainIdC = await infoApi.getBlockchainID("C");

      avm.refreshBlockchainID(chainIdX);
      avm.setBlockchainAlias("X");
      pChain.refreshBlockchainID(chainIdP);
      pChain.setBlockchainAlias("P");
      cChain.refreshBlockchainID(chainIdC);
      cChain.setBlockchainAlias("C");

      avm.getAVAXAssetID(true);
      pChain.getAVAXAssetID(true);
      cChain.getAVAXAssetID(true);

      state.selectedNetwork = net;
      dispatch("saveSelectedNetwork");

      // Update explorer api
      explorer_api.defaults.baseURL = net.explorerUrl;

      // Set web3 Network Settings
      const web3Provider = `${net.protocol}://${net.ip}:${net.port}/ext/bc/C/rpc`;
      web3.setProvider(web3Provider);

      // Set socket connections
      setSocketNetwork(net);

      commit("Assets/removeAllAssets", null, { root: true });
      await dispatch("Assets/updateAvaAsset", null, { root: true });

      // If authenticated
      if (rootState.isAuth) {
        // Go back to wallet page
        router.replace("/wallet");
        for (let i = 0; i < rootState.wallets.length; i++) {
          const w = rootState.wallets[i];
          w?.onnetworkchange();
        }
      }

      await dispatch("Assets/onNetworkChange", net, { root: true });
      dispatch("Assets/updateUTXOs", null, { root: true });
      dispatch("Platform/update", null, { root: true });
      dispatch("Platform/updateMinStakeAmount", null, { root: true });
      dispatch("updateTxFee");
      // Update tx history
      dispatch("History/updateTransactionHistory", null, { root: true });

      // Set the SDK Network
      const sdkNetConf = await getConfigFromUrl(net.getFullURL());
      await setNetworkAsync({
        ...sdkNetConf,
        explorerURL: net.explorerUrl,
        explorerSiteURL: net.explorerSiteUrl,
      });
      // state.isConnected = true;
      state.status = "connected";
      return true;
    },

    async updateTxFee({ state }) {
      const txFee = await infoApi.getTxFee();
      state.txFee = txFee.txFee;
      avm.setTxFee(txFee.txFee);
    },

    async init({ state, commit, dispatch }) {
      // Load custom networks if any
      try {
        await dispatch("load");
      } catch (error) {
        console.error(error);
      }

      commit("addNetwork", MainnetConfig);
      commit("addNetwork", TestnetConfig);

      try {
        const isSet = await dispatch("loadSelectedNetwork");
        if (!isSet) {
          await dispatch("setNetwork", state.networks[0]);
        }
        return true;
      } catch (error) {
        console.log(error);
        state.status = "disconnected";
      }
    },
  },
};

export default network_module;
