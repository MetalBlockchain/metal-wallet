import type { UtxoCsvRow } from "@/js/CSV/models";
import type { TransactionType, TransactionTypeName } from "@/js/Glacier/models";
import { createUtxoCsvData } from "@/js/CSV/createUtxoCsvData";
import { getTxTimestamp } from "@/js/Glacier/getTxTimestamp";
import {
  isCChainExportTransaction,
  isTransactionP,
  isTransactionX,
} from "@/js/Glacier/models";

// eslint-disable-next-line unicorn/prefer-set-has
const SUPPORTED_TYPE: TransactionTypeName[] = [
  "BaseTx",
  "ExportTx",
  "ImportTx",
  "OperationTx",
];

/**
 * Create CSV file contents of UTXO movements based on given transactions.
 * Does not include staking transactions.
 * @param txs
 * @param ownedAddresses
 */
export async function createUtxoCSV(
  txs: TransactionType[],
  ownedAddresses: string[],
  evmAddress: string,
) {
  const filtered = txs.filter((tx) => SUPPORTED_TYPE.includes(tx.txType));

  return filtered.flatMap((tx) => {
    const txRows: UtxoCsvRow[] = [];

    const unixTime = getTxTimestamp(tx);
    const date = new Date(unixTime);

    const shared = {
      txID: tx.txHash,
      txType: tx.txType,
      timeStamp: date,
      unixTime: unixTime.toString(),
    };

    if (isTransactionX(tx)) {
      for (const utxo of tx.consumedUtxos) {
        txRows.push({
          ...shared,
          ...createUtxoCsvData(utxo, ownedAddresses),
          isInput: true,
        });
      }

      for (const utxo of tx.emittedUtxos) {
        txRows.push({
          ...shared,
          ...createUtxoCsvData(utxo, ownedAddresses),
          isInput: false,
        });
      }
    } else if (isTransactionP(tx)) {
      for (const utxo of tx.consumedUtxos || []) {
        txRows.push({
          ...shared,
          ...createUtxoCsvData(utxo, ownedAddresses),
          isInput: true,
        });
      }
      for (const utxo of tx.emittedUtxos || []) {
        txRows.push({
          ...shared,
          ...createUtxoCsvData(utxo, ownedAddresses),
          isInput: false,
        });
      }
    } else if (isCChainExportTransaction(tx)) {
      for (const evmIn of tx.evmInputs) {
        txRows.push({
          ...shared,
          isInput: true,
          amount: evmIn.asset.amount,
          assetID: evmIn.asset.assetId,
          chain: tx.sourceChain,
          isOwner: evmAddress === evmIn.fromAddress,
          owners: [evmIn.fromAddress],
          locktime: 0,
          threshold: 1,
        });
      }

      for (const utxo of tx.emittedUtxos) {
        txRows.push({
          ...shared,
          ...createUtxoCsvData(utxo, ownedAddresses),
          isInput: false,
        });
      }
    } else {
      for (const utxo of tx.consumedUtxos) {
        txRows.push({
          ...shared,
          ...createUtxoCsvData(utxo, ownedAddresses),
          isInput: true,
        });
      }

      for (const evmOut of tx.evmOutputs) {
        txRows.push({
          ...shared,
          isInput: true,
          amount: evmOut.asset.amount,
          assetID: evmOut.asset.assetId,
          chain: tx.destinationChain,
          isOwner: evmAddress === evmOut.toAddress,
          owners: [evmOut.toAddress],
          locktime: 0,
          threshold: 1,
        });
      }
    }

    return txRows;
  });
}
