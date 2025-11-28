<template>
  <div :active="isPopup" class="dropdown hover_border">
    <button :disabled="disabled" @click="showPopup">
      {{ symbol }}
      <!--            <fa icon="caret-down" style="float: right"></fa>-->
    </button>
    <!--        <BalancePopup-->
    <!--            :assets="assetArray"-->
    <!--            ref="popup"-->
    <!--            class="popup"-->
    <!--            @select="onselect"-->
    <!--            :disabled-ids="disabledIds"-->
    <!--            @close="onclose"-->
    <!--        ></BalancePopup>-->
    <AvmTokenSelect
      ref="token_modal"
      :assets="assetArray"
      :disabled-ids="disabledIds"
      @select="onselect"
    ></AvmTokenSelect>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type AvaAsset from "@/js/AvaAsset";
import { defineComponent } from "vue";
import AvmTokenSelect from "@/components/modals/AvmTokenSelect.vue";

export default defineComponent({
  components: {
    AvmTokenSelect,
  },
  props: {
    disabledAssets: { default: () => [], type: Array as PropType<AvaAsset[]> },
    disabled: { default: false, type: Boolean },
    modelValue: { type: Object as PropType<AvaAsset> },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      isPopup: false,
    };
  },
  computed: {
    assetArray(): AvaAsset[] {
      // return this.$store.getters.walletAssetsArray
      return this.$store.getters["Assets/walletAssetsArray"];
    },
    disabledIds(): string[] {
      const disabledIds = this.disabledAssets.map((a) => a.id);
      return disabledIds;
    },
    symbol() {
      const sym = this.modelValue?.symbol;
      return sym;
    },
  },
  methods: {
    showPopup() {
      (this.$refs.token_modal as typeof AvmTokenSelect).open();
    },
    onclose() {},
    onselect(asset: AvaAsset) {
      this.$emit("update:modelValue", asset);
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

button {
  padding: 4px 12px;
  width: 100%;
  height: 100%;
  text-align: left;
  font-size: 15px;

  svg {
    transition-duration: 0.2s;
  }
}

.dropdown {
  position: relative;
  &:focus-within {
    outline: 1px solid var(--secondary-color);
  }
  > button {
    text-align: center;
  }
}

.dropdown[active] {
  button {
    svg {
      transform: rotateZ(180deg);
    }
  }
}
.popup {
  position: absolute;
}

@include mixins.mobile-device {
  button {
    font-size: 13px;
  }
}
</style>
