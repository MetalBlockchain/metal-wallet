<template>
  <modal ref="modal" :title="$t('modal.nft.title')">
    <div class="nft_view_body">
      <ERC721View class="view" :index="tokenId" :token="token"></ERC721View>
    </div>
  </modal>
</template>
<script lang="ts">
import type ERC721Token from "@/js/ERC721Token";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import ERC721View from "../misc/ERC721View.vue";

export default defineComponent({
  components: { ERC721View, Modal },
  props: {
    token: {
      type: Object as PropType<ERC721Token>,
    },
    tokenId: {
      type: String,
    },
  },

  methods: {
    open() {
      (this.$refs.modal as typeof Modal).open();
    },
  },
});
</script>
<style scoped lang="scss">
.nft_view_body {
  width: 80vw;
  height: 80vh;
}

.view {
  height: 100%;
  width: 100%;
}
</style>
