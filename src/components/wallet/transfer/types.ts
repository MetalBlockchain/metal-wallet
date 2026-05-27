import type { BN } from "@metalblockchain/metaljs";
import type AvaAsset from "@/js/AvaAsset";

export interface ITransaction {
  uuid: string;
  asset: AvaAsset;
  amount: BN;
}

export interface ICurrencyInputDropdownValue {
  asset: AvaAsset | null;
  amount: BN;
}
