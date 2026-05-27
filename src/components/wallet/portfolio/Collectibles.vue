<template>
  <div
    class="collectibles_view no_scroll_bar"
    :scroll="isScroll"
    @scroll="onScroll"
  >
    <AddERC721TokenModal ref="add_token_modal"></AddERC721TokenModal>
    <div v-if="!isEmpty" class="list">
      <CollectibleFamilyRow
        v-for="fam in nftFamsArray"
        :key="fam.id"
        :family="fam"
      ></CollectibleFamilyRow>
      <ERC721FamilyRow
        v-for="token in erc721s"
        :key="token.contractAddress"
        :family="token"
      ></ERC721FamilyRow>
      <div class="add_token_row">
        <button @click="showModal">Add Collectible</button>
      </div>
    </div>
    <div v-else class="coming_soon">
      <!--            <img v-if="$root.theme === 'day'" src="@/assets/nft_preview.png" />-->
      <!--            <img v-else src="@/assets/nft_preview_night.png" />-->
      <p>{{ $t("portfolio.nobalance_nft") }}</p>
      <div class="add_token_row">
        <button @click="showModal">Add Collectible</button>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import AddERC721TokenModal from "@/components/modals/AddERC721TokenModal.vue";
import CollectibleFamilyRow from "@/components/wallet/portfolio/CollectibleFamilyRow.vue";
import ERC721FamilyRow from "@/components/wallet/portfolio/ERC721FamilyRow.vue";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useErc721Store } from "@/stores/pinia/erc721";

// const payloadTypes = PayloadTypes.getInstance();
export const Collectibles = defineComponent({
  components: {
    ERC721FamilyRow,
    AddERC721TokenModal,
    CollectibleFamilyRow,
  },
  props: {
    search: {
      type: String,
    },
  },
  data() {
    return {
      isScroll: false,
    };
  },
  computed: {
    ...mapState(useAssetsStore, {
      nftUTXOs: "nftUTXOs",
      nftMintUTXOs: "nftMintUTXOs",
      nftFams: "nftFams",
    }),
    ...mapState(useErc721Store, {
      totalOwned: "totalOwned",
      erc721s: "networkContracts",
    }),
    isEmpty(): boolean {
      const nftUtxos = this.nftUTXOs.length;
      const mintUTxos = this.nftMintUTXOs.length;
      const erc721Bal = this.totalOwned;
      return nftUtxos + mintUTxos + erc721Bal === 0;
    },
    nftFamsArray() {
      let fams = this.nftFams;

      // If search query
      if (this.search) {
        const query = this.search;
        fams = fams.filter((fam) => {
          if (
            fam.name.includes(query) ||
            fam.id.includes(query) ||
            fam.symbol.includes(query)
          ) {
            return true;
          }
          return false;
        });
      }

      fams.sort((a, b) => {
        const symbolA = a.symbol;
        const symbolB = b.symbol;

        if (symbolA < symbolB) {
          return -1;
        } else if (symbolA > symbolB) {
          return 1;
        }
        return 0;
      });

      return fams;
    },
  },
  methods: {
    onScroll(ev: any) {
      const val = ev.target.scrollTop;
      this.isScroll = val > 0 ? true : false;
    },
    showModal() {
      (this.$refs.add_token_modal as typeof AddERC721TokenModal).open();
    },
  },
});
export default Collectibles;
</script>
<style lang="scss" scoped>
@use "@/styles/abstracts/mixins";
@use "./portfolio";

$flip_dur: 0.6s;

.collectibles_view {
  height: 100%;
  overflow: scroll;
  transition-duration: 0.2s;
  border-top: 0px solid transparent;
  &[scroll] {
    border-top: 3px solid var(--bg-wallet);
  }
}

.list {
  max-height: 50px;
}

.coming_soon {
  padding-top: 60px;
  text-align: center;
  img {
    width: 100%;
    max-width: 560px;
  }

  p {
    font-weight: lighter;
    font-size: 28px;
    color: var(--primary-color-light);
  }
}

.nft_card {
  transition-duration: 0.3s;
  width: 140px;
  height: 220px;
}

@include mixins.mobile-device {
  .collectibles_view {
    height: 90vh;
  }
}
</style>
