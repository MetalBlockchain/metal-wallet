import type { UnsignedTx as UnsignedTxX } from "@metalblockchain/metaljs/dist/apis/avm";
import type { UnsignedTx as UnsignedTxP } from "@metalblockchain/metaljs/dist/apis/platformvm";
import { getCredentialBytes } from "@/helpers/utxoSelection/getCredentialBytes";
import { bintools } from "@/AVA";

export function getTxSize(tx: UnsignedTxX | UnsignedTxP) {
  // Calculate number of credentials
  const credsSize = getCredentialBytes(tx);

  // What is to total size of the transaction
  return bintools.addChecksum(tx.toBuffer()).length + credsSize; // returns in bytes
}
