import { Network } from "@metalblockchain/glacier-sdk";
import Glacier from "@/js/Glacier/Glacier";
import { splitToParts } from "@/js/Glacier/utils";
import { ava } from "@/misc/AVA";
import { isMainnetNetworkID } from "@/stores/vuex/modules/network/isMainnetNetworkID";
import { isTestnetNetworkID } from "@/stores/vuex/modules/network/isTestnetNetworkID";

export async function listChainsForAddresses(addrs: string[]) {
  const addressLimit = 64;
  const addrParts = splitToParts<string>(addrs, addressLimit);

  const netID = ava.getNetworkID();

  // Cannot use glacier for other networks
  if (!isMainnetNetworkID(netID) && !isTestnetNetworkID(netID)) return [];
  const network: any = isMainnetNetworkID(netID) ? Network.MAINNET : "tahoe";

  const promises = addrParts.map((addresses) => {
    return Glacier.primaryNetwork.getChainIdsForAddresses({
      addresses: addresses.join(","),
      network,
    });
  });

  const results = await Promise.all(promises);
  const flat = results.flatMap((res: any) => res.addresses);

  return flat;
}
