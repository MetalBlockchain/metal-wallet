import type { NetworkStatus } from "@/stores/types/network";
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
import { MainnetConfig, TestnetConfig } from "@/stores/constants/network";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useHistoryStore } from "@/stores/pinia/history";
import { usePlatformStore } from "@/stores/pinia/platform";
import { useRootStore } from "@/stores/pinia/root";

export interface INetworkStore {
  networks: AvaNetwork[];
  networksCustom: AvaNetwork[];
  selectedNetwork: null | AvaNetwork;
  // isConnected: boolean
  status: NetworkStatus;

  txFee: BN;
}

function getDefaultState(): INetworkStore {
  return {
    status: "disconnected", // disconnected | connecting | connected
    networks: [],
    networksCustom: [],
    selectedNetwork: null,
    txFee: new BN(0),
  };
}

export const useNetworkStore = defineStore("network", {
  state: () => getDefaultState(),
  actions: {
    addCustomNetwork(net: AvaNetwork) {
      // Check if network alerady exists
      const networks = this.networksCustom;
      // Do not add if there is a network already with the same url
      for (const network of networks) {
        if (network) {
          const url = network.url;
          if (net.url === url) {
            return;
          }
        }
      }
      this.networksCustom.push(net);
      this.save();
    },

    removeCustomNetwork(net: AvaNetwork) {
      const index = this.networksCustom.indexOf(net);
      this.networksCustom.splice(index, 1);
      this.save();
    },
    saveSelectedNetwork() {
      const data = JSON.stringify(this.selectedNetwork?.url);
      localStorage.setItem("network_selected", data);
    },
    loadSelectedNetwork(): boolean {
      const data = localStorage.getItem("network_selected");
      if (!data) return false;
      try {
        // let net: AvaNetwork = JSON.parse(data);
        const nets: AvaNetwork[] = this.allNetworks;

        for (const net of nets) {
          if (net && JSON.stringify(net.url) === data) {
            this.setNetwork(net);
            return true;
          }
        }
        return false;
      } catch {
        return false;
      }
    },

    // Save custom networks to local storage
    save() {
      const data = JSON.stringify(this.networksCustom);
      localStorage.setItem("networks", data);
    },
    // Load custom networks from local storage
    load() {
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
          this.addCustomNetwork(newCustom);
        }
      }
    },
    async setNetwork(net: AvaNetwork) {
      const router = useRouter();
      const rootStore = useRootStore();
      const historyStore = useHistoryStore();
      const assetsStore = useAssetsStore();
      const platformStore = usePlatformStore();
      this.status = "connecting";

      // Chose if the network should use credentials
      await net.updateCredentials();
      ava.setRequestConfig("withCredentials", net.withCredentials);
      ava.setAddress(net.ip, net.port, net.protocol);
      ava.setNetworkID(net.networkId);

      // Reset transaction history
      historyStore.clear();

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

      this.selectedNetwork = net;
      this.saveSelectedNetwork();

      // Update explorer api
      explorer_api.defaults.baseURL = net.explorerUrl;

      // Set web3 Network Settings
      const web3Provider = `${net.protocol}://${net.ip}:${net.port}/ext/bc/C/rpc`;
      web3.setProvider(web3Provider);

      // Set socket connections
      setSocketNetwork(net);

      assetsStore.removeAllAssets();
      await assetsStore.updateAvaAsset();

      // If authenticated
      if (rootStore.isAuth) {
        // Go back to wallet page
        router.replace("/wallet");
        for (let i = 0; i < rootStore.wallets.length; i++) {
          const w = rootStore.wallets[i];
          w?.onnetworkchange();
        }
      }

      await assetsStore.onNetworkChange();
      assetsStore.updateUTXOs();
      platformStore.update();
      platformStore.updateMinStakeAmount();
      this.updateTxFee();
      // Update tx history
      historyStore.updateTransactionHistory();

      // Set the SDK Network
      const sdkNetConf = await getConfigFromUrl(net.getFullURL());
      await setNetworkAsync({
        ...sdkNetConf,
        explorerURL: net.explorerUrl,
        explorerSiteURL: net.explorerSiteUrl,
      });
      // state.isConnected = true;
      this.status = "connected";
      return true;
    },

    async updateTxFee() {
      const txFee = await infoApi.getTxFee();
      this.txFee = txFee.txFee;
      avm.setTxFee(txFee.txFee);
    },

    async init() {
      // Load custom networks if any
      try {
        this.load();
      } catch (error) {
        console.error(error);
      }

      this.addNetwork(MainnetConfig);
      this.addNetwork(TestnetConfig);

      try {
        const isSet = this.loadSelectedNetwork();
        const network = this.networks[0];
        if (!isSet && network) {
          await this.setNetwork(network);
        }
        return true;
      } catch (error) {
        console.log(error);
        this.disconnect();
      }
    },
    addNetwork(net: AvaNetwork) {
      this.networks.push(net);
    },
    resetNetwork() {
      this.selectedNetwork = null;
      this.disconnect();
    },
    disconnect() {
      this.status = "disconnected";
    },
  },
  getters: {
    allNetworks(): AvaNetwork[] {
      return this.networks.concat(this.networksCustom);
    },
  },
});
