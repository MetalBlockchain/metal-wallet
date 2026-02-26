<template>
  <modal ref="modal" :can-close="false" title="Loading Wallet">
    <div class="ledger_loading_body">
      <Spinner style="font-size: 1.5em; margin-bottom: 1em"></Spinner>
      <p>Please wait while we load your wallet information.</p>
    </div>
  </modal>
</template>
<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import Spinner from "@/components/misc/Spinner.vue";
import Modal from "@/components/modals/Modal.vue";
import { useLedgerStore } from "@/stores/pinia/ledger";

export default defineComponent({
  components: { Spinner, Modal },
  computed: {
    ...mapState(useLedgerStore, {
      isActive: "isWalletLoading",
    }),
  },
  watch: {
    isActive: [{ immediate: true, handler: "onActive" }],
  },
  mounted() {
    if (this.isActive) {
      (this.$refs.modal as typeof Modal).open();
    }
  },
  methods: {
    onActive(val: boolean): void {
      if (!this.$refs.modal) return;
      if (val) {
        (this.$refs.modal as typeof Modal).open();
      } else {
        (this.$refs.modal as typeof Modal).close();
      }
    },
  },
});
</script>
<style scoped lang="scss">
.ledger_loading_body {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
}
</style>
