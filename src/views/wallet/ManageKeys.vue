<template>
  <div>
    <div>
      <div class="card_body">
        <header>
          <div class="header_title">
            <h1>{{ $t("keys.title") }}</h1>
            <hr />
          </div>
        </header>
        <div v-if="canEncryptWallet" class="button_container">
          <button
            v-if="!account"
            class="save_account ava_button_secondary"
            @click="openSaveAccount"
          >
            <fa icon="exclamation-triangle"></fa>
            {{ $t("keys.button1") }}
          </button>
          <button
            v-if="hasVolatile && account"
            class="save_account ava_button_secondary"
            @click="openAccountSettings"
          >
            <fa icon="exclamation-triangle"></fa>
            {{ $t("keys.button1") }}
          </button>
          <button class="but_primary ava_button_secondary" @click="exportKeys">
            <img class="key_logo" src="@/assets/upload.svg" />
            {{ $t("keys.button3") }}
          </button>
          <SaveAccountModal ref="account_modal"></SaveAccountModal>
          <AccountSettingsModal ref="account_settings"></AccountSettingsModal>
          <ExportKeys ref="export" :wallets="allWallets"></ExportKeys>
        </div>
        <my-keys></my-keys>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import { mapState } from "pinia";
import { defineComponent } from "vue";
import AccountSettingsModal from "@/components/modals/AccountSettings/AccountSettingsModal.vue";
import ExportKeys from "@/components/modals/ExportKeys.vue";
import SaveAccountModal from "@/components/modals/SaveAccount/SaveAccountModal.vue";
import MyKeys from "@/components/wallet/manage/MyKeys.vue";
import { useAccountsStore } from "@/stores/pinia/accounts";
import { useRootStore } from "@/stores/pinia/root";

export const ManageKeys = defineComponent({
  name: "Manage",
  components: {
    AccountSettingsModal,
    MyKeys,
    ExportKeys,
    SaveAccountModal,
  },
  computed: {
    ...mapState(useAccountsStore, ["account"]),
    ...mapState(useRootStore, {
      walletType: (store) => {
        return store.activeWallet?.type;
      },
      hasVolatile: (store) => {
        return store.volatileWallets.length > 0;
      },
      allWallets: (store) => {
        return store.wallets as MnemonicWallet[];
      },
      warnUpdateKeyfile: (store) => {
        return store.warnUpdateKeyfile;
      },
    }),
    canEncryptWallet() {
      if (!this.walletType) return [];
      return ["mnemonic", "singleton"].includes(this.walletType);
    },
  },
  methods: {
    exportKeys() {
      (this.$refs.export as typeof ExportKeys).open();
    },
    openSaveAccount() {
      (this.$refs.account_modal as typeof SaveAccountModal).open();
    },
    openAccountSettings() {
      (this.$refs.account_settings as typeof AccountSettingsModal).open();
    },
  },
});
export default ManageKeys;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.button_container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;

  button {
    font-size: 14px;
    font-weight: 500;
    color: var(--tertiary-color);
    display: flex;
    align-items: center;

    img {
      height: 20px;
      width: 20px;
      margin-right: 10px;
    }
  }
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .header_title {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 18px;
    width: 100%;

    h1 {
      font-size: 20px;
      font-weight: 500;
      white-space: nowrap;
      margin-right: 12px;
      color: var(--tertiary-color);
    }

    hr {
      flex: 0 1 100%;
      border: 1px solid var(--border-secondary-light);
    }
  }
}

h1 {
  font-size: 20px;
  font-weight: 500;
  white-space: nowrap;
  color: var(--tertiary-color);
}

.save_account {
  color: var(--warning);
}

@include mixins.mobile-device {
  header {
    display: block;
  }

  .button_container {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    /*flex-wrap: wrap;*/

    button {
      padding: 8px 0;
    }
  }
}
</style>
