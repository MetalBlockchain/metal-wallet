<template>
  <div class="access_card">
    <div class="content">
      <h1>XPUB (Readonly)</h1>
      <p class="desc">Show METAL balances.</p>
      <form @submit.prevent="access">
        <p class="_label">X & P-Chain Extended Public Key</p>
        <v-text-field
          v-model="xpubXP"
          class="pass"
          dense
          flat
          hide-details
          label="xpub..."
          solo
          type="password"
        ></v-text-field>
        <p class="_label">C-Chain Address</p>
        <v-text-field
          v-model="evmAddr"
          class="pass"
          dense
          flat
          hide-details
          label="0x..."
          solo
        ></v-text-field>
        <p class="err">{{ error }}</p>

        <v-btn
          class="ava_button button_primary"
          depressed
          :disabled="!canSubmit"
          :loading="isLoading"
          @click="access"
        >
          View Wallet Balances
        </v-btn>
      </form>
    </div>
  </div>
</template>
<script lang="ts">
import { PublicMnemonicWallet } from "@metalblockchain/metal-wallet-sdk";
import { ethers } from "ethers";
import { defineComponent } from "vue";
// import Form from "@/components/wallet/earn/ChainTransfer/Form.vue";
// import WalletReadonly from "@/views/WalletReadonly.vue";

export default defineComponent({
  data() {
    const wallet: PublicMnemonicWallet | null = null;

    return {
      xpubXP: "",
      evmAddr: "",
      xpubC: "",
      isLoading: false,
      error: "",
      wallet,
    };
  },
  computed: {
    canSubmit() {
      return this.xpubXP.length > 10 && this.evmAddr.length > 9;
    },
  },
  methods: {
    access() {
      try {
        ethers.utils.getAddress(this.evmAddr);
      } catch {
        this.error = " Invalid evm address";
        return;
      }

      try {
        // Not using real xpub for EVM, instead getting C balance
        // directly from network
        const wallet = new PublicMnemonicWallet(this.xpubXP, this.xpubXP);
        this.$router.push({
          name: "wallet_readonly",
          params: {
            //@ts-ignore
            wallet: wallet,
            evmAddress: this.evmAddr,
          },
        });
      } catch {
        this.error = "Invalid XPUB key.";
      }
    },
  },
});
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";

h1 {
  font-size: vars.$m-size;
  font-weight: 400;
}
.pass {
  // background-color: var(--bg) !important;
}

.desc {
  font-size: 0.9em;
  color: var(--primary-color-light);
  //margin-bottom: 30px !important;
}

.content {
  width: 460px;
  max-width: 100%;
  margin: 0px auto;
  padding: 2em;
  background-color: var(--bg-light);
}
._label {
  margin-top: 1em !important;
  font-size: 0.9em;
  text-align: left !important;
}

.ava_button {
  width: 100%;
  margin-top: 22px;
}
</style>
