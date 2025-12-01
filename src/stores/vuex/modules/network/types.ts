import type { BN } from "@metalblockchain/metaljs";
import type { AvaNetwork } from "@/js/AvaNetwork";

export interface NetworkState {
  networks: AvaNetwork[];
  networksCustom: AvaNetwork[];
  selectedNetwork: null | AvaNetwork;
  // isConnected: boolean
  status: NetworkStatus;

  txFee: BN;
}

export type NetworkStatus = "disconnected" | "connecting" | "connected";

export interface NetworkItem {
  name: string;
  url: string;
  protocol: string;
  port: number;
  networkId: number;
  chainId: string;
}
