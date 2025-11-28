<template>
  <div class="chain_select">
    <button :data-active="modelValue === 'X'" @click="setChain('X')">
      Exchange
    </button>
    <button :data-active="modelValue === 'P'" @click="setChain('P')">
      Platform
    </button>
    <button
      v-if="isEVMSupported"
      :data-active="modelValue === 'C'"
      @click="setChain('C')"
    >
      Contract
    </button>
  </div>
</template>
<script lang="ts">
import type { WalletType } from "@/js/wallets/types";
import { defineComponent } from "vue";

export const ChainSelect = defineComponent({
  props: {
    modelValue: { type: String },
  },
  emits: ["update:modelValue"],
  computed: {
    isEVMSupported() {
      const wallet: WalletType | null = this.$store.state.activeWallet;
      if (!wallet) return false;
      return wallet.ethAddress;
    },
  },
  methods: {
    setChain(val: string) {
      this.$emit("update:modelValue", val);
    },
  },
});
export default ChainSelect;
</script>
<style scoped lang="scss">
.chain_select {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  font-size: 13px;
  color: var(--primary-color-light);
}
button {
  padding: 8px 5px;
  opacity: 0.8;
  outline: none !important;
  font-weight: bold;
  background-color: none !important;
  height: 40px;
  margin-top: 32px;
  margin-bottom: 16px;

  &:hover {
    opacity: 1;
    color: var(--secondary-color);
  }
  &[data-active="true"] {
    opacity: 1;
    background-color: var(--bg-2);
    color: var(--tertiary-color);
    border-radius: 6px;
  }
}
</style>
