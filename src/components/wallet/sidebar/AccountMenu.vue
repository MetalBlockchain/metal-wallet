<template>
  <div v-if="!isLedger && wallet">
    <template v-if="account">
      <button class="account_but" @click="openSettings">
        <Identicon
          :diameter="18"
          :value="account.baseAddresses.join('')"
        ></Identicon>
        <p>{{ account.name }}</p>
      </button>
      <AccountSettingsModal ref="settings_modal"></AccountSettingsModal>
    </template>
    <template v-else>
      <SaveAccountModal ref="save_modal"></SaveAccountModal>
      <button class="save_account" @click="save">
        <fa class="volatile_alert" icon="exclamation-triangle"></fa>
        Save Account
      </button>
    </template>
  </div>
</template>
<script lang="ts">
import { mapState } from "pinia";
import { defineComponent } from "vue";
import Identicon from "@/components/misc/Identicon.vue";
import AccountSettingsModal from "@/components/modals/AccountSettings/AccountSettingsModal.vue";
import SaveAccountModal from "@/components/modals/SaveAccount/SaveAccountModal.vue";
import { useAccountsStore } from "@/stores/pinia/accounts";
import { useRootStore } from "@/stores/pinia/root";

export const AccountMenu = defineComponent({
  components: {
    AccountSettingsModal,
    SaveAccountModal,
    Identicon,
  },
  computed: {
    ...mapState(useAccountsStore, ["account"]),
    ...mapState(useRootStore, {
      wallet: "activeWallet",
      isLedger: (store) => {
        const w = store.activeWallet;
        if (!w) return false;
        return w.type === "ledger";
      },
    }),
  },
  methods: {
    openSettings() {
      (this.$refs.settings_modal as typeof AccountSettingsModal).open();
    },
    save() {
      (this.$refs.save_modal as typeof SaveAccountModal).open();
    },
  },
});
export default AccountMenu;
</script>

<style scoped lang="scss">
.account_but {
  color: var(--primary-color);
  display: flex;
  flex-direction: row;
  align-items: center;
  p {
    text-align: left;
    margin-left: 8px !important;
  }

  &:hover {
    opacity: 0.5;
  }
}

.save_account {
  color: var(--warning);
  &:hover {
    opacity: 0.5;
  }
}
</style>
