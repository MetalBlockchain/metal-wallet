<template>
  <div v-if="hasBalance" class="family_row">
    <div class="title_row">
      <p>{{ token?.symbol }}</p>
      <p class="name">{{ token?.name }}</p>
    </div>

    <div class="items">
      <ERC721View
        v-for="tokenIndex in walletBalance"
        :key="tokenIndex"
        class="item"
        :index="tokenIndex"
        :token="token"
        @click="selectToken(tokenIndex)"
      ></ERC721View>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type { iErc721SelectInput } from "@/components/misc/EVMInputDropdown/types";
import type ERC721Token from "@/js/ERC721Token";
import { defineComponent } from "vue";
import ERC721View from "@/components/misc/ERC721View.vue";

export const ERC721Row = defineComponent({
  components: { ERC721View },
  props: {
    token: {
      type: Object as PropType<ERC721Token>,
    },
  },
  emits: ["select"],
  computed: {
    walletBalance(): string[] {
      if (!this.token) {
        return [];
      }
      return (
        this.$store.state.Assets.ERC721.walletBalance[
          this.token.contractAddress
        ] || []
      );
    },
    hasBalance(): boolean {
      return this.walletBalance.length > 0;
    },
  },
  methods: {
    selectToken(index: string) {
      if (this.token) {
        const data: iErc721SelectInput = {
          id: index,
          token: this.token,
        };
        this.$emit("select", data);
      }
    },
  },
});
export default ERC721Row;
</script>
<style scoped lang="scss">
.family_row {
  display: flex !important;
  flex-direction: column;
}
p {
  margin-bottom: 4px;
}

.name {
  color: var(--primary-color-light);
  font-size: 13px;
}

.title_row {
  margin-bottom: 8px;
}
.items {
  display: grid;
  column-gap: 8px;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));

  > * {
    cursor: pointer;
    &:hover {
      opacity: 0.4;
    }
  }
}
</style>
