<template>
  <div>
    <h2>{{ $t("advanced.sign.title") }}</h2>
    <p
      style="margin-bottom: 14px !important; font-size: 14px; font-weight: 500"
    >
      {{ $t("advanced.sign.desc") }}
    </p>
    <div v-if="isHD">
      <label>{{ $t("advanced.sign.label1") }}</label>
      <SearchAddress v-model="sourceAddress" :wallet="wallet"></SearchAddress>
    </div>
    <div>
      <label>{{ $t("advanced.sign.label2") }}</label>
      <p class="warn">{{ $t("advanced.sign.warn") }}</p>
      <textarea v-model="message"></textarea>
    </div>
    <p class="err">{{ error }}</p>
    <v-btn
      block
      class="button_secondary"
      depressed
      :disabled="!canSubmit"
      small
      @click="sign"
    >
      {{ $t("advanced.sign.submit") }}
    </v-btn>

    <div v-if="signed" class="result">
      <label>{{ $t("advanced.sign.label3") }}</label>
      <p class="signed">{{ signed }}</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { SingletonWallet } from "@/js/wallets/SingletonWallet";
import type { WalletType } from "@/js/wallets/types";
import { defineComponent } from "vue";
import SearchAddress from "@/components/wallet/advanced/SignMessage/SearchAddress.vue";

export const SignMessage = defineComponent({
  components: { SearchAddress },
  data() {
    return {
      sourceAddress: undefined,
      message: "",
      signed: "",
      error: "",
    };
  },
  computed: {
    wallet(): WalletType {
      return this.$store.state.activeWallet;
    },
    isHD() {
      return this.wallet.type !== "singleton";
    },
    canSubmit(): boolean {
      if (!this.sourceAddress && this.isHD) return false;
      if (!this.message) return false;

      return true;
    },
  },
  deactivated() {
    this.clear();
  },
  methods: {
    async sign() {
      this.error = "";
      try {
        // Convert the message to a hashed buffer
        // let hashMsg = this.msgToHash(this.message);
        this.signed = await (this.wallet.type === "singleton"
          ? (this.wallet as SingletonWallet).signMessage(this.message)
          : this.wallet.signMessage(this.message, this.sourceAddress!));
      } catch (error: any) {
        this.error = error;
      }
    },
    clear() {
      this.message = "";
      this.signed = "";
      this.error = "";
    },
  },
});
export default SignMessage;
</script>
<style scoped lang="scss">
h2 {
  font-size: 20px;
  font-weight: 500;
  color: var(--tertiary-color);
  margin-bottom: 16px;
}
select,
textarea,
.signed {
  padding: 6px 12px;
  background-color: rgba(0, 0, 0, 0.1);
}
select {
  outline: none;
  width: 100%;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 13px;

  &:hover {
    color: var(--primary-color);
  }
}

option {
  background-color: var(--bg-wallet);
}

label {
  display: block;
  text-align: left;
  color: var(--primary-color-light);
  font-size: 12px;
  margin-bottom: 20px;
  margin-top: 6px;
}

textarea {
  width: 100%;
  resize: none;
  font-size: 13px;
  padding: 6px 12px;
  height: 80px;
}

.signed {
  word-break: break-all;
  font-size: 12px;
}

.warn {
  font-size: 12px;
  color: var(--secondary-color);
}

.result {
  margin-top: 6px;
}
</style>
