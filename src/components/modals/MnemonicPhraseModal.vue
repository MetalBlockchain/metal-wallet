<template>
  <modal ref="modal" class="modal_main" :title="$t('modal.mnemonic.title')">
    <div class="mnemonic_modal_body">
      <mnemonic-display :phrase="phrase" :row-size="3"></mnemonic-display>
      <p class="warning_text">
        Warning: Never disclose this mnemonic phrase. Anyone with your phrase
        can steal assets held in your wallet.
      </p>
    </div>
  </modal>
</template>
<script lang="ts">
import type MnemonicPhrase from "@/js/wallets/MnemonicPhrase";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import MnemonicDisplay from "@/components/misc/MnemonicDisplay.vue";
import Modal from "@/components/modals/Modal.vue";

export default defineComponent({
  components: {
    Modal,
    MnemonicDisplay,
  },
  props: {
    phrase: { type: Object as PropType<MnemonicPhrase> },
  },
  methods: {
    open(): void {
      const modal = this.$refs.modal as typeof Modal;
      modal.open();
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.mnemonic_modal_body {
  /*width: 600px;*/
  max-width: 400px;
  width: 100%;
  padding: 30px;
  background-color: var(--bg-light);
}

.copyBut {
  width: 20px;
  height: 20px;
  margin: 15px auto;
  margin-bottom: 0;
}

.phrase_raw {
  background-color: var(--bg);
  margin: 15px 0px !important;
  border-radius: 2px;
  padding: 6px 12px;
}

.warning_text {
  background-color: var(--secondary-color);
  color: #fff;
  margin-top: 15px !important;
  padding: 4px 14px;
  border-radius: 3px;
}

@include mixins.mobile-device {
  .mnemonic_modal_body {
    max-width: 100%;
  }
}
</style>
