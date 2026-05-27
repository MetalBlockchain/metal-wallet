import type { AllKeyFileDecryptedTypes } from "@/js/IKeystore";
import type { WalletType } from "@/js/wallets/types";
import type {
  AccessWalletMultipleInput,
  ExportWalletsInput,
  ImportKeyfileInput,
  IssueBatchTxInput,
  ValidatorMetaData,
} from "@/stores/types";
import { Buffer } from "@metalblockchain/metaljs";
import { privateToAddress } from "ethereumjs-util";
import { getAvaxPriceUSD } from "@/helpers/price_helper";
import { getValidatorMetaData } from "@/helpers/validator_helper";
import {
  extractKeysFromDecryptedFile,
  KEYSTORE_VERSION,
  makeKeyfile,
  readKeyFile,
} from "@/js/Keystore";
import MnemonicWallet from "@/js/wallets/MnemonicWallet";
import { SingletonWallet } from "@/js/wallets/SingletonWallet";
import { bintools } from "@/misc/AVA";
import router from "@/router";
import { downloadFile } from "@/utils/downloadFile";
import { useAssetsStore } from "./assets";
import { useHistoryStore } from "./history";
import { useNotificationsStore } from "./notifications";

export interface IRootStore {
  isAuth: boolean;
  activeWallet: WalletType | null;
  address: string | null; // current active derived address
  wallets: WalletType[];
  volatileWallets: WalletType[]; // will be forgotten when tab is closed
  warnUpdateKeyfile: boolean; // If true will promt the user the export a new keyfile
  prices: {
    usd: number;
  };
  validatorMetaData: ValidatorMetaData;
}

function getDefaultState(): IRootStore {
  return {
    isAuth: false,
    activeWallet: null,
    address: null, // current active derived address
    wallets: [],
    volatileWallets: [], // will be forgotten when tab is closed
    warnUpdateKeyfile: false, // If true will promt the user the export a new keyfile
    prices: {
      usd: 0,
    },
    validatorMetaData: {
      validators: [],
    },
  };
}

export const useRootStore = defineStore("root", {
  state: () => getDefaultState(),
  actions: {
    // Used in home page to access a user's wallet
    // Used to access wallet with a single key
    // TODO rename to accessWalletMenmonic
    accessWallet(mnemonic: string): MnemonicWallet | null {
      const wallet = this.addWalletMnemonic(mnemonic);
      this.activateWallet(wallet);

      this.onAccess();
      return wallet;
    },

    // Only for singletons and mnemonics
    accessWalletMultiple({
      keys: keyList,
      activeIndex,
    }: {
      keys: AccessWalletMultipleInput[];
      activeIndex: number;
    }) {
      for (const keyInfo of keyList) {
        try {
          if (keyInfo) {
            keyInfo.type === "mnemonic"
              ? this.addWalletMnemonic(keyInfo.key)
              : this.addWalletSingleton(keyInfo.key);
          }
        } catch {
          continue;
        }
      }

      const wallet = this.wallets[activeIndex] ?? null;
      this.activateWallet(wallet as WalletType);

      this.onAccess();
    },

    accessWalletSingleton(key: string) {
      const wallet = this.addWalletSingleton(key);
      this.activateWallet(wallet);
      this.onAccess();
    },

    onAccess() {
      this.isAuth = true;

      const assetsStore = useAssetsStore();

      assetsStore.updateAvaAsset();
      router.push("/wallet");
      assetsStore.updateUTXOs();
    },

    // TODO: Parts can be shared with the logout function below
    // Similar to logout but keeps the Remembered keys.
    timeoutLogout() {
      const notificationsStore = useNotificationsStore();

      notificationsStore.add({
        title: "Session Timeout",
        message: "You are logged out due to inactivity.",
        type: "warning",
      });

      this.logout();
    },

    logout() {
      localStorage.removeItem("w");
      // Go to the base URL with GET request not router
      // This clears all state and resets the app
      window.location.href = "/";
    },

    // used with logout
    removeAllKeys() {
      const notificationsStore = useNotificationsStore();
      const wallets = this.wallets;

      while (wallets.length > 0) {
        const wallet = wallets[0];
        if (wallet) {
          this.removeWallet(wallet as WalletType);

          notificationsStore.add({
            title: "Key Removed",
            message: "Private key and assets removed from the wallet.",
          });
        }
      }

      this.wallets = [];
      this.resetVolatileWallets();
    },

    // Add a HD wallet from mnemonic string
    addWalletMnemonic(mnemonic: string): MnemonicWallet | null {
      // Cannot add mnemonic wallets on ledger mode
      if (this.activeWallet?.type === "ledger") return null;

      // Make sure wallet doesnt exist already
      for (let i = 0; i < this.wallets.length; i++) {
        const w = this.wallets[i];
        if (
          w &&
          w.type === "mnemonic" &&
          (w as MnemonicWallet).getMnemonic() === mnemonic
        ) {
          throw new Error("Wallet already exists.");
        }
      }

      const wallet = new MnemonicWallet(mnemonic);

      this.wallets.push(wallet);
      this.volatileWallets.push(wallet);

      return wallet;
    },

    // Add a singleton wallet from private key string
    addWalletSingleton(pk: string): SingletonWallet | null {
      try {
        const keyBuf = Buffer.from(pk, "hex");
        privateToAddress(keyBuf as any);
        pk = `PrivateKey-${bintools.cb58Encode(keyBuf)}`;
      } catch {
        //
      }

      // Cannot add singleton wallets on ledger mode
      if (this.activeWallet?.type === "ledger") return null;

      // Make sure wallet doesnt exist already
      for (let i = 0; i < this.wallets.length; i++) {
        const w = this.wallets[i];
        if (w && w.type === "singleton" && (w as SingletonWallet).key === pk) {
          throw new Error("Wallet already exists.");
        }
      }

      const wallet = new SingletonWallet(pk);

      this.wallets.push(wallet);
      this.volatileWallets.push(wallet);

      return wallet;
    },

    removeWallet(wallet: WalletType) {
      // TODO: This might cause an error use wallet id instead
      const index = this.wallets.indexOf(wallet);
      this.wallets.splice(index, 1);
    },

    async issueBatchTx(data: IssueBatchTxInput) {
      const wallet = this.activeWallet;
      if (!wallet) return "error";

      const toAddr = data.toAddress;
      const orders = data.orders;
      const memo = data.memo;

      const txId: string = await wallet.issueBatchTx(orders, toAddr, memo);
      return txId;
    },

    activateWallet(wallet: WalletType | null) {
      const assetsStore = useAssetsStore();
      const historyStore = useHistoryStore();

      this.activeWallet = wallet;

      assetsStore.updateAvaAsset();

      this.updateActiveAddress();

      historyStore.updateTransactionHistory();
    },

    async exportWallets(input: ExportWalletsInput) {
      const notificationsStore = useNotificationsStore();
      try {
        const pass = input.password;
        const wallets = input.wallets;
        const wallet = this.activeWallet;
        if (!wallet) throw new Error("No active wallet.");
        const activeIndex = wallets.findIndex((w) => w.id == wallet!.id);

        const file_data = await makeKeyfile(wallets, pass, activeIndex);

        // Download the file
        const text = JSON.stringify(file_data);
        // let addr = file_data.keys[0].address.substr(2,5);

        const utcDate = new Date();
        const dateString = utcDate.toISOString().replace(" ", "_");
        const filename = `METAL_${dateString}.json`;

        const blob = new Blob([text], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);

        await downloadFile(filename, url);
      } catch {
        notificationsStore.add({
          title: "Export Wallet",
          message: "Error exporting wallet.",
          type: "error",
        });
      }
    },

    // Given a key file with password, will try to decrypt the file and add keys to user's
    // key chain
    async importKeyfile(data: ImportKeyfileInput) {
      const pass = data.password;
      const fileData = data.data;

      const version = fileData.version;

      // Decrypt the key file with the password
      const keyFile: AllKeyFileDecryptedTypes = await readKeyFile(
        fileData,
        pass,
      );
      // Extract wallet keys
      const keys = extractKeysFromDecryptedFile(keyFile);

      if (this.isAuth) {
        for (const key of keys) {
          if (!key) continue;

          // Private keys from the keystore file do not have the PrivateKey- prefix
          if (key.type === "mnemonic") {
            this.addWalletMnemonic(key.key);
          } else if (key.type === "singleton") {
            this.addWalletSingleton(key.key);
          }
        }
      } else {
        // If not auth, login user then add keys
        this.accessWalletMultiple({
          keys,
          activeIndex: keyFile.activeIndex,
        });
      }

      // Keystore warning flag asking users to update their keystore files;
      this.warnUpdateKeyfile = false;
      if (version !== KEYSTORE_VERSION) {
        this.warnUpdateKeyfile = true;
      }
      this.resetVolatileWallets();

      return {
        success: true,
        message: "success",
      };
    },

    async updateAvaxPrice() {
      const usd = await getAvaxPriceUSD();
      this.prices = {
        usd,
      };
    },

    async loadValidatorMetaData() {
      const data = await getValidatorMetaData();
      this.validatorMetaData = data;
    },

    updateActiveAddress() {
      if (this.activeWallet) {
        const addrNow = this.activeWallet.getCurrentAddressAvm();
        this.address = addrNow;
      } else {
        this.address = null;
      }
    },
    resetVolatileWallets() {
      this.volatileWallets = [];
    },
  },
  getters: {
    addresses(): string[] {
      const wallet = this.activeWallet;
      if (!wallet) return [];
      return wallet.getDerivedAddresses();
    },
  },
});
