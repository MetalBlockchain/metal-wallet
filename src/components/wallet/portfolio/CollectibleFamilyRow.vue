<template>
  <div v-if="allUtxos.length > 0" class="nft_family_row">
    <div class="fam_header">
      <p class="name">{{ family?.name }}</p>
      <p class="symbol">{{ family?.symbol }}</p>
      <p class="fam_id">{{ family?.id }}</p>
    </div>
    <div class="list">
      <CollectibleFamilyGroup
        v-for="(group, id) in groupDict"
        :key="id"
        class="group"
        :utxos="group"
      ></CollectibleFamilyGroup>
      <div v-if="canMint" class="group mint_card">
        <p>
          {{ $t("portfolio.collectibles.mint_more") }}
        </p>
        <v-btn class="button_secondary" depressed small :to="mintUrl">
          {{ $t("portfolio.collectibles.mint_submit") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { NftGroupDict } from "@/components/wallet/portfolio/types";
import type { AvaNftFamily } from "@/js/AvaNftFamily";
import type {
  NFTMintOutput,
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type { PropType } from "vue";
import { AVMConstants } from "@metalblockchain/metaljs/dist/apis/avm";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import CollectibleFamilyGroup from "@/components/wallet/portfolio/CollectibleFamilyGroup.vue";
import { useAssetsStore } from "@/stores/pinia/assets";

export const CollectibleFamilyRow = defineComponent({
  components: {
    CollectibleFamilyGroup,
  },
  props: {
    family: {
      type: Object as PropType<AvaNftFamily>,
    },
  },
  computed: {
    ...mapState(useAssetsStore, {
      nftDict: "walletNftDict",
      nftMintDict: "nftMintDict",
    }),
    utxos(): UTXO[] {
      const id = this.family?.id;
      return id && this.nftDict ? (this.nftDict[id] ?? []) : [];
    },
    mintUtxos(): UTXO[] {
      const id = this.family?.id;
      return id && this.nftMintDict ? (this.nftMintDict[id] ?? []) : [];
    },
    canMint() {
      return this.mintUtxos.length > 0;
    },
    groupDict(): NftGroupDict {
      const dict: NftGroupDict = {};
      for (let i = 0; i < this.utxos.length; i++) {
        const utxo = this.utxos[i];
        if (utxo) {
          const out = utxo.getOutput() as NFTTransferOutput;
          const groupId = out.getGroupID();

          const target = dict[groupId];
          if (target) {
            target.push(utxo);
          } else {
            dict[groupId] = [utxo];
          }
        }
      }
      return dict;
    },
    allUtxos(): UTXO[] {
      return this.utxos.concat(this.mintUtxos);
    },
    mintUrl() {
      if (this.mintUtxos.length === 0) return "";
      const mintUtxo = this.mintUtxos[0];
      if (!mintUtxo) return "";

      return `/wallet/studio?utxo=${mintUtxo.getUTXOID()}`;
    },
    groupIds(): number[] {
      const ids: number[] = this.allUtxos.map((val) => {
        const id = val.getOutput().getOutputID();
        if (id === AVMConstants.NFTMINTOUTPUTID) {
          const out = val.getOutput() as NFTMintOutput;
          return out.getGroupID();
        } else {
          const out = val.getOutput() as NFTTransferOutput;
          return out.getGroupID();
        }
      });

      const idsUnique = ids.filter((val, index) => {
        return ids.indexOf(val) === index;
      });

      idsUnique.sort((a, b) => {
        return a - b;
      });

      return idsUnique;
    },
  },
});
export default CollectibleFamilyRow;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
@use "tokens";

.mint_card {
  font-size: 13px;
  border: 1px dashed var(--primary-color-light);
  padding: 12px 12px;
  color: var(--primary-color);
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-between;
}

@include mixins.mobile-device {
  .fam_header {
    grid-template-columns: max-content 1fr;
  }
  .fam_id {
    grid-column: 1/3;
    text-align: left;
  }
  .mint_card {
    height: max-content;
  }
  .list {
    grid-template-columns: 1fr;
  }
}
</style>
