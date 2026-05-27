import type {
  TransferableInput as TransferableInputX,
  UnsignedTx as UnsignedTxX,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  TransferableInput as TransferableInputP,
  UnsignedTx as UnsignedTxP,
} from "@metalblockchain/metaljs/dist/apis/platformvm";

/**
 * Size of serialized credentials for the given unsigned transaction in bytes.
 * @param tx
 */
export function getCredentialBytes(tx: UnsignedTxX | UnsignedTxP) {
  let credsSize = 0;
  tx.getTransaction()
    .getIns()
    // eslint-disable-next-line unicorn/no-array-for-each
    .forEach((input: TransferableInputX | TransferableInputP) => {
      const numSigs = input.getInput().getSigIdxs().length;
      // Each cred is of size 8 + 65 * sigs
      credsSize += 8 + 65 * numSigs;
    });
  return credsSize;
}
