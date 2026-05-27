import type { AllKeyFileDecryptedTypes } from "@/js/IKeystore";

import type { WalletType } from "@/js/wallets/types";
import type {
  AccessWalletMultipleInput,
  ExportWalletsInput,
  ImportKeyfileInput,
  IssueBatchTxInput,
  RootState,
  ValidatorMetaData,
} from "@/stores/vuex/types";
import { Buffer } from "@metalblockchain/metaljs";
import { privateToAddress } from "ethereumjs-util";
import { createStore } from "vuex";
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

import Accounts from "./modules/accounts/accounts";
import Assets from "./modules/assets/assets";

import Earn from "./modules/earn/earn";
import History from "./modules/history/history";
import Ledger from "./modules/ledger/ledger";
import Network from "./modules/network/network";
import Notifications from "./modules/notifications/notifications";
import Platform from "./modules/platform/platform";

// Vue.use(Vuex);

export default createStore({
  modules: {
    Assets,
    Notifications,
    Network,
    History,
    Platform,
    Ledger,
    Accounts,
    Earn,
  },
  state: {
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
  },
  getters: {
    addresses(state: RootState): string[] {
      const wallet = state.activeWallet;
      if (!wallet) return [];
      const addresses = wallet.getDerivedAddresses();
      return addresses;
    },
    validatorMetaData(state: RootState): ValidatorMetaData {
      return state.validatorMetaData;
    },
  },
  mutations: {
    updateActiveAddress(state) {
      if (state.activeWallet) {
        const addrNow = state.activeWallet.getCurrentAddressAvm();
        state.address = addrNow;
      } else {
        state.address = null;
      }
    },
  },
  actions: {
    // Used in home page to access a user's wallet
    // Used to access wallet with a single key
    // TODO rename to accessWalletMenmonic
    async accessWallet(
      { state, dispatch, commit },
      mnemonic: string,
    ): Promise<MnemonicWallet> {
      const wallet: MnemonicWallet = await dispatch(
        "addWalletMnemonic",
        mnemonic,
      );
      await dispatch("activateWallet", wallet);

      dispatch("onAccess");
      return wallet;
    },

    // Only for singletons and mnemonics
    async accessWalletMultiple(
      { state, dispatch, commit },
      {
        keys: keyList,
        activeIndex,
      }: { keys: AccessWalletMultipleInput[]; activeIndex: number },
    ) {
      for (const keyInfo of keyList) {
        try {
          if (keyInfo) {
            await (keyInfo.type === "mnemonic"
              ? dispatch("addWalletMnemonic", keyInfo.key)
              : dispatch("addWalletSingleton", keyInfo.key));
          }
        } catch {
          continue;
        }
      }

      await dispatch("activateWallet", state.wallets[activeIndex]);

      dispatch("onAccess");
    },

    async accessWalletSingleton({ state, dispatch }, key: string) {
      const wallet = await dispatch("addWalletSingleton", key);
      await dispatch("activateWallet", wallet);

      dispatch("onAccess");
    },

    async onAccess(store) {
      store.state.isAuth = true;

      store.dispatch("Assets/updateAvaAsset");
      router.push("/wallet");
      store.dispatch("Assets/updateUTXOs");
    },

    // TODO: Parts can be shared with the logout function below
    // Similar to logout but keeps the Remembered keys.
    async timeoutLogout(store) {
      await store.dispatch("Notifications/add", {
        title: "Session Timeout",
        message: "You are logged out due to inactivity.",
        type: "warning",
      });

      store.dispatch("logout");
    },

    async logout(store) {
      localStorage.removeItem("w");
      // Go to the base URL with GET request not router
      // This clears all state and resets the app
      window.location.href = "/";
    },

    // used with logout
    async removeAllKeys({ state, dispatch }) {
      const wallets = state.wallets;

      while (wallets.length > 0) {
        const wallet = wallets[0];
        await dispatch("removeWallet", wallet);

        dispatch("Notifications/add", {
          title: "Key Removed",
          message: "Private key and assets removed from the wallet.",
        });
      }

      state.wallets = [];
      state.volatileWallets = [];
    },

    // Add a HD wallet from mnemonic string
    async addWalletMnemonic(
      { state, dispatch },
      mnemonic: string,
    ): Promise<MnemonicWallet | null> {
      // Cannot add mnemonic wallets on ledger mode
      if (state.activeWallet?.type === "ledger") return null;

      // Make sure wallet doesnt exist already
      for (let i = 0; i < state.wallets.length; i++) {
        const w = state.wallets[i] as WalletType;
        if (
          w.type === "mnemonic" &&
          (w as MnemonicWallet).getMnemonic() === mnemonic
        ) {
          throw new Error("Wallet already exists.");
        }
      }

      const wallet = new MnemonicWallet(mnemonic);
      state.wallets.push(wallet);
      state.volatileWallets.push(wallet);
      return wallet;
    },

    // Add a singleton wallet from private key string
    async addWalletSingleton(
      { state, dispatch },
      pk: string,
    ): Promise<SingletonWallet | null> {
      try {
        const keyBuf = Buffer.from(pk, "hex");
        privateToAddress(keyBuf as any);
        pk = `PrivateKey-${bintools.cb58Encode(keyBuf)}`;
      } catch {
        //
      }

      // Cannot add singleton wallets on ledger mode
      if (state.activeWallet?.type === "ledger") return null;

      // Make sure wallet doesnt exist already
      for (let i = 0; i < state.wallets.length; i++) {
        const w = state.wallets[i] as WalletType;
        if (w.type === "singleton" && (w as SingletonWallet).key === pk) {
          throw new Error("Wallet already exists.");
        }
      }

      const wallet = new SingletonWallet(pk);
      state.wallets.push(wallet);
      state.volatileWallets.push(wallet);
      return wallet;
    },

    removeWallet({ state, dispatch, getters }, wallet: MnemonicWallet) {
      // TODO: This might cause an error use wallet id instead
      const index = state.wallets.indexOf(wallet);
      state.wallets.splice(index, 1);
    },

    async issueBatchTx({ state }, data: IssueBatchTxInput) {
      const wallet = state.activeWallet;
      if (!wallet) return "error";

      const toAddr = data.toAddress;
      const orders = data.orders;
      const memo = data.memo;

      const txId: string = await wallet.issueBatchTx(orders, toAddr, memo);
      return txId;
    },

    async activateWallet({ state, dispatch, commit }, wallet: MnemonicWallet) {
      state.activeWallet = wallet;

      dispatch("Assets/updateAvaAsset");
      commit("updateActiveAddress");
      dispatch("History/updateTransactionHistory");
    },

    async exportWallets({ state, dispatch }, input: ExportWalletsInput) {
      try {
        const pass = input.password;
        const wallets = input.wallets;
        const wallet = state.activeWallet as
          | MnemonicWallet
          | SingletonWallet
          | null;
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
        const element = document.createElement("a");

        element.setAttribute("href", url);
        element.setAttribute("download", filename);
        element.style.display = "none";
        document.body.append(element);
        element.click();
        element.remove();
      } catch {
        dispatch("Notifications/add", {
          title: "Export Wallet",
          message: "Error exporting wallet.",
          type: "error",
        });
      }
    },

    // Given a key file with password, will try to decrypt the file and add keys to user's
    // key chain
    async importKeyfile(store, data: ImportKeyfileInput) {
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

      if (store.state.isAuth) {
        for (const key of keys) {
          if (!key) continue;

          // Private keys from the keystore file do not have the PrivateKey- prefix
          if (key.type === "mnemonic") {
            await store.dispatch("addWalletMnemonic", key.key);
          } else if (key.type === "singleton") {
            await store.dispatch("addWalletSingleton", key.key);
          }
        }
      } else {
        // If not auth, login user then add keys
        await store.dispatch("accessWalletMultiple", {
          keys,
          activeIndex: keyFile.activeIndex,
        });
      }

      // Keystore warning flag asking users to update their keystore files;
      store.state.warnUpdateKeyfile = false;
      if (version !== KEYSTORE_VERSION) {
        store.state.warnUpdateKeyfile = true;
      }
      store.state.volatileWallets = [];

      return {
        success: true,
        message: "success",
      };
    },

    async updateAvaxPrice(store) {
      const usd = await getAvaxPriceUSD();
      store.state.prices = {
        usd,
      };
    },

    async loadValidatorMetaData(store) {
      const data = await getValidatorMetaData();
      store.state.validatorMetaData = data;
    },
  },
});
