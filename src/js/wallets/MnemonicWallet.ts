// A simple wrapper thar combines avalanche.js, bip39 and HDWallet

import type { Transaction } from "@ethereumjs/tx";
import type {
  KeyPair as AVMKeyPair,
  Tx as AVMTx,
  UnsignedTx as AVMUnsignedTx,
  UTXO as AVMUTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";

import type {
  Tx as EvmTx,
  UnsignedTx as EVMUnsignedTx,
} from "@metalblockchain/metaljs/dist/apis/evm";
import type {
  Tx as PlatformTx,
  UnsignedTx as PlatformUnsignedTx,
  KeyChain as PlatformVMKeyChain,
} from "@metalblockchain/metaljs/dist/apis/platformvm";

import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { ITransaction } from "@/components/wallet/transfer/types";
import type Erc20Token from "@/js/Erc20Token";
import type { IAvaHdWallet, WalletNameType } from "@/js/wallets/types";

import { BN, Buffer as BufferAvalanche } from "@metalblockchain/metaljs";
import { KeyChain as AVMKeyChain } from "@metalblockchain/metaljs/dist/apis/avm";
import { KeyChain as EVMKeyChain } from "@metalblockchain/metaljs/dist/apis/evm";
import { getPreferredHRP } from "@metalblockchain/metaljs/dist/utils";
import * as bip39 from "bip39";
import { privateToAddress } from "ethereumjs-util";
import HDKey from "hdkey";
import { WalletHelper } from "@/helpers/wallet_helper";
import { AbstractHdWallet } from "@/js/wallets/AbstractHdWallet";
import MnemonicPhrase from "@/js/wallets/MnemonicPhrase";
import { ava, bintools } from "@/misc/AVA";

// HD WALLET
// Accounts are not used and the account index is fixed to 0
// m / purpose' / coin_type' / account' / change / address_index

const AVA_TOKEN_INDEX = "9000";
export const AVA_ACCOUNT_PATH = `m/44'/${AVA_TOKEN_INDEX}'/0'`; // Change and index left out
export const ETH_ACCOUNT_PATH = `m/44'/60'/0'`;
export const LEDGER_ETH_ACCOUNT_PATH = ETH_ACCOUNT_PATH + "/0/0";

// Possible indexes for each request is
// SCAN_SIZE - INDEX_RANGE

export default class MnemonicWallet
  extends AbstractHdWallet
  implements IAvaHdWallet
{
  seed: string;
  hdKey: HDKey;

  isLoading: boolean;
  type: WalletNameType;
  ethKey: string;
  ethKeyBech: string;
  ethKeyChain: EVMKeyChain;
  ethAddress: string;

  private mnemonic: MnemonicPhrase;

  // The master key from avalanche.js
  constructor(mnemonic: string) {
    const seed: globalThis.Buffer = bip39.mnemonicToSeedSync(mnemonic);
    const masterHdKey: HDKey = HDKey.fromMasterSeed(seed);
    const accountHdKey = masterHdKey.derive(AVA_ACCOUNT_PATH);
    const ethAccountKey = masterHdKey.derive(ETH_ACCOUNT_PATH + "/0/0");

    super(accountHdKey, ethAccountKey, false);

    // Derive EVM key and address
    const ethPrivateKey = ethAccountKey.privateKey || Buffer.alloc(0);
    this.ethKey = ethPrivateKey.toString("hex");
    this.ethAddress = privateToAddress(ethPrivateKey).toString("hex");

    const cPrivKey =
      `PrivateKey-` + bintools.cb58Encode(BufferAvalanche.from(ethPrivateKey));
    this.ethKeyBech = cPrivKey;

    const cKeyChain = new EVMKeyChain(ava.getHRP(), "C");
    this.ethKeyChain = cKeyChain;

    this.type = "mnemonic";
    this.seed = seed.toString("hex");
    this.hdKey = masterHdKey;
    this.mnemonic = new MnemonicPhrase(mnemonic);
    this.isLoading = false;
  }

  // TODO : Move to hd core class
  onnetworkchange() {
    super.onnetworkchange();

    // Update EVM values
    this.ethKeyChain = new EVMKeyChain(ava.getHRP(), "C");
    // ? I'm not sure is importKey doesn't have side effects, so the following line is not removed for now
    const _ = this.ethKeyChain.importKey(this.ethKeyBech);
    this.ethBalance = new BN(0);
  }

  getEvmAddress(): string {
    return this.ethAddress;
  }

  async sendEth(to: string, amount: BN, gasPrice: BN, gasLimit: number) {
    return await WalletHelper.sendEth(this, to, amount, gasPrice, gasLimit);
  }

  async estimateGas(
    to: string,
    amount: BN,
    token: Erc20Token,
  ): Promise<number> {
    return await WalletHelper.estimateGas(this, to, amount, token);
  }

  async sendERC20(
    to: string,
    amount: BN,
    gasPrice: BN,
    gasLimit: number,
    token: Erc20Token,
  ): Promise<string> {
    return await WalletHelper.sendErc20(
      this,
      to,
      amount,
      gasPrice,
      gasLimit,
      token,
    );
  }

  async getUTXOs(): Promise<void> {
    // TODO: Move to shared file
    this.isFetchUtxos = true;
    // If we are waiting for helpers to initialize delay the call
    const isInit =
      this.externalHelper.isInit &&
      this.internalHelper.isInit &&
      this.platformHelper.isInit;
    if (!isInit) {
      setTimeout(() => {
        this.getUTXOs();
      }, 1000);
      return;
    }

    super.getUTXOs();
    this.getStake();
    this.getEthBalance();
    return;
  }

  getCurrentKey(): AVMKeyPair {
    return this.externalHelper.getCurrentKey() as AVMKeyPair;
  }

  /**
   * Returns the mnemonic phrase of this wallet
   */
  getMnemonic(): string {
    return this.mnemonic.getValue();
  }

  getMnemonicEncrypted(): MnemonicPhrase {
    return this.mnemonic;
  }

  async issueBatchTx(
    orders: (ITransaction | AVMUTXO)[],
    addr: string,
    memo: BufferAvalanche | undefined,
  ): Promise<string> {
    return await WalletHelper.issueBatchTx(this, orders, addr, memo);
  }

  // returns a keychain that has all the derived private/public keys for X chain
  getKeyChain(): AVMKeyChain {
    const internal = this.internalHelper.getAllDerivedKeys() as AVMKeyPair[];
    const external = this.externalHelper.getAllDerivedKeys() as AVMKeyPair[];

    const allKeys = internal.concat(external);
    const keychain: AVMKeyChain = new AVMKeyChain(
      getPreferredHRP(ava.getNetworkID()),
      this.chainId,
    );

    for (const key of allKeys) {
      if (key) {
        keychain.addKey(key);
      }
    }
    return keychain;
  }

  async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
    const keychain = this.getKeyChain();

    const tx = unsignedTx.sign(keychain);
    return tx;
  }

  async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
    const keychain = this.platformHelper.getKeychain() as PlatformVMKeyChain;
    const tx = unsignedTx.sign(keychain);
    return tx;
  }

  async signC(unsignedTx: EVMUnsignedTx): Promise<EvmTx> {
    const keyChain = this.ethKeyChain;
    return unsignedTx.sign(keyChain);
  }

  async signEvm(tx: Transaction) {
    const keyBuff = Buffer.from(this.ethKey, "hex");
    return tx.sign(keyBuff);
  }

  async signHashByExternalIndex(index: number, hash: BufferAvalanche) {
    const key = this.externalHelper.getKeyForIndex(index) as AVMKeyPair;
    const signed = key.sign(hash);
    return bintools.cb58Encode(signed);
  }

  async createNftFamily(name: string, symbol: string, groupNum: number) {
    return await WalletHelper.createNftFamily(this, name, symbol, groupNum);
  }

  async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number) {
    return await WalletHelper.mintNft(this, mintUtxo, payload, quantity);
  }
}
