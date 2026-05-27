<template>
  <div class="tx_row" :data-day-change="source?.isDayChange">
    <div class="tx_cols">
      <div class="explorer_col">
        <a
          v-if="explorerUrl"
          class="explorer_link"
          :href="explorerUrl"
          target="_blank"
          tooltip="View in Explorer"
        >
          <fa icon="search"></fa>
        </a>
      </div>
      <div class="meta_col">
        <div>
          <label>Date</label>
          <p class="time">
            {{ date.toDateString() }}
            <span>{{ date.toLocaleTimeString() }}</span>
          </p>
        </div>
      </div>
      <div class="tx_detail">
        <component :is="tx_comp" :transaction="source"></component>
        <p v-if="hasMultisig" class="multisig_warn">
          <fa icon="exclamation-triangle"></fa>
          Contains Shared Balance (Multisig)
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { TransactionType, TransactionTypeName } from "@/js/Glacier/models";
import type { PChainUtxo, Utxo } from "@metalblockchain/glacier-sdk";
import type { PropType } from "vue";
import moment from "moment";
import { defineComponent } from "vue";
import BaseTx from "@/components/SidePanels/History/ViewTypes/BaseTx.vue";
import ImportExport from "@/components/SidePanels/History/ViewTypes/ImportExport.vue";
import StakingTx from "@/components/SidePanels/History/ViewTypes/StakingTx.vue";
import { getUrlFromTransaction } from "@/js/Glacier/getUrlFromTransaction";
import {
  isCChainImportTransaction,
  isTransactionC,
  isTransactionX,
} from "@/js/Glacier/models";
import { ava } from "@/misc/AVA";

export const TxRow = defineComponent({
  components: {
    StakingTx,
    BaseTx,
    ImportExport,
  },
  props: {
    index: {
      type: Number,
    },
    source: {
      type: Object as PropType<
        TransactionType & {
          isMonthChange: boolean;
          isDayChange: boolean;
        }
      >,
    },
  },
  computed: {
    explorerUrl(): string | null {
      if (!this.source) return null;
      const netID = ava.getNetworkID();
      return getUrlFromTransaction(netID, this.source);
    },
    hasMultisig() {
      if (!this.source) return false;
      if (!isCChainImportTransaction(this.source)) {
        if (!this.source.emittedUtxos) return false;
        let totMultiSig = 0;
        // eslint-disable-next-line unicorn/no-array-for-each
        this.source.emittedUtxos.forEach((utxo: Utxo | PChainUtxo) => {
          if (utxo.addresses.length > 1) {
            totMultiSig++;
          }
        });
        return totMultiSig > 0;
      }
      return false;
    },
    timestamp() {
      if (!this.source) return 0;
      return isTransactionX(this.source) || isTransactionC(this.source)
        ? this.source.timestamp * 1000
        : this.source.blockTimestamp * 1000;
    },
    date() {
      return new Date(this.timestamp);
    },
    type(): TransactionTypeName {
      return this.source?.txType ?? "";
    },
    tx_comp() {
      switch (this.type) {
        case "ExportTx":
        case "ImportTx": {
          return ImportExport;
        }
        case "AddDelegatorTx":
        case "AddPermissionlessDelegatorTx":
        case "AddValidatorTx":
        case "AddPermissionlessValidatorTx": {
          return StakingTx;
        }
        default: {
          return BaseTx;
        }
      }
    },
    mom() {
      return moment(this.timestamp);
    },
    dayLabel() {
      return this.mom.format("dddd Do");
    },
    monthLabel(): string {
      const month = this.mom.format("MMMM");
      return month;
    },
    yearLabel(): string {
      return this.mom.format("Y");
    },
  },
});
export default TxRow;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
.tx_row {
  //display: grid;
  //grid-template-columns: 1fr 1fr;
  padding: 1px 0px;
  font-size: 13px;
  box-sizing: border-box;
  position: relative;
  //display: grid;
  //grid-template-columns: 1fr 1fr;
  //margin-bottom: 22px;

  &[data-day-change="true"] {
    padding-top: 27px;

    &:before {
      content: "";
      position: absolute;
      top: 13px;
      left: 0;
      width: 100%;
      height: 1px;
      background-color: var(--bg-light);
    }
  }
}
.tx_cols {
  display: grid;
  grid-template-columns: max-content 2fr 1fr;
  column-gap: 14px;
  background-color: var(--bg-light);
  padding: 8px 14px;
  border-radius: 4px;
  box-sizing: border-box;
}

.date {
  color: var(--primary-color);
  font-size: 14px;
  //display: flex;
  //max-width: 320px;
  //justify-content: space-between;
  padding-right: 30px;
  text-align: right;
  //padding-left: 40%;
}

.tx_detail {
  //margin-bottom: 8px;
  width: 100%;
}

.time {
  //color: var(--primary-color-light);
  font-size: 13px;

  span {
    margin-left: 12px;
  }
}
.memo {
  p {
    font-size: 12px;
  }
  overflow-wrap: break-word;
  width: 100%;
  max-width: 420px;
}

.meta_col {
  overflow: auto;
  display: grid;
  column-gap: 14px;
  grid-template-columns: max-content max-content;
}
.date_label {
  line-height: 24px;
  position: sticky;
  top: 0px;
  height: max-content;
  font-size: 24px;
  width: max-content;
  z-index: 2;
  //background-color: var(--bg);
}

.explorer_col {
  a {
    color: var(--primary-color);
    opacity: 0.4;
    font-size: 12px;

    &:hover {
      opacity: 1;
    }
  }
}

label {
  font-size: 12px;
  color: var(--primary-color-light);
}

.multisig_warn {
  color: var(--error);
}

@include mixins.mobile-device {
  .tx_cols {
    grid-template-columns: max-content 1fr;
  }

  .meta_col {
    border-bottom: 1px solid var(--bg);
    padding-bottom: 8px;
    margin-bottom: 8px;
  }

  .tx_detail {
    grid-column: 2/3;
    grid-row: 2;
  }
}
</style>
