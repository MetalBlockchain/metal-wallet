<template>
    <div class="earn_page">
        <div class="header">
            <div class="header_title">
                <h1>{{ $t('earn.title') }}</h1>
                <hr />
            </div>
            <h1 class="subtitle" v-if="pageNow">
                / {{ subtitle }}
                <span @click="cancel"><fa icon="times"></fa></span>
            </h1>
        </div>
        <transition name="fade" mode="out-in">
            <div v-if="!pageNow">
                <p class="earn_desc">{{ $t('earn.desc') }}</p>
                <div class="options">
                    <div>
                        <h4 class="title">
                            {{ $t('earn.validate_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('earn.validate_card.desc') }}
                        </p>
                        <p v-if="!canValidate" class="no_balance">
                            {{ $t('earn.warning_1', [minStakeAmt.toLocaleString()]) }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="validate"
                            @click="addValidator"
                            depressed
                            small
                            :disabled="!canValidate"
                        >
                            {{ $t('earn.validate_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('earn.delegate_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('earn.delegate_card.desc') }}
                        </p>
                        <p v-if="!canDelegate" class="no_balance">
                            {{ $t('earn.warning_2', [minDelegationAmt.toLocaleString()]) }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="delegate"
                            @click="addDelegator"
                            depressed
                            small
                            :disabled="!canDelegate"
                        >
                            {{ $t('earn.delegate_card.submit') }}
                        </v-btn>
                    </div>
                    <div>
                        <h4 class="title">
                            {{ $t('earn.rewards_card.title') }}
                        </h4>
                        <p style="flex-grow: 1">
                            {{ $t('earn.rewards_card.desc') }}
                        </p>
                        <v-btn
                            class="button_secondary"
                            data-cy="rewards"
                            @click="viewRewards"
                            depressed
                            small
                        >
                            {{ $t('earn.rewards_card.submit') }}
                        </v-btn>
                    </div>
                </div>
                <!--                <v-btn @click="viewRewards" depressed small>View Estimated Rewards</v-btn>-->
            </div>
            <div v-else>
                <component :is="pageNow" class="comp" @cancel="cancel"></component>
            </div>
        </transition>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'

import AddValidator from '@/components/wallet/earn/Validate/AddValidator.vue'
import AddDelegator from '@/components/wallet/earn/Delegate/AddDelegator.vue'
import { BN } from '@metalblockchain/metaljs/dist'
import UserRewards from '@/components/wallet/earn/UserRewards.vue'
import { bnToBig } from '@/helpers/helper'
import Big from 'big.js'

@Component({
    name: 'earn',
    components: {
        UserRewards,
        AddValidator,
        AddDelegator,
    },
})
export default class Earn extends Vue {
    pageNow: any = null
    subtitle: string = ''
    intervalID: any = null

    addValidator() {
        this.pageNow = AddValidator
        this.subtitle = this.$t('earn.subtitle1') as string
    }
    addDelegator() {
        this.pageNow = AddDelegator
        this.subtitle = this.$t('earn.subtitle2') as string
    }
    transfer() {
        this.$router.replace('/wallet/cross_chain')
    }

    viewRewards() {
        this.pageNow = UserRewards
        this.subtitle = this.$t('earn.subtitle4') as string
    }
    cancel() {
        this.pageNow = null
        this.subtitle = ''
    }

    deactivated() {
        this.cancel()
    }

    destroyed() {
        clearInterval(this.intervalID)
    }

    get platformUnlocked(): BN {
        return this.$store.getters['Assets/walletPlatformBalance'].available
    }

    get platformLockedStakeable(): BN {
        // return this.$store.getters.walletPlatformBalanceLockedStakeable
        return this.$store.getters['Assets/walletPlatformBalanceLockedStakeable']
    }

    get totBal(): BN {
        return this.platformUnlocked.add(this.platformLockedStakeable)
    }

    get pNoBalance() {
        return this.platformUnlocked.add(this.platformLockedStakeable).isZero()
    }

    get canDelegate(): boolean {
        let bn = this.$store.state.Platform.minStakeDelegation
        if (this.totBal.lt(bn)) {
            return false
        }
        return true
    }

    get canValidate(): boolean {
        let bn = this.$store.state.Platform.minStake
        if (this.totBal.lt(bn)) {
            return false
        }
        return true
    }

    get minStakeAmt(): Big {
        let bn = this.$store.state.Platform.minStake
        return bnToBig(bn, 9)
    }

    get minDelegationAmt(): Big {
        let bn = this.$store.state.Platform.minStakeDelegation
        return bnToBig(bn, 9)
    }
}
</script>
<style scoped lang="scss">
@use '../../main';
.earn_page {
    display: grid;
    grid-template-rows: max-content 1fr;
}
.earn_desc {
    font-size: 14px;
    font-weight: 400;
}
.header {
    display: flex;
    /*justify-content: space-between;*/
    /*align-items: center;*/
    align-items: center;

    .header_title {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 18px;
        width: 100%;

        h1 {
            font-size: 20px;
            font-weight: 500;
            white-space: nowrap;
            margin-right: 12px;
            color: var(--tertiary-color);
        }

        hr {
            flex: 0 1 100%;
            border: 1px solid var(--border-secondary-light);
        }
    }

    .subtitle {
        margin-left: 0.5em;
        font-size: 20px;
        color: var(--primary-color-light);
        font-weight: 400;
    }

    span {
        margin-left: 1em;

        &:hover {
            color: var(--primary-color);
            cursor: pointer;
        }
    }
}
.options {
    margin: 30px 0;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    column-gap: 14px;
    row-gap: 14px;
    //display: flex;
    //justify-content: space-evenly;
    //padding: 60px;

    > div {
        width: 100%;
        justify-self: center;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        //max-width: 260px;
        padding: 30px;
        border-radius: 16px;
        border: 1px solid var(--border-secondary-light);
        overflow: auto;
    }

    h4 {
        font-size: 20px !important;
        font-weight: 600;
        color: var(--tertiary-color);
    }

    p {
        /*color: var(--primary-color-light);*/
        font-size: 14px;
        font-weight: 400;
        margin: 14px 0 !important;
    }

    .no_balance {
        color: var(--error);
    }

    .v-btn {
        margin-top: 14px;
    }
}

span {
    color: var(--primary-color-light);
    opacity: 0.5;
    float: right;
    font-weight: lighter;
}

.cancel {
    font-size: 13px;
    color: var(--secondary-color);
    justify-self: flex-end;
}

.comp {
    margin-top: 14px;
}

@include main.medium-device {
    .options {
        grid-template-columns: 1fr 1fr;
    }
}

@include main.mobile-device {
    .options {
        grid-template-columns: none;
        grid-row-gap: 15px;
    }
}
</style>
