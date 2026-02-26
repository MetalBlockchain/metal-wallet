<template>
  <div class="transfer_card">
    <!--        <h1>{{ $t('transfer.title') }}</h1>-->
    <div v-if="networkStatus !== 'connected'" class="disconnected">
      <p>{{ $t("transfer.disconnected") }}</p>
    </div>
    <div v-else class="card_body">
      <FormC v-show="formType === 'C'">
        <ChainInput v-model="formType" :disabled="isConfirm"></ChainInput>
      </FormC>
      <div v-show="formType === 'X'" class="new_order_Form">
        <div class="lists">
          <ChainInput v-model="formType" :disabled="isConfirm"></ChainInput>
          <div>
            <tx-list
              ref="txList"
              class="tx_list"
              :disabled="isConfirm"
              @change="updateTxList"
            ></tx-list>
            <template v-if="hasNFT">
              <NftList
                ref="nftList"
                :disabled="isConfirm"
                @change="updateNftList"
              ></NftList>
            </template>
          </div>
        </div>
        <div>
          <div class="to_address">
            <h4>{{ $t("transfer.to") }}</h4>
            <qr-input
              v-model="addressIn"
              class="qrIn hover_border"
              :disabled="isConfirm"
              placeholder="xxx"
            ></qr-input>
          </div>
          <div>
            <!--                        <template v-if="isConfirm && formMemo.length > 0">-->
            <!--                            <h4>Memo (Optional)</h4>-->
            <!--                            <p class="confirm_val">{{ formMemo }}</p>-->
            <!--                        </template>-->
            <h4 v-if="memo || !isConfirm">{{ $t("transfer.memo") }}</h4>
            <textarea
              v-if="memo || !isConfirm"
              v-model="memo"
              autocomplete="off"
              class="memo"
              :disabled="isConfirm"
              maxlength="256"
              placeholder="Memo"
            ></textarea>
          </div>
          <div class="fees">
            <p>
              {{ $t("transfer.fee_tx") }}
              <span>{{ txFee.toLocaleString(9) }} METAL</span>
            </p>
            <p>
              {{ $t("transfer.total_avax") }}
              <span>{{ totalUSD.toLocaleString(2) }} USD</span>
            </p>
          </div>
          <div class="checkout">
            <ul v-if="formErrors.length > 0" class="err_list">
              <li v-for="errItem in formErrors" :key="errItem">
                {{ errItem }}
              </li>
            </ul>
            <template v-if="!isConfirm">
              <v-btn
                block
                class="button_secondary"
                depressed
                :disabled="!canSend"
                :ripple="false"
                @click="confirm"
              >
                Confirm
              </v-btn>
            </template>
            <template v-else-if="isConfirm && !isSuccess">
              <p class="err">{{ err }}</p>
              <v-btn
                block
                class="button_secondary"
                depressed
                :disabled="!canSend"
                :loading="isAjax"
                :ripple="false"
                @click="submit"
              >
                {{ $t("transfer.send") }}
              </v-btn>
              <v-btn
                block
                small
                style="
                  margin-top: 20px !important;
                  color: var(--secondary-color);
                "
                text
                @click="cancelConfirm"
              >
                Cancel
              </v-btn>
            </template>
            <template v-else-if="isSuccess">
              <p style="color: var(--success)">
                <fa icon="check-circle"></fa>
                Transaction Sent
              </p>
              <label style="word-break: break-all">
                <b>ID:</b>
                {{ txId }}
              </label>
              <v-btn
                block
                class="button_primary"
                depressed
                :disabled="!canSendAgain"
                :ripple="false"
                style="margin-top: 14px"
                @click="startAgain"
              >
                Start Again
              </v-btn>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import type Big from "big.js";
import type { ITransaction } from "@/components/wallet/transfer/types";
import type { ChainIdType } from "@/constants";

import type AvaAsset from "@/js/AvaAsset";
import type { WalletType } from "@/js/wallets/types";
import type { IssueBatchTxInput, priceDict } from "@/stores/types";
import { BN, Buffer } from "@metalblockchain/metaljs";
import * as bip39 from "bip39";
import { defineComponent } from "vue";
import QrInput from "@/components/shared/QrInput.vue";
import { TxState } from "@/components/wallet/earn/ChainTransfer/types";
import ChainInput from "@/components/wallet/transfer/ChainInput.vue";
import FormC from "@/components/wallet/transfer/FormC.vue";
import NftList from "@/components/wallet/transfer/NftList.vue";
import TxList from "@/components/wallet/transfer/TxList.vue";
import { bnToBig } from "@/helpers/helper";
import { ava, avm, isValidAddress } from "@/misc/AVA";

export const Transfer = defineComponent({
  components: {
    TxList,
    QrInput,
    NftList,
    FormC,
    ChainInput,
  },
  data(): {
    formType: ChainIdType;
    showAdvanced: boolean;
    isAjax: boolean;
    addressIn: string;
    memo: string;
    orders: ITransaction[];
    nftOrders: UTXO[];
    formErrors: string[];
    err: string;
    formAddress: string;
    formOrders: ITransaction[];
    formNftOrders: UTXO[];
    formMemo: string;
    isConfirm: boolean;
    isSuccess: boolean;
    txId: string;
    canSendAgain: boolean;
    txState: TxState | null;
  } {
    const txState: TxState | null = null;
    const formNftOrders: UTXO[] = [];
    const formOrders: ITransaction[] = [];
    const formErrors: string[] = [];
    const nftOrders: UTXO[] = [];
    const orders: ITransaction[] = [];
    const formType: ChainIdType = "X";

    return {
      formType,
      showAdvanced: false,
      isAjax: false,
      addressIn: "",
      memo: "",
      orders,
      nftOrders,
      formErrors,
      err: "",
      formAddress: "",
      formOrders,
      formNftOrders,
      formMemo: "",
      isConfirm: false,
      isSuccess: false,
      txId: "",
      canSendAgain: false,
      txState,
    };
  },
  computed: {
    networkStatus(): string {
      const stat = this.$store.state.Network.status;
      return stat;
    },
    hasNFT(): boolean {
      // return this.$store.getters.walletNftUTXOs.length > 0
      return this.$store.state.Assets.nftUTXOs.length > 0;
    },
    faucetLink() {
      const link = import.meta.env.VITE_APP_FAUCET_LINK;
      if (link) return link;
      return null;
    },
    canSend() {
      if (!this.addressIn) return false;

      if (
        this.orders.length > 0 &&
        this.totalTxSize.eq(new BN(0)) &&
        this.nftOrders.length === 0
      ) {
        return false;
      }

      if (this.orders.length === 0 && this.nftOrders.length === 0) return false;

      return true;
    },
    totalTxSize() {
      let res = new BN(0);
      for (let i = 0; i < this.orders.length; i++) {
        const order = this.orders[i];
        if (order && order.amount) {
          res = res.add(order.amount);
        }
      }

      return res;
    },
    avaxTxSize() {
      let res = new BN(0);
      for (let i = 0; i < this.orders.length; i++) {
        const order = this.orders[i];
        if (!order || !order.asset) continue;
        if (order.amount && order.asset.id === this.avaxAsset.id) {
          res = res.add(order.amount);
        }
      }

      return res;
    },
    avaxAsset(): AvaAsset {
      return this.$store.getters["Assets/AssetAVA"];
    },
    wallet(): WalletType {
      return this.$store.state.activeWallet;
    },
    txFee(): Big {
      const fee = avm.getTxFee();
      return bnToBig(fee, 9);
    },
    totalUSD(): Big {
      const totalAsset = this.avaxTxSize.add(avm.getTxFee());
      const bigAmt = bnToBig(totalAsset, 9);
      const usdPrice = this.priceDict.usd;
      const usdBig = bigAmt.times(usdPrice);
      return usdBig;
    },
    addresses() {
      return this.$store.state.addresses;
    },
    priceDict(): priceDict {
      return this.$store.state.prices;
    },
    nftUTXOs(): UTXO[] {
      return this.$store.state.Assets.nftUTXOs;
    },
  },
  activated() {
    this.clearForm();

    if (this.$route.query.chain) {
      const chain = this.$route.query.chain as string;
      this.formType = chain === "X" ? "X" : "C";
    }

    if (this.$route.query.nft) {
      const utxoId = this.$route.query.nft as string;
      const target = this.nftUTXOs.find((el) => {
        return el.getUTXOID() === utxoId;
      });

      if (target) {
        (this.$refs.nftList as typeof NftList).addNft(target);
      }
    }
  },
  deactivated() {
    this.startAgain();
  },
  methods: {
    confirm() {
      const isValid = this.formCheck();
      if (!isValid) return;

      this.formOrders = [...this.orders];
      this.formNftOrders = [...this.nftOrders];
      this.formAddress = this.addressIn;
      this.formMemo = this.memo;

      this.isConfirm = true;
    },
    cancelConfirm() {
      this.err = "";
      this.formMemo = "";
      this.formOrders = [];
      this.formNftOrders = [];
      this.formAddress = "";
      this.isConfirm = false;
    },
    updateTxList(data: ITransaction[]) {
      this.orders = data;
    },
    updateNftList(val: UTXO[]) {
      this.nftOrders = val;
    },
    formCheck() {
      this.formErrors = [];
      const err = [];

      const addr = this.addressIn;

      const chain = addr.split("-");

      if (chain[0] !== "X") {
        err.push("Invalid address. You can only send to other X addresses.");
      }

      if (!isValidAddress(addr)) {
        err.push("Invalid address.");
      }

      const memo = this.memo;
      if (this.memo) {
        const buff = Buffer.from(memo);
        const size = buff.length;
        if (size > 256) {
          err.push("You can have a maximum of 256 characters in your memo.");
        }

        // Make sure memo isnt mnemonic
        const isMnemonic = bip39.validateMnemonic(memo);
        if (isMnemonic) {
          err.push("You should not put a mnemonic phrase into the Memo field.");
        }
      }

      // Make sure to address matches the bech32 network hrp
      const hrp = ava.getHRP();
      if (!addr.includes(hrp)) {
        err.push("Not a valid address for this network.");
      }

      this.formErrors = err;
      return err.length === 0 ? true : false;
    },
    startAgain() {
      this.clearForm();

      this.txId = "";
      this.isSuccess = false;
      this.cancelConfirm();

      this.orders = [];
      this.nftOrders = [];
      this.formOrders = [];
      this.formNftOrders = [];
    },
    clearForm() {
      this.addressIn = "";
      this.memo = "";

      // Clear transactions list
      if (this.$refs.txList) {
        (this.$refs.txList as typeof TxList).reset();
      }

      // Clear NFT list
      if (this.hasNFT && this.$refs.nftList) {
        (this.$refs.nftList as typeof NftList).clear();
      }
    },
    async onsuccess(_: string) {
      this.isAjax = false;
      this.isSuccess = true;

      this.$store.dispatch("Notifications/add", {
        title: this.$t("transfer.success_title"),
        message: this.$t("transfer.success_msg"),
        type: "success",
      });

      // Update the user's balance
      this.$store.dispatch("Assets/updateUTXOs").then(() => {
        this.updateSendAgainLock();
      });
      this.$store.dispatch("History/updateTransactionHistory");
    },
    updateSendAgainLock() {
      if (this.wallet.isFetchUtxos) {
        setTimeout(() => {
          this.updateSendAgainLock();
        }, 1000);
      } else {
        this.canSendAgain = true;
      }
    },
    onerror(err: any) {
      this.err = err;
      this.isAjax = false;
      this.$store.dispatch("Notifications/add", {
        title: this.$t("transfer.error_title"),
        message: this.$t("transfer.error_msg"),
        type: "error",
      });
    },
    submit() {
      this.isAjax = true;
      this.err = "";

      const sumArray: (ITransaction | UTXO)[] = [
        ...this.formOrders,
        ...this.formNftOrders,
      ] as (ITransaction | UTXO)[];

      const txList: IssueBatchTxInput = {
        toAddress: this.formAddress,
        memo: Buffer.from(this.formMemo),
        orders: sumArray,
      };

      this.$store
        .dispatch("issueBatchTx", txList)
        .then((res) => {
          this.canSendAgain = false;
          this.waitTxConfirm(res);
          this.txId = res;
        })
        .catch((error) => {
          this.onerror(error);
        });
    },
    async waitTxConfirm(txId: string) {
      const status = await avm.getTxStatus(txId);
      if (status === "Unknown" || status === "Processing") {
        // if not confirmed ask again
        setTimeout(() => {
          this.waitTxConfirm(txId);
        }, 500);
        return false;
      } else if (status === "Dropped") {
        // If dropped stop the process
        this.txState = TxState.failed;
        return false;
      } else {
        // If success display success page
        this.txState = TxState.success;
        this.onsuccess(txId);
      }
    },
  },
});
export default Transfer;
</script>

<style lang="scss">
.advanced_panel {
  .v-expansion-panel-header {
    padding: 0;
    font-size: 12px;
    font-weight: normal;
    color: #2c3e50;
    min-height: auto !important;
    margin-bottom: 10px;
  }
  .v-expansion-panel-content__wrap {
    padding: 0 !important;
  }

  .v-icon {
    font-size: 12px;
  }
}
</style>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

$padLeft: 24px;
$padTop: 8px;

.disconnected {
  padding: 30px;
  text-align: center;
  background-color: var(--bg-light);
}

.explain {
  font-size: 12px;
  color: var(--primary-color-light);
}
h1 {
  font-weight: normal;
}
h4 {
  display: block;
  text-align: left;
  font-size: 12px;
  font-weight: bold;
  margin: 12px 0;
  color: var(--tertiary-color);
}

.send_to {
  display: flex;
  margin-bottom: 10px;
}

.addressIn > input {
  color: var(--bg) !important;
  padding: 5px 6px !important;
  text-align: center;
  letter-spacing: 2px;
  font-size: 12px;
}

.addressIn > input::-webkit-input-placeholder {
  color: var(--primary-color-light) !important;
}

.addressIn .v-input__slot:before {
  display: none;
}

.readerBut {
  margin-top: 4px;
  display: flex;
  background-color: #404040;
  /*cursor: pointer;*/
}
.readerBut button {
  opacity: 0.6;
  outline: none;
  padding: 6px 12px;
  margin: 0px auto;
}
.readerBut:hover button {
  opacity: 1;
}

.memo {
  font-size: 14px;
  background-color: var(--bg-light);
  resize: none;
  width: 100%;
  height: 80px;
  border-radius: 2px;
  padding: 4px 12px;
}

.radio_buttons {
  margin-top: 15px;
}

.tx_info {
  text-align: left;
  font-size: 14px;
}

.new_order_Form {
  display: grid;
  grid-template-columns: 1fr 1fr 300px;
  column-gap: 45px;
}

.new_order_Form > div {
  /*padding: 10px 0;*/
  margin-bottom: 15px;
}
.lists {
  /*padding-right: 45px;*/
  //border-right: 1px solid var(--bg-light);
  grid-column: 1/3;

  /*> div{*/
  /*    margin: 14px 0;*/
  /*}*/
}

.tx_list {
  margin-bottom: 14px;
}

.fees {
  margin: 14px 0;
  border-top: 1px solid var(--bg-light);
  padding-top: 14px;
}

.fees p {
  text-align: left;
  font-size: 13px;
  color: var(--tertiary-color);
}

.fees span {
  font-weight: 500;
  float: right;
}

label {
  color: var(--primary-color-light);
  font-size: 12px;
  font-weight: bold;
  margin: 2px 0 !important;
}

.faucet {
  margin-top: 20px;
}

.advanced {
  padding: 20px 0px !important;
  margin-bottom: 20px;
}

.advanced .advancedBody {
  transition-duration: 0.2s;
}

.err_list {
  font-size: 12px;
  color: var(--error);
  margin: 6px 0;
}

.checkout {
  margin-top: 14px;
}

.confirm_val {
  background-color: var(--bg-light);
  word-break: break-all;
  padding: 8px 16px;
}

//@media only screen and (max-width: 600px) {
//    .order_form {
//        display: block;
//    }
//    .asset_select button {
//        flex-grow: 1;
//        word-break: break-word;
//    }
//}

@include mixins.medium-device {
  .new_order_Form {
    grid-template-columns: 1fr 1fr 220px;
    column-gap: 25px;
  }
}

@include mixins.mobile-device {
  .transfer_card {
    display: block;
    grid-template-columns: none;
  }

  .but_primary {
    width: 100%;
  }

  .new_order_Form {
    display: block;
    grid-template-columns: none;
  }

  .tx_list {
    padding: 0;
    border: none;
  }

  .lists {
    border: none;
  }
}
</style>
