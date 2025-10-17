<template>
  <div class="list_cont no_scroll_bar">
    <v-tabs grow>
      <v-tab>Internal</v-tab>
      <v-tab>External</v-tab>
      <v-tab>Platform</v-tab>
      <v-tab-item>
        <HdChainTable
          :addresses="addrsInternal"
          :balance-dict="keyBalancesInternal"
          :wallet="wallet"
          :path="1"
          :helper="internalHelper"
        ></HdChainTable>
      </v-tab-item>
      <v-tab-item>
        <HdChainTable
          :addresses="addrsExternal"
          :balance-dict="keyBalancesExternal"
          :wallet="wallet"
          :path="0"
          :helper="externalHelper"
        ></HdChainTable>
      </v-tab-item>
      <v-tab-item>
        <HdChainTable
          :addresses="addrsPlatform"
          :balance-dict="keyBalancesPlatform"
          :wallet="wallet"
          :path="0"
          :helper="platformHelper"
        ></HdChainTable>
      </v-tab-item>
    </v-tabs>
  </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop, Watch } from "vue-property-decorator";

import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { UTXOSet as AVMUTXOSet } from "@metalblockchain/metaljs/dist/apis/avm";

import type { UTXOSet as PlatformUTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { bintools } from "@/AVA";
import type AvaAsset from "@/js/AvaAsset";
import type { DerivationListBalanceDict } from "@/components/modals/HdDerivationList/types";
import { bnToBig } from "@/helpers/helper";
import type { BN } from "@metalblockchain/metaljs";
import HdChainTable from "@/components/modals/HdDerivationList/HdChainTable.vue";

@Component({
  components: {
    HdChainTable,
  },
})
export class HDDerivationList extends Vue {
  @Prop() wallet!: MnemonicWallet;

  addrsExternal: string[] = [];
  addrsInternal: string[] = [];
  addrsPlatform: string[] = [];

  @Watch("wallet.internalHelper.utxoSet", { immediate: true })
  onInternalUtxoChange() {
    this.addrsInternal = this.wallet.internalHelper.getAllDerivedAddresses();
  }

  @Watch("wallet.externalHelper.utxoSet", { immediate: true })
  onExternalUtxoChange() {
    this.addrsExternal = this.wallet.externalHelper.getAllDerivedAddresses();
  }

  @Watch("wallet.platformHelper.utxoSet", { immediate: true })
  onPlatformUtxoChange() {
    this.addrsPlatform = this.wallet.platformHelper.getAllDerivedAddresses();
  }

  get internalHelper() {
    return this.wallet.internalHelper;
  }
  get externalHelper() {
    return this.wallet.externalHelper;
  }
  get platformHelper() {
    return this.wallet.platformHelper;
  }

  get assetsDict() {
    return this.$store.state.Assets.assetsDict;
  }

  utxoSetToBalanceDict(
    set: AVMUTXOSet | PlatformUTXOSet,
    addrs: string[]
  ): DerivationListBalanceDict[] {
    const assets: AvaAsset[] = this.$store.state.Assets.assets;

    const denoms: number[] = assets.map((asset) => {
      return asset.denomination;
    });
    const assetIds: string[] = this.$store.getters["Assets/assetIds"];

    const res = [];
    for (let i = 0; i < addrs.length; i++) {
      const balDict: DerivationListBalanceDict = {};
      const addrBuff = bintools.stringToAddress(addrs[i]);
      assetIds.forEach((assetId, index) => {
        const bal: BN = set.getBalance([addrBuff], assetId);

        if (!bal.isZero()) {
          const balBig = bnToBig(bal, denoms[index]);
          balDict[assetId] = balBig;
        }
      });
      res.push(balDict);
    }
    return res;
  }

  get keyBalancesExternal(): DerivationListBalanceDict[] {
    const wallet = this.wallet;
    const utxoSet = wallet.externalHelper.utxoSet as AVMUTXOSet;
    const addrs = this.addrsExternal;

    return this.utxoSetToBalanceDict(utxoSet, addrs);
  }

  get keyBalancesInternal(): DerivationListBalanceDict[] {
    const wallet = this.wallet;
    const utxoSet = wallet.internalHelper.utxoSet;
    const addrs = this.addrsInternal;
    return this.utxoSetToBalanceDict(utxoSet, addrs);
  }

  get keyBalancesPlatform(): DerivationListBalanceDict[] {
    const wallet = this.wallet;
    const utxoSet = wallet.platformHelper.utxoSet;
    const addrs = this.addrsPlatform;
    return this.utxoSetToBalanceDict(utxoSet, addrs);
  }
}
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
