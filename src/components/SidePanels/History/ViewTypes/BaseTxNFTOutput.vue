<template>
  <div class="nft_output">
    <!--        <p class="fam_title">{{ assetDetail.name }}</p>-->
    <div class="fam_row">
      <tx-history-nft-family-group
        v-for="(utxos, groupNum) in groupDict"
        :key="groupNum"
        :asset-i-d="assetID"
        class="fam_group"
        :utxos="utxos"
      ></tx-history-nft-family-group>
    </div>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";

import type AvaAsset from "@/js/AvaAsset";
import type { UTXO } from "@/stores/vuex/modules/history/types";
import { defineComponent } from "vue";
import TxHistoryNftFamilyGroup from "@/components/SidePanels/TxHistoryNftFamilyGroup.vue";

export interface GroupDict {
  [key: number]: UTXO[];
}

export const BaseTxNFTOutput = defineComponent({
  components: { TxHistoryNftFamilyGroup },
  props: {
    assetID: {
      type: String,
    },
    summary: {
      type: Array as PropType<UTXO[]>,
    },
  },
  data() {
    const groupDict: GroupDict = {};

    return {
      groupDict,
    };
  },
  computed: {
    assetDetail(): AvaAsset | null {
      if (!this.assetID) {
        return null;
      }
      return this.$store.state.Assets.nftFamsDict[this.assetID];
    },
    groups(): number[] {
      const gNums: number[] = [];
      if (this.summary) {
        for (const utxo of this.summary) {
          const groupID = utxo.groupID;

          if (!gNums.includes(groupID)) {
            gNums.push(groupID);
          }
        }
      }
      return gNums;
    },
  },
  created() {
    const groupDict: GroupDict = {};
    if (this.summary) {
      for (const utxo of this.summary) {
        const groupID = utxo.groupID;

        if (groupDict[groupID]) {
          groupDict[groupID].push(utxo);
        } else {
          groupDict[groupID] = [utxo];
        }
      }
    }
    this.groupDict = groupDict;
  },
});
export default BaseTxNFTOutput;
</script>
<style scoped lang="scss">
.amount {
  text-align: right;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
  color: #992005;

  &[profit] {
    color: var(--success);
  }
}

.fam_title {
  text-align: right;
  color: var(--primary-color-light);
}

.fam_row {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}

.fam_group {
  margin-left: 4px;
}
</style>
