<template>
  <modal ref="modal" :can-close="false" title="Accessing Ledger Device">
    <div v-if="isActive" class="ledger_block">
      <p v-if="isPrompt" style="font-size: 18px">
        {{ $t("modal.ledger.desc") }}
      </p>
      <p v-if="warning" class="alert">{{ warning }}</p>

      <p class="message">{{ title }}</p>
      <p v-if="info" class="message">{{ info }}</p>
      <template v-else>
        <div v-for="(message, i) in messages" :key="i" class="message block">
          <p class="title">{{ message.title }}</p>
          <p class="value">{{ message.value }}</p>
        </div>
      </template>
      <Spinner class="spinner"></Spinner>
    </div>
  </modal>
</template>

<script lang="ts">
import type { ILedgerBlockMessage } from "@/stores/types/ledger";
import { defineComponent } from "vue";
import Spinner from "@/components/misc/Spinner.vue";
import Modal from "./Modal.vue";

export const LedgerBlock = defineComponent({
  components: {
    Modal,
    Spinner,
  },
  data() {
    const intervalId: ReturnType<typeof setTimeout> | null = null;

    return {
      intervalId,
    };
  },
  computed: {
    title(): string {
      return this.$store.state.Ledger.title;
    },
    info(): string {
      return this.$store.state.Ledger.info;
    },
    messages(): Array<ILedgerBlockMessage> {
      return this.$store.state.Ledger.messages;
    },
    isActive(): boolean {
      return this.$store.state.Ledger.isBlock;
    },
    isPrompt(): boolean {
      return this.$store.state.Ledger.isPrompt;
    },
    warning() {
      return this.$store.state.Ledger.warning;
    },
  },
  watch: {
    isActive: [{ immediate: true, handler: "onActive" }],
  },
  methods: {
    open() {
      (this.$refs.modal as typeof Modal).open();
    },
    close() {
      (this.$refs.modal as typeof Modal).close();
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
export default LedgerBlock;
</script>

<style scoped lang="scss">
.ledger_block {
  pointer-events: none;
  padding: 30px;
  max-width: 600px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.message .title {
  line-height: 1rem;
  font-size: 0.8rem !important;
  color: var(--primary-color-light);
}

.alert {
  color: var(--error);
}

.message {
  padding: 12px;
  color: var(--primary-color);
  width: 100%;
  margin: 4px 0 !important;
  word-break: break-all;
  background-color: var(--bg-wallet);
}

.message.block {
  text-align: left;
  padding: 6px 12px;
}

.message.desc {
  padding: 6px;
  margin-top: 2px;
  margin-bottom: 8px;
  font-size: 1rem;
}

.spinner {
  width: 40px;
  font-size: 20px !important;
  margin: 20px auto !important;
  color: var(--primary-color) !important;
}
</style>
