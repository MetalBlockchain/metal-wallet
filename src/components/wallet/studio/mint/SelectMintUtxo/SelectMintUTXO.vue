<template>
  <div class="families">
    <FamilyRow
      v-for="(_, assetId) in nftMintDict"
      :key="assetId"
      :family="nftFamsDict[assetId]"
      @select="select"
    ></FamilyRow>
  </div>
</template>
<script lang="ts">
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type { IWalletNftMintDict } from "@/stores/types";
import type { NftFamilyDict } from "@/stores/types/assets";
import { defineComponent } from "vue";
import FamilyRow from "@/components/wallet/studio/mint/SelectMintUtxo/FamilyRow.vue";

export const SelectMintUTXO = defineComponent({
  components: { FamilyRow },
  emits: ["change"],
  computed: {
    nftFamsDict(): NftFamilyDict {
      return this.$store.state.Assets.nftFamsDict;
    },
    nftMintDict(): IWalletNftMintDict {
      // return this.$store.getters.walletNftMintDict
      return this.$store.getters["Assets/nftMintDict"];
    },
  },
  methods: {
    select(utxo: UTXO) {
      this.$emit("change", utxo);
    },
  },
});

export default SelectMintUTXO;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.families {
  grid-template-columns: repeat(5, 1fr);
  padding: 30px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-evenly;

  > div {
    width: 230px;
  }
}

@include mixins.medium-device {
  .families {
    grid-template-columns: repeat(3, 1fr);
  }
}

@include mixins.mobile-device {
  .families {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
