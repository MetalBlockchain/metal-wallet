<template>
  <div>
    <label>{{ $t("private_key") }}</label>
    <form @submit.prevent="addKey">
      <qr-input
        v-model="privateKeyInput"
        class="qrIn"
        @change="validateQR"
      ></qr-input>
      <p class="err">{{ error }}</p>
      <v-btn
        block
        class="addKeyBut button_primary ava_button"
        depressed
        :disabled="!canAdd"
        :loading="isLoading"
        type="submit"
      >
        {{ $t("add_pk") }}
      </v-btn>
    </form>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import QrInput from "@/components/shared/QrInput.vue";

export default defineComponent({
  components: {
    QrInput,
  },
  emits: ["success"],
  data() {
    return {
      privateKeyInput: "",
      canAdd: false,
      error: "",
      isLoading: false,
    };
  },
  methods: {
    validateQR(_: string) {
      if (this.privateKeyInput.length > 10) {
        this.canAdd = true;
      } else if (this.privateKeyInput.length === 0) {
        this.error = "";
        this.canAdd = false;
      } else {
        this.canAdd = false;
      }
    },
    addKey() {
      this.isLoading = true;
      this.error = "";

      setTimeout(async () => {
        try {
          await this.$store.dispatch(
            "addWalletSingleton",
            this.privateKeyInput,
          );
          this.$emit("success");
          this.clear();
        } catch (error: any) {
          this.isLoading = false;

          this.error = error.message.includes("already")
            ? (this.$t("keys.import_key_duplicate_err") as string)
            : (this.$t("keys.import_key_err") as string);
        }
      }, 200);
    },
    clear() {
      this.isLoading = false;
      this.privateKeyInput = "";
      this.canAdd = false;
      this.error = "";
    },
  },
});
</script>
<style scoped lang="scss">
label {
  color: #909090;
  font-size: 12px;
}

.qrIn {
  border-radius: 2px !important;
  height: 40px;
  font-size: 12px;
  background-color: #f5f6fa;
}

.err {
  color: var(--error);
}
</style>
