import type { PChainUtxo, Utxo } from "@metalblockchain/glacier-sdk";
import type { UtxoType } from "@/js/Glacier/models";
import { PrimaryNetworkAssetType } from "@metalblockchain/glacier-sdk";
import { describe, expect, test } from "vitest";
import { createUtxoCsvData } from "@/js/CSV/createUtxoCsvData";

const AVAX_ID = "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z";

function createUtxoDataX(
  assetId: string,
  amount: string,
  chain: string,
  owners: string[],
  locktime: number,
  threshold: number,
): Partial<Utxo> {
  return {
    utxoId: "21AD4VanDd31ttAZZkMbr8SKL5DsQNSyfQcUFHKRq6bBHxq6tb",
    asset: {
      assetId,
      name: "Avalanche",
      symbol: "AVAX",
      denomination: 9,
      type: PrimaryNetworkAssetType.SECP256K1,
      amount,
    },
    createdOnChainId: chain,
    consumedOnChainId: "2oYMBNV4eNHyqk2fjjV5nVQLDbtmNJzq5s3qs3Lo6ftnC6FByM",
    utxoType: "transfer",
    creationTxHash: "CtgoQCfhacAgWynSJXCryeRojNGn67wo5WbBxwkz327etZu1m",
    consumingTxHash: "2b3WtmnUSKx5STbhkTxMQ2W9AR1p6Ysxnw35MM9Qug8iY5r32f",
    consumingTxTimestamp: 1_601_674_796,
    outputIndex: "1",
    timestamp: 1_601_674_139,
    locktime,
    threshold,
    addresses: owners,
  };
}

function createEmittedUtxoDataP(
  assetId: string,
  amount: string,
  chain: string,
  owners: string[],
): Partial<PChainUtxo> {
  return {
    consumingTxHash: "2AuQwY1r6LdHQnrwxQm86ZHDnkdLeh3ydb7R8DeFrPgYuVubZ1",
    addresses: owners,
    amount,
    assetId,
    utxoId: "CSmtEKBjGC5kbKVKBtC6WRFcQfMWQu2f23XepyXrAGPeosE66",
    staked: false,
    createdOnChainId: chain,
    consumedOnChainId: "11111111111111111111111111111111LpoYY",
  };
}

function createConsumedUtxoDataP(
  assetId: string,
  amount: string,
  chain: string,
  owners: string[],
): Partial<PChainUtxo> {
  return {
    txHash: "fyfrcK69orUDnrAHsub6BPWP88QyKJb7NM7jFGBAjwCoVwiVs",
    addresses: owners,
    amount,
    assetId,
    utxoId: "FKuaPbKqRPeCP3DqFccHdLsgz85GLAgCAau7mAT6sXcrGRmho",
    createdOnChainId: chain,
    consumedOnChainId: "11111111111111111111111111111111LpoYY",
  };
}

describe("createUtxoCsvData", () => {
  describe("X Chain UTXOs", () => {
    test("owned, single owner, avax", () => {
      const utxo = createUtxoDataX(
        AVAX_ID,
        "1000",
        "chain1",
        ["address1"],
        0,
        1,
      ) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address1"]);

      expect(data).toEqual({
        isOwner: true,
        amount: "1000",
        chain: "chain1",
        owners: ["address1"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });

    test("owned, multi owner, avax", () => {
      const utxo = createUtxoDataX(
        AVAX_ID,
        "1000",
        "chain1",
        ["address1", "address2"],
        0,
        1,
      ) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address1"]);

      expect(data).toEqual({
        isOwner: true,
        amount: "1000",
        chain: "chain1",
        owners: ["address1", "address2"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });

    test("not owned, multi owner, avax", () => {
      const utxo = createUtxoDataX(
        AVAX_ID,
        "1000",
        "chain1",
        ["address1", "address2"],
        0,
        1,
      ) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address3"]);

      expect(data).toEqual({
        isOwner: false,
        amount: "1000",
        chain: "chain1",
        owners: ["address1", "address2"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });
  });

  describe("P Chain emitted UTXOs", () => {
    test("owned, single owner, avax", () => {
      const utxo = createEmittedUtxoDataP(AVAX_ID, "1000", "chain1", [
        "address1",
      ]) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address1"]);

      expect(data).toEqual({
        isOwner: true,
        amount: "1000",
        chain: "chain1",
        owners: ["address1"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });

    test("owned, multi owner, avax", () => {
      const utxo = createEmittedUtxoDataP(AVAX_ID, "1000", "chain1", [
        "address1",
        "address2",
      ]) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address1"]);

      expect(data).toEqual({
        isOwner: true,
        amount: "1000",
        chain: "chain1",
        owners: ["address1", "address2"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });

    test("not owned, single owner, avax", () => {
      const utxo = createEmittedUtxoDataP(AVAX_ID, "1000", "chain1", [
        "address1",
      ]) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address2"]);

      expect(data).toEqual({
        isOwner: false,
        amount: "1000",
        chain: "chain1",
        owners: ["address1"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });
  });

  describe("P Chain consumed UTXOs", () => {
    test("owned, single owner, avax", () => {
      const utxo = createConsumedUtxoDataP(AVAX_ID, "1000", "chain1", [
        "address1",
      ]) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address1"]);

      expect(data).toEqual({
        isOwner: true,
        amount: "1000",
        chain: "chain1",
        owners: ["address1"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });

    test("owned, multi owner, avax", () => {
      const utxo = createConsumedUtxoDataP(AVAX_ID, "1000", "chain1", [
        "address1",
        "address2",
      ]) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address1"]);

      expect(data).toEqual({
        isOwner: true,
        amount: "1000",
        chain: "chain1",
        owners: ["address1", "address2"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });

    test("not owned, single owner, avax", () => {
      const utxo = createConsumedUtxoDataP(AVAX_ID, "1000", "chain1", [
        "address1",
      ]) as UtxoType;
      const data = createUtxoCsvData(utxo, ["address2"]);

      expect(data).toEqual({
        isOwner: false,
        amount: "1000",
        chain: "chain1",
        owners: ["address1"],
        locktime: 0,
        threshold: 1,
        assetID: "FvwEAhmxKfeiG8SnEvq42hc6whRyY3EFYAvebMqDNDGCgxN5Z",
      });
    });
  });
});
