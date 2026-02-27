<template>
  <div>
    <div class="utxos">
      <div v-if="isSender">
        <label v-if="!sentToSelf">Sent</label>
        <label v-else>Sent to self</label>
        <template v-if="!sentToSelf">
          <BaseTxUtxo
            v-for="(utxo, i) in sentUTXOs"
            :key="i"
            :ins="inputUTXOs"
            :is-sent="true"
            :outs="outputUTXOs"
            :utxo="utxo"
          ></BaseTxUtxo>
        </template>
        <template v-else>
          <BaseTxUtxo
            v-for="(utxo, i) in outputUTXOs"
            :key="i"
            :ins="inputUTXOs"
            :is-sent="true"
            :outs="outputUTXOs"
            :utxo="utxo"
          ></BaseTxUtxo>
        </template>

        <div class="nft_cols">
          <!--                    <div class="nft_addr">-->
          <!--                        <p v-for="addr in summary.collectibles.sent.addresses" :key="addr">-->
          <!--                            to {{ 'X-' + addr }}-->
          <!--                        </p>-->
          <!--                    </div>-->
          <!--                    <div class="nft_fams">-->
          <!--                        <BaseTxNFTOutput-->
          <!--                            v-for="(asset, assetId) in summary.collectibles.sent.assets"-->
          <!--                            :key="assetId"-->
          <!--                            :asset-i-d="assetId"-->
          <!--                            :summary="asset"-->
          <!--                            class="nft_out"-->
          <!--                        ></BaseTxNFTOutput>-->
          <!--                    </div>-->
        </div>
      </div>
      <div v-else>
        <label>Received</label>
        <BaseTxUtxo
          v-for="(utxo, i) in receivedUTXOs"
          :key="i"
          :ins="inputUTXOs"
          :is-sent="false"
          :outs="outputUTXOs"
          :utxo="utxo"
        ></BaseTxUtxo>
        <!--                <BaseTxOutput-->
        <!--                    v-for="(asset, assetId) in tokensReceived"-->
        <!--                    :key="assetId"-->
        <!--                    :asset-i-d="assetId"-->
        <!--                    :summary="asset"-->
        <!--                ></BaseTxOutput>-->
        <!--                <div class="nft_cols">-->
        <!--                    <div class="nft_addr">-->
        <!--                        <p v-for="addr in summary.collectibles.received.addresses" :key="addr">-->
        <!--                            from {{ 'X-' + addr }}-->
        <!--                        </p>-->
        <!--                    </div>-->
        <!--                    <div class="nft_fams">-->
        <!--                        <BaseTxNFTOutput-->
        <!--                            v-for="(asset, assetId) in summary.collectibles.received.assets"-->
        <!--                            :key="assetId"-->
        <!--                            :asset-i-d="assetId"-->
        <!--                            :summary="asset"-->
        <!--                            class="nft_out"-->
        <!--                        ></BaseTxNFTOutput>-->
        <!--                    </div>-->
        <!--                </div>-->
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";

import type {
  TransactionTypeName,
  XChainTransaction,
} from "@/js/Glacier/models";
import { mapState } from "pinia";
import { defineComponent } from "vue";
// import TxHistoryValueFunctional from "@/components/SidePanels/History/TxHistoryValueFunctional.vue";
// import BaseTxNFTOutput from "@/components/SidePanels/History/ViewTypes/BaseTxNFTOutput.vue";
// import BaseTxOutput from "@/components/SidePanels/History/ViewTypes/BaseTxOutput.vue";
import BaseTxUtxo from "@/components/SidePanels/History/ViewTypes/BaseTxUtxo.vue";
// import TxHistoryNftFamilyGroup from "@/components/SidePanels/TxHistoryNftFamilyGroup.vue";
// import TxHistoryValue from "@/components/SidePanels/TxHistoryValue.vue";
import { isOwnedUTXO } from "@/js/Glacier/isOwnedUtxo";
import { useRootStore } from "@/stores/pinia/root";

export const BaseTx = defineComponent({
  components: {
    BaseTxUtxo,
    // BaseTxNFTOutput,
    // BaseTxOutput,
    // TxHistoryValue,
    // TxHistoryValueFunctional,
    // TxHistoryNftFamilyGroup,
  },
  props: {
    transaction: {
      type: Object as PropType<XChainTransaction>,
    },
  },
  computed: {
    ...mapState(useRootStore, {
      addresses: (store) => {
        if (!store.activeWallet) return [];
        return store.activeWallet.getHistoryAddresses();
      },
    }),
    inputUTXOs() {
      return this.transaction?.consumedUtxos ?? [];
    },
    outputUTXOs() {
      return this.transaction?.emittedUtxos ?? [];
    },
    receivedUTXOs() {
      return this.outputUTXOs.filter((utxo) => {
        return isOwnedUTXO(utxo, this.addresses);
      });
    },
    sentUTXOs() {
      const utxos = this.outputUTXOs.filter((utxo) => {
        return !isOwnedUTXO(utxo, this.addresses);
      });

      return utxos;
    },
    sentToSelf() {
      return this.isSender && this.sentUTXOs.length === 0;
    },
    isSender() {
      return this.inputUTXOs.some((utxo) => {
        return isOwnedUTXO(utxo, this.addresses);
      });
    },
    hasReceived() {
      if (!this.transaction) {
        return false;
      }
      return this.transaction.emittedUtxos.some((utxo) => {
        return isOwnedUTXO(utxo, this.addresses);
      });
    },
    addrsRaw() {
      const addrs: string[] = this.addresses;
      return addrs.map((addr) => addr.split("-")[1]);
    },
    type() {
      if (!this.transaction) {
        return null;
      }
      return this.transaction.txType as TransactionTypeName;
    },
  },
});
export default BaseTx;
</script>
<style scoped lang="scss">
label {
  font-size: 12px;
  color: var(--primary-color-light);
}
.nfts {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  justify-content: flex-end;
  > div {
    margin-left: 5px;
  }
}

.nft_cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.nft_addr {
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 12px;
  color: var(--primary-color-light);
  overflow: hidden;
  white-space: nowrap;

  p {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.nft_fams {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.nft_out {
  margin-bottom: 4px;
}
</style>
