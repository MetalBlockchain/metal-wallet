<template>
  <div class="nft_col">
    <h4>{{ $t("top.balance.collectibles") }}</h4>
    <p v-if="isEmpty">{{ $t("top.nftempty") }}</p>
    <div v-else class="rows">
      <p>{{ statusText }}</p>
      <div class="nft_list">
        <div
          v-for="(utxo, i) in nftArray"
          :key="utxo.getUTXOID()"
          class="nft_item"
        >
          <NftPayloadView
            :payload="nftPayloads[i]"
            :small="true"
          ></NftPayloadView>
        </div>
        <div v-for="item in erc721BalanceArray" :key="item.id" class="nft_item">
          <ERC721View :index="item.id" :token="item.token"></ERC721View>
        </div>
        <div v-for="i in dummyAmt" :key="i" class="nft_item dummy_item"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { Buffer } from "@metalblockchain/metaljs";
import type {
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import { PayloadTypes } from "@metalblockchain/metaljs/dist/utils";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import ERC721View from "@/components/misc/ERC721View.vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import { bintools } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useErc721Store } from "@/stores/pinia/erc721";
import { useRootStore } from "@/stores/pinia/root";

const NFT_COUNT = 15;

const payloadtypes = PayloadTypes.getInstance();

export const NftCol = defineComponent({
  components: {
    ERC721View,
    NftPayloadView,
  },
  computed: {
    ...mapState(useAssetsStore, ["nftUTXOs", "nftFams"]),
    ...mapState(useErc721Store, {
      erc721Balance: "walletBalance",
      erc721Find: "find",
      erc721TotalOwned: "totalOwned",
      erc721TotalCollectionsOwned: "totalCollectionsOwned",
    }),
    ...mapState(useRootStore, ["activeWallet"]),
    isEmpty(): boolean {
      return this.nftArray.length + this.erc721BalanceArray.length === 0;
    },
    nftArray(): UTXO[] {
      let utxos = this.nftUTXOs as UTXO[];

      const ids: string[] = [];
      // Filter same groups
      utxos = utxos.filter((utxo) => {
        const out = utxo.getOutput() as NFTTransferOutput;
        const famId = bintools.cb58Encode(utxo.getAssetID());
        const groupId = out.getGroupID();

        const cacheId = `${famId}-${groupId}`;
        if (ids.includes(cacheId)) {
          return false;
        } else {
          ids.push(cacheId);
          return true;
        }
      });

      return utxos.slice(0, NFT_COUNT);
    },
    nftPayloads(): PayloadBase[] {
      return this.nftArray.map((utxo) => {
        const out = utxo.getOutput() as NFTTransferOutput;
        const payload = out.getPayloadBuffer();

        const typeId = payloadtypes.getTypeID(payload);
        const pl: Buffer = payloadtypes.getContent(payload);
        const payloadbase: PayloadBase = payloadtypes.select(typeId, pl);

        return payloadbase;
      });
    },
    erc721BalanceArray() {
      // TODO: Remove after ledger support
      if (this.activeWallet?.type === "ledger") return [];

      const res = [];
      for (const tokenAddr in this.erc721Balance) {
        const erc721Token = this.erc721Find(tokenAddr);
        if (erc721Token) {
          const tokenIds = this.erc721Balance[tokenAddr] ?? [];
          const tokens = tokenIds.map((id) => {
            return {
              token: erc721Token,
              id: id,
            };
          });
          res.push(...tokens);
        }
      }
      return res.slice(0, NFT_COUNT - this.nftArray.length);
    },
    dummyAmt(): number {
      return (
        NFT_COUNT - (this.nftArray.length + this.erc721BalanceArray.length)
      );
    },
    collectedAmt(): number {
      const avmAmt = this.nftUTXOs.length;
      const evmAmt = this.erc721TotalOwned;
      return avmAmt + evmAmt;
    },
    collectionAmt(): number {
      const avmFamsAmt = this.nftFams.length;
      const evmFamsAmt = this.erc721TotalCollectionsOwned;
      return avmFamsAmt + evmFamsAmt;
    },
    statusText(): string {
      const res = `${this.collectedAmt} collected from ${this.collectionAmt} Collections`;
      return res;
    },
  },
});
export default NftCol;
</script>
<style scoped lang="scss">
.nft_col {
  p {
    font-size: 12px;
    color: var(--primary-color-light);
  }
}

$nft_w: 35px;

.nft_list {
  margin-top: 8px;
  grid-gap: 8px;
  display: grid;
  grid-template-columns: repeat(5, $nft_w);
}

.nft_item {
  position: relative;
  height: $nft_w;
  width: $nft_w;
  border-radius: 4px;
  overflow: hidden;
  background-color: var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dummy_item {
  opacity: 0.2;
}

.cards_cont {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
