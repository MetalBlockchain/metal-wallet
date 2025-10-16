import { getTxURL } from "@/js/Glacier/getTxURL";
import { expect, test, describe } from "vitest";

describe("getTxURL", () => {
  test("can get mainnet url for X Chain", () => {
    const url = getTxURL("hash1", "X", true);
    expect(url).toEqual(
      "https://explorer.metalblockchain.org/x-chain/tx/hash1"
    );
  });

  test("can get mainnet url for P Chain", () => {
    const url = getTxURL("hash1", "P", true);
    expect(url).toEqual(
      "https://explorer.metalblockchain.org/p-chain/tx/hash1"
    );
  });

  test("can get mainnet url for C Chain", () => {
    const url = getTxURL("hash1", "C", true);
    expect(url).toEqual(
      "https://explorer.metalblockchain.org/c-chain/tx/hash1"
    );
  });

  test("can get testnet url for X Chain", () => {
    const url = getTxURL("hash1", "X", false);
    expect(url).toEqual(
      "https://tahoe-explorer.metalblockchain.org/x-chain/tx/hash1"
    );
  });
});
