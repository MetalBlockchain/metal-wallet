<template>
  <div class="export_wallet">
    <p v-if="isDesc" class="explain">{{ $t("keys.export_key_desc") }}</p>
    <form @submit.prevent="download">
      <label>Password (min 9 characters)</label>
      <v-text-field
        v-model="pass"
        class="formIn"
        dense
        height="40"
        hide-details
        outlined
        placeholder="Password"
        type="password"
      ></v-text-field>
      <label>Confirm Password</label>
      <v-text-field
        v-model="passConfirm"
        class="formIn"
        dense
        height="40"
        hide-details
        outlined
        placeholder="Confirm Password"
        type="password"
      ></v-text-field>
      <p class="err">{{ err }}</p>
      <v-btn
        block
        class="button_primary"
        depressed
        :disabled="!isValid"
        :loading="isLoading"
        type="submit"
      >
        Export Wallet
      </v-btn>
    </form>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { ExportWalletsInput } from "@/stores/types";
import { defineComponent } from "vue";

export const ExportWallet = defineComponent({
  props: {
    wallets: {
      type: Array as PropType<MnemonicWallet[]>,
    },
    isDesc: { default: true, type: Boolean },
  },
  emits: ["success"],
  data() {
    return {
      isLoading: false,
      pass: "",
      passConfirm: "",
      err: "",
    };
  },
  computed: {
    isValid(): boolean {
      return this.pass.length >= 9 && this.pass === this.passConfirm
        ? true
        : false;
    },
  },
  methods: {
    clear() {
      this.isLoading = false;
      this.pass = "";
      this.passConfirm = "";
      this.err = "";
    },
    async download() {
      this.isLoading = true;
      this.err = "";

      if (!this.wallets) {
        this.isLoading = false;
        this.err = "No wallet selected.";
        return;
      }

      const input: ExportWalletsInput = {
        password: this.pass,
        wallets: this.wallets,
      };
      setTimeout(() => {
        this.$store.dispatch("exportWallets", input).then(() => {
          this.isLoading = false;
          this.pass = "";
          this.passConfirm = "";
          this.$store.dispatch("Notifications/add", {
            title: "Key File Export",
            message: "Your keys are downloaded.",
          });
          this.$emit("success");
        });
      }, 200);
    },
  },
});
export default ExportWallet;
</script>
<style lang="scss">
.export_wallet {
  .formIn {
    .v-input__slot {
      background-color: var(--bg-light) !important;
    }

    .v-text-field__details {
      padding: 0;
    }

    fieldset {
      border: none;
    }
  }
}
</style>
<style lang="scss">
.export_wallet {
  fieldset {
    border: none !important;
  }
}
</style>
<style scoped lang="scss">
// @use "../../../light_theme";

.export_wallet {
  font-size: 12px;
}
.explain {
  color: var(--primary-color-light);
  margin-bottom: 20px !important;
}

label {
  color: var(--primary-color-light);
}

.formIn {
  background-color: var(--bg-light);
  font-size: 12px;
  border-radius: 2px;
}

.button_primary {
  margin-top: 10px;
}

.err {
  margin: 4px 0 !important;
  color: var(--error);
}
</style>
