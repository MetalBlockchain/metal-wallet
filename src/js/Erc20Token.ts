import type { TokenListToken } from "@/stores/types/assets";
import { BN } from "@metalblockchain/metaljs";
import ERC20Abi from "@openzeppelin/contracts/build/contracts/ERC20.json";
import Big from "big.js";
import { bnToBig } from "@/helpers/helper";
import { web3 } from "@/misc/evm";

class Erc20Token {
  data: TokenListToken;
  contract: any;
  balanceRaw: string;
  balanceBN: BN;
  balanceBig: Big;

  constructor(tokenData: TokenListToken) {
    this.data = tokenData;
    this.balanceRaw = "0";
    this.balanceBN = new BN("0");
    this.balanceBig = Big(0);

    const tokenInst = new web3.eth.Contract(
      ERC20Abi.abi as any,
      tokenData.address,
    );
    this.contract = tokenInst;
  }

  // Returns a new instance of the token, given only the erc20 address
  static fromAddress(address: string) {
    const _ = new web3.eth.Contract(ERC20Abi.abi as any, address);
  }

  createTransferTx(to: string, amount: BN) {
    return this.contract.methods.transfer(to, amount.toString());
  }

  async updateBalance(address: string) {
    const bal = await this.contract.methods.balanceOf("0x" + address).call();
    this.balanceRaw = bal;
    this.balanceBN = new BN(bal);
    this.balanceBig = bnToBig(
      this.balanceBN,
      Number.parseInt(this.data.decimals as string),
    );
  }
}

export default Erc20Token;
