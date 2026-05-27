<template>
  <div class="tx_summary">
    <p v-if="isCollectibleEmpty && isFungibleEmpty">Empty</p>
    <template v-else>
      <h4>Assets</h4>
      <div>
        <div
          v-for="order in cleanOrders"
          :key="order.uuid"
          class="fungible_row"
        >
          <p>{{ order.asset.symbol }}</p>
          <p style="color: var(--primary-color)">
            {{ order.asset.name }}
          </p>
          <p style="text-align: right; color: var(--primary-color)">
            {{ cleanNum(order.amount, order.asset.denomination) }}
          </p>
        </div>
        <p v-if="cleanOrders?.length === 0">No tokens added.</p>
      </div>
      <template v-if="!isCollectibleEmpty">
        <h4>Collectibles</h4>
        <div class="nfts">
          <div
            v-for="(utxo, i) in nftOrders"
            :key="utxo.getUTXOID()"
            class="nft_group"
          >
            <NftPayloadView
              :payload="nftPayloads?.at(i)"
              :small="true"
            ></NftPayloadView>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script lang="ts">
import type { ITransaction } from "./types";
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type { PropType } from "vue";
import { BN } from "@metalblockchain/metaljs";
import { defineComponent } from "vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import { bnToBig, getPayloadFromUTXO } from "@/helpers/helper";

export const TxSummary = defineComponent({
  components: {
    NftPayloadView,
  },
  props: {
    orders: {
      type: Array as PropType<ITransaction[]>,
    },
    nftOrders: {
      type: Array as PropType<UTXO[]>,
    },
  },
  computed: {
    nftPayloads() {
      return this.nftOrders?.map((utxo) => {
        return getPayloadFromUTXO(utxo);
      });
    },
    isFungibleEmpty() {
      if (!this.orders) return false;
      for (let i = 0; i < this.orders.length; i++) {
        const order = this.orders[i];
        if (order?.amount.gt(new BN(0))) {
          return false;
        }
      }
      return true;
    },
    cleanOrders() {
      const ZERO = new BN(0);
      return this.orders?.filter((order) => {
        return order.amount.gt(ZERO);
      });
    },
    isCollectibleEmpty() {
      return this.nftOrders?.length === 0;
    },
  },
  methods: {
    cleanNum(val: BN, denom: number) {
      return bnToBig(val, denom).toLocaleString(denom);
    },
  },
});
export default TxSummary;
</script>
<style scoped lang="scss">
.tx_summary {
  padding-right: 20px;
}
.fungible_row {
  display: grid;
  grid-template-columns: 50px max-content 1fr;
  width: 100%;
  background-color: var(--bg-light);
  padding: 8px 16px;
  color: var(--primary-color-light);
  font-size: 16px;
  margin-bottom: 6px !important;
}
.amt {
  float: right;
}

.nfts {
  display: flex;
  flex-wrap: wrap;
  //grid-template-columns: repeat(6, 1fr);

  $nft_w: 80px;
  > div {
    position: relative;
    width: $nft_w;
    overflow: auto;
    border-radius: 3px;
    height: $nft_w;
    background-color: var(--bg-light);
    margin: 4px;

    &:first-of-type {
      margin-left: 0;
    }
  }
}
h4 {
  display: block;
  text-align: left;
  font-size: 12px;
  font-weight: bold;
  margin: 12px 0;
}

label {
  color: var(--primary-color-light);
  font-size: 12px;
  font-weight: bold;
  margin: 2px 0 !important;
}
</style>
