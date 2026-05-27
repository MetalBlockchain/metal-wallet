import type { Tx as AVMTx } from "@metalblockchain/metaljs/dist/apis/avm/tx";
import type { Tx as EVMTx } from "@metalblockchain/metaljs/dist/apis/evm/tx";
import type { Tx as PlatformTx } from "@metalblockchain/metaljs/dist/apis/platformvm/tx";
import { xChain } from "@metalblockchain/metal-wallet-sdk";
import { bintools, cChain, pChain } from "@/misc/AVA";

export async function issueX(tx: AVMTx) {
  return xChain.issueTx(
    "0x" + bintools.addChecksum(tx.toBuffer()).toString("hex"),
  );
}

export async function issueP(tx: PlatformTx) {
  return pChain.issueTx(
    "0x" + bintools.addChecksum(tx.toBuffer()).toString("hex"),
  );
}

export async function issueC(tx: EVMTx) {
  return cChain.issueTx(
    "0x" + bintools.addChecksum(tx.toBuffer()).toString("hex"),
  );
}
