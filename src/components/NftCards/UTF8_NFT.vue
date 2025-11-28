<template>
  <BaseNftCard :mini="mini" :raw-card="rawCard" :utxo-id="utxo?.getUTXOID()">
    <template #card>
      <div class="utf8_nft">
        <p>{{ text }}</p>
      </div>
    </template>
    <template #deck></template>
    <template #mini>
      <p><fa icon="quote-right"></fa></p>
    </template>
  </BaseNftCard>
</template>
<script lang="ts">
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import BaseNftCard from "@/components/NftCards/BaseNftCard.vue";

export default defineComponent({
  components: {
    BaseNftCard,
  },
  props: {
    payload: {
      type: Object as PropType<PayloadBase>,
    },
    mini: { default: false, type: Boolean },
    rawCard: { default: false, type: Boolean },
    utxo: {
      type: Object as PropType<UTXO>,
    },
  },
  computed: {
    text(): string {
      return this.payload?.getContent().toString("utf8") ?? "";
    },
  },
});
</script>
<style scoped lang="scss">
.utf8_nft {
  word-break: normal;
  padding: 15px 12px;
  text-align: center;
}
</style>
