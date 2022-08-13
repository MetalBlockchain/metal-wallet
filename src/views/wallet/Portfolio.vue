<template>
    <div class="home_view">
        <div class="header">
            <div>
                <div class="header_title">
                    <h1>{{ $t('portfolio.assets') }}</h1>
                    <hr />
                </div>
            </div>
            <div>
                <div class="tabs">
                    <button
                        @click="tab = 'fungibles'"
                        :active="tab === `fungibles`"
                        data-cy="wallet_fungible"
                    >
                        {{ $t('portfolio.assets1') }}
                    </button>
                    <button
                        @click="tab = 'collectibles'"
                        :active="tab === `collectibles`"
                        data-cy="wallet_nft"
                    >
                        {{ $t('portfolio.assets2') }}
                    </button>
                </div>
                <div class="search hover_border">
                    <img v-if="$root.theme === 'day'" src="@/assets/search.png" />
                    <img v-else src="@/assets/search_night.svg" />
                    <input :placeholder="$t('portfolio.search')" v-model="search" />
                </div>
            </div>
        </div>
        <div class="pages">
            <transition-group name="fade" mode="out-in">
                <fungibles
                    v-show="tab === `fungibles`"
                    key="fungibles"
                    :search="search"
                ></fungibles>
                <collectibles
                    v-show="tab === `collectibles`"
                    key="collectibles"
                    :search="search"
                ></collectibles>
            </transition-group>
        </div>
    </div>
</template>
<script>
import Fungibles from '@/components/wallet/portfolio/Fungibles'
import Collectibles from '@/components/wallet/portfolio/Collectibles'
export default {
    name: 'WalletHome',
    data() {
        return {
            search: '',
            tab: 'fungibles',
        }
    },
    components: {
        Fungibles,
        Collectibles,
    },
    watch: {
        tab() {
            this.search = ''
        },
    },
}
</script>
<style scoped lang="scss">
@use '../../main';

.home_view {
    display: grid;
    grid-template-rows: max-content 1fr;
}
.header {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
    border-bottom: 2px solid transparent;
    flex-wrap: nowrap;
    white-space: nowrap;

    h1 {
        font-size: 20px;
        font-weight: 500;
        margin-right: 12px;
        color: var(--tertiary-color);
    }

    div {
        display: flex;
        align-items: center;
        flex-wrap: nowrap;
        white-space: nowrap;
        width: 100%;
    }

    .header_title {
        display: flex;

        hr {
            width: 100%;
            border: 1px solid var(--border-secondary-light);
        }

        margin-bottom: 18px;
    }

    button {
        padding: 8px 12px;
        font-size: 14px;
        font-weight: bold;
        outline: none !important;
        color: var(--tertiary-color);

        &[active] {
            color: var(--secondary-color);
            background-color: var(--bg-3);
            border-radius: 6px;
        }
    }
}

.buttons {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    white-space: nowrap;
    height: 40px;
}

.search {
    background-color: var(--bg-light);
    border-radius: 4px;
    /*flex-grow: 1;*/
    height: 46px;
    padding: 5px;
    display: flex;
    align-items: center;
    font-size: 13px;
    flex-basis: 420px;
    flex-shrink: 1;
    border: 1px solid transparent;

    $icon_w: 36px;

    img {
        border-radius: 4px;
        padding: 10px 0px;
        background-color: var(--bg-wallet-light);
        /*height: 100%;*/
        height: $icon_w;
        width: $icon_w;
        object-fit: contain;
    }

    input {
        padding: 0px 16px;
        outline: none;
        border: none !important;
        flex-grow: 1;
        color: var(--primary-color);

        &::placeholder {
            color: #b3b7d3;
        }
    }
}

.pages {
    /*margin-top: 30px;*/
}

@include main.mobile-device {
    .header {
        display: block;

        > div {
            overflow: hidden;
            display: flex;
        }
        button {
            flex-grow: 1;
            border-radius: 0px;
            margin: 0;
            font-size: 12px;
        }
    }

    .search {
        margin: 15px 0px;
    }

    .pages {
        /*min-height: 100vh;*/
        /*padding-bottom: 30px;*/
    }
}

@include main.medium-device {
    .header {
        button {
            font-size: 13px;

            &[active] {
                border-bottom-width: 2px;
            }
        }
    }

    .search {
        //margin: 15px 0px;
        //flex-basis: 100%;
        flex-grow: 1;
        height: 36px;
        flex-basis: auto;

        img {
            padding: 6px;
            height: 22px;
            width: 22px;
        }
    }
}
</style>
