import type {
  GetTransactionsParams,
  TransactionType,
} from "@/js/Glacier/models";
import { splitToParts } from "@/js/Glacier/utils";
import { filterDuplicateGlacierTxs } from "./filterDuplicateGlacierTxs";
import Glacier from "./Glacier";
import { sortGlacierTxs } from "./sortGlacierTxs";

/**
 *
 * @param config
 * @param limit Max number of transactions to fetch. If undefined will fetch all.
 */
export async function getTransactionsForAddresses(
  config: GetTransactionsParams,
  limit?: number,
) {
  const addressLimit = 64; // Max number of addresses glacier accepts
  const addrParts = splitToParts<string>(config.addresses, addressLimit);

  async function fetchAll(
    config: GetTransactionsParams,
    currentCount = 0,
  ): Promise<TransactionType[]> {
    const res =
      await Glacier.primaryNetworkTransactions.listLatestPrimaryNetworkTransactions(
        {
          ...config,
          addresses: config.addresses.join(","),
        },
      );
    const txs = res.transactions ?? [];
    // const res = await GlacierService.getTransactions(config)
    currentCount += txs.length;
    if (res.nextPageToken && (!limit || (limit && currentCount < limit))) {
      const next = await fetchAll(
        {
          ...config,
          pageToken: res.nextPageToken,
        },
        currentCount,
      );
      return [...txs, ...next];
    }
    return txs;
  }

  let txs: TransactionType[] = [];
  for (const addrs of addrParts) {
    if (!addrs) continue;

    const result = await fetchAll({
      ...config,
      addresses: addrs,
    });
    txs = [...txs, ...result];
    if (limit && txs.length >= limit) {
      break;
    }
  }

  // Filter duplicate transactions
  const filtered = filterDuplicateGlacierTxs(txs);

  // Sort by blocktime
  return sortGlacierTxs(filtered, config.sortOrder);
}
