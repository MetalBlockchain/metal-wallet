<template>
  <div class="list_cont no_scroll_bar">
    <v-tabs v-model="tab" grow>
      <v-tab value="internal">Internal</v-tab>
      <v-tab value="external">External</v-tab>
      <v-tab value="platform">Platform</v-tab>
    </v-tabs>
    <v-tabs-window v-model="tab">
      <v-tabs-window-item value="internal">
        <HdChainTable
          :addresses="addrsInternal"
          :balance-dict="keyBalancesInternal"
          :helper="internalHelper"
          :path="1"
          :wallet="wallet"
        ></HdChainTable>
      </v-tabs-window-item>
      <v-tabs-window-item value="external">
        <HdChainTable
          :addresses="addrsExternal"
          :balance-dict="keyBalancesExternal"
          :helper="externalHelper"
          :path="0"
          :wallet="wallet"
        ></HdChainTable>
      </v-tabs-window-item>
      <v-tabs-window-item value="platform">
        <HdChainTable
          :addresses="addrsPlatform"
          :balance-dict="keyBalancesPlatform"
          :helper="platformHelper"
          :path="0"
          :wallet="wallet"
        ></HdChainTable>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>
<script lang="ts">
import type { BN } from "@metalblockchain/metaljs";
import type { UTXOSet as AVMUTXOSet } from "@metalblockchain/metaljs/dist/apis/avm";

import type { UTXOSet as PlatformUTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm";
import type { PropType } from "vue";
import type { DerivationListBalanceDict } from "@/components/modals/HdDerivationList/types";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import { defineComponent } from "vue";
import HdChainTable from "@/components/modals/HdDerivationList/HdChainTable.vue";
import { bnToBig } from "@/helpers/helper";
import { bintools } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";

export const HDDerivationList = defineComponent({
  components: {
    HdChainTable,
  },
  props: {
    wallet: {
      type: Object as PropType<MnemonicWallet>,
    },
  },
  setup() {
    const assetsStore = useAssetsStore();
    return {
      assetsStore,
    };
  },
  data() {
    const addrsPlatform: string[] = [];
    const addrsInternal: string[] = [];
    const addrsExternal: string[] = [];
    const tab = "internal";

    return {
      addrsExternal,
      addrsInternal,
      addrsPlatform,
      tab,
    };
  },
  computed: {
    internalHelper() {
      return this.wallet?.internalHelper;
    },
    externalHelper() {
      return this.wallet?.externalHelper;
    },
    platformHelper() {
      return this.wallet?.platformHelper;
    },
    assetsDict() {
      return this.assetsStore.assetsDict;
    },
    keyBalancesExternal(): DerivationListBalanceDict[] {
      const wallet = this.wallet;
      const utxoSet = wallet?.externalHelper.utxoSet as AVMUTXOSet;
      const addrs = this.addrsExternal;

      return this.utxoSetToBalanceDict(utxoSet, addrs);
    },
    keyBalancesInternal(): DerivationListBalanceDict[] {
      const wallet = this.wallet;
      const utxoSet = wallet?.internalHelper.utxoSet;
      if (!utxoSet) return [];
      const addrs = this.addrsInternal;
      return this.utxoSetToBalanceDict(utxoSet, addrs);
    },
    keyBalancesPlatform(): DerivationListBalanceDict[] {
      const wallet = this.wallet;
      const utxoSet = wallet?.platformHelper.utxoSet;
      if (!utxoSet) return [];
      const addrs = this.addrsPlatform;
      return this.utxoSetToBalanceDict(utxoSet, addrs);
    },
  },
  watch: {
    "wallet.internalHelper.utxoSet": [
      { immediate: true, handler: "onInternalUtxoChange" },
    ],
    "wallet.externalHelper.utxoSet": [
      { immediate: true, handler: "onExternalUtxoChange" },
    ],
    "wallet.platformHelper.utxoSet": [
      { immediate: true, handler: "onPlatformUtxoChange" },
    ],
  },
  methods: {
    utxoSetToBalanceDict(
      set: AVMUTXOSet | PlatformUTXOSet,
      addrs: string[],
    ): DerivationListBalanceDict[] {
      const assets = this.assetsStore.assets;

      const denoms: number[] = assets.map((asset) => {
        return asset.denomination;
      });
      const assetIds: string[] = this.assetsStore.assetIds;

      const res = [];
      for (const addr of addrs) {
        const balDict: DerivationListBalanceDict = {};
        const addrBuff = bintools.stringToAddress(addr);
        for (const [index, assetId] of assetIds.entries()) {
          const bal: BN = set.getBalance([addrBuff], assetId);

          if (!bal.isZero()) {
            const balBig = bnToBig(bal, denoms[index]);
            balDict[assetId] = balBig;
          }
        }
        res.push(balDict);
      }
      return res;
    },
    onInternalUtxoChange() {
      if (this.wallet) {
        this.addrsInternal =
          this.wallet.internalHelper.getAllDerivedAddresses();
      }
    },
    onExternalUtxoChange() {
      if (this.wallet) {
        this.addrsExternal =
          this.wallet.externalHelper.getAllDerivedAddresses();
      }
    },
    onPlatformUtxoChange() {
      if (this.wallet) {
        this.addrsPlatform =
          this.wallet.platformHelper.getAllDerivedAddresses();
      }
    },
  },
});
export default HDDerivationList;
</script>

<style scoped lang="scss">
.list_cont {
  max-height: 60vh;
  min-height: 290px;
  /*height: 290px;*/
  position: relative;
  overflow: scroll;
}

.list_row {
  border-bottom: 1px solid var(--bg-light);

  &:last-of-type {
    border: none;
  }
}

.headers {
  position: sticky;
  top: 0;
  border-bottom: 1px solid var(--bg-light);
  font-weight: bold;
  background-color: var(--bg);
}

.headers,
.list_row {
  display: grid;
  grid-template-columns: 35px 2fr 1fr;
  padding: 5px 0px;
  column-gap: 10px;
}

.col_bal {
  text-align: right;
  padding-right: 15px;
  padding-left: 15px;
}

.empty {
  width: 100%;
  text-align: center;
  padding: 30px;
}

.warn_row {
  padding: 14px;
  text-align: center;
  color: #fff;
  background-color: var(--secondary-color);
}

.more_address {
  padding: 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  button {
    color: var(--secondary-color);
  }
}
</style>
