<template>
  <div class="import_row" :data-export="isExport && !isExportReceiver">
    <p class="actionTitle">{{ actionTitle }} ({{ chainAlias }})</p>
    <div class="flex-column">
      <p v-if="isExportReceiver" class="amt">
        {{ toLocaleString(outputReceivedBalances, 9) }} AVAX
      </p>
      <template v-else>
        <p v-for="(bal, key) in balances" :key="key" class="amt">
          {{ isExport ? "-" : ""
          }}{{ toLocaleString(bal.amount, bal.decimals) }}
          {{ bal.symbol }}
        </p>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import type { TransactionType, XChainTransaction } from "@/js/Glacier/models";
import type { PropType } from "vue";
import { BN } from "@metalblockchain/metaljs";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";
import { isOwnedUTXO } from "@/js/Glacier/isOwnedUtxo";
import { isTransactionP } from "@/js/Glacier/models";
import { avm, cChain, pChain } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useRootStore } from "@/stores/pinia/root";
import { getExportBalances } from "./getExportBalances";

function idToAlias(chainId: string | undefined) {
  switch (chainId) {
    case pChain.getBlockchainID(): {
      return "P";
    }
    case avm.getBlockchainID(): {
      return "X";
    }
    case cChain.getBlockchainID(): {
      return "C";
    }
    // No default
  }
  return chainId;
}

export const ImportExport = defineComponent({
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
    ...mapState(useAssetsStore, ["assetsDict"]),
    isExport() {
      return this.transaction?.txType === "ExportTx";
    },
    actionTitle() {
      if (this.isExport) {
        return this.isExportReceiver ? "Received" : "Export";
      } else {
        return "Import";
      }
    },
    destinationChainId() {
      //TODO: Remove type when PChainTx is ready
      return (this.transaction as XChainTransaction).destinationChain!;
    },
    sourceChainId() {
      //TODO: Remove type when PChainTx is ready
      return (this.transaction as XChainTransaction).sourceChain;
    },
    chainAlias() {
      const chainId = this.isExport
        ? this.sourceChainId
        : this.destinationChainId;
      return idToAlias(chainId);
    },
    ownedInputs() {
      const tx = this.transaction;

      return tx && isTransactionP(tx)
        ? tx.consumedUtxos.filter((utxo) => {
            return isOwnedUTXO(utxo, this.addresses);
          })
        : [];
    },
    ownedOutputs() {
      const tx = this.transaction;
      return tx && isTransactionP(tx)
        ? tx.emittedUtxos.filter((utxo) => {
            return isOwnedUTXO(utxo, this.addresses);
          })
        : [];
    },
    sourceChainAlias() {
      return idToAlias(this.sourceChainId);
    },
    balances() {
      if (this.transaction) {
        return getExportBalances(
          this.transaction,
          this.destinationChainId,
          this.getAssetFromID,
        );
      }
      return [];
    },
    isExportReceiver() {
      return (
        this.isExport &&
        this.ownedInputs.length === 0 &&
        this.ownedOutputs.length > 0
      );
    },
    outputReceivedBalances() {
      return this.ownedOutputs.reduce((agg, utxo) => {
        return agg.add(new BN(utxo.amount));
      }, new BN(0));
    },
  },
  methods: {
    toLocaleString(val: BN, decimals: number) {
      return bnToBig(val, decimals).toLocaleString();
    },
    getAssetFromID(id: string) {
      return this.assetsDict[id];
    },
  },
});

export default ImportExport;
</script>

<style scoped lang="scss">
.import_row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--primary-color-light);

  &[data-export="true"] {
    .amt {
      color: #992005;
    }
  }
}

.actionTitle {
  white-space: nowrap;
}

.amt {
  text-align: right;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 500;
  color: var(--success);
  word-break: normal;
}
</style>
