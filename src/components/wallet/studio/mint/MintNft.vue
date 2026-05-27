<template>
  <div>
    <div v-if="!mintUtxo">
      <p>{{ $t("studio.mint.desc") }}</p>
      <SelectMintUTXO
        class="select_mint_utxo"
        @change="setUtxo"
      ></SelectMintUTXO>
    </div>
    <MintForm
      v-else
      :mint-utxo="mintUtxo"
      @cancel="cancel"
      @clear-utxo="clearUtxo"
    ></MintForm>
  </div>
</template>
<script lang="ts">
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type Big from "big.js";
import { defineComponent } from "vue";

import MintForm from "@/components/wallet/studio/mint/MintForm.vue";
import SelectMintUTXO from "@/components/wallet/studio/mint/SelectMintUtxo/SelectMintUTXO.vue";
import { bnToBig } from "@/helpers/helper";
import { pChain } from "@/misc/AVA";

export const MintNft = defineComponent({
  components: {
    SelectMintUTXO,
    MintForm,
  },
  emits: ["cancel"],
  setup() {
    const isLoading = ref(false);
    const mintUtxo = ref<UTXO>();

    return {
      isLoading,
      mintUtxo,
    };
  },
  computed: {
    txFee(): Big {
      return bnToBig(pChain.getTxFee(), 9);
    },
    mintUtxos() {
      // return this.$store.getters.walletNftMintUTXOs
      return this.$store.state.Assets.nftMintUTXOs;
    },
  },
  mounted() {
    const utxoId = this.$route.query.utxo;

    // Select the utxo in the query if possible
    if (utxoId) {
      const utxos: UTXO[] = this.mintUtxos;

      for (const utxo of utxos) {
        const id = utxo.getUTXOID();

        if (id === utxoId) {
          this.setUtxo(utxo);
        }
      }
    }
  },
  methods: {
    async submit() {
      const wallet = this.$store.state.activeWallet;
      if (!wallet) return;

      this.isLoading = true;
      this.isLoading = false;
    },
    setUtxo(utxo: UTXO) {
      this.mintUtxo = utxo;
    },
    clearUtxo() {
      this.mintUtxo = undefined;
    },
    cancel() {
      this.$emit("cancel");
    },
  },
});
export default MintNft;
</script>
<style scoped lang="scss"></style>
