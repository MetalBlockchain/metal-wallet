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
          :items="txsProcessed"
          key-field="txHash"
          :min-item-size="70"
          :style="{ height: '100%' }"
        >
          <template #default="{ item, index, active }">
            <DynamicScrollerItem
              :active="active"
              :data-index="index"
              :emit-resize="true"
              :item="item"
              :size-dependencies="['isDayChange']"
            >
              <TxRow :index="index" :source="item"></TxRow>
            </DynamicScrollerItem>
          </template>
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
<script lang="ts" setup>
import type { TransactionType, TransactionTypeName } from "@/js/Glacier/models";

import { useI18n } from "vue-i18n";
import { DynamicScroller, DynamicScrollerItem } from "vue-virtual-scroller";
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

const { t } = useI18n();
const networkStore = useNetworkStore();
const historyStore = useHistoryStore();

const tList = useTemplateRef("list");
const tVList = useTemplateRef("vlist");
const tGlacier_csv_modal = useTemplateRef("glacier_csv_modal");

const mode = ref<ModeKeyType>("all");
const modes = ref<string[]>([
  t("activity.mode1"),
  t("activity.mode2"),
  t("activity.mode3"),
  t("activity.mode4"),
]);
const modeKey = ref<ModeKeyType[]>(["all", "transfer", "swap", "stake"]);
const isLoading = ref(false);
const monthNow = ref(0);
const yearNow = ref(0);
const listH = ref(0);

const activeNetwork = computed(() => networkStore.selectedNetwork);
const isUpdatingAll = computed(() => historyStore.isUpdatingAll);
const isError = computed(() => historyStore.isError);
const allTxs = computed(() => {
  return historyStore.allTransactions.filter((tx: TransactionType) => {
    return supportedTypes.has(tx.txType);
  });
});

const isCsvDisabled = computed(() => {
  return !hasExplorer.value || isFuji.value;
});

const showList = computed(() => {
  if (isUpdatingAll.value || isLoading.value || isError.value) return false;
  return true;
});
const isNextPage = computed(() => {
  const now = new Date();
  if (yearNow.value < now.getFullYear()) return true;
  if (monthNow.value < now.getMonth()) return true;
  return false;
});

const isPrevPage = computed(() => {
  // if (this.yearNow  now.getFullYear()) return true
  if (monthNow.value === MONTH_MIN && yearNow.value === YEAR_MIN) return false;
  return true;
});

const monthNowName = computed(() => {
  return t(`activity.months.${monthNow.value}`);
});

const isMainnet = computed(() => {
  return (
    activeNetwork.value && isMainnetNetworkID(activeNetwork.value.networkId)
  );
});
const isFuji = computed(() => {
  return (
    activeNetwork.value && isTestnetNetworkID(activeNetwork.value.networkId)
  );
});

const hasExplorer = computed(() => {
  if (!activeNetwork.value) return false;
  return isMainnet.value || isFuji.value;
});

const txs = computed<TransactionType[]>(() => {
  let txsSource;
  switch (mode.value) {
    case "transfer": {
      txsSource = txsTransfer.value;
      break;
    }
    case "swap": {
      txsSource = txsSwap.value;
      break;
    }
    case "stake": {
      txsSource = txsStake.value;
      break;
    }
    default: {
      txsSource = allTxs.value;
      break;
    }
  }

  const filtered = txsSource.filter((tx) => {
    const date = new Date(getTxTimestamp(tx));

    if (
      date.getMonth() === monthNow.value &&
      date.getFullYear() === yearNow.value
    ) {
      return true;
    }
    return false;
  });
  return filtered;
});

const txsProcessed = computed(() => {
  const txsSource = txs.value;

  const res = txsSource.map((tx, index) => {
    let showMonth = false;
    let showDay = false;

    if (index === 0) {
      showMonth = true;
      showDay = true;
    } else {
      const txBefore = txsSource[index - 1];
      if (txBefore) {
        const date = new Date(getTxTimestamp(tx));
        const dateBefore = new Date(getTxTimestamp(txBefore));

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
});

const txsTransfer = computed(() => {
  return allTxs.value.filter((tx) => {
    return transferTypes.has(tx.txType);
  });
});

const txsSwap = computed(() => {
  return allTxs.value.filter((tx) => {
    return exportTypes.has(tx.txType);
  });
});

const txsStake = computed(() => {
  return allTxs.value.filter((tx) => {
    return stakeTypes.has(tx.txType);
  });
});

onMounted(() => {
  updateHistory();

  const now = new Date();
  yearNow.value = now.getFullYear();
  monthNow.value = now.getMonth();
  scrollToTop();
  setScrollHeight();
});

const updateHistory = historyStore.updateAllTransactionHistory;

function openGlacierCsvModal() {
  tGlacier_csv_modal.value?.open();
}

function getTxTimestamp(tx: TransactionType) {
  return isTransactionX(tx) || isTransactionC(tx)
    ? tx.timestamp * 1000
    : tx.blockTimestamp * 1000;
}

function prevPage() {
  if (monthNow.value === 0) {
    yearNow.value = yearNow.value - 1;
    monthNow.value = 11;
  } else {
    monthNow.value = monthNow.value - 1;
  }
  scrollToTop();
  setScrollHeight();
}

function nextPage() {
  if (monthNow.value === 11) {
    yearNow.value = yearNow.value + 1;
    monthNow.value = 0;
  } else {
    monthNow.value = monthNow.value + 1;
  }
  scrollToTop();
  setScrollHeight();
}

function scrollToTop() {
  tVList.value?.scrollToItem(0);
}

function setScrollHeight() {
  const h = tList.value?.clientHeight ?? 0;
  listH.value = h;
}
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
