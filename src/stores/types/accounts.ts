import type { iUserAccountEncrypted } from "@/stores/types";

export interface AccountsState {
  accounts: iUserAccountEncrypted[];
  accountIndex: null | number;
}

export interface ChangePasswordInput {
  passNew: string;
  passOld: string;
}
