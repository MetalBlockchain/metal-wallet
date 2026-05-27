import * as bip39 from "bip39";
import { describe, expect, test } from "vitest";
import MnemonicPhrase from "@/js/wallets/MnemonicPhrase";

describe("MnemonicPhrase", () => {
  test("can encrypt and decrypt", () => {
    const NUM_ITERATION = 10_000;
    for (let i = 0; i < NUM_ITERATION; i++) {
      const phraseRaw = bip39.generateMnemonic(256);
      const phrase = new MnemonicPhrase(phraseRaw);
      expect(phrase.getValue()).toEqual(phraseRaw);
    }
  }, 15_000);
});
