<template>
  <div class="my_keys">
    <p class="label">{{ $t("keys.active_wallet") }}</p>
    <key-row
      v-if="activeWallet"
      class="key_row"
      :is_default="true"
      :wallet="activeWallet"
    ></key-row>
    <hr v-if="inactiveWallets.length > 0" />
    <p v-if="inactiveWallets.length > 0" class="label">Other Keys</p>
    <transition-group name="fade">
      <key-row
        v-for="wallet in inactiveWallets"
        :key="wallet.id"
        class="key_row"
        :wallet="wallet"
        @remove="removeWallet(wallet)"
        @select="selectWallet"
      ></key-row>
    </transition-group>
  </div>
</template>
<script lang="ts">
import type { WalletType } from "@/js/wallets/types";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import KeyRow from "@/components/wallet/manage/KeyRow.vue";
import { useAccountsStore } from "@/stores/pinia/accounts";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import { useRootStore } from "@/stores/pinia/root";

export const MyKeys = defineComponent({
  components: {
    KeyRow,
  },
  computed: {
    ...mapState(useRootStore, {
      activeWallet: (store): WalletType | null =>
        store.activeWallet as WalletType,
      wallets: "wallets",
    }),
    ...mapState(useAccountsStore, ["account"]),
    inactiveWallets(): WalletType[] {
      const wallets = this.wallets;

      const res = wallets.filter((wallet) => {
        if (this.activeWallet === wallet) return false;
        return true;
      });

      return res as WalletType[];
    },
  },
  methods: {
    ...mapActions(useRootStore, {
      walletActivate: "activateWallet",
      walletRemove: "removeWallet",
    }),
    ...mapActions(useHistoryStore, ["updateTransactionHistory"]),
    ...mapActions(useAccountsStore, ["deleteKey"]),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),

    selectWallet(wallet: WalletType) {
      this.walletActivate(wallet);
      this.updateTransactionHistory();
    },
    async removeWallet(wallet: WalletType) {
      const msg = this.$t("keys.del_check") as string;
      const isConfirm = confirm(msg);

      if (isConfirm) {
        this.deleteKey(wallet);
        await this.walletRemove(wallet);
        this.addNotification({
          title: this.$t("keys.remove_success_title"),
          message: this.$t("keys.remove_success_msg"),
        });
      }
    },
  },
});
export default MyKeys;
</script>
<style scoped lang="scss">
.default_key {
}

hr {
  border-top: 1px solid var(--bg-light);
  border-left: 1px solid var(--bg-light);
  border-right: 1px solid var(--bg-light);
  border-color: var(--bg-light) !important;
  margin: 12px 0;
}

.label {
  font-size: 13px;
  color: #999;
  font-weight: bold;
  padding: 2px 10px;
}
.key_row {
  background-color: var(--bg-light);
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
  transition-duration: 0.2s;
}

.my_keys {
  padding-top: 15px;
}
.addressItem {
  &[selected] {
  }
}

.volatile_cont {
  max-width: 380px;
  /*border-top: 1px solid #eee;*/
  margin-top: 20px;
  padding-top: 20px;
  /*display: grid;*/
  /*grid-template-columns: 1fr 1fr;*/
}

.remember_comp {
  /*padding: 20px 0;*/
}

.alert_box {
  /*margin: 0px 25px;*/
  font-size: 0.9rem;
}
</style>
<style lang="scss">
.volatile_cont {
  .v-expansion-panel {
    background-color: transparent !important;
  }

  .passwords input {
    background-color: #d2e9fd;
  }

  .v-expansion-panel-header,
  .v-expansion-panel-content__wrap {
    padding: 8px 0;
  }
}
</style>
