<template>
  <modal ref="modal" :title="title" @before-close="beforeClose">
    <div class="export_body">
      <p class="selection_num">
        {{ $t("keys.export_key_info", [wallets?.length ?? 0]) }};
      </p>
      <export-wallet
        ref="export"
        :wallets="wallets"
        @success="handleExportSuccess"
      ></export-wallet>
    </div>
  </modal>
</template>

<script lang="ts">
import type { PropType } from "vue";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import ExportWallet from "@/components/wallet/manage/ExportWallet.vue";

export const ExportKeys = defineComponent({
  components: {
    Modal,
    ExportWallet,
  },
  props: {
    wallets: {
      type: Array as PropType<MnemonicWallet[]>,
    },
  },
  data() {
    return {
      isActive: false,
      title: "Export Keys",
    };
  },
  methods: {
    beforeClose() {
      (this.$refs.export as typeof ExportWallet).clear();
    },
    open() {
      (this.$refs.modal as typeof Modal).open();
    },
    close() {
      this.isActive = false;
    },
    handleExportSuccess() {
      (this.$refs.modal as typeof Modal).close();
      this.close();
    },
  },
});
export default ExportKeys;
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.export_body {
  padding: 30px;
  width: 100%;
  max-width: 450px;
  min-height: 315px;
}

.selection_num {
  color: var(--primary-color);
  text-align: center;
  font-weight: bold;
  font-size: 14px;
  padding-bottom: 14px;
}

.explain {
  text-align: center;
}

@include mixins.mobile-device {
  .export_body {
    max-width: 100%;
  }
}
</style>

<style lang="scss">
@use "@/styles/abstracts/vars";

.v-tab.v-tab {
  font-weight: 700;
}

.v-tabs-slider-wrapper {
  color: vars.$secondary-color;
  caret-color: vars.$secondary-color;
  height: 3px !important;
}
</style>
