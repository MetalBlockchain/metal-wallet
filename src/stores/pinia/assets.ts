// import ERC721Module from "./modules/erc721";
import type {
  AmountOutput,
  UTXOSet as AVMUTXOSet,
  NFTMintOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type { UTXO as AVMUTXO } from "@metalblockchain/metaljs/dist/apis/avm/utxos";
import type { StakeableLockOut } from "@metalblockchain/metaljs/dist/apis/platformvm";
import type { UTXOSet as PlatformUTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm/utxos";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type {
  IWalletAssetsDict,
  IWalletBalanceDict,
  IWalletNftDict,
  IWalletNftMintDict,
} from "@/stores/types";
import type {
  AddTokenListInput,
  AssetsDict,
  NftFamilyDict,
  TokenList,
  TokenListToken,
} from "@/stores/types/assets";
import { BN } from "@metalblockchain/metaljs";
import { PlatformVMConstants } from "@metalblockchain/metaljs/dist/apis/platformvm";

import { UnixNow } from "@metalblockchain/metaljs/dist/utils";
import axios from "axios";
import cloneDeep from "lodash-es/cloneDeep";
import { isUrlBanned } from "@/components/misc/NftPayloadView/blacklist";
import { getPayloadFromUTXO } from "@/helpers/helper";

import AvaAsset from "@/js/AvaAsset";
import { AvaNftFamily } from "@/js/AvaNftFamily";
import Erc20Token from "@/js/Erc20Token";
import { ava, avm, bintools } from "@/misc/AVA";
import { web3 } from "@/misc/evm";
import { useErc721Store } from "@/stores/pinia/erc721";
import { useRootStore } from "@/stores/pinia/root";
import { fetchTokenList } from "@/stores/utils/fetchTokenList";

export interface IAssetsStore {
  // isUpdateBalance: boolean
  AVA_ASSET_ID: string | null;

  assets: AvaAsset[];
  assetsDict: AssetsDict;
  nftFams: AvaNftFamily[];
  nftFamsDict: NftFamilyDict;
  balanceDict: IWalletBalanceDict;
  nftUTXOs: AVMUTXO[];
  nftMintUTXOs: AVMUTXO[];
  erc20Tokens: Erc20Token[];
  erc20TokensCustom: Erc20Token[];
  evmChainId: number;
  tokenLists: TokenList[];
  tokenListUrls: string[];
  tokenListsCustom: string[];
  nftWhitelist: string[];
}
function getDefaultState(): IAssetsStore {
  return {
    AVA_ASSET_ID: null,
    // isUpdateBalance: false,
    assets: [],
    assetsDict: {}, // holds meta data of assets
    nftFams: [],
    nftFamsDict: {},
    balanceDict: {},
    nftUTXOs: [],
    nftMintUTXOs: [],
    erc20Tokens: [],
    erc20TokensCustom: [],
    evmChainId: 0,
    tokenLists: [],
    tokenListUrls: [],
    tokenListsCustom: [],
    nftWhitelist: [],
  };
}

const TOKEN_LISTS: string[] = [];

export const useAssetsStore = defineStore("assets", {
  state: () => getDefaultState(),

  actions: {
    async onNetworkChange() {
      const id = await web3.eth.getChainId();
      this.evmChainId = id;
    },

    // Called on a logout event
    onLogout() {
      this.removeAllAssets();
    },

    // Called when the active wallet finishes fetching utxos
    onUtxosUpdated() {
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      if (!wallet) return;

      if (wallet.isFetchUtxos) {
        setTimeout(() => {
          this.onUtxosUpdated();
        }, 500);
        return;
      }

      this.updateBalanceDict();
      this.updateUtxoArrays();
      this.addUnknownAssets();
    },

    /**
     * Updates X-Chain NFT utxos in 2 categories, nftUTXOs
     * and nftMintUTXOs
     */
    updateUtxoArrays() {
      const utxoSet = this.walletAvmUtxoSet;
      if (utxoSet === null) return {};

      const utxos = utxoSet.getAllUTXOs();

      let nftUtxos = [];
      const nftMintUtxos = [];

      for (const utxo of utxos) {
        const outId = utxo.getOutput().getOutputID();

        if (outId === 11) {
          nftUtxos.push(markRaw(utxo));
        } else if (outId === 10) {
          nftMintUtxos.push(markRaw(utxo));
        }
      }

      // Filter NFT utxos

      nftUtxos = nftUtxos.filter((utxo) => {
        const payload = getPayloadFromUTXO(utxo);
        const content = payload.getContent().toString();
        return !isUrlBanned(content);
      });

      this.nftUTXOs = nftUtxos;
      this.nftMintUTXOs = nftMintUtxos;
    },

    addErc20Token(token: TokenListToken) {
      const tokens: Erc20Token[] = this.erc20TokensCustom.concat(
        this.erc20Tokens,
      );

      // Make sure its not added before
      for (const t of tokens) {
        if (
          t &&
          token.address === t.data.address &&
          token.chainId === t.data.chainId
        ) {
          console.log("ERC20 Token already added.");
          return;
        }
      }

      const t = new Erc20Token(token);
      this.erc20Tokens.push(markRaw(t));
    },

    addCustomErc20Token(token: TokenListToken) {
      const rootStore = useRootStore();

      const tokens = this.erc20TokensCustom.concat(this.erc20Tokens);

      // Make sure its not added before
      for (const t of tokens) {
        if (
          t &&
          token.address === t.data.address &&
          token.chainId === t.data.chainId
        ) {
          console.log("ERC20 Token already added.");
          return;
        }
      }

      const t = new Erc20Token(token);
      // Save token state to storage
      this.erc20TokensCustom.push(markRaw(t));

      const w = rootStore.activeWallet;
      if (w) {
        t.updateBalance(w.ethAddress);
      }

      this.saveCustomErc20Tokens();

      return t;
    },

    removeTokenList(list: TokenList) {
      // Remove token list object
      for (let i = 0; i <= this.tokenLists.length; i++) {
        const l = this.tokenLists[i];

        if (l && l.url === list.url) {
          this.tokenLists.splice(i, 1);
          break;
        }
      }

      // Remove custom Token list urls
      const index = this.tokenListsCustom.indexOf(list.url);
      this.tokenListsCustom.splice(index, 1);

      // Update local storage
      this.saveCustomTokenLists();
    },

    async addTokenListUrl(data: AddTokenListInput) {
      // Make sure URL is not already added
      if (this.tokenListUrls.includes(data.url)) throw "Already added.";
      if (this.tokenListsCustom.includes(data.url)) throw "Already added.";

      const url = data.url;
      const res = await axios.get(url);
      const tokenList: TokenList = res.data;
      tokenList.url = url;
      tokenList.readonly = data.readonly;

      this.addTokenList(tokenList);
    },

    addTokenList(tokenList: TokenList) {
      const tokens: TokenListToken[] = tokenList.tokens;
      this.tokenLists.push(tokenList);
      for (const token of tokens) {
        this.addErc20Token(token);
      }

      if (tokenList.readonly) {
        this.tokenListUrls.push(tokenList.url);
      } else {
        this.tokenListsCustom.push(tokenList.url);
        this.saveCustomTokenLists();
      }
    },

    loadCustomTokenLists() {
      const listRaw = localStorage.getItem("token_lists");
      if (!listRaw) return;
      const urls: string[] = JSON.parse(listRaw);

      for (const url of urls) {
        this.addTokenListUrl({
          url,
          readonly: false,
        });
      }
    },

    async initErc20List() {
      // Load default erc20 token contracts
      const erc20Tokens = await fetchTokenList();
      erc20Tokens.readonly = true;
      erc20Tokens.url = "Default";
      this.addTokenList(erc20Tokens);

      for (const TOKEN_LIST of TOKEN_LISTS) {
        await this.addTokenListUrl({
          url: TOKEN_LIST,
          readonly: true,
        });
      }

      this.loadCustomTokenLists();
      this.loadCustomErc20Tokens();
    },

    // Gets the balances of the active wallet and gets descriptions for unknown asset ids
    addUnknownAssets() {
      const balanceDict: IWalletBalanceDict = this.balanceDict;
      const nftDict: IWalletNftDict = this.walletNftDict;
      const nftMintDict: IWalletNftMintDict = this.nftMintDict;

      for (const id in balanceDict) {
        if (!this.assetsDict[id]) {
          this.addUnknownAsset(id);
        }
      }

      for (const nft_id in nftDict) {
        if (!this.nftFamsDict[nft_id]) {
          this.addUnknownNftFamily(nft_id);
        }
      }

      for (const familyId in nftMintDict) {
        if (!this.nftFamsDict[familyId]) {
          this.addUnknownNftFamily(familyId);
        }
      }
    },

    // Update the utxos for the current active wallet
    async updateUTXOs() {
      const rootStore = useRootStore();
      const erc721Store = useErc721Store();
      const wallet = rootStore.activeWallet;
      if (!wallet) {
        return false;
      }

      await wallet.getUTXOs();
      this.onUtxosUpdated();
      this.updateERC20Balances();

      erc721Store.updateWalletBalance();

      rootStore.updateActiveAddress();
    },

    // Only updates external utxos of the wallet
    async updateUTXOsExternal() {
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      if (!wallet) {
        return false;
      }

      await (wallet.type === "mnemonic"
        ? (wallet as MnemonicWallet).updateUTXOsExternal()
        : wallet.updateUTXOsX());

      this.onUtxosUpdated();
      rootStore.updateActiveAddress();
    },

    updateERC20Balances() {
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      if (!wallet) return;
      // Old ledger wallets do not have an eth address
      if (!wallet.ethAddress) return;

      const networkID = this.evmChainId;
      const tokens: Erc20Token[] = this.networkErc20Tokens;
      for (const token of tokens) {
        if (token.data.chainId !== networkID) continue;
        token.updateBalance(wallet!.ethAddress);
      }
    },

    // What is the AVAX coin in the network
    async updateAvaAsset() {
      const res = await avm.getAssetDescription("METAL");
      const id = bintools.cb58Encode(res.assetID);
      this.AVA_ASSET_ID = id;
      const asset = new AvaAsset(id, res.name, res.symbol, res.denomination);
      this.addAsset(asset);
    },

    /**
     * Update the X-Chain asset dictionary, split balances into categories.
     * (locked, available, multisig)
     */
    updateBalanceDict(): IWalletBalanceDict {
      const utxoSet = this.walletAvmUtxoSet;
      if (utxoSet === null) return {};

      const dict: IWalletBalanceDict = {};

      const unixNox = UnixNow();
      const ZERO = new BN(0);

      const addrUtxos = utxoSet.getAllUTXOs();

      for (const utxo of addrUtxos) {
        // Process only SECP256K1 Transfer Output utxos, outputid === 07
        const outId = utxo.getOutput().getOutputID();

        if (outId !== 7) continue;

        const utxoOut = utxo.getOutput() as AmountOutput;

        const locktime = utxoOut.getLocktime();
        const threhsold = utxoOut.getThreshold();
        const amount = utxoOut.getAmount();
        const assetIdBuff = utxo.getAssetID();
        const assetId = bintools.cb58Encode(assetIdBuff);

        // Which category should the utxo fall under
        const isMultisig = threhsold > 1;
        const isLocked = locktime.gt(unixNox);

        if (isMultisig) {
          if (dict[assetId]) {
            const amt = dict[assetId].multisig;
            dict[assetId].multisig = amt.add(amount);
          } else {
            dict[assetId] = {
              locked: ZERO.clone(),
              available: ZERO.clone(),
              multisig: amount.clone(),
            };
          }
        } else if (isLocked) {
          if (dict[assetId]) {
            const amt = dict[assetId].locked;
            dict[assetId].locked = amt.add(amount);
          } else {
            dict[assetId] = {
              locked: amount.clone(),
              available: ZERO.clone(),
              multisig: ZERO.clone(),
            };
          }
        }
        // If locked
        else {
          if (dict[assetId]) {
            const amt = dict[assetId].available;
            dict[assetId].available = amt.add(amount);
          } else {
            dict[assetId] = {
              locked: ZERO.clone(),
              available: amount.clone(),
              multisig: ZERO.clone(),
            };
          }
        }
      }
      this.balanceDict = dict;
      return dict;
    },

    /**
     * Adds an unknown asset id to the assets dictionary
     */
    async addUnknownAsset(assetId: string) {
      // get info about the asset
      const desc = await ava.XChain().getAssetDescription(assetId);
      const newAsset = new AvaAsset(
        assetId,
        desc.name,
        desc.symbol,
        desc.denomination,
      );

      this.addAsset(newAsset);
      return desc;
    },

    async addUnknownNftFamily(assetId: string) {
      const desc = await ava.XChain().getAssetDescription(assetId);
      const newFam = new AvaNftFamily(assetId, desc.name, desc.symbol);

      this.addNftFamily(newFam);
      return desc;
    },

    addAsset(asset: AvaAsset) {
      if (this.assetsDict[asset.id]) {
        return;
      }
      this.assets.push(markRaw(asset));
      this.assetsDict[asset.id] = markRaw(asset);
    },
    addNftFamily(family: AvaNftFamily) {
      if (this.nftFamsDict[family.id]) {
        return;
      }
      this.nftFams.push(markRaw(family));
      this.nftFamsDict[family.id] = markRaw(family);
    },
    removeAllAssets() {
      this.assets = [];
      this.assetsDict = {};
      this.nftFams = [];
      this.nftFamsDict = {};
      this.nftUTXOs = [];
      this.nftMintUTXOs = [];
      this.balanceDict = {};
      this.AVA_ASSET_ID = null;
    },
    saveCustomErc20Tokens() {
      const tokens: Erc20Token[] = this.erc20TokensCustom;

      const tokenRawData: TokenListToken[] = tokens.map((token) => {
        return token.data;
      });
      localStorage.setItem("erc20_tokens", JSON.stringify(tokenRawData));
    },
    loadCustomErc20Tokens() {
      const tokensRaw = localStorage.getItem("erc20_tokens") || "[]";
      const tokens: TokenListToken[] = JSON.parse(tokensRaw);
      for (const token of tokens) {
        if (token) {
          this.erc20TokensCustom.push(markRaw(new Erc20Token(token)));
        }
      }
    },

    saveCustomTokenLists() {
      const lists = JSON.stringify(this.tokenListsCustom);
      localStorage.setItem("token_lists", lists);
    },

    whitelistNFT(id?: string) {
      if (id) {
        this.nftWhitelist.push(id);
      }
    },
  },
  getters: {
    networkErc20Tokens(): Erc20Token[] {
      const tokens = this.erc20Tokens.concat(this.erc20TokensCustom);
      const chainId = this.evmChainId;

      const filt = tokens.filter((t) => {
        if (t.data.chainId !== chainId) return false;
        return true;
      });
      return filt;
    },

    findErc20() {
      return (contractAddr: string) => {
        const tokens: Erc20Token[] = this.erc20Tokens.concat(
          this.erc20TokensCustom,
        );
        for (const t of tokens) {
          if (t && t.data.address === contractAddr) {
            return t;
          }
        }
        return null;
      };
    },

    // assset id -> utxos
    walletNftDict() {
      const utxos = this.nftUTXOs;
      const res: IWalletNftDict = {};

      for (const utxo of utxos) {
        if (utxo) {
          const assetIdBuff = utxo.getAssetID();
          // TODO: Encoding might be taking too much time
          const assetId = bintools.cb58Encode(assetIdBuff);

          if (res[assetId]) {
            res[assetId].push(utxo as UTXO);
          } else {
            res[assetId] = [utxo as UTXO];
          }
        }
      }
      return res;
    },

    walletAssetsDict(): IWalletAssetsDict {
      const balanceDict: IWalletBalanceDict = this.balanceDict;
      const assetsDict: AssetsDict = cloneDeep(this.assetsDict);
      const res: IWalletAssetsDict = {};

      for (const assetId in assetsDict) {
        const balanceAmt = balanceDict[assetId];

        let asset: AvaAsset | undefined;
        if (balanceAmt) {
          asset = assetsDict[assetId];
          asset?.resetBalance();
          asset?.addBalance(balanceAmt.available);
          asset?.addBalanceLocked(balanceAmt.locked);
          asset?.addBalanceMultisig(balanceAmt.multisig);
        } else {
          asset = assetsDict[assetId];
          asset?.resetBalance();
        }

        // Add extras for AVAX token
        if (asset && asset.id === this.AVA_ASSET_ID) {
          asset.addExtra(this.walletStakingBalance);
          asset.addExtra(this.walletPlatformBalance.available);
          asset.addExtra(this.walletPlatformBalance.locked);
          asset.addExtra(this.walletPlatformBalance.lockedStakeable);
          asset.addExtra(this.walletPlatformBalance.multisig);
        }

        if (asset) {
          res[assetId] = asset;
        }
      }
      return res;
    },

    walletAssetsArray(): AvaAsset[] {
      const assetsDict: IWalletAssetsDict = this.walletAssetsDict;
      const res: AvaAsset[] = [];

      for (const id in assetsDict) {
        const asset = assetsDict[id];
        if (asset) {
          res.push(asset);
        }
      }
      return res;
    },

    /**
     * Get the X-Chain (AVM) UTXO Set currently loaded in the wallet
     */
    walletAvmUtxoSet(): AVMUTXOSet | null {
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      if (!wallet) return null;
      return wallet.utxoset as AVMUTXOSet;
    },

    nftFamilies(): AvaNftFamily[] {
      return this.nftFams;
    },

    walletStakingBalance(): BN {
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      if (!wallet) return new BN(0);

      return wallet.stakeAmount;
    },

    /**
     * Calculates balances (available, locked, lockedStakeable, multisig) from the active wallet's UTXO set.
     * @param state
     * @param getters
     * @param rootState
     */
    walletPlatformBalance(): {
      available: BN;
      locked: BN;
      lockedStakeable: BN;
      multisig: BN;
    } {
      const rootStore = useRootStore();
      const wallet = rootStore.activeWallet;
      const balances = {
        available: new BN(0),
        locked: new BN(0),
        lockedStakeable: new BN(0),
        multisig: new BN(0),
      };

      if (!wallet || !this.AVA_ASSET_ID) return balances;

      const utxoSet: PlatformUTXOSet = wallet.getPlatformUTXOSet();

      const now = UnixNow();

      const utxos = utxoSet.getAllUTXOs();
      // Only use AVAX UTXOs
      const avaxID = bintools.cb58Decode(this.AVA_ASSET_ID);
      const avaxUTXOs = utxos.filter((utxo) =>
        utxo.getAssetID().equals(avaxID),
      );

      for (const utxo of avaxUTXOs) {
        if (utxo) {
          const utxoOut = utxo.getOutput();
          const outId = utxoOut.getOutputID();
          const threshold = utxoOut.getThreshold();

          // If its multisig utxo
          if (threshold > 1) {
            balances.multisig.iadd((utxoOut as AmountOutput).getAmount());
            continue;
          }

          const isStakeableLock =
            outId === PlatformVMConstants.STAKEABLELOCKOUTID;

          const locktime = isStakeableLock
            ? (utxoOut as StakeableLockOut).getStakeableLocktime()
            : (utxoOut as AmountOutput).getLocktime();

          // If normal unlocked utxo (includes stakeable lock that is in the past)
          if (locktime.lte(now)) {
            balances.available.iadd((utxoOut as AmountOutput).getAmount());
          }
          // If locked utxo
          else if (!isStakeableLock) {
            balances.locked.iadd((utxoOut as AmountOutput).getAmount());
          }
          // If stakeable lock utxo
          else if (isStakeableLock) {
            balances.lockedStakeable.iadd(
              (utxoOut as AmountOutput).getAmount(),
            );
          }
        }
      }

      return balances;
    },

    walletPlatformBalanceLocked(): BN {
      return this.walletPlatformBalance.locked;
    },

    walletPlatformBalanceLockedStakeable(): BN {
      return this.walletPlatformBalance.lockedStakeable;
    },

    nftMintDict(): IWalletNftMintDict {
      const res: IWalletNftMintDict = {};
      const mintUTXOs = this.nftMintUTXOs;

      // eslint-disable-next-line unicorn/no-for-loop
      for (let i = 0; i < mintUTXOs.length; i++) {
        const utxo = mintUTXOs[i];
        if (utxo) {
          const assetId = bintools.cb58Encode(utxo.getAssetID());

          const target = res[assetId];
          if (target) {
            target.push(utxo as UTXO);
          } else {
            res[assetId] = [utxo as UTXO];
          }
        }
      }

      // sort by groupID
      for (const id in res) {
        if (res[id]) {
          res[id].sort((a, b) => {
            const idA = (a.getOutput() as NFTMintOutput).getGroupID();
            const idB = (b.getOutput() as NFTMintOutput).getGroupID();

            return idA - idB;
          });
        }
      }
      return res;
    },

    assetIds(): string[] {
      return this.assets.map((asset) => {
        return asset.id;
      });
    },
    AssetAVA(): AvaAsset | null {
      const walletBalanceDict = this.walletAssetsDict;
      const AVA_ASSET_ID = this.AVA_ASSET_ID;
      if (AVA_ASSET_ID && walletBalanceDict[AVA_ASSET_ID]) {
        return walletBalanceDict[AVA_ASSET_ID];
      }
      return null;
    },
  },
});
