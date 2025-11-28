import type { PChainTransaction } from "@metalblockchain/glacier-sdk";
import type {
  CChainTransaction,
  TransactionType,
  XChainTransaction,
} from "@/js/Glacier/models";
import { SortOrder } from "@metalblockchain/glacier-sdk";

export function sortGlacierTxs(
  txs: TransactionType[],
  sortOrder: SortOrder = SortOrder.DESC,
) {
  return txs.sort((a, b) => {
    const timeA =
      (a as XChainTransaction | CChainTransaction).timestamp ||
      (a as PChainTransaction).blockTimestamp ||
      0;

    const timeB =
      (b as XChainTransaction | CChainTransaction).timestamp ||
      (b as PChainTransaction).blockTimestamp ||
      0;

    const orderVal = timeB - timeA;

    const multiplier = sortOrder === SortOrder.DESC ? 1 : -1;
    return orderVal * multiplier;
  });
}
