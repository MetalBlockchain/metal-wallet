import type { TokenListToken } from "@/stores/types/assets";
import type {
  ERC721TokenInput,
  ERC721WalletBalance,
} from "@/stores/types/erc721";
import ERC721_TOKEN_LIST from "@/data/ERC721Tokenlist.json";
import ERC721Token from "@/js/ERC721Token";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useRootStore } from "@/stores/pinia/root";

export interface IERC721Store {
  erc721Tokens: ERC721Token[];
  erc721TokensCustom: ERC721Token[];
  walletBalance: ERC721WalletBalance;
}

function getDefaultState(): IERC721Store {
  return {
    erc721Tokens: [],
    erc721TokensCustom: [],
    walletBalance: {},
  };
}

export const useErc721Store = defineStore("erc721", {
  state: () => getDefaultState(),
  actions: {
    async removeCustom(data: ERC721Token) {
      const index = this.erc721TokensCustom.indexOf(data);
      this.erc721TokensCustom.splice(index, 1);
      delete this.walletBalance[data.contractAddress];
      this.saveCustomContracts();
    },

    async addCustom(data: ERC721TokenInput) {
      const tokens = this.erc721Tokens.concat(this.erc721TokensCustom);

      // Make sure its not added before
      for (const t of tokens) {
        if (
          t &&
          data.address === t.data.address &&
          data.chainId === t.data.chainId
        ) {
          console.log("ERC721 Token already added.");
          return;
        }
      }

      const t = new ERC721Token(data);
      this.erc721TokensCustom.push(t);

      this.saveCustomContracts();
      setTimeout(() => {
        this.updateWalletBalance();
      }, 500);
      return t;
    },

    async init() {
      // Load default erc721 token contracts
      const erc721Tokens = ERC721_TOKEN_LIST.tokens;

      for (const token of erc721Tokens) {
        if (token) {
          this.erc721Tokens.push(new ERC721Token(token));
        }
      }
      this.loadCustomContracts();
    },
    updateWalletBalance() {
      const rootStore = useRootStore();
      const w = rootStore.activeWallet;
      if (!w) return;

      const walletAddr = "0x" + w.getEvmAddress();

      // Loop through contracts and update wallet balance object
      const contracts: ERC721Token[] = this.networkContracts;
      for (const erc721 of contracts) {
        if (erc721) {
          erc721
            .getAllTokensIds(walletAddr)
            .then((tokenIds: string[]) => {
              this.walletBalance[erc721.contractAddress] = tokenIds;
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
    },
    clear() {
      this.walletBalance = {};
    },
    saveCustomContracts() {
      const tokens = this.erc721TokensCustom;
      const tokenRawData = tokens.map((token) => {
        return token.data;
      });
      localStorage.setItem("erc721_tokens", JSON.stringify(tokenRawData));
    },
    loadCustomContracts() {
      const tokensRaw = localStorage.getItem("erc721_tokens") || "[]";
      const tokens: TokenListToken[] = JSON.parse(tokensRaw);
      for (const token of tokens) {
        if (token) {
          this.erc721TokensCustom.push(new ERC721Token(token));
        }
      }
    },
  },
  getters: {
    networkContracts(): ERC721Token[] {
      const tokens = this.erc721Tokens.concat(this.erc721TokensCustom);
      const assetsStore = useAssetsStore();
      const chainId = assetsStore.evmChainId;
      const filt = tokens.filter((t) => {
        if (t.data.chainId !== chainId) return false;
        return true;
      });
      return filt;
    },

    networkContractsCustom(): ERC721Token[] {
      const contracts: ERC721Token[] = this.networkContracts;
      return contracts.filter((c) => {
        return this.erc721TokensCustom.includes(c);
      });
    },

    totalOwned() {
      const bal = this.walletBalance;
      let tot = 0;
      for (const contractAddrress in bal) {
        if (bal[contractAddrress]) {
          const len = bal[contractAddrress].length;
          tot += len;
        }
      }
      return tot;
    },
    totalCollectionsOwned() {
      const bal = this.walletBalance;
      let tot = 0;
      for (const contractAddrress in bal) {
        if (bal[contractAddrress]) {
          const len = bal[contractAddrress].length;
          if (len > 0) tot++;
        }
      }
      return tot;
    },
    find() {
      return (contractAddr: string) => {
        const tokens: ERC721Token[] = this.networkContracts;
        for (const t of tokens) {
          if (t && t.data.address === contractAddr) {
            return t;
          }
        }
        return null;
      };
    },
  },
});
