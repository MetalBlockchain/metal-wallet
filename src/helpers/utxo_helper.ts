import type { BN } from "@metalblockchain/metaljs";
import type { UTXOSet as AVMUTXOSet } from "@metalblockchain/metaljs/dist/apis/avm/utxos";
import type { UTXOSet as PlatformUTXOSet } from "@metalblockchain/metaljs/dist/apis/platformvm/utxos";
import { avm, pChain } from "@/misc/AVA";

export async function getStakeForAddresses(addrs: string[]): Promise<BN> {
  if (addrs.length <= 256) {
    const stakeData = await pChain.getStake(addrs);
    return stakeData.staked;
  } else {
    //Break the list in to 1024 chunks
    const chunk = addrs.slice(0, 256);
    const remainingChunk = addrs.slice(256);

    const stakeData = await pChain.getStake(chunk);
    const chunkStake = stakeData.staked;
    return chunkStake.add(await getStakeForAddresses(remainingChunk));
  }
}

export async function avmGetAllUTXOs(addrs: string[]): Promise<AVMUTXOSet> {
  if (addrs.length <= 1024) {
    const utxos = await avmGetAllUTXOsForAddresses(addrs);
    return utxos;
  } else {
    //Break the list in to 1024 chunks
    const chunk = addrs.slice(0, 1024);
    const remainingChunk = addrs.slice(1024);

    const newSet = await avmGetAllUTXOsForAddresses(chunk);
    return newSet.merge(await avmGetAllUTXOs(remainingChunk));
  }
}

export async function avmGetAllUTXOsForAddresses(
  addrs: string[],
  endIndex: any = undefined,
): Promise<AVMUTXOSet> {
  if (addrs.length > 1024)
    throw new Error("Maximum length of addresses is 1024");
  const response = await (endIndex
    ? avm.getUTXOs(addrs, undefined, 0, endIndex)
    : avm.getUTXOs(addrs));

  const utxoSet = response.utxos;
  const nextEndIndex = response.endIndex;
  const len = response.numFetched;

  if (len >= 1024) {
    const subUtxos = await avmGetAllUTXOsForAddresses(addrs, nextEndIndex);
    return utxoSet.merge(subUtxos);
  }
  return utxoSet;
}

// helper method to get utxos for more than 1024 addresses
export async function platformGetAllUTXOs(
  addrs: string[],
): Promise<PlatformUTXOSet> {
  if (addrs.length <= 1024) {
    const newSet = await platformGetAllUTXOsForAddresses(addrs);
    return newSet;
  } else {
    //Break the list in to 1024 chunks
    const chunk = addrs.slice(0, 1024);
    const remainingChunk = addrs.slice(1024);

    const newSet = await platformGetAllUTXOsForAddresses(chunk);

    return newSet.merge(await platformGetAllUTXOs(remainingChunk));
  }
}

export async function platformGetAllUTXOsForAddresses(
  addrs: string[],
  endIndex: any = undefined,
): Promise<PlatformUTXOSet> {
  const response = await (endIndex
    ? pChain.getUTXOs(addrs, undefined, 0, endIndex)
    : pChain.getUTXOs(addrs));

  const utxoSet = response.utxos;
  const nextEndIndex = response.endIndex;
  const len = response.numFetched;

  if (len >= 1024) {
    const subUtxos = await platformGetAllUTXOsForAddresses(addrs, nextEndIndex);
    return utxoSet.merge(subUtxos);
  }

  return utxoSet;
}
