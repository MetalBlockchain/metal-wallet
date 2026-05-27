import type { TransactionType } from "@/js/Glacier/models";
import { isTransactionC, isTransactionX } from "@/js/Glacier/models";
/**
 * Return Javascript UNIX timestamp of the given transaction
 * @param tx
 */
export function getTxTimestamp(tx: TransactionType) {
  return isTransactionX(tx) || isTransactionC(tx) ? tx.timestamp * 1000 : tx.blockTimestamp * 1000;
}
