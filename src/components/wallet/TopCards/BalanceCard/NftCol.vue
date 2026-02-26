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
import type { IWalletNftDict } from "@/stores/types";
import type { ERC721WalletBalance } from "@/stores/types/erc721";
import { PayloadTypes } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent } from "vue";
import ERC721View from "@/components/misc/ERC721View.vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import { bintools } from "@/misc/AVA";

const NFT_COUNT = 15;

const payloadtypes = PayloadTypes.getInstance();

export const NftCol = defineComponent({
  components: {
    ERC721View,
    NftPayloadView,
  },
  computed: {
    isEmpty(): boolean {
      return this.nftArray.length + this.erc721BalanceArray.length === 0;
    },
    nftDict(): IWalletNftDict {
      return this.$store.getters["Assets/walletNftDict"];
    },
    nftArray(): UTXO[] {
      let utxos: UTXO[] = this.$store.state.Assets.nftUTXOs;

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
    erc721Balance(): ERC721WalletBalance {
      return this.$store.state.Assets.ERC721.walletBalance;
    },
    erc721BalanceArray() {
      // TODO: Remove after ledger support
      if (this.$store.state.activeWallet.type === "ledger") return [];

      const res = [];
      for (const tokenAddr in this.erc721Balance) {
        const erc721Token =
          this.$store.getters["Assets/ERC721/find"](tokenAddr);
        const tokenIds = this.erc721Balance[tokenAddr] ?? [];
        const tokens = tokenIds.map((id) => {
          return {
            token: erc721Token,
            id: id,
          };
        });
        res.push(...tokens);
      }
      return res.slice(0, NFT_COUNT - this.nftArray.length);
    },
    dummyAmt(): number {
      return (
        NFT_COUNT - (this.nftArray.length + this.erc721BalanceArray.length)
      );
    },
    collectedAmt(): number {
      const avmAmt = this.$store.state.Assets.nftUTXOs.length;
      const evmAmt = this.$store.getters["Assets/ERC721/totalOwned"];
      return avmAmt + evmAmt;
    },
    collectionAmt(): number {
      const avmFamsAmt = this.$store.state.Assets.nftFams.length;
      const evmFamsAmt =
        this.$store.getters["Assets/ERC721/totalCollectionsOwned"];
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
