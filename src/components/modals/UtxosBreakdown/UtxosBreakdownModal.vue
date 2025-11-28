<template>
  <Modal ref="modal" title="Wallet UTXO Breakdown">
    <div class="utxos_breakdown_body">
      <div class="tabs">
        <button :data-active="chain === 'X'" @click="setChain('X')">
          X Chain
        </button>
        <button :data-active="chain === 'P'" @click="setChain('P')">
          P Chain
        </button>
      </div>
      <div class="scrollable">
        <div style="height: 90px">
          <table cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th></th>
                <th class="col_id">ID</th>
                <th>Type</th>
                <th>Locktime</th>
                <th class="col_thresh">Threshold</th>
                <th>Owners</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              <UTXORow
                v-for="utxo in avmUTXOs"
                v-show="chain === 'X'"
                :key="utxo.getUTXOID()"
                :utxo="utxo"
              ></UTXORow>
              <UTXORow
                v-for="utxo in platformUTXOs"
                v-show="chain === 'P'"
                :key="utxo.getUTXOID()"
                :is-x="false"
                :utxo="utxo"
              ></UTXORow>
              <tr v-if="isEmpty" class="empty_row">
                <td colspan="7">
                  <p style="text-align: center">
                    You do not have any UTXOs on this chain.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script lang="ts">
import type { UTXO as AVMUTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  UTXO as PlatformUTXO,
  StakeableLockOut,
} from "@metalblockchain/metaljs/dist/apis/platformvm";

import type { WalletType } from "@/js/wallets/types";
import { AVMConstants } from "@metalblockchain/metaljs/dist/apis/avm";
import { PlatformVMConstants } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import UTXORow from "@/components/modals/UtxosBreakdown/AVMUTXORow.vue";

export const UtxosBreakdownModal = defineComponent({
  components: { UTXORow, Modal },
  data() {
    return {
      chain: "X",
    };
  },
  computed: {
    wallet(): WalletType | null {
      return this.$store.state.activeWallet;
    },
    avmUTXOs(): AVMUTXO[] {
      if (!this.wallet) return [];
      const utxos = this.wallet.getUTXOSet().getAllUTXOs();
      // eslint-disable-next-line unicorn/no-array-sort
      const sorted = utxos.sort(this.sortFnc);
      return sorted;
    },
    platformUTXOs(): PlatformUTXO[] {
      if (!this.wallet) return [];
      const utxos = this.wallet.getPlatformUTXOSet().getAllUTXOs();
      // eslint-disable-next-line unicorn/no-array-sort
      const sorted = utxos.sort(this.sortFnc);
      return sorted;
    },
    isEmpty() {
      return this.chain === "X"
        ? this.avmUTXOs.length === 0
        : this.platformUTXOs.length === 0;
    },
  },
  methods: {
    open(): void {
      const modal = this.$refs.modal;
      (modal as typeof Modal).open();
    },
    setChain(chainID: string) {
      this.chain = chainID;
    },
    sortFnc(a: PlatformUTXO | AVMUTXO, b: PlatformUTXO | AVMUTXO) {
      const aOut = a.getOutput();
      const bOut = b.getOutput();

      const aType = aOut.getTypeID();
      const bType = bOut.getTypeID();

      if (aType === bType) {
        let aLock = aOut.getLocktime().toNumber();
        let bLock = bOut.getLocktime().toNumber();

        if (aType === PlatformVMConstants.STAKEABLELOCKOUTID) {
          const aStakeLock = (aOut as StakeableLockOut)
            .getStakeableLocktime()
            .toNumber();
          const bStakeLock = (bOut as StakeableLockOut)
            .getStakeableLocktime()
            .toNumber();

          aLock = Math.max(aLock, aStakeLock);
          bLock = Math.max(bLock, bStakeLock);
        }

        if (aLock !== bLock) return bLock - aLock;
        return 0;
      } else {
        if (aType === AVMConstants.SECPXFEROUTPUTID) {
          return -1;
        } else if (bType === AVMConstants.SECPXFEROUTPUTID) {
          return 1;
        }

        if (aType === AVMConstants.NFTXFEROUTPUTID) {
          return -1;
        } else if (bType === AVMConstants.NFTXFEROUTPUTID) {
          return 1;
        }

        if (aType === AVMConstants.NFTMINTOUTPUTID) {
          return -1;
        } else if (bType === AVMConstants.NFTMINTOUTPUTID) {
          return 1;
        }

        if (aType === AVMConstants.SECPMINTOUTPUTID) {
          return -1;
        } else if (bType === AVMConstants.SECPMINTOUTPUTID) {
          return 1;
        }

        // if(aType === AVMConstants.)
      }

      return 0;
    },
  },
});
export default UtxosBreakdownModal;
</script>
<style scoped lang="scss">
.utxos_breakdown_body {
  width: 90vw;
  height: 80vh;
  max-width: 1500px;
  display: grid;
  grid-template-rows: max-content 1fr;
}

.scrollable {
  height: 100%;
  overflow: scroll;
  position: relative;
}
table {
  width: 100%;
  overflow: scroll;
  border-collapse: collapse;
  padding: 0;
}
th {
  font-size: 13px;
  font-weight: bold;
  position: sticky;
  top: 0;
  background-color: var(--bg);
}

thead {
  tr {
    border-bottom: 2px solid var(--bg-wallet);
  }
}

.tabs {
  > button {
    padding: 12px 24px;
    transition-duration: 0.2s;

    &:hover {
      color: var(--secondary-color);
    }

    &[data-active="true"] {
      background-color: var(--secondary-color);
      color: #fff;
    }
  }
}

.empty_row {
  color: var(--primary-color-light);
  td {
    padding: 30px;
  }
}
</style>

<style lang="scss">
.utxos_breakdown_body {
  .col_id {
    //padding-left: 12px !important;
    //width: 60px;
    display: block;
  }

  .col_thresh {
    text-align: center;
  }

  th,
  td {
    padding: 1px 4px;
  }
}
</style>
