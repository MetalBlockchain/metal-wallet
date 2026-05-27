<template>
  <modal ref="modal" class="modal_main" title="Select Token">
    <div class="avm_token_select">
      <div class="list">
        <div
          v-for="asset in assets"
          :key="asset.id"
          :disabled="isDisabled(asset)"
          :zero="asset.amount.isZero()"
          @click="select(asset)"
        >
          <div class="col_name">
            <p>{{ asset.symbol }}</p>
            <p>{{ asset.name }}</p>
          </div>
          <div class="col_balance">
            <p>{{ bal(asset) }}</p>
          </div>
        </div>
      </div>
    </div>
  </modal>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type AvaAsset from "@/js/AvaAsset";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import { bnToBig } from "@/helpers/helper";

export const PrivateKey = defineComponent({
  components: {
    Modal,
  },
  props: {
    assets: {
      type: Array as PropType<AvaAsset[]>,
    },
    disabledIds: { default: () => [], type: Array as PropType<string[]> },
  },
  emits: ["select"],
  data() {
    return {
      bal: (asset: AvaAsset) => {
        return bnToBig(asset.amount, asset.denomination).toLocaleString();
      },
    };
  },
  methods: {
    open(): void {
      (this.$refs.modal as typeof Modal).open();
    },
    close() {
      (this.$refs.modal as typeof Modal).close();
    },
    select(asset: AvaAsset) {
      if (asset.amount.isZero()) return;
      if (this.isDisabled(asset)) return;

      this.close();
      this.$emit("select", asset);
    },
    isDisabled(asset: AvaAsset): boolean {
      if (this.disabledIds.includes(asset.id)) return true;
      return false;
    },
  },
});
export default PrivateKey;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.avm_token_select {
  width: 520px;
  max-width: 100%;
}

.list {
  display: flex;
  flex-direction: column;
  max-height: 60vh;
  overflow: scroll;

  > div {
    display: grid;
    grid-template-columns: max-content 1fr;
    padding: 10px 20px;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: var(--bg-light);
    }

    &[disabled] {
      opacity: 0.3;
    }
  }
}

.col_name {
  text-align: left;

  p:last-of-type {
    color: var(--primary-color-light);
    font-size: 13px;
  }
}

.col_balance {
  align-self: center;
}

@include mixins.mobile-device {
  .avm_token_select {
    width: 100%;
  }
}
</style>
