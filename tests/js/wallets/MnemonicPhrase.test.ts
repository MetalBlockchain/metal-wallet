import MnemonicPhrase from "@/js/wallets/MnemonicPhrase";
import { describe, expect, test } from "vitest";
import * as bip39 from "bip39";

describe("MnemonicPhrase", () => {
  test("can encrypt and decrypt", () => {
    const NUM_ITERATION = 10000;
    for (let i = 0; i < NUM_ITERATION; i++) {
      const phraseRaw = bip39.generateMnemonic(256);
      const phrase = new MnemonicPhrase(phraseRaw);
      expect(phrase.getValue()).toEqual(phraseRaw);
    }
  });
});
