import type { iUserAccountEncrypted } from "@/stores/vuex/types";

export interface AccountsState {
  accounts: iUserAccountEncrypted[];
  accountIndex: null | number;
}

export interface ChangePasswordInput {
  passNew: string;
  passOld: string;
}
