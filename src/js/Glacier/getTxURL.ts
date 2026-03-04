import type { ChainIdType } from "@/constants";

const mainnetBase = "https://explorer.metalblockchain.org/";
const fujiBase = "https://tahoe-explorer.metalblockchain.org/";

/**
 * Get the URL for the given transaction hash on subnets.avax.network
 * @param txHash
 * @param chain
 * @param isMainnet
 */
export function getTxURL(
  txHash: string,
  chain: ChainIdType,
  isMainnet: boolean,
) {
  const base = isMainnet ? mainnetBase : fujiBase;
  const chainPath = chain.toLowerCase() + "-chain";
  return `${base}${chainPath}/tx/${txHash}`;
}
