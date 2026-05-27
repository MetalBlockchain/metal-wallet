<template>
  <div>
    <h4>{{ $t("earn.shared.utxo_select.label") }}</h4>
    <p class="desc">
      {{ $t("earn.shared.utxo_select.desc") }}
    </p>
    <v-chip-group v-model="formType" mandatory @change="onTypeChange">
      <v-chip small value="all">{{ $t("earn.shared.utxo_select.all") }}</v-chip>
      <v-chip small value="custom">{{
        $t("earn.shared.utxo_select.custom")
      }}</v-chip>
    </v-chip-group>

    <div class="available">
      <div>
        <label>{{ $t("earn.shared.utxo_select.available") }}</label>
        <p>
          <span>{{ selectedBalanceText }} METAL</span>
        </p>
      </div>

      <button
        v-if="formType === 'custom'"
        class="select_but"
        @click="openModal"
      >
        <fa icon="search"></fa>
        {{ $t("earn.shared.utxo_select.select") }}
      </button>
    </div>

    <UtxoSelectModal
      ref="modal"
      v-model="customUtxos"
      :all="platformUtxos"
    ></UtxoSelectModal>
  </div>
</template>
<script lang="ts">
import type {
  AmountOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import type { WalletType } from "@/js/wallets/types";

import { BN } from "@metalblockchain/metaljs";
import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent, ref } from "vue";
import UtxoSelectModal from "@/components/modals/UtxoSelect/UtxoSelectModal.vue";
import { bnToBig } from "@/helpers/helper";

export const UtxoSelectForm = defineComponent({
  components: {
    UtxoSelectModal,
  },
  props: {
    modelValue: { type: Array },
  },
  emits: ["update:modelValue"],
  setup() {
    const customUtxos = ref<UTXO[]>();
    const formType = ref<string>("all");

    return {
      customUtxos,
      formType,
    };
  },
  computed: {
    platformUtxos(): UTXO[] {
      const wallet: WalletType | null = this.$store.state.activeWallet;
      if (!wallet) return [];
      const utxos = wallet.getPlatformUTXOSet().getAllUTXOs();
      const now = UnixNow();
      return utxos.filter((utxo) => {
        // Filter out locked and multisig utxos
        const locktime = utxo.getOutput().getLocktime();
        const threshold = utxo.getOutput().getThreshold();
        if (locktime.gt(now)) return false;
        if (threshold > 1) return false;
        return true;
      });
    },
    selectedBalance(): BN {
      return this.formType === "all"
        ? this.platformUtxos.reduce((acc, val: UTXO) => {
            const out = val.getOutput() as AmountOutput;
            return acc.add(out.getAmount());
          }, new BN(0))
        : (this.customUtxos?.reduce((acc, val) => {
            const out = val.getOutput() as AmountOutput;
            return acc.add(out.getAmount());
          }, new BN(0)) ?? new BN(0));
    },
    selectedBalanceText() {
      return bnToBig(this.selectedBalance, 9).toLocaleString();
    },
  },
  watch: {
    customUtxos: [
      {
        handler: "onCustomChange",
      },
    ],
    platformUtxos: [
      {
        handler: "onPlatformUtxosChange",
      },
    ],
  },
  mounted() {
    this.selectAll();
  },
  methods: {
    onTypeChange(val: string) {
      if (val === "all") {
        this.selectAll();
      } else {
        this.selectCustom();
      }
    },
    openModal() {
      //@ts-ignore
      this.$refs.modal.open();
    },
    selectCustom() {
      this.$emit("update:modelValue", this.customUtxos);
    },
    selectAll() {
      this.$emit("update:modelValue", this.platformUtxos);
    },
    clear() {
      this.selectAll();
    },
    onCustomChange(utxos: UTXO[]) {
      if (this.formType === "custom") {
        this.$emit("update:modelValue", utxos);
      }
    },
    onPlatformUtxosChange(_: UTXO[]) {
      if (this.formType === "all") {
        this.selectAll();
      }
    },
  },
});
export default UtxoSelectForm;
</script>
<style scoped lang="scss">
.available {
  max-width: 100%;
  padding: 6px 14px;
  background-color: var(--bg-light);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

label {
  margin-top: 6px;
  color: var(--primary-color-light);
  font-size: 14px;
  margin-bottom: 3px;
}
.select_but {
  font-size: 12px;
  color: var(--secondary-color);
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
}

.desc {
  font-size: 13px;
  margin-bottom: 8px !important;
  color: var(--primary-color-light);
}
</style>
