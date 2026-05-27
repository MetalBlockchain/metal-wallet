<template>
  <Modal ref="modal" title="Select a Collectible">
    <div class="nft_sel_body">
      <div class="list">
        <CollectibleFamily
          v-for="fam in nftFamsDict"
          :key="fam.id"
          :disabled-ids="disabledIds"
          :family="fam"
          @select="select"
        ></CollectibleFamily>
      </div>
    </div>
  </Modal>
</template>
<script lang="ts">
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type { PropType } from "vue";
import type { NftFamilyDict } from "@/stores/vuex/modules/assets/types";
import { defineComponent } from "vue";
import CollectibleFamily from "@/components/misc/BalancePopup/CollectibleFamily.vue";
import Modal from "@/components/modals/Modal.vue";

export const AvmNftSelectModal = defineComponent({
  components: { CollectibleFamily, Modal },
  props: {
    disabledIds: { default: () => [], type: Array as PropType<string[]> },
  },
  emits: ["select"],
  computed: {
    isEmpty(): boolean {
      // return this.$store.getters.walletNftUTXOs.length === 0
      return this.$store.state.Assets.nftUTXOs.length === 0;
    },
    nftFamsDict(): NftFamilyDict {
      return this.$store.state.Assets.nftFamsDict;
    },
  },
  methods: {
    open() {
      (this.$refs.modal as typeof Modal).open();
    },
    close() {
      (this.$refs.modal as typeof Modal).close();
    },
    select(nft: UTXO) {
      this.$emit("select", nft);
      this.close();
    },
    isNftUsed(utxo: UTXO) {
      return this.disabledIds.includes(utxo.getUTXOID());
    },
  },
});
export default AvmNftSelectModal;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
.nft_sel_body {
  width: 650px;
  max-width: 100%;
}

.list {
  max-height: 60vh;
  overflow: scroll;

  > div {
    border-bottom: 2px solid var(--bg-light);
    padding: 14px;
  }
}

@include mixins.mobile-device {
  .nft_sel_body {
    width: 100%;
  }
}
</style>
