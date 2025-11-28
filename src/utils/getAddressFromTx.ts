import type { TransferableOutput } from "@metalblockchain/metaljs/dist/apis/avm";
import type { UnsignedTx as AVMUnsignedTx } from "@metalblockchain/metaljs/dist/apis/avm/tx";
import type { EVMBaseTx } from "@metalblockchain/metaljs/dist/apis/evm";
import type { UnsignedTx as PlatformUnsignedTx } from "@metalblockchain/metaljs/dist/apis/platformvm/tx";
import { BaseTx as AVMBaseTx } from "@metalblockchain/metaljs/dist/apis/avm";
import { UnsignedTx as EVMUnsignedTx } from "@metalblockchain/metaljs/dist/apis/evm/tx";

import { BaseTx as PlatformBaseTx } from "@metalblockchain/metaljs/dist/apis/platformvm";
import {
  AddDelegatorTx,
  AddPermissionlessDelegatorTx,
  AddPermissionlessValidatorTx,
  AddValidatorTx,
} from "@metalblockchain/metaljs/dist/apis/platformvm/validationtx";
import { ava as avalanche, bintools } from "@/misc/AVA";

/**
 * Returns an array of unique addresses that are found on stake outputs of a tx.
 * @param tx
 */
export function getStakeOutAddresses(
  tx: AVMBaseTx | PlatformBaseTx | EVMBaseTx,
): string[] {
  if (
    tx instanceof AddValidatorTx ||
    tx instanceof AddDelegatorTx ||
    tx instanceof AddPermissionlessValidatorTx ||
    tx instanceof AddPermissionlessDelegatorTx
  ) {
    const allAddrs = tx.getStakeOuts().flatMap((out) =>
      out
        .getOutput()
        .getAddresses()
        .map((addr) => {
          return bintools.addressToString(avalanche.getHRP(), "P", addr);
        }),
    );
    // Remove duplicates
    return [...new Set(allAddrs)];
  }

  return [];
}

export function getOutputAddresses(tx: AVMBaseTx | PlatformBaseTx) {
  const chainID = tx instanceof AVMBaseTx ? "X" : "P";
  const outAddrs = tx
    .getOuts()
    //@ts-ignore
    .flatMap((out: TransferableOutput) =>
      out
        .getOutput()
        .getAddresses()
        .map((addr) => {
          return bintools.addressToString(avalanche.getHRP(), chainID, addr);
        }),
    );
  return [...new Set(outAddrs)] as string[];
}

/**
 * Returns every output address for the given transaction.
 * @param unsignedTx
 */
export function getTxOutputAddresses<
  UnsignedTx extends AVMUnsignedTx | PlatformUnsignedTx | EVMUnsignedTx,
>(unsignedTx: UnsignedTx): string[] {
  if (unsignedTx instanceof EVMUnsignedTx) {
    return [];
  }

  const tx = unsignedTx.getTransaction();
  if (tx instanceof AVMBaseTx) {
    const outAddrs = getOutputAddresses(tx);
    return outAddrs;
  } else if (tx instanceof PlatformBaseTx) {
    const stakeAddrs = getStakeOutAddresses(tx);
    const outAddrs = getOutputAddresses(tx);

    return [...new Set([...stakeAddrs, ...outAddrs])];
  }

  return [];
}
