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
import { mapState } from "pinia";
import { defineComponent } from "vue";
import CollectibleFamily from "@/components/misc/BalancePopup/CollectibleFamily.vue";
import Modal from "@/components/modals/Modal.vue";
import { useAssetsStore } from "@/stores/pinia/assets";

export const AvmNftSelectModal = defineComponent({
  components: { CollectibleFamily, Modal },
  props: {
    disabledIds: { default: () => [], type: Array as PropType<string[]> },
  },
  emits: ["select"],
  computed: {
    ...mapState(useAssetsStore, {
      isEmpty: (store) => store.nftUTXOs.length === 0,
      nftFamsDict: (store) => store.nftFamsDict,
    }),
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
