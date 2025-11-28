<template>
  <div v-if="hasBalance || !family?.canSupport">
    <div class="fam_header">
      <p class="name">{{ family?.name }}</p>
      <p class="symbol">{{ family?.symbol }}</p>
      <p class="fam_id">{{ family?.contractAddress }}</p>
    </div>
    <div v-if="family?.canSupport" class="list">
      <ERC721View
        v-for="tokenIndex in walletBalance"
        :key="tokenIndex"
        class="group"
        :index="tokenIndex"
        :token="family"
      ></ERC721View>
    </div>
    <div v-else>
      <p>This ERC721 Contract does not support the required interfaces.</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type ERC721Token from "@/js/ERC721Token";
import { defineComponent } from "vue";
import ERC721View from "@/components/wallet/portfolio/ERC721Card.vue";

export const ERC721FamilyRow = defineComponent({
  components: { ERC721View },
  props: {
    family: {
      type: Object as PropType<ERC721Token>,
    },
  },
  computed: {
    walletBalance(): string[] {
      return this.family
        ? this.$store.state.Assets.ERC721.walletBalance[
            this.family.contractAddress
          ] || []
        : [];
    },
    hasBalance() {
      return this.walletBalance.length > 0;
    },
  },
});
export default ERC721FamilyRow;
</script>
<style scoped lang="scss">
@use "tokens";
</style>
