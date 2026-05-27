import type { ListStakingParams } from "@/js/Glacier/models";
import type { PChainTransaction } from "@metalblockchain/glacier-sdk";
import { Network, PChainId, SortOrder } from "@metalblockchain/glacier-sdk";
import { splitToParts } from "@/js/Glacier/utils";
import { ava } from "@/misc/AVA";
import { isMainnetNetworkID } from "@/stores/utils/isMainnetNetworkID";
import { isTestnetNetworkID } from "@/stores/utils/isTestnetNetworkID";
import { filterDuplicateGlacierTxs } from "./filterDuplicateGlacierTxs";
import Glacier from "./Glacier";

export async function listStakingForAddresses(addrs: string[]) {
  if (addrs.length === 0) return [];

  const netID = ava.getNetworkID();

  const network: any = isMainnetNetworkID(netID) ? Network.MAINNET : "tahoe";

  // Cannot use glacier for other networks
  if (!isMainnetNetworkID(netID) && !isTestnetNetworkID(netID)) return [];

  const addressLimit = 64;
  const addrParts = splitToParts<string>(addrs, addressLimit);

  async function fetchAll(
    config: ListStakingParams,
  ): Promise<PChainTransaction[]> {
    // const res = await GlacierService.listStaking(config)
    const res =
      await Glacier.primaryNetworkTransactions.listActivePrimaryNetworkStakingTransactions(
        {
          ...config,
          addresses: config.addresses.join(","),
        },
      );

    if (res.nextPageToken) {
      const next = await fetchAll({
        ...config,
        pageToken: res.nextPageToken,
      });
      return [...res.transactions, ...next];
    }
    return res.transactions ?? [];
  }

  const promises = addrParts.map((addrs) => {
    return fetchAll({
      addresses: addrs,
      pageSize: 100,
      sortOrder: SortOrder.DESC,
      blockchainId: PChainId.P_CHAIN,
      network,
    });
  });

  const results = (await Promise.all(promises)).flat();

  return filterDuplicateGlacierTxs(results) as PChainTransaction[];
}
