import type {
  KeyPair as AVMKeyPair,
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";

import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import { BN, Buffer } from "@metalblockchain/metaljs";

import { KeyChain as AVMKeyChain } from "@metalblockchain/metaljs/dist/apis/avm";
import {
  Defaults,
  getPreferredHRP,
  ONEAVAX,
  PayloadTypes,
} from "@metalblockchain/metaljs/dist/utils";
import Big from "big.js";

import createHash from "create-hash";
import { ava } from "@/misc/AVA";

function bnToBig(val: BN, denomination = 0): Big {
  return new Big(val.toString()).div(Math.pow(10, denomination));
}

function keyToKeypair(key: string, chainID = "X"): AVMKeyPair {
  const hrp = getPreferredHRP(ava.getNetworkID());
  const keychain = new AVMKeyChain(hrp, chainID);
  return keychain.importKey(key);
}

function calculateStakingReward(
  amount: BN,
  duration: number,
  currentSupply: BN,
): BN {
  const networkID = ava.getNetworkID();

  //@ts-ignore
  const defValues = Defaults.network[networkID];

  if (!defValues) {
    console.error("Network default values not found.");
    return new BN(0);
  }
  const defPlatformVals = defValues.P;

  const maxConsumption: number = defPlatformVals.maxConsumption;
  const minConsumption: number = defPlatformVals.minConsumption;
  const diffConsumption = maxConsumption - minConsumption;
  const maxSupply: BN = defPlatformVals.maxSupply;
  const maxStakingDuration: BN = defPlatformVals.maxStakingDuration;
  const remainingSupply = maxSupply.sub(currentSupply);

  const amtBig = Big(amount.div(ONEAVAX).toString());
  const currentSupplyBig = Big(currentSupply.div(ONEAVAX).toString());
  const remainingSupplyBig = Big(remainingSupply.div(ONEAVAX).toString());
  const portionOfExistingSupplyBig = amtBig.div(currentSupplyBig);

  const portionOfStakingDuration = duration / maxStakingDuration.toNumber();
  const mintingRate =
    minConsumption + diffConsumption * portionOfStakingDuration;

  let rewardBig: Big = remainingSupplyBig.times(portionOfExistingSupplyBig);
  rewardBig = rewardBig.times(Big(mintingRate * portionOfStakingDuration));

  const rewardStr = rewardBig.times(Math.pow(10, 9)).toFixed(0);
  const rewardBN = new BN(rewardStr);

  return rewardBN;
}

function digestMessage(msgStr: string) {
  const mBuf = Buffer.from(msgStr, "utf8");
  const msgSize = Buffer.alloc(4);
  msgSize.writeUInt32BE(mBuf.length, 0);
  const msgBuf = Buffer.from(
    `\u001AAvalanche Signed Message:\n${msgSize}${msgStr}`,
    "utf8",
  );
  return createHash("sha256").update(msgBuf).digest();
}

const payloadtypes = PayloadTypes.getInstance();

function getPayloadFromUTXO(utxo: UTXO): PayloadBase {
  const out = utxo.getOutput() as NFTTransferOutput;
  const payload = out.getPayloadBuffer();

  const typeId = payloadtypes.getTypeID(payload);
  const pl: Buffer = payloadtypes.getContent(payload);
  const payloadbase: PayloadBase = payloadtypes.select(typeId, pl);

  return payloadbase;
}

export {
  bnToBig,
  calculateStakingReward,
  digestMessage,
  getPayloadFromUTXO,
  keyToKeypair,
};
