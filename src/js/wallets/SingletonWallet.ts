import type { Transaction } from "@ethereumjs/tx";
import type {
  KeyPair as AVMKeyPair,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  Tx as AVMTx,
  UnsignedTx as AVMUnsignedTx,
} from "@metalblockchain/metaljs/dist/apis/avm/tx";
import type { UTXO as AVMUTXO } from "@metalblockchain/metaljs/dist/apis/avm/utxos";

import type {
  Tx as EvmTx,
  UnsignedTx as EVMUnsignedTx,
} from "@metalblockchain/metaljs/dist/apis/evm/tx";
import type { KeyPair as PlatformKeyPair } from "@metalblockchain/metaljs/dist/apis/platformvm";
import type {
  Tx as PlatformTx,
  UnsignedTx as PlatformUnsignedTx,
} from "@metalblockchain/metaljs/dist/apis/platformvm/tx";
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type { AvaWalletCore, UnsafeWallet } from "./types";
import type { ITransaction } from "@/components/wallet/transfer/types";
import type Erc20Token from "@/js/Erc20Token";
import type { WalletNameType } from "@/js/wallets/types";
import { BN, Buffer as BufferAvalanche } from "@metalblockchain/metaljs";
import {
  KeyChain as AVMKeyChain,
  UTXOSet as AVMUTXOSet,
} from "@metalblockchain/metaljs/dist/apis/avm";
import {
  KeyChain as EVMKeyChain,
  KeyChain,
} from "@metalblockchain/metaljs/dist/apis/evm";
import {
  KeyChain as PlatformKeyChain,
  UTXOSet as PlatformUTXOSet,
} from "@metalblockchain/metaljs/dist/apis/platformvm";
import { privateToAddress } from "ethereumjs-util";
import { digestMessage } from "@/helpers/helper";
import { avmGetAllUTXOs, platformGetAllUTXOs } from "@/helpers/utxo_helper";
import { WalletHelper } from "@/helpers/wallet_helper";
import { AbstractWallet } from "@/js/wallets/AbstractWallet";
import { ava, avm, bintools, pChain } from "@/misc/AVA";
import { buildUnsignedTransaction } from "../TxHelper";

class SingletonWallet
  extends AbstractWallet
  implements AvaWalletCore, UnsafeWallet
{
  keyChain: AVMKeyChain;
  keyPair: AVMKeyPair;

  platformKeyChain: PlatformKeyChain;
  platformKeyPair: PlatformKeyPair;

  chainId: string;
  chainIdP: string;

  key: string;

  stakeAmount: BN;

  type: WalletNameType;

  ethKey: string;
  ethKeyBech: string;
  ethKeyChain: EVMKeyChain;
  ethAddress: string;
  ethAddressBech: string;

  constructor(pk: string) {
    super();

    this.key = pk;

    this.chainId = avm.getBlockchainAlias() || avm.getBlockchainID();
    this.chainIdP = pChain.getBlockchainAlias() || pChain.getBlockchainID();

    const hrp = ava.getHRP();

    this.keyChain = new AVMKeyChain(hrp, this.chainId);
    this.keyPair = this.keyChain.importKey(pk);

    this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP);
    this.platformKeyPair = this.platformKeyChain.importKey(pk);

    this.stakeAmount = new BN(0);

    // Derive EVM key and address
    const pkBuf = bintools.cb58Decode(pk.split("-")[1] ?? "");
    const pkHex = pkBuf.toString("hex");
    const pkBuffNative = Buffer.from(pkHex, "hex");

    this.ethKey = pkHex;
    this.ethAddress = privateToAddress(pkBuffNative).toString("hex");

    const cPrivKey =
      `PrivateKey-` + bintools.cb58Encode(BufferAvalanche.from(pkBuf));
    this.ethKeyBech = cPrivKey;
    const cKeyChain = new KeyChain(ava.getHRP(), "C");
    this.ethKeyChain = cKeyChain;

    const cKeypair = cKeyChain.importKey(cPrivKey);
    this.ethAddressBech = cKeypair.getAddressString();

    this.type = "singleton";
    this.isInit = true;
  }

  getChangeAddressAvm(): string {
    return this.getCurrentAddressAvm();
  }

  getAllExternalAddressesX(): string[] {
    return [this.getCurrentAddressAvm()];
  }

  getAllChangeAddressesX(): string[] {
    return [this.getChangeAddressAvm()];
  }

  getCurrentAddressAvm(): string {
    return this.keyPair.getAddressString();
  }

  getDerivedAddresses(): string[] {
    const addr = this.getCurrentAddressAvm();
    return [addr];
  }

  getDerivedAddressesP() {
    return [this.getCurrentAddressPlatform()];
  }

  getAllDerivedExternalAddresses(): string[] {
    return this.getDerivedAddresses();
  }

  getExtendedPlatformAddresses(): string[] {
    const addr = this.platformKeyPair.getAddressString();
    return [addr];
  }

  getHistoryAddresses(): string[] {
    const addr = this.getCurrentAddressAvm();
    return [addr];
  }

  getCurrentAddressPlatform(): string {
    return this.platformKeyPair.getAddressString();
  }

  getBaseAddress(): string {
    return this.getCurrentAddressAvm();
  }

  getPlatformUTXOSet(): PlatformUTXOSet {
    return this.platformUtxoset;
  }

  getEvmAddress(): string {
    return this.ethAddress;
  }

  getEvmAddressBech(): string {
    return this.ethAddressBech;
  }

  async updateUTXOsX(): Promise<AVMUTXOSet> {
    const result = await avmGetAllUTXOs([this.getCurrentAddressAvm()]);
    this.utxoset = result;
    return result;
  }

  async updateUTXOsP(): Promise<PlatformUTXOSet> {
    const result = await platformGetAllUTXOs([
      this.getCurrentAddressPlatform(),
    ]);
    this.platformUtxoset = result;
    return result;
  }

  async getUTXOs(): Promise<void> {
    this.isFetchUtxos = true;

    await this.updateUTXOsX();
    await this.updateUTXOsP();

    await this.getStake();
    await this.getEthBalance();

    this.isFetchUtxos = false;

    return;
  }

  async buildUnsignedTransaction(
    orders: (ITransaction | UTXO)[],
    addr: string,
    memo?: BufferAvalanche,
  ) {
    const changeAddress = this.getChangeAddressAvm();
    const derivedAddresses = this.getDerivedAddresses();
    const utxoset = this.getUTXOSet() as AVMUTXOSet;

    return buildUnsignedTransaction(
      orders,
      addr,
      derivedAddresses,
      utxoset,
      changeAddress,
      memo,
    );
  }

  async issueBatchTx(
    orders: (ITransaction | AVMUTXO)[],
    addr: string,
    memo: BufferAvalanche | undefined,
  ): Promise<string> {
    return await WalletHelper.issueBatchTx(this, orders, addr, memo);
  }

  onnetworkchange(): void {
    const hrp = ava.getHRP();

    this.keyChain = new AVMKeyChain(hrp, this.chainId);
    this.utxoset = new AVMUTXOSet();
    this.keyPair = this.keyChain.importKey(this.key);

    this.platformKeyChain = new PlatformKeyChain(hrp, this.chainIdP);
    this.platformUtxoset = new PlatformUTXOSet();
    this.platformKeyPair = this.platformKeyChain.importKey(this.key);

    // Update EVM values
    this.ethKeyChain = new EVMKeyChain(ava.getHRP(), "C");
    const cKeypair = this.ethKeyChain.importKey(this.ethKeyBech);
    this.ethAddressBech = cKeypair.getAddressString();
    this.ethBalance = new BN(0);

    this.getUTXOs();
  }

  async signX(unsignedTx: AVMUnsignedTx): Promise<AVMTx> {
    const keychain = this.keyChain;

    const tx = unsignedTx.sign(keychain);
    return tx;
  }

  async signP(unsignedTx: PlatformUnsignedTx): Promise<PlatformTx> {
    const keychain = this.platformKeyChain;
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

  async signMessage(msgStr: string): Promise<string> {
    const digest = digestMessage(msgStr);

    const digestHex = digest.toString("hex");
    const digestBuff = BufferAvalanche.from(digestHex, "hex");
    const signed = this.keyPair.sign(digestBuff);

    return bintools.cb58Encode(signed);
  }

  async createNftFamily(name: string, symbol: string, groupNum: number) {
    return await WalletHelper.createNftFamily(this, name, symbol, groupNum);
  }

  async mintNft(mintUtxo: AVMUTXO, payload: PayloadBase, quantity: number) {
    return await WalletHelper.mintNft(this, mintUtxo, payload, quantity);
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

  getAllAddressesX() {
    return [this.getCurrentAddressAvm()];
  }

  getAllAddressesP() {
    return [this.getCurrentAddressPlatform()];
  }
}

export { SingletonWallet };
