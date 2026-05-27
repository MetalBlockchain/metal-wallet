<template>
  <div class="cols">
    <div class="form">
      <slot></slot>
      <div class="table_title">
        <p>{{ $t("transfer.tx_list.amount") }}</p>
        <p>{{ $t("transfer.tx_list.token") }}</p>
      </div>
      <div class="list_item">
        <EVMInputDropdown
          ref="token_in"
          :disabled="isConfirm"
          :gas-limit="gasLimit"
          :gas-price="gasPrice"
          @amount-change="onAmountChange"
          @collectible-change="onCollectibleChange"
          @token-change="onTokenChange"
        ></EVMInputDropdown>
      </div>
    </div>
    <div class="right_col">
      <div class="to_address">
        <h4>{{ $t("transfer.to") }}</h4>
        <qr-input
          v-model="addressIn"
          class="qrIn"
          :disabled="isConfirm"
          placeholder="xxx"
        ></qr-input>
      </div>
      <div class="gas_cont">
        <div>
          <h4>
            {{ $t("transfer.c_chain.gasPrice") }}
            <br />
            <small>Adjusted automatically according to network load.</small>
          </h4>
          <p></p>
          <input
            v-model="gasPriceNumber"
            disabled
            inputmode="numeric"
            min="0"
            type="number"
          />
        </div>
        <div>
          <h4>{{ $t("transfer.c_chain.gasLimit") }}</h4>

          <p v-if="!isConfirm" style="font-size: 13px">
            Gas Limit will be automatically calculated after you click Confirm.
          </p>
          <p v-else class="confirm_data">{{ gasLimit }}</p>
        </div>
      </div>

      <div v-if="isConfirm" class="fees">
        <p>
          {{ $t("transfer.fee_tx") }}
          <span>{{ maxFeeText }} METAL</span>
        </p>
        <p>
          <span>${{ maxFeeUSD.toLocaleString(2) }} USD</span>
        </p>
      </div>
      <template v-if="!isSuccess">
        <p class="err">{{ err }}</p>
        <v-btn
          v-if="!isConfirm"
          block
          class="button_primary checkout"
          depressed
          :disabled="!canConfirm"
          @click="confirm"
        >
          {{ $t("transfer.c_chain.confirm") }}
        </v-btn>
        <template v-else>
          <v-btn
            block
            class="button_primary checkout"
            depressed
            :loading="isLoading"
            @click="submit"
          >
            {{ $t("transfer.send") }}
          </v-btn>
          <v-btn
            block
            class="checkout"
            small
            style="color: var(--primary-color)"
            text
            @click="cancel"
          >
            {{ $t("transfer.c_chain.cancel") }}
          </v-btn>
        </template>
      </template>
      <template v-else>
        <p style="color: var(--success)">
          <fa icon="check-circle"></fa>
          {{ $t("transfer.c_chain.success.desc") }}
        </p>
        <div>
          <label>{{ $t("transfer.c_chain.success.label1") }}</label>
          <p class="confirm_data" style="word-break: break-all">
            {{ txHash }}
          </p>
        </div>
        <v-btn
          block
          class="button_primary"
          :disabled="!canSendAgain"
          small
          style="margin: 14px 0"
          @click="startAgain"
        >
          {{ $t("transfer.c_chain.reset") }}
        </v-btn>
      </template>
    </div>
  </div>
</template>
<script lang="ts">
import type { iErc721SelectInput } from "@/components/misc/EVMInputDropdown/types";
import type Erc20Token from "@/js/Erc20Token";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type Big from "big.js";
import {
  bnToAvaxC,
  bnToBigAvaxC,
  bnToBigAvaxX,
  GasHelper,
  TxHelper,
} from "@metalblockchain/metal-wallet-sdk";
import { BN } from "@metalblockchain/metaljs";
import { mapActions, mapState } from "pinia";
import { defineComponent } from "vue";
import EVMInputDropdown from "@/components/misc/EVMInputDropdown/EVMInputDropdown.vue";
import QrInput from "@/components/shared/QrInput.vue";
import { bnToBig } from "@/helpers/helper";
import { WalletHelper } from "@/helpers/wallet_helper";
import { web3 } from "@/misc/evm";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useErc721Store } from "@/stores/pinia/erc721";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import { useRootStore } from "@/stores/pinia/root";

export const FormC = defineComponent({
  components: {
    EVMInputDropdown,
    QrInput,
  },
  data(): {
    isConfirm: boolean;
    isSuccess: boolean;
    addressIn: string;
    amountIn: BN;
    gasPrice: BN;
    gasPriceInterval: ReturnType<typeof setTimeout> | undefined;
    gasLimit: number;
    err: string;
    isLoading: boolean;
    formAddress: string;
    formAmount: BN;
    formToken: Erc20Token | "native";
    canSendAgain: boolean;
    isCollectible: boolean;
    formCollectible: iErc721SelectInput | null;
    txHash: string;
  } {
    const formCollectible: iErc721SelectInput | null = null;
    const formToken: Erc20Token | "native" = "native";
    const gasPriceInterval: ReturnType<typeof setTimeout> | undefined =
      undefined;

    return {
      isConfirm: false,
      isSuccess: false,
      addressIn: "",
      amountIn: new BN(0),
      gasPrice: new BN(225_000_000_000),
      gasPriceInterval,
      gasLimit: 21_000,
      err: "",
      isLoading: false,
      formAddress: "",
      formAmount: new BN(0),
      formToken,
      canSendAgain: false,
      isCollectible: false,
      formCollectible,
      txHash: "",
    };
  },
  computed: {
    ...mapState(useRootStore, {
      wallet: "activeWallet",
      priceDict: "prices",
    }),
    ...mapState(useAssetsStore, ["findErc20"]),
    ...mapState(useErc721Store, {
      erc721Find: "find",
    }),
    gasPriceNumber() {
      return bnToBigAvaxX(this.gasPrice).toFixed(0);
    },
    denomination(): number {
      return this.formToken === "native"
        ? 9
        : Number.parseInt(this.formToken.data.decimals as string);
    },
    symbol(): string {
      if (this.formToken === "native") return "METAL";
      return this.formToken.data.symbol;
    },
    totalUSD(): Big | null {
      if (this.formToken !== "native") {
        return null;
      }

      const bigAmt = bnToBig(this.amountIn, 18);
      const usdPrice = this.priceDict.usd;
      const bigFee = bnToBig(this.maxFee, 18);
      const usdBig = bigAmt.add(bigFee).times(usdPrice);
      return usdBig;
    },
    maxFee(): BN {
      const res = this.gasPrice.mul(new BN(this.gasLimit));
      return res;
    },
    maxFeeUSD() {
      return bnToBigAvaxC(this.maxFee).times(this.priceDict.usd);
    },
    maxFeeText(): string {
      return bnToAvaxC(this.maxFee);
    },
    formAmountBig() {
      return bnToBig(this.formAmount, this.denomination);
    },
    canConfirm() {
      if (!this.isCollectible) {
        if (this.amountIn.isZero()) return false;
        if (this.gasLimit <= 0 && this.formToken == "native") return false;
      }

      // if (this.gasPrice <= 0) return false
      if (this.addressIn.length < 6) return false;

      return true;
    },
  },
  created() {
    // Update gas price automatically
    this.updateGasPrice();
    this.gasPriceInterval = setInterval(() => {
      if (!this.isConfirm) {
        this.updateGasPrice();
      }
    }, 15_000);
  },
  activated() {
    this.startAgain();

    const tokenAddr = this.$route.query.token;
    const tokenId = this.$route.query.tokenId;

    if (tokenAddr) {
      if (tokenAddr === "native") {
        (this.$refs.token_in as typeof EVMInputDropdown).setToken(tokenAddr);
      } else {
        const token = this.findErc20(tokenAddr as string);
        const erc721 = this.erc721Find(tokenAddr as string);
        if (token) {
          (this.$refs.token_in as typeof EVMInputDropdown).setToken(token);
        } else if (erc721 && tokenId) {
          (this.$refs.token_in as typeof EVMInputDropdown).setErc721Token(
            erc721,
            tokenId as string,
          );
        }
      }
    }
  },
  unmounted() {
    if (this.gasPriceInterval) {
      clearInterval(this.gasPriceInterval);
    }
  },
  methods: {
    ...mapActions(useAssetsStore, ["updateUTXOs"]),
    ...mapActions(useHistoryStore, ["updateTransactionHistory"]),
    ...mapActions(useNotificationsStore, {
      addNotification: "add",
    }),
    async updateGasPrice() {
      this.gasPrice = await GasHelper.getAdjustedGasPrice();
    },
    onAmountChange(val: BN) {
      this.amountIn = val;
    },
    onTokenChange(token: Erc20Token | "native") {
      this.formToken = token;
      this.isCollectible = false;
    },
    onCollectibleChange(val: iErc721SelectInput) {
      this.isCollectible = true;
      this.formCollectible = val;
    },
    validateAddress(addr: string) {
      if (addr.slice(0, 4) !== "C-0x" && addr.slice(0, 2) !== "0x") {
        return false;
      }

      return true;
    },
    validate(): boolean {
      this.err = "";

      const addr = this.addressIn;

      if (!this.validateAddress(addr)) {
        this.err =
          'Invalid C Chain address. Make sure your address begins with "0x" or "C-0x"';
        return false;
      }

      if (addr.slice(0, 2) === "C-") {
        const hexStr = addr.slice(2);
        if (!web3.utils.isAddress(hexStr)) {
          this.err = "Not a valid C chain address.";
          return false;
        }
      } else {
        if (!web3.utils.isAddress(addr)) {
          this.err = "Not a valid C chain address.";
          return false;
        }
      }

      return true;
    },
    async estimateGas() {
      if (!this.wallet) return;

      if (!this.isCollectible) {
        if (this.formToken === "native") {
          // For AVAX Transfers
          const gasLimit = await TxHelper.estimateAvaxGas(
            this.wallet.getEvmAddress(),
            this.formAddress,
            this.formAmount,
            this.gasPrice,
          );
          this.gasLimit = gasLimit;
        } else {
          // For ERC20 tokens
          const tx = (this.formToken as Erc20Token).createTransferTx(
            this.formAddress,
            this.formAmount,
          );
          const estGas = await WalletHelper.estimateTxGas(
            this.wallet as MnemonicWallet,
            tx,
          );
          this.gasLimit = estGas;
        }
      }

      // For erc721 transfers
      if (this.isCollectible && this.formCollectible) {
        const fromAddr = "0x" + this.wallet.getEvmAddress();
        const toAddr = this.formAddress;
        const tx = this.formCollectible.token.createTransferTx(
          fromAddr,
          toAddr,
          this.formCollectible.id,
        );
        const estGas = await WalletHelper.estimateTxGas(
          this.wallet as MnemonicWallet,
          tx,
        );
        this.gasLimit = estGas;
      }
    },
    confirm() {
      if (!this.wallet) return;
      if (!this.validate()) return;
      this.formAddress = this.addressIn;
      this.formAmount = this.amountIn.clone();
      this.isConfirm = true;

      this.estimateGas();
    },
    cancel() {
      this.err = "";
      this.isConfirm = false;
    },
    startAgain() {
      this.isConfirm = false;
      this.isSuccess = false;
      this.err = "";

      (this.$refs.token_in as typeof EVMInputDropdown).clear();

      this.amountIn = new BN(0);
      this.gasLimit = 21_000;
      this.addressIn = "";
    },
    async submit() {
      if (!this.wallet) return;
      this.isLoading = true;
      // convert base 9 to 18

      const gasPriceWei = this.gasPrice;
      let toAddress = this.formAddress;

      if (toAddress.slice(0, 2) === "C-") {
        toAddress = toAddress.slice(2);
      }

      try {
        if (this.isCollectible) {
          if (!this.formCollectible) throw "No collectible selected.";
          const txHash = await WalletHelper.sendErc721(
            this.wallet as MnemonicWallet,
            toAddress,
            gasPriceWei,
            this.gasLimit,
            this.formCollectible.token,
            this.formCollectible.id,
          );
          this.onSuccess(txHash);
        } else {
          if (this.formToken === "native") {
            const formAmt = this.formAmount;

            const txHash = await this.wallet.sendEth(
              toAddress,
              formAmt,
              gasPriceWei,
              this.gasLimit,
            );
            this.onSuccess(txHash);
          } else {
            const txHash = await this.wallet.sendERC20(
              toAddress,
              this.formAmount,
              gasPriceWei,
              this.gasLimit,
              this.formToken,
            );
            this.onSuccess(txHash);
          }
        }
      } catch (error) {
        this.onError(error);
      }
    },
    onSuccess(txId: string) {
      this.isLoading = false;
      this.isSuccess = true;
      this.txHash = txId;

      this.addNotification({
        title: this.$t("transfer.success_title"),
        message: this.$t("transfer.success_msg"),
        type: "success",
      });

      // Refresh UTXOs
      this.canSendAgain = false;
      setTimeout(() => {
        this.updateUTXOs();
        this.updateTransactionHistory();
        this.canSendAgain = true;
      }, 3000);
    },
    onError(err: any) {
      this.err = err;
      this.isLoading = false;

      console.error(err);

      this.addNotification({
        title: this.$t("transfer.error_title"),
        message: this.$t("transfer.error_msg"),
        type: "error",
      });
    },
  },
});
export default FormC;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

h4 {
  display: block;
  text-align: left;
  font-size: 12px;
  font-weight: bold;
  margin: 12px 0;
  color: var(--tertiary-color);
}

.cols {
  display: grid;
  grid-template-columns: 1fr 1fr 300px;
  column-gap: 45px;
  padding: 0;
}

.form {
  padding-right: 60px;
  grid-column: 1/3;
  border-right: 1px solid var(--bg-light);
}

.list_item {
  margin-bottom: 12px;
}
.table_title {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 0;
  p {
    font-size: 14px;
    font-weight: bold;
    color: var(--tertiary-color);
    padding: 12px 0;
  }
}

input,
.confirm_data {
  background-color: var(--bg-light);
  padding: 6px 12px;
  color: var(--primary-color);
  font-size: 14px;
}
.gas_cont {
  column-gap: 14px;
  input {
    width: 100%;
  }
}

label {
  color: var(--primary-color-light);
  font-size: 12px;
  font-weight: bold;
  margin: 2px 0 !important;
}

.fees {
  display: flex;
  flex-direction: column;
  margin-top: 14px;
  border-top: 1px solid var(--bg-light);
  padding-top: 14px;
  color: var(--tertiary-color);
}
.fees p {
  text-align: left;
  font-size: 13px;
  color: var(--primary-color-light);
}

.fees span {
  float: right;
}
.to_address {
}

.checkout {
  margin-top: 14px;
}

.right_col {
  padding-bottom: 30px;
}

@include mixins.medium-device {
  .cols {
    grid-template-columns: 1fr 1fr 220px;
    column-gap: 25px;
  }
}

@include mixins.mobile-device {
  .cols {
    display: block;
  }
  .form {
    padding-bottom: 14px;
    border: none;
    padding-right: 0;
  }
  .gas_cont {
    display: block;

    > div {
      margin-bottom: 14px;
      display: flex;
      flex-direction: column;
    }
  }
}
</style>
