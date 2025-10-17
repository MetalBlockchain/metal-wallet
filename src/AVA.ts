import Metal, { BinTools } from "@metalblockchain/metaljs";
import type {
  KeyChain as AVMKeyChain,
  AVMAPI,
} from "@metalblockchain/metaljs/dist/apis/avm";

import type { EVMAPI } from "@metalblockchain/metaljs/dist/apis/evm";
import type { InfoAPI } from "@metalblockchain/metaljs/dist/apis/info";
import type { PlatformVMAPI } from "@metalblockchain/metaljs/dist/apis/platformvm";

// Connect to TestNet by default
// Doesn't really matter how we initialize, it will get changed by the network module later
const ip = "bootstrap.ava.network";
const port = 21000;
const protocol = "https";
const network_id = 2;
const chain_id = "X";
const bintools: BinTools = BinTools.getInstance();
const ava: Metal = new Metal(ip, port, protocol, network_id, chain_id);

const avm: AVMAPI = ava.XChain();
const cChain: EVMAPI = ava.CChain();
const pChain: PlatformVMAPI = ava.PChain();
const infoApi: InfoAPI = ava.Info();
const keyChain: AVMKeyChain = avm.keyChain();

function isValidAddress(addr: string) {
  try {
    const res = bintools.stringToAddress(addr);
    return true;
  } catch (err) {
    return false;
  }
}

export {
  ava,
  avm,
  pChain,
  cChain,
  infoApi,
  bintools,
  isValidAddress,
  keyChain,
};
