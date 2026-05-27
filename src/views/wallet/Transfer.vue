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
            <TxList
              ref="txList"
              class="tx_list"
              :disabled="isConfirm"
              @change="updateTxList"
            ></TxList>
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
<script lang="ts" setup>
import type { ITransaction } from "@/components/wallet/transfer/types";
import type { ChainIdType } from "@/constants";
import type { IssueBatchTxInput } from "@/stores/types";
import type { UTXO } from "@metalblockchain/metaljs/dist/apis/avm";
import { BN, Buffer } from "@metalblockchain/metaljs";
import * as bip39 from "bip39";
import { useI18n } from "vue-i18n";
import QrInput from "@/components/shared/QrInput.vue";
import { TxState } from "@/components/wallet/earn/ChainTransfer/types";
import ChainInput from "@/components/wallet/transfer/ChainInput.vue";
import FormC from "@/components/wallet/transfer/FormC.vue";
import NftList from "@/components/wallet/transfer/NftList.vue";
import TxList from "@/components/wallet/transfer/TxList.vue";
import { bnToBig } from "@/helpers/helper";
import { ava, avm, isValidAddress } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useHistoryStore } from "@/stores/pinia/history";
import { useNetworkStore } from "@/stores/pinia/networks";
import { useNotificationsStore } from "@/stores/pinia/notifications";
import { useRootStore } from "@/stores/pinia/root";

const { t } = useI18n();
const route = useRoute();

const networkStore = useNetworkStore();
const assetsStore = useAssetsStore();
const rootStore = useRootStore();
const historyStore = useHistoryStore();
const notificationsStore = useNotificationsStore();

const nftList = useTemplateRef("nftList");
const txList = useTemplateRef("txList");

const formType = ref<ChainIdType>("X");
const isAjax = ref(false);
const addressIn = ref("");
const memo = ref("");
const orders = ref<ITransaction[]>([]);
const nftOrders = ref<UTXO[]>([]);
const formErrors = ref<string[]>([]);
const err = ref("");
const formAddress = ref("");
const formOrders = ref<ITransaction[]>([]);
const formNftOrders = ref<UTXO[]>([]);
const formMemo = ref("");
const isConfirm = ref(false);
const isSuccess = ref(false);
const txId = ref("");
const canSendAgain = ref(false);
const txState = ref<TxState | null>(null);

const avaxAsset = computed(() => assetsStore.AssetAVA);

const wallet = computed(() => rootStore.activeWallet);

const txFee = computed(() => {
  const fee = avm.getTxFee();
  return bnToBig(fee, 9);
});

const priceDict = computed(() => rootStore.prices);

const nftUTXOs = computed(() => assetsStore.nftUTXOs);

const totalTxSize = computed(() => {
  let res = new BN(0);
  for (let i = 0; i < orders.value.length; i++) {
    const order = orders.value[i];
    if (order && order.amount) {
      res = res.add(order.amount);
    }
  }
  return res;
});

const avaxTxSize = computed(() => {
  let res = new BN(0);
  for (let i = 0; i < orders.value.length; i++) {
    const order = orders.value[i];
    if (!order || !order.asset) continue;
    if (order.amount && order.asset.id === avaxAsset.value?.id) {
      res = res.add(order.amount);
    }
  }

  return res;
});

const totalUSD = computed(() => {
  const totalAsset = avaxTxSize.value.add(avm.getTxFee());
  const bigAmt = bnToBig(totalAsset, 9);
  const usdPrice = priceDict.value.usd;
  const usdBig = bigAmt.times(usdPrice);
  return usdBig;
});

const networkStatus = computed(() => networkStore.status);

const hasNFT = computed(() => assetsStore.nftUTXOs.length > 0);

const canSend = computed(() => {
  if (!addressIn.value) return false;

  if (
    orders.value.length > 0 &&
    totalTxSize.value.eq(new BN(0)) &&
    nftOrders.value.length === 0
  ) {
    return false;
  }

  if (orders.value.length === 0 && nftOrders.value.length === 0) return false;

  return true;
});

onActivated(() => {
  clearForm();

  if (route.query.chain) {
    const chain = route.query.chain as string;
    formType.value = chain === "X" ? "X" : "C";
  }

  if (route.query.nft) {
    const utxoId = route.query.nft as string;
    const target = nftUTXOs.value.find((el) => {
      return el.getUTXOID() === utxoId;
    });

    if (target) {
      nftList.value?.addNft(target as UTXO);
    }
  }
});

onDeactivated(() => {
  startAgain();
});

function confirm() {
  const isValid = formCheck();
  if (!isValid) return;

  formOrders.value = [...orders.value];
  formNftOrders.value = [...nftOrders.value];
  formAddress.value = addressIn.value;
  formMemo.value = memo.value;

  isConfirm.value = true;
}

function cancelConfirm() {
  err.value = "";
  formMemo.value = "";
  formOrders.value = [];
  formNftOrders.value = [];
  formAddress.value = "";
  isConfirm.value = false;
}

function updateTxList(data: ITransaction[]) {
  orders.value = data;
}

function updateNftList(val: UTXO[]) {
  nftOrders.value = val;
}

function formCheck() {
  formErrors.value = [];
  const err = [];

  const addr = addressIn.value;

  const chain = addr.split("-");

  if (chain[0] !== "X") {
    err.push("Invalid address. You can only send to other X addresses.");
  }

  if (!isValidAddress(addr)) {
    err.push("Invalid address.");
  }

  const memoValue = memo.value;
  if (memoValue) {
    const buff = Buffer.from(memoValue);
    const size = buff.length;
    if (size > 256) {
      err.push("You can have a maximum of 256 characters in your memo.");
    }

    // Make sure memo isnt mnemonic
    const isMnemonic = bip39.validateMnemonic(memoValue);
    if (isMnemonic) {
      err.push("You should not put a mnemonic phrase into the Memo field.");
    }
  }

  // Make sure to address matches the bech32 network hrp
  const hrp = ava.getHRP();
  if (!addr.includes(hrp)) {
    err.push("Not a valid address for this network.");
  }

  formErrors.value = err;
  return err.length === 0 ? true : false;
}
function startAgain() {
  clearForm();

  txId.value = "";
  isSuccess.value = false;
  cancelConfirm();

  orders.value = [];
  nftOrders.value = [];
  formOrders.value = [];
  formNftOrders.value = [];
}

function clearForm() {
  addressIn.value = "";
  memo.value = "";

  // Clear transactions list
  if (txList.value) {
    txList.value.reset();
  }

  // Clear NFT list
  if (hasNFT.value && nftList.value) {
    nftList.value.clear();
  }
}
async function onsuccess(_: string) {
  isAjax.value = false;
  isSuccess.value = true;

  notificationsStore.add({
    title: t("transfer.success_title"),
    message: t("transfer.success_msg"),
    type: "success",
  });

  // Update the user's balance
  assetsStore.updateUTXOs().then(() => {
    updateSendAgainLock();
  });
  historyStore.updateTransactionHistory();
}
function updateSendAgainLock() {
  if (wallet.value?.isFetchUtxos) {
    setTimeout(() => {
      updateSendAgainLock();
    }, 1000);
  } else {
    canSendAgain.value = true;
  }
}
function onerror(e: any) {
  err.value = e;
  isAjax.value = false;
  notificationsStore.add({
    title: t("transfer.error_title"),
    message: t("transfer.error_msg"),
    type: "error",
  });
}

function submit() {
  isAjax.value = true;
  err.value = "";

  const sumArray: (ITransaction | UTXO)[] = [
    ...formOrders.value,
    ...formNftOrders.value,
  ] as (ITransaction | UTXO)[];

  const txList: IssueBatchTxInput = {
    toAddress: formAddress.value,
    memo: Buffer.from(formMemo.value),
    orders: sumArray,
  };

  rootStore
    .issueBatchTx(txList)
    .then((res) => {
      canSendAgain.value = false;
      waitTxConfirm(res);
      txId.value = res;
    })
    .catch((error) => {
      onerror(error);
    });
}
async function waitTxConfirm(txId: string) {
  const status = await avm.getTxStatus(txId);
  if (status === "Unknown" || status === "Processing") {
    // if not confirmed ask again
    setTimeout(() => {
      waitTxConfirm(txId);
    }, 500);
    return false;
  } else if (status === "Dropped") {
    // If dropped stop the process
    txState.value = TxState.failed;
    return false;
  } else {
    // If success display success page
    txState.value = TxState.success;
    onsuccess(txId);
  }
}
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
