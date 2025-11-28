<template>
  <div class="radio_buts">
    <button
      v-for="(key, i) in keys"
      :key="key"
      class="hover_border"
      :data-active="modelValue === key"
      :disabled="disabled"
      @click="select(key)"
    >
      {{ labels?.at(i) }}
    </button>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    labels: {
      type: Array as PropType<string[]>,
    },
    keys: {
      type: Array as PropType<string[]>,
    },
    disabled: { default: false, type: Boolean },
    modelValue: { type: String },
  },
  emits: ["update:modelValue"],
  methods: {
    select(val: string) {
      this.$emit("update:modelValue", val);
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.radio_buts {
  display: flex;
  flex-wrap: wrap;
}

button {
  word-break: normal;
  white-space: nowrap;
  font-weight: bold;
  font-size: 14px;
  padding: 4px 14px;
  border: 1px solid transparent;
  color: var(--primary-color-light);
  background-color: var(--bg-wallet);
  border-radius: 4px;
  margin-right: 6px;
  margin-bottom: 6px;
  transition-duration: 0.2s;
  font-family: Inconsolata, monospace;

  &[data-active="true"] {
    color: var(--bg-wallet);
    background-color: var(--primary-color);
  }

  &[disabled] {
    opacity: 0.4;
  }
}

@include mixins.medium-device {
  button {
    font-size: 11px;
    padding: 4px 8px;
  }
}
</style>
