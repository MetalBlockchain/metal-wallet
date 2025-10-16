import type AvaAsset from "@/js/AvaAsset";
import type { BN } from "@metalblockchain/metaljs";

export interface ITransaction {
  uuid: string;
  asset: AvaAsset;
  amount: BN;
}

export interface ICurrencyInputDropdownValue {
  asset: AvaAsset | null;
  amount: BN;
}
