<template>
  <modal ref="modal" class="modal_main" :title="$t('modal.utxo_select.title')">
    <div class="utxo_select_modal_body">
      <p>{{ $t("modal.utxo_select.desc") }}</p>
      <div class="table_cont">
        <table>
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th class="col_date">
                {{ $t("modal.utxo_select.col1") }}
              </th>
              <th class="col_amt">
                {{ $t("modal.utxo_select.col2") }}
              </th>
            </tr>
          </thead>
          <tbody>
            <UtxoRow
              v-for="utxo in allSorted"
              :key="utxo.getUTXOID()"
              :utxo="utxo"
              @add="addUtxo(utxo)"
              @remove="removeUtxo(utxo)"
            ></UtxoRow>
          </tbody>
        </table>
      </div>
      <div class="tot">
        <label>{{ $t("modal.utxo_select.available") }}</label>
        <p>{{ selectedBalanceText }} METAL</p>
      </div>
      <v-btn block class="button_secondary" depressed small @click="close">
        {{ $t("modal.utxo_select.submit") }}
      </v-btn>
    </div>
  </modal>
</template>

<script lang="ts">
import type {
  AmountOutput,
  SECPTransferOutput,
  StakeableLockOut,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import type { PropType } from "vue";
import { BN } from "@metalblockchain/metaljs";

import {
  PlatformVMConstants,
  UTXOSet,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import UtxoRow from "@/components/modals/UtxoSelect/UtxoRow.vue";
import { bnToBig } from "@/helpers/helper";

export default defineComponent({
  components: {
    Modal,
    UtxoRow,
  },
  props: {
    all: {
      type: Array as PropType<UTXO[]>,
    },
    modelValue: { type: Array as PropType<UTXO[]> },
  },
  emits: ["update:modelValue"],
  data() {
    return {
      customSet: new UTXOSet(),
    };
  },
  computed: {
    allSorted() {
      return this.all
        ? // eslint-disable-next-line unicorn/no-array-sort
          [...this.all].sort((a: UTXO, b: UTXO) => {
            // Sort by Lock status
            const typeA = a.getOutput().getTypeID();
            const typeB = b.getOutput().getTypeID();

            let locktimeA = a.getOutput().getLocktime();
            let locktimeB = a.getOutput().getLocktime();

            if (typeA === PlatformVMConstants.STAKEABLELOCKOUTID) {
              const sLocktime = (
                a.getOutput() as StakeableLockOut
              ).getStakeableLocktime();
              locktimeA = BN.max(locktimeA, sLocktime);
            }

            if (typeB === PlatformVMConstants.STAKEABLELOCKOUTID) {
              const sLocktime = (
                b.getOutput() as StakeableLockOut
              ).getStakeableLocktime();
              locktimeB = BN.max(locktimeB, sLocktime);
            }

            // if (now.lt(locktimeA) && now.lt(locktimeB)) {
            if (locktimeA.gt(locktimeB)) {
              return -1;
            } else if (locktimeA.lt(locktimeB)) {
              return 1;
            }
            // }

            // Sort by amount
            const outA = a.getOutput() as StakeableLockOut | SECPTransferOutput;
            const outB = b.getOutput() as StakeableLockOut | SECPTransferOutput;

            const amtA = outA.getAmount();
            const amtB = outB.getAmount();

            return amtA.gt(amtB) ? -1 : 1;
          })
        : [];
    },
    selectedBalance() {
      const res = this.modelValue?.reduce((acc, utxo) => {
        const out = utxo.getOutput() as AmountOutput | StakeableLockOut;
        return acc.add(out.getAmount());
      }, new BN(0));
      return res;
    },
    selectedBalanceText() {
      return this.selectedBalance
        ? bnToBig(this.selectedBalance, 9).toLocaleString()
        : "";
    },
  },
  methods: {
    addUtxo(utxo: UTXO) {
      this.customSet.add(utxo);
      this.$emit("update:modelValue", this.customSet.getAllUTXOs());
    },
    removeUtxo(utxo: UTXO) {
      this.customSet.remove(utxo);
      this.$emit("update:modelValue", this.customSet.getAllUTXOs());
    },
    open(): void {
      const modal = this.$refs.modal as typeof Modal;
      modal.open();
    },
    close(): void {
      const modal = this.$refs.modal as typeof Modal;
      modal.close();
    },
  },
});
</script>
<style scoped lang="scss">
.utxo_select_modal_body {
  width: 720px;
  max-width: 100%;
  padding: 10px 20px;
}

table {
  width: 100%;
}

.table_cont {
  height: 230px;
  max-height: 100%;
  overflow: scroll;
  position: relative;
  background-color: var(--bg-light);
}

table {
  border-collapse: collapse;
}
th {
  background-color: var(--bg);
  z-index: 1;
  padding: 2px 0;
  border-bottom: 1px solid var(--bg);
  position: sticky;
  top: 0;
  font-size: 13px;
}

.col_amt {
  text-align: right;
  padding-right: 18px;
}

.tot {
  display: flex;
  //background-color: var(--bg-light);
  padding: 8px 12px;
  margin: 14px 0;
  justify-content: space-between;
}
</style>
