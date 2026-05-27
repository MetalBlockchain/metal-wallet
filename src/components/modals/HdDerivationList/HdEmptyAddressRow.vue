<template>
  <div class="list_row list_row_empty">
    <p class="col_index" style="text-align: center">{{ index }}</p>
    <p class="col_addr">
      <span>{{ address }}</span>
      &nbsp;
      <!-- TODO Why ledger type doesn't have any action -->
      <span v-if="walletType === 'ledger'" class="verify" @click="() => {}">
        {{ $t("create.verify") }}
      </span>
    </p>
    <p class="col_bal">{{ $t("modal.hd.no_use") }}</p>
  </div>
</template>
<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { useRootStore } from "@/stores/pinia/root";

export const HdEmptyAddressRow = defineComponent({
  props: {
    index: {
      type: Number,
    },
    path: {
      type: Number,
    },
    address: {
      type: String,
    },
  },
  computed: {
    ...mapState(useRootStore, {
      walletType: (store) =>
        store.activeWallet ? store.activeWallet.type : null,
    }),
  },
});
export default HdEmptyAddressRow;
</script>
<style scoped lang="scss">
.list_row_empty {
  color: var(--primary-color-light);
}
.col_index,
.col_bal {
  user-select: none;
}

.col_addr {
  /*white-space: nowrap;*/
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
  font-family: monospace;
  color: var(--primary-color-light);

  .verify {
    opacity: 0;
    cursor: pointer;
    color: var(--primary-color);
    transition: opacity 0.1s;
    font-size: 11px;
    padding: 2px 4px;
    background: var(--bg-light);
    user-select: none;
  }

  &:hover {
    .verify {
      opacity: 1;
      transition: opacity 0.2s;
    }
  }
}

.col_bal {
  padding-right: 15px;
  text-align: right;
}
</style>
