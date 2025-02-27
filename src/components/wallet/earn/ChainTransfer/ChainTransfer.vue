<template>
    <div>
        <div class="cols">
            <div class="form">
                <ChainSwapForm
                    ref="form"
                    @change="onFormChange"
                    :is-confirm="isConfirm"
                    :balance="balanceBig"
                    :max-amt="formMaxAmt"
                ></ChainSwapForm>

                <div v-if="!isSuccess && !isLoading">
                    <div v-if="!isImportErr" class="fees">
                        <h4>{{ $t('earn.transfer.fee') }}</h4>

                        <p>
                            Export Fee
                            <span>{{ exportFee.toLocaleString() }} METAL</span>
                        </p>
                        <p>
                            Import Fee
                            <span>{{ importFee.toLocaleString() }} METAL</span>
                        </p>
                        <p>
                            <b>
                                Total
                                <span>{{ fee.toLocaleString() }} METAL</span>
                            </b>
                        </p>
                    </div>
                    <div>
                        <p class="err">{{ err }}</p>
                        <template v-if="isImportErr">
                            <p>
                                {{ $t('earn.transfer.err_desc') }}
                            </p>
                            <v-btn
                                depressed
                                class="button_secondary"
                                small
                                block
                                @click="startAgain"
                            >
                                {{ $t('earn.transfer.success.again') }}
                            </v-btn>
                        </template>
                        <template v-else>
                            <v-btn
                                v-if="!isConfirm"
                                data-cy="confirm"
                                class="button_secondary"
                                @click="confirm"
                                :disabled="!canSubmit"
                                block
                                depressed
                                :loading="isLoading"
                            >
                                {{ $t('earn.transfer.confirm') }}
                            </v-btn>
                            <template v-else>
                                <v-btn
                                    data-cy="submit"
                                    class="button_secondary"
                                    @click="submit"
                                    :loading="isLoading"
                                    depressed
                                    block
                                >
                                    {{ $t('earn.transfer.submit') }}
                                </v-btn>
                                <v-btn
                                    v-if="!isLoading"
                                    data-cy="cancel"
                                    style="color: var(--secondary-color); margin: 12px 0 !important"
                                    @click="cancelConfirm"
                                    depressed
                                    text
                                    block
                                >
                                    {{ $t('earn.transfer.cancel') }}
                                </v-btn>
                            </template>
                        </template>
                    </div>
                </div>
                <div v-if="isSuccess" class="complete">
                    <h4>{{ $t('earn.transfer.success.title') }}</h4>
                    <p style="color: var(--success); margin: 12px 0 !important">
                        <fa icon="check-circle"></fa>
                        {{ $t('earn.transfer.success.message') }}
                    </p>
                    <v-btn depressed class="button_secondary" small block @click="startAgain">
                        {{ $t('earn.transfer.success.again') }}
                    </v-btn>
                </div>
            </div>
            <div class="right_col">
                <ChainCard :chain="sourceChain"></ChainCard>
                <ChainCard :chain="targetChain" :is-source="false"></ChainCard>
                <TxStateCard
                    :state="exportState"
                    :status="exportStatus"
                    :reason="exportReason"
                    :tx-id="exportId"
                ></TxStateCard>
                <TxStateCard
                    :state="importState"
                    :status="importStatus"
                    :reason="importReason"
                    :tx-id="importId"
                    :is-export="false"
                ></TxStateCard>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Component, Vue, Watch } from 'vue-property-decorator'
import Dropdown from '@/components/misc/Dropdown.vue'
import AvaxInput from '@/components/misc/AvaxInput.vue'
import AvaAsset from '@/js/AvaAsset'
import { BN, platformvm } from '@metalblockchain/metaljs'
import { avm, cChain, pChain } from '@/AVA'
import MnemonicWallet from '@/js/wallets/MnemonicWallet'
import Spinner from '@/components/misc/Spinner.vue'
import ChainCard from '@/components/wallet/earn/ChainTransfer/ChainCard.vue'
import TxStateCard from '@/components/wallet/earn/ChainTransfer/TxState.vue'
import { ChainSwapFormData, TxState } from '@/components/wallet/earn/ChainTransfer/types'
import { ChainIdType } from '@/constants'

import ChainSwapForm from '@/components/wallet/earn/ChainTransfer/Form.vue'

import { WalletType } from '@/js/wallets/types'
import {
    ExportChainsC,
    ExportChainsP,
    ExportChainsX,
    GasHelper,
    Big,
    bnToBig,
    bnToAvaxX,
    bnToBigAvaxX,
    bnToBigAvaxC,
    bigToBN,
    avaxCtoX,
    bnToAvaxP,
    TxHelper,
} from '@metalblockchain/metal-wallet-sdk'
import { sortUTxoSetP } from '@/helpers/sortUTXOs'
import { selectMaxUtxoForExportP } from '@/helpers/utxoSelection/selectMaxUtxoForExportP'
import { FeeConfig, FeeState } from '@metalblockchain/metaljs/dist/apis/platformvm'

const IMPORT_DELAY = 5000 // in ms
const BALANCE_DELAY = 2000 // in ms

@Component({
    name: 'chain_transfer',
    components: {
        Spinner,
        Dropdown,
        AvaxInput,
        ChainCard,
        ChainSwapForm,
        TxStateCard,
    },
})
export default class ChainTransfer extends Vue {
    $refs!: {
        form: ChainSwapForm
    }
    sourceChain: ChainIdType = 'X'
    targetChain: ChainIdType = 'P'
    isLoading = false
    amt: BN = new BN(0)
    err: string = ''

    isImportErr = false
    isConfirm = false
    isSuccess = false

    formAmt: BN = new BN(0)

    baseFee: BN = new BN(0)
    importFee: Big = new Big(0)
    exportFee: Big = new Big(0)

    // Transaction ids
    exportId: string = ''
    exportState: TxState = TxState.waiting
    exportStatus: string | null = null
    exportReason: string | null = null

    importId: string = ''
    importState: TxState = TxState.waiting
    importStatus: string | null = null
    importReason: string | null = null

    txMaxAmount: BN | undefined = undefined

    feeConfig: FeeConfig | undefined = undefined
    feeState: FeeState | undefined = undefined

    @Watch('sourceChain')
    @Watch('targetChain')
    onChainChange() {
        if (this.sourceChain === 'C' || this.targetChain === 'C') {
            this.updateBaseFee()
        }
    }

    @Watch('sourceChain')
    @Watch('targetChain')
    @Watch('amt')
    onChange() {
        if (this.targetChain == 'P' && this.amt.gt(new BN(0))) {
            TxHelper.calculatePlatformImportFee().then((fee) => {
                this.importFee = bnToBig(fee, 9)
            });
        } else {
            this.importFee = this.getFee(this.targetChain, false)
        }

        if (this.sourceChain == 'P' && this.amt.gt(new BN(0))) {
            const utxos = this.wallet.getPlatformUTXOSet();
            const fromAddrs = this.wallet.getAllAddressesP();
            const destinationAddr = this.targetChain === 'C' ? this.wallet.getEvmAddressBech() : this.wallet.getCurrentAddressAvm()
            const pChangeAddr = this.wallet.getCurrentAddressPlatform()

            TxHelper.calculatePlatformExportFee(utxos, fromAddrs, destinationAddr, this.amt, pChangeAddr, this.targetChain as ExportChainsP).then((fee) => {
                this.exportFee = bnToBig(fee, 9)
            })
        } else {
            this.exportFee = this.getFee(this.sourceChain, true)
        }
    }

    created() {
        this.updateBaseFee()
        this.getFeeVariables()
    }

    get ava_asset(): AvaAsset | null {
        let ava = this.$store.getters['Assets/AssetAVA']
        return ava
    }

    get platformBalance() {
        return this.$store.getters['Assets/walletPlatformBalance']
    }

    get platformUnlocked(): BN {
        return this.platformBalance.available
    }

    get avmUnlocked(): BN {
        if (!this.ava_asset) return new BN(0)
        return this.ava_asset.amount
    }

    get evmUnlocked(): BN {
        let balRaw = this.wallet.ethBalance
        return avaxCtoX(balRaw)
    }

    get balanceBN(): BN {
        if (this.sourceChain === 'P') {
            return this.platformUnlocked
        } else if (this.sourceChain === 'C') {
            return this.evmUnlocked
        } else {
            return this.avmUnlocked
        }
    }

    get balanceBig(): Big {
        return bnToBig(this.balanceBN, 9)
    }

    get formAmtText() {
        return bnToAvaxX(this.formAmt)
    }

    get fee(): Big {
        return this.exportFee.add(this.importFee)
    }

    get feeBN(): BN {
        return this.importFeeBN.add(this.exportFeeBN)
    }

    getFee(chain: ChainIdType, isExport: boolean): Big {
        if (chain === 'X') {
            return bnToBigAvaxX(avm.getTxFee())
        } else if (chain === 'P') {
            return bnToBigAvaxX(new BN(0))
        } else {
            const fee = isExport
                ? GasHelper.estimateExportGasFeeFromMockTx(
                      this.targetChain as ExportChainsC,
                      this.amt,
                      this.wallet.getEvmAddress(),
                      this.wallet.getCurrentAddressPlatform()
                  )
                : GasHelper.estimateImportGasFeeFromMockTx(1, 1)

            const totFeeWei = this.baseFee.mul(new BN(fee))
            return bnToBigAvaxC(totFeeWei)
        }
    }

    /**
     * Returns the import fee in nAVAX
     */
    get importFeeBN(): BN {
        return bigToBN(this.importFee, 9)
    }

    get exportFeeBN(): BN {
        return bigToBN(this.exportFee, 9)
    }

    /**
     * User's spendable balance minus total fees
     */
    get maxAmt(): BN {
        let max = this.balanceBN.sub(this.feeBN)

        if (max.isNeg() || max.isZero()) {
            return new BN(0)
        } else {
            return max
        }
    }

    /**
     * Maximum amount that fits into a valid transaction (excluding export fee)
     */
    get formMaxAmt() {
        const amt = this.txMaxAmount ? BN.min(this.maxAmt, this.txMaxAmount) : this.maxAmt
        return BN.max(amt, new BN(0))
    }

    @Watch('sourceChain')
    @Watch('targetChain')
    @Watch('balanceBN')
    @Watch('feeBN')
    @Watch('wallet')
    updateMaxTxSize() {
        if (this.sourceChain !== 'P' || this.targetChain === 'P') {
            this.txMaxAmount = undefined
            return
        }

        const utxoSet = this.wallet.getPlatformUTXOSet()
        const sortedSet = sortUTxoSetP(utxoSet, false)

        const pChangeAddr = this.wallet.getCurrentAddressPlatform()
        const fromAddrs = this.wallet.getAllAddressesP()

        const destinationAddr =
            this.targetChain === 'C'
                ? this.wallet.getEvmAddressBech()
                : this.wallet.getCurrentAddressAvm()

        const res = selectMaxUtxoForExportP(sortedSet.getAllUTXOs())
        // The maximum form amount is = max possible export amount - export and import fees
        this.txMaxAmount = res.amount.sub(this.feeBN)
    }

    onFormChange(data: ChainSwapFormData) {
        this.amt = data.amount
        this.sourceChain = data.sourceChain
        this.targetChain = data.destinationChain
    }

    confirm() {
        this.formAmt = this.amt.clone()
        this.isConfirm = true
    }

    cancelConfirm() {
        this.isConfirm = false
        this.formAmt = new BN(0)
    }

    get wallet() {
        let wallet: WalletType = this.$store.state.activeWallet
        return wallet
    }

    async updateBaseFee() {
        this.baseFee = await GasHelper.getBaseFeeRecommended()
    }

    async getFeeVariables() {
        pChain.getFeeConfig().then((feeConfig) => {
            this.feeConfig = feeConfig;
        })
        pChain.getFeeState().then((feeState) => {
            this.feeState = feeState
        })
    }

    async submit() {
        this.err = ''
        this.isLoading = true
        this.isImportErr = false

        try {
            this.chainExport(this.formAmt, this.sourceChain, this.targetChain).catch((e) => {
                this.onerror(e)
            })
        } catch (err) {
            this.onerror(err)
        }
    }

    // Triggers export from chain
    // STEP 1
    async chainExport(amt: BN, sourceChain: ChainIdType, destinationChain: ChainIdType) {
        let wallet: WalletType = this.$store.state.activeWallet
        let exportTxId
        this.exportState = TxState.started

        try {
            switch (sourceChain) {
                case 'X':
                    exportTxId = await wallet.exportFromXChain(
                        amt,
                        destinationChain as ExportChainsX,
                        this.importFeeBN
                    )
                    break
                case 'P':
                    exportTxId = await wallet.exportFromPChain(
                        amt,
                        destinationChain as ExportChainsP,
                        this.importFeeBN
                    )
                    break
                case 'C':
                    exportTxId = await wallet.exportFromCChain(
                        amt,
                        destinationChain as ExportChainsC,
                        this.exportFeeBN
                    )
                    break
            }
        } catch (e) {
            throw e
        }

        this.exportId = exportTxId
        this.waitExportStatus(exportTxId)
    }

    // STEP 2
    async waitExportStatus(txId: string, remainingTries = 15) {
        let status
        if (this.sourceChain === 'X') {
            status = await avm.getTxStatus(txId)
        } else if (this.sourceChain === 'P') {
            let resp = await pChain.getTxStatus(txId)
            if (typeof resp === 'string') {
                status = resp
            } else {
                status = resp.status
                this.exportReason = resp.reason
            }
        } else {
            let resp = await cChain.getAtomicTxStatus(txId)
            status = resp
        }
        this.exportStatus = status

        if (status === 'Unknown' || status === 'Processing') {
            // If out of tries
            if (remainingTries <= 0) {
                this.exportState = TxState.failed
                this.exportStatus = 'Timeout'
                return false
            }

            // if not confirmed ask again
            setTimeout(() => {
                this.waitExportStatus(txId, remainingTries - 1)
            }, 1000)
            return false
        } else if (status === 'Dropped') {
            // If dropped stop the process
            this.exportState = TxState.failed
            return false
        } else {
            // If success start import
            this.exportState = TxState.success

            // Because the API nodes are behind a load balancer we are waiting for all api nodes to update
            this.importState = TxState.started
            this.importStatus = 'Waiting'
            setTimeout(() => {
                this.chainImport()
            }, IMPORT_DELAY)
        }

        return true
    }

    // STEP 3
    async chainImport(canRetry = true) {
        let wallet: MnemonicWallet = this.$store.state.activeWallet
        let importTxId
        try {
            if (this.targetChain === 'P') {
                importTxId = await wallet.importToPlatformChain(this.sourceChain as ExportChainsP)
            } else if (this.targetChain === 'X') {
                importTxId = await wallet.importToXChain(this.sourceChain as ExportChainsX)
            } else {
                //TODO: Import only the exported UTXO

                importTxId = await wallet.importToCChain(
                    this.sourceChain as ExportChainsC,
                    this.importFeeBN
                )
            }
        } catch (e) {
            // Retry import one more time
            if (canRetry) {
                setTimeout(() => {
                    this.chainImport(false)
                }, IMPORT_DELAY)
                return
            }
            this.onerror(e)
            this.onErrorImport(e)
            return
        }

        this.importId = importTxId
        this.importState = TxState.started

        this.waitImportStatus(importTxId)
    }

    // STEP 4
    async waitImportStatus(txId: string) {
        let status

        if (this.targetChain === 'X') {
            status = await avm.getTxStatus(txId)
        } else if (this.targetChain === 'P') {
            let resp = await pChain.getTxStatus(txId)
            if (typeof resp === 'string') {
                status = resp
            } else {
                status = resp.status
            }
        } else {
            let resp = await cChain.getAtomicTxStatus(txId)
            status = resp
        }

        this.importStatus = status

        if (status === 'Unknown' || status === 'Processing') {
            // if not confirmed ask again
            setTimeout(() => {
                this.waitImportStatus(txId)
            }, 1000)
            return false
        } else if (status === 'Dropped') {
            // If dropped stop the process
            this.importState = TxState.failed
            return false
        } else {
            // If success display success page
            this.importState = TxState.success
            this.onsuccess()
        }

        return true
    }

    onerror(err: any) {
        console.error(err)
        this.isLoading = false
        this.err = err
        this.$store.dispatch('Notifications/add', {
            type: 'error',
            title: 'Transfer Failed',
            message: err,
        })
    }

    onErrorImport(err: any) {
        this.importState = TxState.failed
        this.isImportErr = true
    }

    startAgain() {
        this.$refs.form.clear()

        this.err = ''
        this.isImportErr = false
        this.isConfirm = false
        this.isLoading = false
        this.isSuccess = false

        this.exportId = ''
        this.exportState = TxState.waiting
        this.exportStatus = null
        this.exportReason = null

        this.importId = ''
        this.importState = TxState.waiting
        this.importStatus = null
        this.importReason = null
    }

    onsuccess() {
        // Clear Form
        this.isSuccess = true
        this.$store.dispatch('Notifications/add', {
            type: 'success',
            title: 'Transfer Complete',
            message: 'Funds transferred between chains.',
        })

        setTimeout(() => {
            this.$store.dispatch('Assets/updateUTXOs')
            this.$store.dispatch('History/updateTransactionHistory')
        }, BALANCE_DELAY)
    }

    get canSubmit() {
        if (this.amt.eq(new BN(0))) {
            return false
        }

        if (this.amt.gt(this.formMaxAmt)) {
            return false
        }

        return true
    }
}
</script>
<style scoped lang="scss">
@use "../../../../main";

.cols {
    display: grid;
    grid-template-columns: max-content 1fr;
    column-gap: 5vw;
}

.right_col {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    column-gap: 14px;
    row-gap: 2px;
    padding-top: 14px;
    height: max-content;
    //height: 100%;
    > div {
        //height: max-content;
        background-color: var(--bg-light);
        border-radius: 4px;
        padding: 12px 18px;
        box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.1);
    }
}

.form {
    max-width: 100%;
    width: 360px;
    padding-bottom: 14px;
    //justify-self: center;
    > div {
        margin: 14px 0;
    }
}
.dropdown {
    background-color: var(--bg-light);
}

.chain {
    font-size: 32px;
    text-align: center;
    justify-content: center;
}
.chains {
    position: relative;
    //text-align: center;
    display: grid;
    grid-template-rows: max-content max-content;
    row-gap: 14px;
    //margin: 0 !important;
    //column-gap: 4px;
    //grid-template-columns: 1fr 1fr;
}

.chain_cont {
    background-color: var(--bg-light);
    padding: 14px;
}

.switch_but {
    position: absolute;
    left: 50%;
    border: 3px solid var(--bg-wallet-light);
    transform: translateX(-50%);
}

label {
    color: var(--primary-color-light);
}

.meta {
    display: grid;
    grid-template-columns: max-content max-content;
    column-gap: 2em;
}

h2 {
    font-weight: lighter;
    font-size: 2em;
}
.import_err {
    max-width: 320px;
    //margin: 10vh auto;
    color: var(--primary-color);

    p {
        margin: 6px 0 !important;
        margin-bottom: 14px !important;
        color: var(--primary-color-light);
    }
}

.loading_col {
    max-width: 320px;

    > div {
        position: relative;
        background-color: var(--bg-light);
        padding: 14px;
        margin-bottom: 6px;

        &[state='0'] {
            opacity: 0.2;
        }

        &[state='2'] {
            .status_icon {
                color: var(--success);
            }
        }

        &[state='-1'] {
            .status_icon {
                color: var(--error);
            }
        }

        p {
            word-break: break-all;
            font-size: 13px;
        }
    }

    label {
        font-weight: bold;
        font-size: 12px;
    }

    /*.status_icon{*/
    /*    position: absolute;*/
    /*    top: 8px;*/
    /*    right: 12px;*/
    /*}*/

    .loading_header {
        display: flex;
        justify-content: space-between;
    }

    .spinner {
        color: var(--primary-color) !important;
    }
}

.fees {
    margin: 14px 0;
    border-top: 1px solid var(--bg-light);
    padding-top: 14px;
}

.fees p {
    text-align: left;
    font-size: 13px;
    color: var(--primary-color-light);
}

.fees span {
    float: right;
}

.complete {
    margin-top: 30px;
    > div {
        background-color: var(--bg-light);
        padding: 14px;
        margin: 4px 0;
    }

    .desc {
        margin: 6px 0 !important;
        color: var(--primary-color-light);
    }

    p {
        word-break: keep-all !important;
    }
}

@include main.medium-device {
    .cols {
        //display: grid;
        //grid-template-columns: 1fr 2fr;
        grid-template-columns: none;
        //column-gap: 2vw;
    }
    .right_col {
        //grid-template-columns: 1fr 1fr;
        //row-gap: 14px;
        //display: none;
        grid-column: 1;
        grid-row: 1;
    }
}

@include main.mobile-device {
    .cols {
        display: block;
        padding-bottom: 3vh;
    }

    .form {
        width: 100%;
    }
    .chains {
        row-gap: 4px;
        grid-template-columns: none;
        grid-template-rows: max-content max-content;
    }
}
</style>
