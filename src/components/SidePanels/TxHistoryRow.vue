<template>
  <div class="tx_history_row">
    <div>
      <p class="time">
        {{ timeText }}
        <a
          v-if="explorerUrl"
          class="explorer_link"
          :href="explorerUrl"
          target="_blank"
          tooltip="View in Explorer"
        >
          <fa icon="search"></fa>
        </a>
      </p>

      <div v-if="memo" class="memo">
        <p>Memo</p>
        <p>{{ memo }}</p>
      </div>
    </div>
    <component :is="viewComponent" :transaction="transaction"></component>
    <p v-if="hasMultisig" class="multisig_warn">
      <fa icon="exclamation-triangle"></fa>
      Contains Shared Balance (Multisig)
    </p>
  </div>
</template>
<script lang="ts">
import type { PChainUtxo, Utxo } from "@metalblockchain/glacier-sdk";
import type { PropType } from "vue";
import type {
  TransactionType,
  TransactionTypeName,
  XChainTransaction,
} from "@/js/Glacier/models";
import moment from "moment";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import BaseTx from "@/components/SidePanels/History/ViewTypes/BaseTx.vue";
import ImportExport from "@/components/SidePanels/History/ViewTypes/ImportExport.vue";
import StakingTx from "@/components/SidePanels/History/ViewTypes/StakingTx.vue";
import TxHistoryNftFamilyGroup from "@/components/SidePanels/TxHistoryNftFamilyGroup.vue";
import { getUrlFromTransaction } from "@/js/Glacier/getUrlFromTransaction";
import { isOwnedUTXO } from "@/js/Glacier/isOwnedUtxo";
import { isTransactionC, isTransactionX } from "@/js/Glacier/models";
import { ava } from "@/misc/AVA";
import { useRootStore } from "@/stores/pinia/root";

export const TxHistoryRow = defineComponent({
  components: {
    TxHistoryNftFamilyGroup,
  },
  props: {
    transaction: {
      type: Object as PropType<TransactionType>,
    },
  },
  computed: {
    ...mapState(useRootStore, {
      addresses: (store) => {
        if (!store.activeWallet) return [];
        return store.activeWallet.getHistoryAddresses();
      },
    }),
    explorerUrl(): string | null {
      if (!this.transaction) return null;
      const netID = ava.getNetworkID();
      return getUrlFromTransaction(netID, this.transaction);
    },
    hasMultisig() {
      if (!this.ownedOutputs) return false;
      let totMultiSig = 0;
      // eslint-disable-next-line unicorn/no-array-for-each
      this.ownedOutputs.forEach((utxo: Utxo | PChainUtxo) => {
        if (utxo.addresses.length > 1) {
          totMultiSig++;
        }
      });
      return totMultiSig > 0;
    },
    outputUTXOs(): Utxo[] | PChainUtxo[] {
      return (this.transaction as XChainTransaction)?.emittedUtxos ?? [];
    },
    ownedOutputs() {
      return (this.outputUTXOs as (Utxo | PChainUtxo)[]).filter(
        (utxo: Utxo | PChainUtxo) => {
          return isOwnedUTXO(utxo, this.addresses);
        },
      );
    },
    memo(): string | null {
      // TODO: Is Memo supported
      return "";
    },
    timestamp() {
      if (!this.transaction) return 0;
      return isTransactionX(this.transaction) ||
        isTransactionC(this.transaction)
        ? this.transaction.timestamp * 1000
        : this.transaction.blockTimestamp * 1000;
    },
    time() {
      return moment(this.timestamp);
    },
    timeText(): string {
      const now = Date.now();
      const diff = now - new Date(this.timestamp).getTime();

      const dayMs = 1000 * 60 * 60 * 24;

      if (diff > dayMs) {
        return this.time.format("MMM DD, YYYY");
      }
      return this.time.fromNow();
    },
    viewComponent() {
      const type = this.transaction?.txType as TransactionTypeName;

      switch (type) {
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
  },
});
export default TxHistoryRow;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";

.icons {
  justify-self: center;
  img {
    width: 20px;
    height: 20px;
    object-fit: contain;
  }
}

.tx_history_row {
  padding: 10px 0px;

  > div {
    align-self: center;
    overflow: auto;
  }
}

.explorer_link {
  color: var(--primary-color-light);
}

.time {
  font-size: 14px;
  font-weight: 500;
  color: var(--tertiary-color);

  a {
    float: right;
    opacity: 0.4;
    font-size: 12px;

    &:hover {
      opacity: 0.8;
    }
  }
}

.from {
  font-size: 12px;
  color: var(--primary-color-light);
  word-break: keep-all;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rewarded,
.memo {
  overflow-wrap: break-word;
  word-break: break-word;
  font-size: 12px;
  color: vars.$primary-color-light;
  display: grid;
  grid-template-columns: max-content 1fr;
  column-gap: 12px;
  margin-bottom: 4px;

  p:last-of-type {
    text-align: right;
  }
}

.rewarded {
  span {
    margin-right: 6px;
    color: var(--success);
  }
}
.not_rewarded span {
  color: var(--error);
}
.nfts {
  display: flex;
  flex-wrap: wrap;
  margin-top: 5px;
  justify-content: flex-end;
  > div {
    margin-left: 5px;
  }
}

.multisig_warn {
  color: var(--error);
  font-size: 0.8em;
}

@include mixins.medium-device {
  .icons {
    justify-self: left;
    img {
      width: 14px;
      height: 14px;
      object-fit: contain;
    }
  }

  .tx_history_row {
    padding: 8px 0px;
    grid-template-columns: 24px 1fr;
  }
  .time {
    font-size: 14px;
    text-align: left;
  }
}
</style>
