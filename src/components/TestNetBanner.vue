<template>
  <div class="network_warning" :visible="isVisible">
    <p>{{ $t("network.not_mainnet") }}</p>
  </div>
</template>

<script lang="ts" setup>
import { useNetworkStore } from "@/stores/pinia/networks";

const networkStore = useNetworkStore();

const isVisible = computed(() => {
  const network = networkStore.selectedNetwork;

  if (!network) return false;

  const netId =
    typeof network.networkId === "string"
      ? Number.parseInt(network.networkId)
      : network.networkId;

  if (netId == 1) return false;

  return true;
});
</script>

<style scoped lang="scss">
$h: 24px;
.network_warning {
  background-color: var(--secondary-color);
  color: #fff;
  font-size: 13px;
  text-align: center;
  position: fixed;
  bottom: -$h;
  width: 100%;
  height: $h;
  line-height: $h;
  z-index: 2;
  transition-duration: 0.4s;

  &[visible] {
    bottom: 0px;
  }
}
</style>
