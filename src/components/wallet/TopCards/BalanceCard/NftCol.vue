<template>
  <div class="nft_col">
    <h4>{{ $t("top.balance.collectibles") }}</h4>
    <p v-if="isEmpty">{{ $t("top.nftempty") }}</p>
    <div v-else class="rows">
      <p>{{ statusText }}</p>
      <div class="nft_list">
        <div
          class="nft_item"
          v-for="(utxo, i) in nftArray"
          :key="utxo.getUTXOID()"
        >
          <NftPayloadView
            :payload="nftPayloads[i]"
            small="true"
          ></NftPayloadView>
        </div>
        <div class="nft_item" v-for="item in erc721BalanceArray" :key="item.id">
          <ERC721View :token="item.token" :index="item.id"></ERC721View>
        </div>
        <div v-for="i in dummyAmt" class="nft_item dummy_item" :key="i"></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { Vue, Component } from "vue-property-decorator";
import type { IWalletNftDict } from "@/store/types";
import type {
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import NftCard from "@/components/wallet/portfolio/NftCard.vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { Buffer } from "@metalblockchain/metaljs";
import { PayloadTypes } from "@metalblockchain/metaljs/dist/utils";
import { bintools } from "@/AVA";
import NftFamilyCardsPreview from "@/components/misc/NftFamilyCardsPreview.vue";
import type { ERC721WalletBalance } from "@/store/modules/assets/modules/types";
import ERC721View from "@/components/misc/ERC721View.vue";

const NFT_COUNT = 15;

const payloadtypes = PayloadTypes.getInstance();

@Component({
  components: {
    ERC721View,
    NftFamilyCardsPreview,
    NftCard,
    NftPayloadView,
  },
})
export class NftCol extends Vue {
  get isEmpty(): boolean {
    return this.nftArray.length + this.erc721BalanceArray.length === 0;
  }

  get nftDict(): IWalletNftDict {
    return this.$store.getters["Assets/walletNftDict"];
  }

  get nftArray(): UTXO[] {
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
  }

  get nftPayloads(): PayloadBase[] {
    return this.nftArray.map((utxo) => {
      const out = utxo.getOutput() as NFTTransferOutput;
      const payload = out.getPayloadBuffer();

      const typeId = payloadtypes.getTypeID(payload);
      const pl: Buffer = payloadtypes.getContent(payload);
      const payloadbase: PayloadBase = payloadtypes.select(typeId, pl);

      return payloadbase;
    });
  }

  get erc721Balance(): ERC721WalletBalance {
    return this.$store.state.Assets.ERC721.walletBalance;
  }

  get erc721BalanceArray() {
    // TODO: Remove after ledger support
    if (this.$store.state.activeWallet.type === "ledger") return [];

    const res = [];
    for (const tokenAddr in this.erc721Balance) {
      const erc721Token = this.$store.getters["Assets/ERC721/find"](tokenAddr);
      const tokenIds = this.erc721Balance[tokenAddr];
      const tokens = tokenIds.map((id) => {
        return {
          token: erc721Token,
          id: id,
        };
      });
      res.push(...tokens);
    }
    return res.slice(0, NFT_COUNT - this.nftArray.length);
  }

  get dummyAmt(): number {
    return NFT_COUNT - (this.nftArray.length + this.erc721BalanceArray.length);
  }

  get collectedAmt(): number {
    const avmAmt = this.$store.state.Assets.nftUTXOs.length;
    const evmAmt = this.$store.getters["Assets/ERC721/totalOwned"];
    return avmAmt + evmAmt;
  }

  get collectionAmt(): number {
    const avmFamsAmt = this.$store.state.Assets.nftFams.length;
    const evmFamsAmt =
      this.$store.getters["Assets/ERC721/totalCollectionsOwned"];
    return avmFamsAmt + evmFamsAmt;
  }

  get statusText(): string {
    const res = `${this.collectedAmt} collected from ${this.collectionAmt} Collections`;
    return res;
  }
}
export default NftCol;
</script>
<style scoped lang="scss">
@use "../../../../main";

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
