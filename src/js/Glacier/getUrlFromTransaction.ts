import type { TransactionType } from "@/js/Glacier/models";
import { getTxURL } from "@/js/Glacier/getTxURL";
import { isTransactionP, isTransactionX } from "@/js/Glacier/models";
import { isMainnetNetworkID } from "@/stores/utils/isMainnetNetworkID";
import { isTestnetNetworkID } from "@/stores/utils/isTestnetNetworkID";

/**
 * Given a glacier transaction, returns its URL on the explorer.
 * @param netID The network ID transaction is made on
 * @param transaction Transaction data from glacier
 */
export function getUrlFromTransaction(
  netID: number,
  transaction: TransactionType,
) {
  const isMainnet = isMainnetNetworkID(netID);
  const isFuji = isTestnetNetworkID(netID);

  if (!isMainnet && !isFuji) return null;

  const isX = isTransactionX(transaction);
  const isP = isTransactionP(transaction);

  const chainId = isX ? "X" : isP ? "P" : "C";
  return getTxURL(transaction.txHash, chainId, isMainnet);
}
