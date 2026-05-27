<template>
  <div class="flex-row utxo">
    <div class="flex-row addresses">
      <p>{{ isSent ? "to" : "from" }}</p>
      <div class="flex-column">
        <p v-for="addr in addresses" :key="addr" class="address">{{ addr }}</p>
      </div>
    </div>
    <p class="token" :sent="isSent">
      <span v-if="isSent">-</span>
      {{ amountString }} {{ symbol }}
    </p>
  </div>
</template>
<script lang="ts">
import type { Utxo } from "@metalblockchain/glacier-sdk";
import type { PropType } from "vue";
import { bnToLocaleString } from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";
import { defineComponent } from "vue";

export const BaseTxUtxo = defineComponent({
  props: {
    utxo: {
      type: Object as PropType<Utxo>,
    },
    ins: {
      type: Array as PropType<Utxo[]>,
    },
    outs: {
      type: Array as PropType<Utxo[]>,
    },
    isSent: {
      type: Boolean,
    },
  },
  computed: {
    amountString() {
      if (!this.utxo) {
        return "";
      }
      return bnToLocaleString(
        new BN(this.utxo.asset.amount),
        this.denomination,
      );
    },
    symbol() {
      if (!this.utxo) {
        return "";
      }
      return this.utxo.asset.symbol;
    },
    denomination() {
      if (!this.utxo) {
        return undefined;
      }
      return this.utxo.asset.denomination;
    },
    addresses() {
      const utxoValue = this.utxo;
      if (!utxoValue) {
        return [];
      }
      // If this is a sent utxo, get who we sent to
      if (this.isSent) {
        return utxoValue.addresses.map((address) =>
          this.formatAddress(address),
        );
      }
      // If received, get who sent this to us
      else {
        if (!this.ins) {
          return [];
        }
        const insUtxos = this.ins.filter((utxo) => {
          return utxo.asset.assetId === utxoValue.asset.assetId;
        });
        return insUtxos
          .flatMap((utxo) => utxo.addresses)
          .map((address) => this.formatAddress(address));
      }
    },
  },
  methods: {
    formatAddress(address: string) {
      const len = address.length;
      return `X-${address.slice(0, 9)}..${address.slice(len - 5)}`;
    },
  },
});
export default BaseTxUtxo;
</script>
<style scoped lang="scss">
.utxo {
  justify-content: space-between;
}
.addresses {
  p {
    overflow: hidden;
    color: var(--primary-color-light);
    white-space: nowrap;
    font-size: 12px;
    line-height: 12px;
    text-overflow: ellipsis;
  }

  .address {
    //max-width: 5em;
    word-break: break-all;
    padding-left: 0.5em;
  }
}

.token {
  text-align: right;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
  color: var(--success);

  &[sent] {
    color: #992005;
  }
}
</style>
