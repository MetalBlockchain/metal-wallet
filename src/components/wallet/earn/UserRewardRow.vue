<template>
    <div class="reward_row">
        <div class="top_bar">
            <div style="display: flex; justify-content: space-between">
                <p>{{ startDate.toLocaleString() }}</p>
                <p>{{ endDate.toLocaleString() }}</p>
            </div>
            <div
                class="reward_bar"
                :style="{
                    width: `${percFull * 100}%`,
                }"
            ></div>
        </div>
        <div class="data_row stake_info">
            <div>
                <label>NodeID</label>
                <p class="reward node_id">{{ tx.nodeId }}</p>
            </div>
            <div>
                <label>{{ $t('earn.rewards.row.stake') }}</label>
                <p class="reward">{{ stakeBig.toLocaleString() }} METAL</p>
            </div>
            <div style="text-align: right">
                <label>{{ $t('earn.rewards.row.reward') }}</label>
                <p class="reward">{{ rewardBig.toLocaleString() }} METAL</p>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import 'reflect-metadata'
import { Vue, Component, Prop } from 'vue-property-decorator'
import { BN } from '@metalblockchain/metaljs'
import Big from 'big.js'
import { bnToBigAvaxP } from '@metalblockchain/metal-wallet-sdk'
import { PChainTransaction } from '@metalblockchain/glacier-sdk'

@Component
export default class UserRewardRow extends Vue {
    now: number = Date.now()
    intervalID: any = null

    @Prop() tx!: PChainTransaction

    updateNow() {
        this.now = Date.now()
    }

    created() {
        this.intervalID = setInterval(() => {
            this.updateNow()
        }, 2000)
    }
    destroyed() {
        clearInterval(this.intervalID)
    }
    get startTime() {
        return (this.tx.startTimestamp ?? 0) * 1000
    }

    get endtime() {
        return (this.tx.endTimestamp ?? 0) * 1000
    }

    get startDate() {
        return new Date(this.startTime)
    }

    get endDate() {
        return new Date(this.endtime)
    }

    get rewardAmt(): BN {
        return new BN(this.tx.estimatedReward || 0)
    }

    get stakingAmt(): BN {
        if (this.tx.amountStaked !== undefined) {
            return new BN(this.tx.amountStaked[0].amount || 0)
        }
        return new BN(0)
    }

    get rewardBig(): Big {
        return Big(this.rewardAmt.toString()).div(Math.pow(10, 9))
    }

    get stakeBig() {
        return bnToBigAvaxP(this.stakingAmt)
    }
    get percFull(): number {
        let range = this.endtime - this.startTime
        let res = (this.now - this.startTime) / range
        return Math.min(res, 1)
    }
}
</script>
<style scoped lang="scss">
@use '../../../main';

.node_id {
    word-break: break-all;
}

.top_bar {
    height: max-content;
    position: relative;
    padding: 2px 8px;
    border-bottom: 2px solid var(--bg-wallet-light);
}
.reward_row {
    border-radius: 4px;
    overflow: hidden;
    font-size: 14px;
    //border: 2px solid var(--bg-light);
    background-color: var(--bg-light);
}

.data_row {
    grid-column: 1/3;
    display: grid;
    grid-template-columns: 1fr 280px;
    align-items: center;
}

.date {
    z-index: 1;
}
.reward_bar {
    background-color: var(--success);
    position: absolute;
    opacity: 0.5;
    height: 100%;
    left: 0;
    top: 0;
    z-index: 0;
}

.stake_info {
    padding: 6px 12px;
    display: grid;
    column-gap: 14px;
    grid-template-columns: 2fr 1fr 1fr;
    /*justify-content: space-between;*/
    /*text-align: right;*/
    text-align: left;

    > div {
        align-self: baseline;
    }
}

label {
    color: var(--primary-color-light) !important;
}

@include main.mobile-device {
    .stake_info {
        grid-column: 1/3;
        border-left: none;
        border-top: 3px solid var(--bg);

        > div:first-of-type {
            text-align: left;
        }
    }
}
</style>
