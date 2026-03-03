<template>
  <div v-if="isEVMSupported">
    <div class="header_title">
      <label>{{ $t("transfer.source_chain.title") }}</label>
      <hr />
    </div>
    <div class="chain_select">
      <button :data-active="modelValue === 'X'" @click="set('X')">
        Exchange
      </button>
      <button :data-active="modelValue === 'C'" @click="set('C')">
        Contract
      </button>
    </div>
  </div>
</template>
<script lang="ts">
import type { ChainIdType } from "@/constants";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { useRootStore } from "@/stores/pinia/root";

export const ChainInput = defineComponent({
  props: {
    disabled: { default: false, type: Boolean },
    modelValue: { type: String },
  },
  emits: ["update:modelValue"],
  computed: {
    ...mapState(useRootStore, {
      isEVMSupported: (store) => {
        return store.activeWallet?.ethAddress;
      },
    }),
  },
  methods: {
    set(val: ChainIdType) {
      if (this.disabled) return;
      this.$emit("update:modelValue", val);
    },
  },
});
export default ChainInput;
</script>

<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

label {
  font-size: 20px;
  font-weight: 500;
  color: var(--tertiary-color);
}

.header_title {
  display: flex;
  flex-direction: row;
  align-items: center;

  label {
    white-space: nowrap;
    margin-right: 12px;
  }

  hr {
    flex: 0 1 100%;
    border: 1px solid var(--border-secondary-light);
  }
}
.chain_select {
  display: flex;
  width: max-content;
  font-size: 13px;
  color: var(--tertiary-color);
  margin-top: 32px;
  margin-bottom: 16px;

  > button {
    padding: 8px 12px;
    outline: none !important;
    font-weight: bold;
    background-color: none !important;
    height: 40px;

    &:hover {
      opacity: 1;
      color: var(--secondary-color);
    }
    &[data-active="true"] {
      opacity: 1;
      background-color: var(--bg-3);
      color: var(--secondary-color);
      border-radius: 6px;
    }
  }
}

@include mixins.mobile-device {
  .chain_select {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 14px;
    > button {
      margin: 0;
      justify-content: center;
      text-align: center;
      background-color: var(--bg-light);
      color: var(--primary-color-light);

      &[data-active="true"] {
        //background-color: var(--secondary-color);
        color: var(--primary-color);
        //color: #fff;
      }
    }
  }
}
</style>
