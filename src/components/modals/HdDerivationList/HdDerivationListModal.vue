<template>
  <modal ref="modal" class="modal_main" title="HD Addresses">
    <div class="hd_deriv_modal_body">
      <HDDerivationList :wallet="wallet"></HDDerivationList>
    </div>
  </modal>
</template>
<script lang="ts">
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import HDDerivationList from "@/components/modals/HdDerivationList/HDDerivationList.vue";
import Modal from "@/components/modals/Modal.vue";

export default defineComponent({
  components: {
    Modal,
    HDDerivationList,
  },
  props: {
    wallet: {
      type: Object as PropType<MnemonicWallet>,
    },
  },
  methods: {
    open(): void {
      const modal = this.$refs.modal as typeof Modal;
      // @ts-ignore
      modal.open();
    },
  },
});
</script>
<style scoped lang="scss">
.hd_deriv_modal_body {
  //width: 600px;
  max-width: 100%;
  padding: 0px;
}
</style>
