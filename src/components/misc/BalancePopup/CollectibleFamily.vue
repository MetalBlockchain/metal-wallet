<template>
  <div v-if="utxos.length > 0" class="collectible_family">
    <p class="fam_title">{{ family?.name }}</p>
    <div class="group_grid">
      <div
        v-for="(utxo, i) in uniqueGroups"
        :key="utxo.getUTXOID()"
        class="card"
        :used="disabledIds.includes(utxo.getUTXOID())"
        @click="click(utxo)"
      >
        <NftPayloadView
          class="payload_view"
          :payload="payloads[i]"
          :small="true"
        ></NftPayloadView>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { AvaNftFamily } from "@/js/AvaNftFamily";
import type {
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type { PropType } from "vue";

import { mapState } from "pinia";
import { defineComponent } from "vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import { getPayloadFromUTXO } from "@/helpers/helper";
import { useAssetsStore } from "@/stores/pinia/assets";

export const CollectibleFamily = defineComponent({
  components: {
    NftPayloadView,
  },
  props: {
    family: {
      type: Object as PropType<AvaNftFamily>,
    },
    disabledIds: { default: () => [], type: Array as PropType<string[]> },
  },
  emits: ["select"],
  computed: {
    ...mapState(useAssetsStore, {
      nftFamilies: "nftFamilies",
      nftDict: "walletNftDict",
    }),
    utxos() {
      const id = this.family?.id;
      return (id && this.nftDict[id]) || [];
    },
    uniqueGroups() {
      const ids: number[] = [];
      return this.utxos.filter((utxo) => {
        const gId = (utxo.getOutput() as NFTTransferOutput).getGroupID();
        if (ids.includes(gId)) {
          return false;
        } else {
          ids.push(gId);
          return true;
        }
      });
    },
    payloads() {
      return this.uniqueGroups.map((utxo) => {
        return getPayloadFromUTXO(utxo);
      });
    },
  },
  methods: {
    click(utxo: UTXO) {
      this.$emit("select", utxo);
    },
  },
});
export default CollectibleFamily;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.collectible_family {
  display: grid;
  grid-template-columns: 1fr max-content;
}
//.fam_title {
//    border-bottom: 2px solid var(--bg-light);
//}
$card_w: 80px;

.group_grid {
  display: grid;
  grid-template-columns: repeat(5, $card_w);
  gap: 12px;
}

.card {
  position: relative;
  width: $card_w;
  height: $card_w;
  background-color: var(--bg-light);
  border-radius: 4px;
  overflow: hidden;
  transition-duration: 0.2s;
  cursor: pointer;
  border: 1px solid var(--bg-light);
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border: 1px solid var(--secondary-color);
    transform: scale(1.1);
  }

  &[used] {
    opacity: 0.1;
    pointer-events: none;
    cursor: not-allowed;
  }
}

@include mixins.mobile-device {
  $card_w: 60px;

  .collectible_family {
    display: block;
  }
  .fam_title {
    color: var(--primary-color-light);
    font-size: 12px;
    margin-bottom: 8px !important;
  }

  .group_grid {
    grid-template-columns: repeat(5, $card_w);
  }
  .card {
    width: $card_w;
    height: $card_w;
  }
}
</style>
