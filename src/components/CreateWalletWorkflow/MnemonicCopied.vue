<template>
  <div>
    <v-checkbox
      :label="explain"
      v-model="value"
      @change="change"
      class="checkbox"
    ></v-checkbox>
  </div>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component, Prop, Model } from "vue-property-decorator";

@Component
export class MnemonicCopied extends Vue {
  @Model("change", { type: Boolean }) readonly value!: boolean;
  @Prop({
    default: "Back up your mnemonic keyphrase!",
  })
  explain!: string;
  change() {
    this.$emit("change", this.value);
  }
}
export default MnemonicCopied;
</script>

<style lang="scss">
@use "../../main";

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
