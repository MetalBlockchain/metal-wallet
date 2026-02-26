import type { WalletType } from "@/js/wallets/types";
import type {
  AccessAccountInput,
  ImportKeyfileInput,
  iUserAccountEncrypted,
  SaveAccountInput,
} from "@/stores/types";
import type { ChangePasswordInput } from "@/stores/types/accounts";

import {
  addAccountToStorage,
  getAccountByIndex,
  getLocalStorageAccounts,
  overwriteAccountAtIndex,
  removeAccountByIndex,
  verifyAccountPassword,
} from "@/helpers/account_helper";
import { makeKeyfile } from "@/js/Keystore";
import { useNotificationsStore } from "./notifications";
import { useRootStore } from "./root";

export interface IAccountsStore {
  accounts: iUserAccountEncrypted[];
  accountIndex: null | number;
}

function getDefaultState(): IAccountsStore {
  return {
    accounts: [],
    accountIndex: null,
  };
}

export const useAccountsStore = defineStore("accounts", {
  state: () => getDefaultState(),
  actions: {
    onLogout() {
      this.accountIndex = null;
    },

    async accessAccount(input: AccessAccountInput) {
      const rootStore = useRootStore();

      const index = input.index;
      const pass = input.pass;

      const account = getAccountByIndex(index);
      if (!account) throw new Error("Account not found.");

      const data: ImportKeyfileInput = {
        password: pass,
        data: account.wallet,
      };

      await rootStore.importKeyfile(data);
      this.accountIndex = index;
    },

    // Creates a keystore file and saves to local storage
    async saveAccount(data: SaveAccountInput) {
      const rootStore = useRootStore();
      const notificationsStore = useNotificationsStore();
      try {
        // If this is an active account, get its index
        const activeAccount = this.account;
        const accountIndex = this.accountIndex;

        const wallet = rootStore.activeWallet;
        const pass = data.password;
        if (!pass || wallet?.type === "ledger") return;

        const wallets = rootStore.wallets as WalletType[];

        if (!wallet) throw new Error("No active wallet.");
        const activeIndex = wallets.findIndex((w) => w.id == wallet!.id);

        const file = await makeKeyfile(wallets, pass, activeIndex);
        const baseAddresses = this.baseAddresses;
        const encryptedWallet: iUserAccountEncrypted = {
          baseAddresses,
          name: activeAccount?.name || data.accountName,
          wallet: file,
        };

        // Remove old account, add new one
        if (accountIndex == null) {
          addAccountToStorage(encryptedWallet);
        } else {
          overwriteAccountAtIndex(encryptedWallet, accountIndex);
        }

        // No more volatile wallets
        rootStore.resetVolatileWallets();
        this.loadAccounts();
        this.accountIndex = this.accounts.length - 1;
      } catch {
        notificationsStore.add({
          title: "Account Save",
          message: "Error Saving Account.",
          type: "error",
        });
      }
    },

    // If there is an active account, will remove it from local storage
    async deleteAccount(password: string) {
      const acct = this.account;
      if (!acct) return;

      const passCorrect = await verifyAccountPassword(acct, password);
      if (!passCorrect) throw new Error("Invalid password.");
      const index = this.accountIndex;

      if (!acct || !index) return;

      removeAccountByIndex(index);
      this.accountIndex = null;

      // Update accounts
      this.loadAccounts();
    },

    async changePassword(input: ChangePasswordInput) {
      const index = this.accountIndex;
      const account = this.account;

      if (!account || !index) return;

      const oldPassCorrect = await verifyAccountPassword(
        account,
        input.passOld,
      );
      if (!oldPassCorrect) throw new Error("Previous password invalid.");

      // Remove current wallet file
      removeAccountByIndex(index);
      // Save with new password
      this.saveAccount({
        password: input.passNew,
        accountName: account.name,
      });
    },

    // Used to save volatile keys into the active account
    async saveKeys(pass: string) {
      const index = this.accountIndex;
      const account = this.account;

      if (!index || !account) return;

      const passCorrect = await verifyAccountPassword(account, pass);
      if (!passCorrect) throw new Error("Invalid password.");

      // Remove current wallet file
      removeAccountByIndex(index);
      // Save with volatile keys
      this.saveAccount({
        password: pass,
        accountName: account.name,
      });
    },

    // Remove the selected key from account and update local storage
    async deleteKey(wallet: WalletType) {
      if (!this.account) return;
      const rootStore = useRootStore();

      const delIndex = rootStore.wallets.indexOf(wallet);
      const acctIndex = this.accountIndex;
      const acct: iUserAccountEncrypted = this.account;

      if (!acctIndex) throw new Error("Account not found.");

      acct.baseAddresses.splice(delIndex, 1);
      acct.wallet.keys.splice(delIndex, 1);

      overwriteAccountAtIndex(acct, acctIndex);
      this.loadAccounts();
    },
    loadAccounts() {
      this.accounts = getLocalStorageAccounts();
    },
  },
  getters: {
    baseAddresses() {
      const rootStore = useRootStore();
      const wallets = rootStore.wallets;
      return wallets.map((w) => w.getEvmAddress());
    },

    baseAddressesNonVolatile() {
      const rootStore = useRootStore();
      const wallets = rootStore.wallets.filter((w) => {
        return !rootStore.volatileWallets.includes(w);
      });

      return wallets.map((w) => w.getEvmAddress());
    },

    account(): iUserAccountEncrypted | null {
      if (this.accountIndex === null) return null;
      return this.accounts[this.accountIndex] ?? null;
    },
  },
});
