// Functions to manage import/export of keystore files
import type {
  AllKeyFileDecryptedTypes,
  AllKeyFileTypes,
  KeyFileDecryptedV2,
  KeyFileDecryptedV3,
  KeyFileDecryptedV4,
  KeyFileDecryptedV5,
  KeyFileDecryptedV6,
  KeyFileKeyDecryptedV2,
  KeyFileKeyDecryptedV3,
  KeyFileKeyDecryptedV4,
  KeyFileKeyDecryptedV5,
  KeyFileKeyDecryptedV6,
  KeyFileKeyV2,
  KeyFileKeyV3,
  KeyFileKeyV4,
  KeyFileKeyV5,
  KeyFileKeyV6,
  KeyFileV2,
  KeyFileV3,
  KeyFileV4,
  KeyFileV5,
  KeyFileV6,
  KeystoreFileKeyType,
} from "./IKeystore";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { SingletonWallet } from "@/js/wallets/SingletonWallet";
import type { WalletType } from "@/js/wallets/types";
import type { AccessWalletMultipleInput } from "@/stores/types";
import type { Buffer } from "buffer/";
import { Buffer as AjsBuffer } from "@metalblockchain/metaljs";
import * as bip39 from "bip39";
import { keyToKeypair } from "@/helpers/helper";
import Crypto from "@/js/Crypto";
import { avm, bintools } from "@/misc/AVA";

const cryptoHelpers = new Crypto();

const KEYSTORE_VERSION = "6.0";

const ITERATIONS_V2 = 100_000;
const ITERATIONS_V3 = 200_000; // and any version above

interface IHash {
  salt: Buffer;
  hash: Buffer;
}

interface PKCrypt {
  salt: Buffer;
  iv: Buffer;
  ciphertext: Buffer;
}

async function readV2(data: KeyFileV2, pass: string) {
  const version: string = data.version;
  cryptoHelpers.keygenIterations = ITERATIONS_V2;

  const salt: Buffer = bintools.cb58Decode(data.salt);
  const pass_hash: string = data.pass_hash;

  const checkHash: Buffer = await cryptoHelpers._pwcleaner(pass, salt);
  const checkHashString = bintools.cb58Encode(AjsBuffer.from(checkHash));

  if (checkHashString !== pass_hash) {
    throw "INVALID_PASS";
  }

  const keys: KeyFileKeyV2[] = data.keys;
  const keysDecrypt: KeyFileKeyDecryptedV2[] = [];

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < keys.length; i++) {
    const key_data: KeyFileKeyV2 | undefined = keys[i];

    if (!key_data) continue;

    const key: Buffer = bintools.cb58Decode(key_data.key);
    const nonce: Buffer = bintools.cb58Decode(key_data.iv);

    const key_decrypt: Buffer = await cryptoHelpers.decrypt(
      pass,
      key,
      salt,
      nonce,
    );
    const key_string = bintools.cb58Encode(AjsBuffer.from(key_decrypt));

    keysDecrypt.push({
      key: key_string,
    });
  }

  return {
    version,
    activeIndex: 0,
    keys: keysDecrypt,
  };
}
async function readV3(data: KeyFileV3, pass: string) {
  const version: string = data.version;
  cryptoHelpers.keygenIterations = ITERATIONS_V3;

  const salt: Buffer = bintools.cb58Decode(data.salt);
  const pass_hash: string = data.pass_hash;

  const checkHash: IHash = await cryptoHelpers.pwhash(pass, salt);
  const checkHashString = bintools.cb58Encode(AjsBuffer.from(checkHash.hash));

  if (checkHashString !== pass_hash) {
    throw "INVALID_PASS";
  }

  const keys: KeyFileKeyV3[] = data.keys;
  const keysDecrypt: KeyFileKeyDecryptedV3[] = [];

  for (const key_data of keys) {
    if (!key_data) continue;

    const key: Buffer = bintools.cb58Decode(key_data.key);
    const nonce: Buffer = bintools.cb58Decode(key_data.iv);

    const key_decrypt: Buffer = await cryptoHelpers.decrypt(
      pass,
      key,
      salt,
      nonce,
    );
    const key_string = bintools.cb58Encode(AjsBuffer.from(key_decrypt));

    keysDecrypt.push({
      key: key_string,
    });
  }

  return {
    version,
    activeIndex: 0,
    keys: keysDecrypt,
  };
}
async function readV4(
  data: KeyFileV4,
  pass: string,
): Promise<KeyFileDecryptedV5> {
  const version: string = data.version;
  cryptoHelpers.keygenIterations = ITERATIONS_V3;

  const salt: Buffer = bintools.cb58Decode(data.salt);
  const pass_hash: string = data.pass_hash;

  const checkHash: IHash = await cryptoHelpers.pwhash(pass, salt);
  const checkHashString = bintools.cb58Encode(AjsBuffer.from(checkHash.hash));

  if (checkHashString !== pass_hash) {
    throw "INVALID_PASS";
  }

  const keys: KeyFileKeyV4[] = data.keys;
  const keysDecrypt: KeyFileKeyDecryptedV4[] = [];

  for (const key_data of keys) {
    if (!key_data) continue;

    const key: Buffer = bintools.cb58Decode(key_data.key);
    const nonce: Buffer = bintools.cb58Decode(key_data.iv);

    const key_decrypt: Buffer = await cryptoHelpers.decrypt(
      pass,
      key,
      salt,
      nonce,
    );
    const key_string = bintools.cb58Encode(AjsBuffer.from(key_decrypt));

    keysDecrypt.push({
      key: key_string,
    });
  }

  return {
    version,
    activeIndex: 0,
    keys: keysDecrypt,
  };
}

async function readV5(
  data: KeyFileV5,
  pass: string,
): Promise<KeyFileDecryptedV5> {
  const version: string = data.version;
  cryptoHelpers.keygenIterations = ITERATIONS_V3;

  const salt: Buffer = bintools.cb58Decode(data.salt);
  const pass_hash = data.pass_hash;

  const checkHash: IHash = await cryptoHelpers.pwhash(pass, salt);
  const checkHashString = bintools.cb58Encode(AjsBuffer.from(checkHash.hash));

  if (checkHashString !== pass_hash) {
    throw "INVALID_PASS";
  }

  const keys: KeyFileKeyV5[] = data.keys;
  const keysDecrypt: KeyFileKeyDecryptedV5[] = [];

  for (const key_data of keys) {
    if (!key_data) continue;
    const key: Buffer = bintools.cb58Decode(key_data.key);
    const nonce: Buffer = bintools.cb58Decode(key_data.iv);

    const key_decrypt: Buffer = await cryptoHelpers.decrypt(
      pass,
      key,
      salt,
      nonce,
    );
    const key_string = key_decrypt.toString();

    keysDecrypt.push({
      key: key_string,
    });
  }

  return {
    version,
    activeIndex: 0,
    keys: keysDecrypt,
  };
}

async function readV6(
  data: KeyFileV6,
  pass: string,
): Promise<KeyFileDecryptedV6> {
  const version: string = data.version;
  const activeIndex = data.activeIndex;
  cryptoHelpers.keygenIterations = ITERATIONS_V3;

  const salt: Buffer = bintools.cb58Decode(data.salt);

  const keys: KeyFileKeyV6[] = data.keys;
  const keysDecrypt: KeyFileKeyDecryptedV6[] = [];

  for (const key_data of keys) {
    if (!key_data) continue;

    const key: Buffer = bintools.cb58Decode(key_data.key);
    const type: KeystoreFileKeyType = key_data.type;
    const nonce: Buffer = bintools.cb58Decode(key_data.iv);

    let key_decrypt: Buffer;
    try {
      key_decrypt = await cryptoHelpers.decrypt(pass, key, salt, nonce);
    } catch {
      throw "INVALID_PASS";
    }

    const key_string = key_decrypt.toString();

    keysDecrypt.push({
      key: key_string,
      type,
    });
  }

  return {
    version,
    activeIndex: activeIndex || 0,
    keys: keysDecrypt,
  };
}

async function readKeyFile(
  data: AllKeyFileTypes,
  pass: string,
): Promise<AllKeyFileDecryptedTypes> {
  switch (data.version) {
    case "6.0": {
      return await readV6(data as KeyFileV6, pass);
    }
    case "5.0": {
      return await readV5(data as KeyFileV5, pass);
    }
    case "4.0": {
      return await readV4(data as KeyFileV4, pass);
    }
    case "3.0": {
      return await readV3(data as KeyFileV3, pass);
    }
    case "2.0": {
      return await readV2(data as KeyFileV2, pass);
    }
    default: {
      throw "INVALID_VERSION";
    }
  }
}

function extractKeysV2(
  file: KeyFileDecryptedV2 | KeyFileDecryptedV3 | KeyFileDecryptedV4,
): AccessWalletMultipleInput[] {
  const chainID = avm.getBlockchainAlias();
  const keys = (
    file as KeyFileDecryptedV2 | KeyFileDecryptedV3 | KeyFileDecryptedV4
  ).keys;

  return keys.map((key) => {
    // Private keys from the keystore file do not have the PrivateKey- prefix
    const pk = "PrivateKey-" + key.key;
    const keypair = keyToKeypair(pk, chainID);

    const keyBuf = keypair.getPrivateKey();
    const keyHex: string = keyBuf.toString("hex");
    const paddedKeyHex = keyHex.padStart(64, "0");
    const mnemonic: string = bip39.entropyToMnemonic(paddedKeyHex);

    return {
      key: mnemonic,
      type: "mnemonic",
    };
  });
}

function extractKeysV5(file: KeyFileDecryptedV5): AccessWalletMultipleInput[] {
  return file.keys.map((key) => ({
    key: key.key,
    type: "mnemonic",
  }));
}

function extractKeysV6(file: KeyFileDecryptedV6): AccessWalletMultipleInput[] {
  return file.keys.map((key) => ({
    type: key.type,
    key: key.key,
  }));
}

function extractKeysFromDecryptedFile(
  file: AllKeyFileDecryptedTypes,
): AccessWalletMultipleInput[] {
  switch (file.version) {
    case "6.0": {
      return extractKeysV6(file as KeyFileDecryptedV6);
    }
    case "5.0": {
      return extractKeysV5(file as KeyFileDecryptedV5);
    }
    case "4.0": {
      return extractKeysV2(file as KeyFileDecryptedV4);
    }
    case "3.0": {
      return extractKeysV2(file as KeyFileDecryptedV3);
    }
    case "2.0": {
      return extractKeysV2(file as KeyFileDecryptedV2);
    }
    default: {
      throw "INVALID_VERSION";
    }
  }
}

// Given an array of wallets and a password, return an encrypted JSON object that is the keystore file
async function makeKeyfile(
  wallets: WalletType[],
  pass: string,
  activeIndex: number,
): Promise<KeyFileV6> {
  // 3.0 and above uses 200,000
  cryptoHelpers.keygenIterations = ITERATIONS_V3;

  const salt: Buffer = await cryptoHelpers.makeSalt();

  const keys: KeyFileKeyV6[] = [];

  for (const wallet of wallets) {
    if (!wallet) continue;

    let key;
    let type: KeystoreFileKeyType;
    if (wallet.type === "singleton") {
      key = (wallet as SingletonWallet).key;
      type = "singleton";
    } else {
      key = (wallet as MnemonicWallet).getMnemonic();
      type = "mnemonic";
    }
    const pk_crypt: PKCrypt = await cryptoHelpers.encrypt(pass, key, salt);

    const key_data: KeyFileKeyV6 = {
      key: bintools.cb58Encode(AjsBuffer.from(pk_crypt.ciphertext)),
      iv: bintools.cb58Encode(AjsBuffer.from(pk_crypt.iv)),
      type,
    };
    keys.push(key_data);
  }

  const file_data: KeyFileV6 = {
    version: KEYSTORE_VERSION,
    salt: bintools.cb58Encode(AjsBuffer.from(salt)),
    activeIndex,
    keys,
  };
  return file_data;
}

export {
  extractKeysFromDecryptedFile,
  KEYSTORE_VERSION,
  makeKeyfile,
  readKeyFile,
};
