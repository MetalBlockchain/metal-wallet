<template>
  <div class="nft_card">
    <p v-if="quantity > 1" class="count">{{ quantity }}</p>
    <NFTViewModal ref="modal" :payload="payload"></NFTViewModal>
    <NftPayloadView class="view" :payload="payload"></NftPayloadView>
    <div class="nft_info">
      <div class="meta_bar">
        <div>
          <p>
            <b>{{ $t("portfolio.collectibles.group") }}:</b>
            {{ groupID }}
          </p>
          <p style="margin-left: 6px !important">{{ payloadTypeName }}</p>
        </div>

        <div>
          <Tooltip
            v-if="utxo"
            class="nft_button"
            :text="$t('portfolio.collectibles.send')"
            @click="transfer"
          >
            <fa icon="share"></fa>
          </Tooltip>
          <Tooltip
            class="nft_button"
            :text="$t('portfolio.collectibles.expand')"
            @click="expand"
          >
            <fa icon="expand"></fa>
          </Tooltip>
        </div>
      </div>
      <div v-if="nftTitle || nftDesc" class="generic_nft_meta">
        <p v-if="nftTitle" class="nft_title">
          {{ nftTitle }}
        </p>
        <p v-if="nftDesc" class="nft_desc">
          {{ nftDesc }}
        </p>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";

import type { PropType } from "vue";
import { PayloadTypes } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent } from "vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import Tooltip from "@/components/misc/Tooltip.vue";
import NFTViewModal from "@/components/modals/NFTViewModal.vue";

const payloadtypes = PayloadTypes.getInstance();

export default defineComponent({
  components: { NFTViewModal, NftPayloadView, Tooltip },
  props: {
    payload: {
      type: Object as PropType<PayloadBase>,
    },
    quantity: { default: 1, type: Number },
    groupID: {
      type: Number,
    },
    utxo: {
      type: Object as PropType<UTXO>,
    },
  },
  computed: {
    payloadTypeID() {
      return this.payload?.typeID();
    },
    payloadTypeName() {
      return this.payloadTypeID
        ? payloadtypes.lookupType(this.payloadTypeID)
        : "Unknown Type";
    },
    payloadContent() {
      return this.payload?.getContent().toString() ?? "";
    },
    nftTitle() {
      try {
        const json = JSON.parse(this.payloadContent);
        return json.avalanche.title;
      } catch {
        return "";
      }
    },
    nftDesc() {
      try {
        const json = JSON.parse(this.payloadContent);
        return json.avalanche.desc;
      } catch {
        return "";
      }
    },
  },
  methods: {
    transfer(ev: MouseEvent) {
      ev.stopPropagation();
      if (!this.utxo) return;

      const utxoId = this.utxo.getUTXOID();
      this.$router.push({
        path: "/wallet/transfer",
        query: {
          nft: utxoId,
          chain: "X",
        },
      });
    },
    expand() {
      (this.$refs.modal as typeof NFTViewModal).open();
    },
  },
});
</script>
<style scoped lang="scss">
@use "nft_card";
</style>
