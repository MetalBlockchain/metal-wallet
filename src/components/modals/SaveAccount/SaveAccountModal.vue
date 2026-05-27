<template>
  <div>
    <Modal ref="modal" :title="$t('keys.save_account.title')">
      <div class="remember_modal">
        <form @submit.prevent="submit">
          <div class="flex-row" style="justify-content: center">
            <Identicon :value="baseAddresses.join('')"></Identicon>
          </div>
          <p>{{ $t("keys.save_account.desc") }}</p>

          <input
            v-model="accountName"
            :disabled="existsInLocalStorage"
            :name="$t('keys.save_account.placeholder_1').toString()"
            placeholder="Account Name"
          />
          <input
            v-model="password"
            :placeholder="$t('keys.save_account.placeholder_2').toString()"
            type="password"
          />
          <input
            v-model="password_confirm"
            :placeholder="$t('keys.save_account.placeholder_3').toString()"
            type="password"
          />
          <p class="err">{{ err }}</p>
          <p class="err small" style="text-align: center">
            Clearing your browser cache will remove this account. Make sure you
            have your
            <b>{{
              walletType == "mnemonic" ? "mnemonic phrase" : "private key"
            }}</b>
            saved.
          </p>
          <v-btn
            class="button_primary"
            :disabled="!canSubmit"
            :loading="isLoading"
            type="submit"
          >
            {{ $t("keys.save_account.submit") }}
          </v-btn>
        </form>
      </div>
    </Modal>
  </div>
</template>
<script lang="ts">
import type { iUserAccountEncrypted, SaveAccountInput } from "@/stores/types";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import Identicon from "@/components/misc/Identicon.vue";
import { useAccountsStore } from "@/stores/pinia/accounts";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import { useRootStore } from "@/stores/pinia/root";
import Modal from "../Modal.vue";

export const SaveAccountModal = defineComponent({
  components: {
    Identicon,
    Modal,
  },
  data() {
    const foundAccount: iUserAccountEncrypted | null = null;
    const err: any = "";

    return {
      password: "",
      password_confirm: "",
      isLoading: false,
      err,
      accountName: "",
      existsInLocalStorage: false,
      index: 0,
      foundAccount,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      walletType: (store) =>
        store.activeWallet ? store.activeWallet.type : null,
    }),
    ...mapState(useAccountsStore, ["baseAddresses"]),
    canSubmit() {
      if (this.error !== null) return false;
      return true;
    },
    error() {
      if (!this.password) return this.$t("keys.password_validation");
      if (!this.password_confirm) return this.$t("keys.password_validation2");
      if (this.accountName.length === 0)
        return this.$t("keys.account_name_required");
      if (this.password.length < 9) return this.$t("keys.password_validation");
      if (this.password !== this.password_confirm)
        return this.$t("keys.password_validation2");

      return null;
    },
  },
  methods: {
    ...mapActions(useAccountsStore, ["saveAccount"]),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    async submit(): Promise<void> {
      this.isLoading = true;
      const pass = this.password;
      const accountName = this.accountName;

      const input: SaveAccountInput = {
        accountName: accountName,
        password: pass,
      };
      await this.saveAccount(input);

      this.isLoading = false;
      this.onsuccess();
    },
    onsuccess() {
      this.addNotification({
        title: "Account Saved",
        message: "Your keys are now stored under a new local account.",
        type: "info",
      });
      this.close();
    },
    clear() {
      this.password = "";
      this.password_confirm = "";
      this.accountName = "";
      this.err = "";
    },
    close() {
      this.clear();
      (this.$refs.modal as typeof Modal).close();
    },
    open() {
      (this.$refs.modal as typeof Modal).open();
    },
  },
});
export default SaveAccountModal;
</script>
<style scoped lang="scss">
.remember_modal {
  width: 320px;
  max-width: 100%;
  padding: 12px 30px;
}

form {
  display: flex;
  flex-direction: column;

  > * {
    margin: 6px 0px;
  }
}

input {
  background-color: var(--bg-light);
  color: var(--primary-color);
  padding: 6px 14px;
}

.cancel_but {
  color: #999;
  font-size: 0.9rem;
}

.password {
  background-color: var(--bg-light);
  color: var(--primary-color);
  padding: 6px 14px;
}

.submit {
  margin-top: 30px;
}

.err {
  color: var(--error);
}
</style>
