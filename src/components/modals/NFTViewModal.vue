<template>
  <modal ref="modal" :title="$t('modal.nft.title')">
    <div class="nft_view_body">
      <NftPayloadView class="view" :payload="payload"></NftPayloadView>
    </div>
  </modal>
</template>
<script lang="ts">
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import Modal from "@/components/modals/Modal.vue";

export default defineComponent({
  components: { NftPayloadView, Modal },
  props: {
    payload: {
      type: Object as PropType<PayloadBase>,
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
