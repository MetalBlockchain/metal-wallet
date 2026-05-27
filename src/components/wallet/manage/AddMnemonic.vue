<template>
  <div class="add_mnemonic">
    <textarea
      v-model="phrase"
      autocapitalize="off"
      autocomplete="off"
      placeholder="web  jar  rack  cereal  inherit ...."
    ></textarea>
    <p class="err">{{ err }}</p>
    <v-btn
      block
      class="addKeyBut button_primary ava_button"
      depressed
      :disabled="!canSubmit"
      :loading="isLoading"
      @click="access"
    >
      {{ $t("keys.import_key_button") }}
    </v-btn>
  </div>
</template>

<script lang="ts">
import * as bip39 from "bip39";
import { mapActions } from "pinia";
import { defineComponent } from "vue";
import { useRootStore } from "@/stores/pinia/root";

export default defineComponent({
  emits: ["success"],
  data() {
    return {
      phrase: "",
      err: "",
      isLoading: false,
    };
  },
  computed: {
    wordCount(): number {
      return this.phrase.trim().split(" ").length;
    },
    canSubmit() {
      if (this.wordCount < 24) {
        return false;
      }
      return true;
    },
  },
  methods: {
    ...mapActions(useRootStore, ["addWalletMnemonic"]),
    errCheck() {
      const phrase = this.phrase.trim();
      const words = phrase.split(" ");

      // not a valid key phrase
      if (words.length !== 24) {
        this.err =
          "Invalid key phrase. Your phrase must be 24 words separated by a single space.";
        return false;
      }

      if (!bip39.validateMnemonic(phrase)) {
        this.err = "Not a valid mnemonic phrase.";
        return false;
      }

      return true;
    },
    clear() {
      this.phrase = "";
      this.err = "";
      this.isLoading = false;
    },
    async access() {
      const phrase = this.phrase.trim();
      this.err = "";
      this.isLoading = true;

      if (!this.errCheck()) {
        this.isLoading = false;
        return;
      }

      setTimeout(() => {
        try {
          this.addWalletMnemonic(phrase);
          this.isLoading = false;
          this.handleImportSuccess();
        } catch (error) {
          this.isLoading = false;
          this.err = (error as Error).message.includes("already")
            ? (this.$t("keys.import_mnemonic_duplicate_err") as string)
            : (this.$t("keys.import_mnemonic_err") as string);
        }
      }, 500);
    },
    handleImportSuccess() {
      this.phrase = "";
      this.$emit("success");
    },
  },
});
</script>
<style scoped lang="scss">
.add_mnemonic {
  /*background-color: #e7e7ea;*/
  padding: 14px 0;
}

textarea {
  padding: 12px;
  font-size: 0.8rem;
  background-color: var(--bg-wallet);
  resize: none;
  width: 100%;
  height: 120px;
  margin-top: 14px;
}

.but_submit {
  margin-top: 12px;
}

.err {
  color: var(--error);
  font-size: 14px;
}
</style>
