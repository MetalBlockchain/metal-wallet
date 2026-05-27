<template>
  <div class="currency_select">
    <button :data-active="modelValue === 'AVAX'" @click="setType('AVAX')">
      METAL
    </button>
    <button :data-active="modelValue === 'USD'" @click="setType('USD')">
      USD
    </button>
  </div>
</template>
<script lang="ts">
import type { CurrencyType } from "@/components/misc/CurrencySelect/types";
import { defineComponent } from "vue";

export const CurrencySelect = defineComponent({
  props: {
    modelValue: { type: String },
  },
  emits: ["update:modelValue"],
  methods: {
    setType(val: CurrencyType) {
      this.$emit("update:modelValue", val);
    },
  },
});
export default CurrencySelect;
</script>
<style scoped lang="scss">
.currency_select {
  display: flex;
  width: max-content;
  background-color: var(--bg-light);
  border-radius: 4px;
  overflow: hidden;
}

button {
  margin: 0;
  border-radius: 0;
  padding: 3px 6px;
  font-size: 12px;
  color: var(--primary-color-light);
  transition-duration: 0.2s;

  &:hover {
    background-color: var(--primary-color-light);
    color: var(--bg);
  }

  &[data-active="true"] {
    background-color: var(--primary-color);
    color: var(--bg);
  }
}
</style>
