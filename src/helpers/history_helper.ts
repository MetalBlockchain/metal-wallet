import type { WalletType } from "@/js/wallets/types";
import type { ITransactionData, UTXO } from "@/stores/types/history";
import { BN } from "@metalblockchain/metaljs";
import { AVMConstants } from "@metalblockchain/metaljs/dist/apis/avm";

// Summary item returned for each transaction
export interface BaseTxSummary {
  tokens: {
    [assetId: string]: BaseTxAssetSummary;
  };
  collectibles: BaseTxNFTSummary;
}

interface TokenSummaryResult {
  [assetID: string]: BaseTxAssetSummary;
}

export interface BaseTxNFTSummary {
  received: NFTSummaryResultDict;
  sent: NFTSummaryResultDict;
}

interface NFTSummaryResultDict {
  assets: {
    [assetID: string]: UTXO[];
  };
  addresses: string[];
}

// export interface BaseTxNFTSummary {
//     sent: UTXO[]
//     received: UTXO[]
// }

export interface BaseTxAssetSummary {
  amount: BN;
  payload: string | undefined;
  groupNum: number;
  addresses: string[];
}

// Used with tokens
function addToDict(
  assetId: string,
  amount: BN,
  dict: TokenSummaryResult,
  utxo: UTXO,
  addresses: string[],
) {
  if (dict[assetId]) {
    dict[assetId].amount = dict[assetId].amount.add(amount);

    const addrDiff = addresses.filter(
      (addr) => !dict[assetId]?.addresses.includes(addr),
    );
    dict[assetId].addresses.push(...addrDiff);
  } else {
    dict[assetId] = {
      amount,
      payload: utxo.payload,
      groupNum: utxo.groupID,
      addresses,
    };
  }
}

function getNFTsSummary(
  tx: ITransactionData,
  wallet: WalletType,
): BaseTxNFTSummary {
  const nftLoss = getLossNFT(tx, wallet);
  const nftGain = getGainNFT(tx, wallet);
  return {
    sent: nftLoss,
    received: nftGain,
  };
}

function getLossNFT(
  tx: ITransactionData,
  wallet: WalletType,
): NFTSummaryResultDict {
  const walletAddrs = wallet.getHistoryAddresses();
  const addrsStripped = new Set(walletAddrs.map((addr) => addr.split("-")[1]));

  const inputs = tx.inputs || [];
  const outputs = tx.outputs;

  const loss: NFTSummaryResultDict = {
    assets: {},
    addresses: [],
  };

  const nfts = inputs.filter((input) => {
    const type = input.output.outputType;
    if (type === AVMConstants.NFTXFEROUTPUTID) return true;
    return false;
  });

  const nftsOuts = outputs.filter((output) => {
    const type = output.outputType;
    if (type === AVMConstants.NFTXFEROUTPUTID) return true;
    return false;
  });

  for (const [i, nft] of nfts.entries()) {
    const utxo = nft?.output;
    if (utxo) {
      const owners = utxo.addresses;
      const assetID = utxo.assetID;

      const intersect = owners.filter((addr) => addrsStripped.has(addr));

      // Did we lose it?
      if (intersect.length > 0) {
        if (loss.assets[assetID]) {
          loss.assets[assetID].push(utxo);
        } else {
          loss.assets[assetID] = [utxo];
        }

        // Who did we lose it to?
        for (let n = 0; i < nftsOuts.length; n++) {
          const nftOut = nftsOuts[n];
          const doesMatch =
            nftOut &&
            nftOut.groupID === utxo.groupID &&
            nftOut.assetID === utxo.assetID;

          if (doesMatch) {
            const addrNotAdded = nftOut.addresses.filter(
              (addr) => !loss.addresses.includes(addr),
            );
            loss.addresses.push(...addrNotAdded);
            break;
          }
        }
      }
    }
  }

  return loss;
}

function getGainNFT(
  tx: ITransactionData,
  wallet: WalletType,
): NFTSummaryResultDict {
  const walletAddrs = wallet.getHistoryAddresses();
  const addrsStripped = new Set(walletAddrs.map((addr) => addr.split("-")[1]));

  const inputs = tx.inputs || [];
  const outputs = tx.outputs;

  const gain: NFTSummaryResultDict = {
    assets: {},
    addresses: [],
  };

  const nftsIns = inputs.filter((input) => {
    const type = input.output.outputType;
    if (type === AVMConstants.NFTXFEROUTPUTID) return true;
    return false;
  });

  const nftsOuts = outputs.filter((output) => {
    const type = output.outputType;
    if (type === AVMConstants.NFTXFEROUTPUTID) return true;
    return false;
  });

  for (const utxo of nftsOuts) {
    if (utxo) {
      const owners = utxo.addresses;
      const assetID = utxo.assetID;

      const intersect = owners.filter((addr) => addrsStripped.has(addr));

      // Did we gain it?
      if (intersect.length > 0) {
        if (gain.assets[assetID]) {
          gain.assets[assetID].push(utxo);
        } else {
          gain.assets[assetID] = [utxo];
        }

        // Who did we gain it from?
        for (const nftsIn of nftsIns) {
          const nftIn = nftsIn?.output;
          const doesMatch =
            nftIn &&
            nftIn.groupID === utxo.groupID &&
            nftIn.assetID === utxo.assetID;

          if (doesMatch) {
            const addrNotAdded = nftIn.addresses.filter(
              (addr) => !gain.addresses.includes(addr),
            );
            gain.addresses.push(...addrNotAdded);
          }
        }
      }
    }
  }

  return gain;
}

function getLoss(tx: ITransactionData, wallet: WalletType): TokenSummaryResult {
  const ins = tx.inputs || [];
  const outs = tx.outputs;

  const walletAddrs = wallet.getHistoryAddresses();
  const addrsStripped = new Set(walletAddrs.map((addr) => addr.split("-")[1]));

  const loss: TokenSummaryResult = {};

  if (ins) {
    for (const input of ins) {
      const utxo = input?.output;
      if (utxo) {
        const outputType = utxo.outputType;
        const isNft = outputType === AVMConstants.NFTXFEROUTPUTID;

        if (isNft) continue;

        const addrs = utxo.addresses;

        const intersect = addrs.filter((addr) => addrsStripped.has(addr));

        if (intersect.length === 0) continue;

        const assetId = utxo.assetID;
        const amount = utxo.amount;
        const amountBN = new BN(amount);

        // Get who received this asset
        const receivers: string[] = [];
        for (const utxo of outs) {
          if (utxo.assetID === assetId) {
            const outAddrs = utxo.addresses;
            // If not a wallet address and not added to receivers
            const targets = outAddrs.filter(
              (addr: string) =>
                !addrsStripped.has(addr) && !receivers.includes(addr),
            );
            receivers.push(...targets);
          }
        }

        addToDict(assetId, amountBN, loss, utxo, receivers);
      }
    }
  }

  return loss;
}

function getProfit(
  tx: ITransactionData,
  wallet: WalletType,
): TokenSummaryResult {
  const outs = tx.outputs;
  const ins = tx.inputs || [];

  const walletAddrs = wallet.getHistoryAddresses();
  const addrsStripped = new Set(walletAddrs.map((addr) => addr.split("-")[1]));

  const profit: TokenSummaryResult = {};

  if (outs) {
    for (const utxo of outs) {
      if (!utxo) continue;

      const outputType = utxo?.outputType;
      const isNft = outputType === AVMConstants.NFTXFEROUTPUTID;

      // Skip NFTs
      if (isNft) continue;

      const addrs = utxo.addresses;

      const intersect = addrs.filter((addr) => addrsStripped.has(addr));

      if (intersect.length === 0) continue;

      const assetId = utxo.assetID;
      const amount = utxo.amount;
      const amountBN = new BN(amount);

      // Get who sent this to you
      const senders: string[] = [];
      for (const input of ins) {
        const utxo = input.output;
        if (utxo.assetID === assetId) {
          const outAddrs = utxo.addresses;
          // If not a wallet address and not added to senders
          const targets = outAddrs.filter(
            (addr: string) =>
              !addrsStripped.has(addr) && !senders.includes(addr),
          );
          senders.push(...targets);
        }
      }

      addToDict(assetId, amountBN, profit, utxo, senders);
    }
  }

  return profit;
}

// Finds the absolute gains and losses for the active wallet given transaction data from the explorer
function getTransactionSummary(tx: ITransactionData, wallet: WalletType) {
  const losses = getLoss(tx, wallet);
  const profits = getProfit(tx, wallet);

  const nftSummary = getNFTsSummary(tx, wallet);

  const sum: BaseTxSummary = {
    tokens: {},
    collectibles: {
      sent: nftSummary.sent,
      received: nftSummary.received,
    },
  };

  // First the losses
  for (const assetId in losses) {
    const loss = losses[assetId];

    if (!loss) continue;

    sum.tokens[assetId] = {
      amount: loss.amount.mul(new BN(-1)),
      payload: loss.payload,
      groupNum: loss.groupNum,
      addresses: loss.addresses,
    };
  }

  for (const assetId in profits) {
    const profit = profits[assetId];

    if (!profit) continue;

    if (sum.tokens[assetId]) {
      sum.tokens[assetId].amount = sum.tokens[assetId].amount.add(
        profit.amount,
      );
    } else {
      sum.tokens[assetId] = {
        amount: profit.amount,
        payload: profit.payload,
        groupNum: profit.groupNum,
        addresses: profit.addresses,
      };
    }
  }

  return sum;
}

/**
 * Given an array of transactions from the explorer, filter out duplicate transactions
 * @param txs
 */
export function filterDuplicateTransactions(txs: ITransactionData[]) {
  const txsIds: string[] = [];
  const filtered: ITransactionData[] = [];

  for (const tx of txs) {
    if (!tx) continue;

    const txId = tx.id;

    if (txsIds.includes(txId)) {
      continue;
    } else {
      txsIds.push(txId);
      filtered.push(tx);
    }
  }
  return filtered;
}

export { getTransactionSummary };
