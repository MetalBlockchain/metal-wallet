<template>
  <div>
    <v-checkbox
      v-model="value"
      class="checkbox"
      :label="explain"
    ></v-checkbox>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export const MnemonicCopied = defineComponent({
  props: {
    explain: {
      default: "Back up your mnemonic keyphrase!",
      type: String,
    },
    modelValue: { type: Boolean },
  },
  emits: ["update:modelValue"],
  computed: {
    value: {
      get() {
        return this.modelValue
      },
      set(value: boolean) {
        this.$emit('update:modelValue', value)
      }
    }
  },
});
export default MnemonicCopied;
</script>

<style lang="scss">
.checkbox {
  .v-label {
    color: var(--primary-color);
  }

  .v-input--selection-controls__input {
    > * {
      color: var(--primary-color) !important;
    }
  }

  .v-input--selection-controls__ripple {
    color: var(--secondary-color) !important;
  }
}
</style>
