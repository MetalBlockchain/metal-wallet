<template>
  <modal
    ref="modal"
    :can-close="false"
    class="modal_main"
    :title="$t('modal.keystore.title')"
  >
    <div class="update_keystore_modal_body">
      <p>{{ $t("modal.keystore.desc") }}</p>
      <ExportWallet
        v-if="!isSuccess"
        ref="export"
        class="export_wallet"
        :is-desc="false"
        :wallets="allWallets"
        @success="success"
      ></ExportWallet>
      <v-btn v-else class="ava_button button_primary" @click="logout">
        {{ $t("modal.keystore.logout") }}
      </v-btn>
    </div>
  </modal>
</template>
<script lang="ts">
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import ExportWallet from "@/components/wallet/manage/ExportWallet.vue";
import { useRootStore } from "@/stores/pinia/root";

export const MnemonicPhrase = defineComponent({
  components: {
    Modal,
    ExportWallet,
  },
  props: {
    phrase: { default: "", type: String },
  },
  data() {
    return {
      isSuccess: false,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      allWallets: (store) => store.wallets as MnemonicWallet[],
    }),
  },
  mounted() {
    this.open();
  },
  methods: {
    ...mapActions(useRootStore, ["logout"]),
    open(): void {
      const modal = this.$refs.modal as typeof Modal;
      modal.open();
    },
    success() {
      (this.$refs.export as typeof ExportWallet).clear();
      this.isSuccess = true;
    },
  },
});
export default MnemonicPhrase;
</script>
<style scoped lang="scss">
.update_keystore_modal_body {
  /*width: 600px;*/
  width: 400px;
  max-width: 100%;
  padding: 30px;
  /*background-color: var(--bg-light);*/
}

.export_wallet {
  margin: 30px 0;
}

.ava_button {
  display: block;
  margin: 10px auto !important;
}
</style>
