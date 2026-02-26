import type {
  ILedgerBlockMessage,
  LedgerModalConfig,
} from "@/stores/types/ledger";

export interface ILedgerStore {
  isBlock: boolean;
  isPrompt: boolean;
  isUpgradeRequired: boolean;
  isWalletLoading: boolean;
  messages: ILedgerBlockMessage[];
  title: string;
  info: string;
  warning: string | undefined;
}

function getDefaultState(): ILedgerStore {
  return {
    isBlock: false, // if true a modal blocks the window
    isPrompt: true, // if true will display a message asking to confirm on ledger
    isUpgradeRequired: false,
    isWalletLoading: false,
    messages: [],
    title: "title",
    info: `info'`,
    warning: undefined,
  };
}

export const useLedgerStore = defineStore("ledger", {
  state: () => getDefaultState(),
  actions: {
    openModal(input: LedgerModalConfig) {
      this.title = input.title;
      this.info = input.info;
      this.messages = input.messages;
      this.isPrompt = input.isPrompt !== false;
      this.isBlock = true;
      this.warning = input.warning;
    },
    closeModal() {
      this.messages = [];
      this.isBlock = false;
    },
    setIsUpgradeRequired(val: boolean) {
      this.isUpgradeRequired = val;
    },
    setIsWalletLoading(val: boolean) {
      this.isWalletLoading = val;
    },
  },
});
