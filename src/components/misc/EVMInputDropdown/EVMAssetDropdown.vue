<template>
  <div :active="isPopup" class="evm_dropdown hover_border" :disabled="disabled">
    <button :disabled="disabled" @click="showPopup">
      {{ symbol }}
    </button>
    <EVMTokenSelectModal
      ref="select_modal"
      @select="select"
      @select-collectible="selectERC721"
    ></EVMTokenSelectModal>
  </div>
</template>
<script lang="ts">
import type { iErc721SelectInput } from "@/components/misc/EVMInputDropdown/types";
import type Erc20Token from "@/js/Erc20Token";

import type ERC721Token from "@/js/ERC721Token";
import Big from "big.js";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import EVMTokenSelectModal from "@/components/modals/EvmTokenSelect/EVMTokenSelectModal.vue";
import { bnToBig } from "@/helpers/helper";
import { useRootStore } from "@/stores/pinia/root";

export const EVMAssetDropdown = defineComponent({
  components: { EVMTokenSelectModal },
  props: {
    disabled: { default: false, type: Boolean },
  },
  emits: ["change", "change-collectible"],
  data(): {
    isPopup: boolean;
    selected: Erc20Token | ERC721Token | "native";
  } {
    const selected: Erc20Token | ERC721Token | "native" = "native";

    return {
      isPopup: false,
      selected,
    };
  },
  computed: {
    symbol() {
      return this.selected === "native" ? "METAL" : this.selected.data.symbol;
    },
    ...mapState(useRootStore, ["activeWallet"]),
    avaxBalance(): Big {
      const w = this.activeWallet;
      if (!w) return Big(0);
      const balBN = w.ethBalance;
      return bnToBig(balBN, 18);
    },
  },
  methods: {
    showPopup() {
      (this.$refs.select_modal as typeof EVMTokenSelectModal).open();
    },
    select(token: Erc20Token | "native") {
      this.selected = token;
      this.$emit("change", token);
    },
    clear() {
      this.select("native");
    },
    selectERC721(val: iErc721SelectInput) {
      this.selected = val.token;
      this.$emit("change-collectible", val);
    },
  },
});
export default EVMAssetDropdown;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
.evm_dropdown {
  position: relative;
}

button {
  text-align: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.list {
  position: absolute;
  top: 0;
  left: 100%;
  width: 260px;
  max-height: 0px;
  overflow: scroll;
  z-index: 2;
  border-radius: 4px;
  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
  background-color: var(--bg);
}

.token_row {
  font-size: 13px;
  padding: 8px 18px;
  display: grid;
  grid-template-columns: max-content max-content 1fr;
  column-gap: 12px;
  cursor: pointer;
  user-select: none;

  > * {
    align-self: center;
  }

  img {
    height: 24px;
    object-fit: contain;
  }

  &:hover {
    //background-color: rgba(var(--bg-1), 0.5);
    background-color: var(--bg-light);
  }
}

.evm_dropdown[active] {
  .list {
    max-height: 240px;
  }
}

.col_bal {
  text-align: right;
}

@include mixins.mobile-device {
  .list {
    border-top-right-radius: 14px;
    border-top-left-radius: 14px;
    position: fixed;
    width: 100%;
    bottom: 0;
    left: 0;
    top: unset;
    height: 40vh;
  }

  .token_row {
    font-size: 16px;
    border-bottom: 1px solid var(--bg-light);
    padding-top: 14px;
    padding-bottom: 14px;
    img {
      height: 30px;
    }
  }
}
</style>
