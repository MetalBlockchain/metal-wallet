<template>
    <div>
        <div class="head">
            <div class="head_title">
                <h1>{{ $t('cross_chain.title') }}</h1>
                <hr />
            </div>
            <p>
                {{ $t('cross_chain.desc') }}
            </p>
        </div>
        <ChainTransfer></ChainTransfer>
    </div>
</template>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

import ChainTransfer from '@/components/wallet/earn/ChainTransfer/ChainTransfer.vue'
@Component({
    name: 'cross_chain',
    components: {
        ChainTransfer,
    },
})
export default class CrossChain extends Vue {}
</script>
<style scoped lang="scss">
h1 {
    font-weight: normal;
}
.head {
    margin-bottom: 14px;
    //display: flex;
    //align-items: center;
    //justify-content: space-between;

    .head_title {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 18px;

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

    p {
        font-size: 14px;
        font-weight: 400;
    }
}
</style>
