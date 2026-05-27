<template>
  <modal
    ref="modal"
    :title="$t('modal.ledger_upgrade.title')"
    @before-close="beforeClose"
  >
    <div class="ledger_block">
      <ol>
        <li>Connect the ledger device to your computer.</li>
        <li>Enter your PIN and access your device.</li>
        <li>
          Ensure you have installed the
          <b>Metal App v{{ minV }}</b>
          or above and open it on your device.
        </li>
      </ol>
      <p style="margin-top: 12px !important">
        <small>
          If you do not have the Avalanche app on your ledger, please add it
          through the
          <a href="https://www.ledger.com/ledger-live/download" target="_blank">
            Ledger Live
          </a>
          app manager. The minimum version required to use the app is version
          {{ minV }}, more instructions can be found
          <a
            href="https://support.avax.network/en/articles/6150237-how-to-use-a-ledger-nano-s-or-nano-x-with-avalanche"
            target="_blank"
          >
            here
          </a>
          .
        </small>
      </p>
    </div>
  </modal>
</template>
<script lang="ts">
import type { WalletType } from "@/js/wallets/types";

import { defineComponent } from "vue";
import { MIN_LEDGER_V } from "@/js/wallets/constants";
import Modal from "./Modal.vue";

export const LedgerUpgrade = defineComponent({
  components: {
    Modal,
  },
  computed: {
    minV() {
      return MIN_LEDGER_V;
    },
    isActive() {
      return this.$store.state.Ledger.isUpgradeRequired;
    },
    wallet() {
      return this.$store.state.activeWallet as WalletType;
    },
  },
  watch: {
    isActive: [{ immediate: true, handler: "onActive" }],
  },
  unmounted() {
    this.$store.commit("Ledger/setIsUpgradeRequired", false);
  },
  methods: {
    open() {
      (this.$refs.modal as typeof Modal).open();
    },
    close() {
      (this.$refs.modal as typeof Modal).close();
    },
    beforeClose() {
      this.$store.commit("Ledger/setIsUpgradeRequired", false);
    },
    onActive(val: boolean): void {
      if (!this.$refs.modal) return;
      if (val) {
        this.open();
      } else {
        this.close();
      }
    },
  },
});
export default LedgerUpgrade;
</script>
<style scoped lang="scss">
.ledger_block {
  padding: 30px;
  max-width: 450px;
}

.ledger_block > div {
  text-align: center;
}
</style>
