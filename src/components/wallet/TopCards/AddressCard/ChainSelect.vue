<template>
  <div class="chain_select">
    <button @click="setChain('X')" :active="chain === 'X'">Exchange</button>
    <button @click="setChain('P')" :active="chain === 'P'">Platform</button>
    <button
      @click="setChain('C')"
      :active="chain === 'C'"
      v-if="isEVMSupported"
    >
      Contract
    </button>
  </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Model } from "vue-property-decorator";
import type { WalletType } from "@/js/wallets/types";

@Component
export class ChainSelect extends Vue {
  @Model("change", { type: String }) readonly chain!: string;

  get isEVMSupported() {
    const wallet: WalletType | null = this.$store.state.activeWallet;
    if (!wallet) return false;
    return wallet.ethAddress;
  }

  setChain(val: string) {
    this.$emit("change", val);
  }
}
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
  &[active] {
    opacity: 1;
    background-color: var(--bg-2);
    color: var(--tertiary-color);
    border-radius: 6px;
  }
}
</style>
