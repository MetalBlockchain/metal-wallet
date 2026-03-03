<template>
  <div class="activity_page">
    <ExportGlacierHistoryModal
      ref="glacier_csv_modal"
    ></ExportGlacierHistoryModal>
    <div v-if="!hasExplorer" class="explorer_warning">
      <div class="warning_body">
        <h1>{{ $t("activity.no_explorer.title") }}</h1>
        <p>{{ $t("activity.no_explorer.desc") }}</p>
      </div>
    </div>
    <div class="settings">
      <div class="filter_col">
        <div class="filter_cont">
          <label>
            Export CSV File (BETA)
            <span v-if="isCsvDisabled" style="font-size: 0.8em; opacity: 0.8">
              Not Supported For This Network
            </span>
          </label>
          <div class="csv_buttons">
            <v-btn
              class="button_secondary"
              depressed
              :disabled="!!isCsvDisabled"
              x-small
              @click="openGlacierCsvModal"
            >
              Export History
            </v-btn>
          </div>
        </div>
        <div class="filter_cont">
          <label>{{ $t("activity.label1") }}</label>
          <RadioButtons
            v-model="mode"
            :keys="modeKey"
            :labels="modes"
          ></RadioButtons>
        </div>
      </div>
      <div v-if="showList">
        <div class="pagination">
          <p class="date_display">{{ monthNowName }} {{ yearNow }}</p>
          <div>
            <button :disabled="!isPrevPage" @click="prevPage">
              <fa icon="angle-left"></fa>
            </button>
            <button :disabled="!isNextPage" @click="nextPage">
              <fa icon="angle-right"></fa>
            </button>
          </div>
        </div>
        <div class="pagination_info">
          <p>{{ $t("activity.found", [txs.length]) }}</p>
          <button @click="updateHistory">
            <fa icon="sync"></fa>
          </button>
        </div>
      </div>
    </div>
    <div ref="list" class="tx_table">
      <div v-show="showList" class="tx_list">
        <DynamicScroller
          v-show="txs.length > 0"
          ref="vlist"
          v-slot="{ item, index }"
          :items="txsProcessed"
          :key-field="'txHash'"
          :min-item-size="24"
          :style="{ height: `${listH}px`, overflowY: 'auto' }"
        >
          <TxRow :index="index" :source="item"></TxRow>
        </DynamicScroller>
        <div v-if="txs.length === 0" class="empty">
          <p>{{ $t("activity.empty") }}</p>
        </div>
      </div>
      <div v-if="!showList" class="loading">
        <template v-if="!isError">
          <Spinner class="spinner"></Spinner>
          <p>{{ $t("activity.loading") }}</p>
        </template>
        <template v-else>
          <p>Error Loading Activity History</p>
          <v-btn
            class="button_secondary"
            depressed
            small
            @click="updateHistory"
          >
            Try Again
          </v-btn>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { TransactionType, TransactionTypeName } from "@/js/Glacier/models";

import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import { DynamicScroller } from "vue-virtual-scroller";
import RadioButtons from "@/components/misc/RadioButtons.vue";
import Spinner from "@/components/misc/Spinner.vue";
import ExportGlacierHistoryModal from "@/components/modals/ExportGlacierHistoryModal.vue";
import TxRow from "@/components/wallet/activity/TxRow.vue";
import { isTransactionC, isTransactionX } from "@/js/Glacier/models";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNetworkStore } from "@/stores/pinia/networks";
import { isMainnetNetworkID } from "@/stores/utils/isMainnetNetworkID";
import { isTestnetNetworkID } from "@/stores/utils/isTestnetNetworkID";

type ModeKeyType = "all" | "transfer" | "swap" | "stake";

const PAGE_LIMIT = 100;

const YEAR_MIN = 2020;
const MONTH_MIN = 8;

const supportedTypes = new Set<TransactionTypeName>([
  "BaseTx",
  "ImportTx",
  "ExportTx",
  "OperationTx",
  "AddValidatorTx",
  "AddDelegatorTx",
  "AddPermissionlessDelegatorTx",
  "AddPermissionlessValidatorTx",
  "CreateAssetTx",
]);

const transferTypes = new Set<TransactionTypeName>([
  "BaseTx",
  "CreateAssetTx",
  "OperationTx",
]);
const exportTypes = new Set<TransactionTypeName>(["ExportTx", "ImportTx"]);

const stakeTypes = new Set<TransactionTypeName>([
  "AddValidatorTx",
  "AddDelegatorTx",
  "AddPermissionlessValidatorTx",
  "AddPermissionlessDelegatorTx",
]);

export const Activity = defineComponent({
  name: "Activity",
  components: {
    ExportGlacierHistoryModal,
    Spinner,
    RadioButtons,
    DynamicScroller,
  },
  data(): {
    mode: ModeKeyType;
    modes: string[];
    modeKey: ModeKeyType[];
    isLoading: boolean;
    pageNow: number;
    RowComponent: typeof TxRow;
    monthNow: number;
    yearNow: number;
    listH: number;
  } {
    const modeKey: ModeKeyType[] = ["all", "transfer", "swap", "stake"];
    const mode: ModeKeyType = "all";
    return {
      mode,
      modes: [
        this.$t("activity.mode1"),
        this.$t("activity.mode2"),
        this.$t("activity.mode3"),
        this.$t("activity.mode4"),
      ],
      modeKey,
      isLoading: false,
      pageNow: 0,
      RowComponent: TxRow,
      monthNow: 0,
      yearNow: 0,
      listH: 100,
    };
  },
  computed: {
    ...mapState(useNetworkStore, {
      activeNetwork: "selectedNetwork",
    }),
    ...mapState(useHistoryStore, {
      isUpdatingAll: "isUpdatingAll",
      isError: "isError",
      allTxs: (store) => {
        return store.allTransactions.filter((tx: TransactionType) => {
          return supportedTypes.has(tx.txType);
        });
      },
    }),
    isCsvDisabled() {
      return !this.hasExplorer || this.isFuji;
    },
    showList(): boolean {
      if (this.isUpdatingAll || this.isLoading || this.isError) return false;
      return true;
    },
    isNextPage() {
      const now = new Date();
      if (this.yearNow < now.getFullYear()) return true;
      if (this.monthNow < now.getMonth()) return true;
      return false;
    },
    isPrevPage() {
      // if (this.yearNow  now.getFullYear()) return true
      if (this.monthNow === MONTH_MIN && this.yearNow === YEAR_MIN)
        return false;
      return true;
    },
    monthNowName() {
      return this.$t(`activity.months.${this.monthNow}`);
    },

    isMainnet() {
      return (
        this.activeNetwork && isMainnetNetworkID(this.activeNetwork.networkId)
      );
    },
    isFuji() {
      return (
        this.activeNetwork && isTestnetNetworkID(this.activeNetwork.networkId)
      );
    },
    hasExplorer() {
      if (!this.activeNetwork) return false;
      return this.isMainnet || this.isFuji;
    },

    monthGroups(): any {
      const res: any = {};
      const txs = this.txs;

      for (const tx of txs) {
        const date = new Date(this.getTxTimestamp(tx));
        // let mom = moment(tx.timestamp)
        const month = date.getMonth();
        const year = date.getFullYear();
        const key = `${month}/${year}`;
        if (res[key]) {
          res[key].push(tx);
        } else {
          res[key] = [tx];
        }
      }
      return res;
    },

    txs(): TransactionType[] {
      let txs;
      switch (this.mode) {
        case "transfer": {
          txs = this.txsTransfer;
          break;
        }
        case "swap": {
          txs = this.txsSwap;
          break;
        }
        case "stake": {
          txs = this.txsStake;
          break;
        }
        default: {
          txs = this.allTxs;
          break;
        }
      }

      const filtered = txs.filter((tx) => {
        const date = new Date(this.getTxTimestamp(tx));

        if (
          date.getMonth() === this.monthNow &&
          date.getFullYear() === this.yearNow
        ) {
          return true;
        }
        return false;
      });
      return filtered;
    },
    txsProcessed() {
      const txs = this.txs;

      const res = txs.map((tx, index) => {
        let showMonth = false;
        let showDay = false;

        if (index === 0) {
          showMonth = true;
          showDay = true;
        } else {
          const txBefore = txs[index - 1];
          if (txBefore) {
            const date = new Date(this.getTxTimestamp(tx));
            const dateBefore = new Date(this.getTxTimestamp(txBefore));

            if (dateBefore.getMonth() !== date.getMonth()) {
              showMonth = true;
              showDay = true;
            } else if (dateBefore.getDay() !== date.getDay()) {
              showDay = true;
            }
          }
        }

        return {
          ...tx,
          isMonthChange: showMonth,
          isDayChange: showDay,
        };
      });
      return res;
    },
    pageAmount(): number {
      return Math.floor(this.txs.length / PAGE_LIMIT);
    },
    txsTransfer(): TransactionType[] {
      return this.allTxs.filter((tx) => {
        return transferTypes.has(tx.txType);
      });
    },
    txsSwap(): TransactionType[] {
      return this.allTxs.filter((tx) => {
        return exportTypes.has(tx.txType);
      });
    },
    txsStake(): TransactionType[] {
      return this.allTxs.filter((tx) => {
        return stakeTypes.has(tx.txType);
      });
    },
  },
  mounted() {
    this.updateHistory();

    const now = new Date();
    this.yearNow = now.getFullYear();
    this.monthNow = now.getMonth();
    this.scrollToTop();
    this.setScrollHeight();
  },
  methods: {
    ...mapActions(useHistoryStore, {
      updateHistory: "updateAllTransactionHistory",
    }),
    openGlacierCsvModal() {
      (this.$refs.glacier_csv_modal as typeof ExportGlacierHistoryModal).open();
    },
    getTxTimestamp(tx: TransactionType) {
      return isTransactionX(tx) || isTransactionC(tx)
        ? tx.timestamp * 1000
        : tx.blockTimestamp * 1000;
    },
    prevPage() {
      if (this.monthNow === 0) {
        this.yearNow = this.yearNow - 1;
        this.monthNow = 11;
      } else {
        this.monthNow = this.monthNow - 1;
      }
      this.scrollToTop();
      this.setScrollHeight();
    },
    nextPage() {
      if (this.monthNow === 11) {
        this.yearNow = this.yearNow + 1;
        this.monthNow = 0;
      } else {
        this.monthNow = this.monthNow + 1;
      }
      this.scrollToTop();
      this.setScrollHeight();
    },
    scrollToTop() {
      (this.$refs.vlist as typeof DynamicScroller).scrollToItem(0);
    },
    setScrollHeight() {
      const h = (this.$refs.list as HTMLElement).clientHeight;
      this.listH = h;
    },
  },
});
export default Activity;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.activity_page {
  position: relative;
  display: grid;
  grid-template-rows: max-content 1fr;
  padding-bottom: 14px;
}

.explorer_warning {
  position: absolute;
  background-color: var(--bg);
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;

  h1 {
    font-weight: normal;
    margin-bottom: 14px;
    color: #fff;
  }

  .warning_body {
    display: flex;
    flex-direction: column;
    max-width: 380px;
    background-color: var(--secondary-color);
    color: #fff;
    padding: 30px;
    border-radius: 12px;
  }
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;

  p {
    margin: 0px 24px !important;
    color: var(--primary-color-light);
    font-size: 22px;
  }
}

.settings {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12px;
}

.tx_table {
  height: 100%;
  overflow: auto;
  border-top: 2px solid var(--bg-wallet);
  //overflow: scroll;
  //padding-right: 20px;
  //margin-right: 20px;
  //border-right: 1px solid var(--bg-light);
}

.tx_list {
  //max-height: 480px;
  //overflow: scroll;
  height: 100%;
  position: relative;
}

.table_headers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  //border-bottom: 1px solid var(--bg-light);
  //background-color: var(--bg-light);
}

.month_group {
  padding-bottom: 30px;
  border-bottom: 1px solid var(--bg-light);
  margin-bottom: 30px;

  &:last-of-type {
    border: none;
  }
}
.month_label {
  position: sticky;
  top: 0px;
}

.cols {
  height: 100%;
  //overflow: auto;
  //display: grid;
  //grid-template-columns: 1fr 240px;
}

.empty,
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 18px 12px;
}

.loading {
  background-color: var(--bg-light);
  padding: 30px;
}
.spinner {
  //width: 40px;
  //height: 40px;
  font-size: 32px;
  margin-bottom: 22px;
  color: #1d82bb;
}

.pagination {
  display: flex;
  flex-direction: row;
  align-items: center;
  p {
    margin-right: 12px !important;
  }
  button {
    width: 24px;
    height: 24px;
    border-radius: 3px;
    border: 1px solid var(--secondary-color);
    color: var(--secondary-color);
    margin-left: 6px;
    opacity: 0.6;
    transition-duration: 0.1s;

    &:hover {
      opacity: 1;
    }

    &[disabled] {
      border-color: var(--primary-color-light);
      color: var(--primary-color-light);
      opacity: 0.4;
    }
  }
}

.date_display {
  font-size: 24px;
}

.filter_cont {
  label {
    font-size: 12px;
    color: var(--primary-color);
  }
}

.pagination_info {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  font-size: 13px;
  color: var(--primary-color-light);
  transition-duration: 0.1s;

  button {
    margin-left: 14px;
    color: var(--secondary-color);
    opacity: 0.6;
    &:hover {
      opacity: 1;
    }
  }
}

.csv_buttons {
  .v-btn {
    margin-right: 1em;
  }
}
@include mixins.medium-device {
  .pagination {
    p {
      font-size: 18px;
    }
  }
}

@include mixins.mobile-device {
  .settings {
    display: grid;
    grid-template-columns: none;
    grid-template-rows: auto auto;
  }

  .filter_col {
    grid-row: 2;
    justify-content: center;
  }

  .pagination {
    justify-content: space-between;
    button {
      width: 35px;
      height: 35px;
    }
  }

  .pagination_info {
    justify-content: flex-start;
  }

  .tx_list {
    height: 90vh;
  }
}
</style>
