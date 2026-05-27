<template>
  <div class="asset">
    <div :avax="isAvaxToken" class="icon">
      <img v-if="iconUrl" :src="iconUrl" />
      <p v-else>?</p>
    </div>
    <p class="name_col not_mobile">
      {{ name }} ({{ symbol }})
      <span v-if="!isAvaxToken">ANT</span>
    </p>
    <p class="name_col mobile_only">{{ symbol }}</p>
    <router-link v-if="isBalance" class="send_col" :to="sendLink">
      <img v-if="isDay" src="@/assets/sidebar/transfer_nav.svg" />
      <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
    </router-link>
    <p v-else></p>
    <p v-if="isBalance" class="balance_col">
      <span>{{ amtBig.toLocaleString() }} {{ symbol }}</span>
      <br />
      <span v-if="isAvaxToken" class="fiat">
        {{ totalUSD.toLocaleString(2) }}
        &nbsp;USD
      </span>
    </p>
    <p v-else class="balance_col">0</p>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type AvaAsset from "@/js/AvaAsset";
import type { WalletType } from "@/js/wallets/types";
import type { priceDict } from "@/stores/vuex/types";
import { BN } from "@metalblockchain/metaljs";
import Big from "big.js";
import { defineComponent } from "vue";

import { useOwnTheme } from "@/composables/use-own-theme";
import { bnToBig } from "@/helpers/helper";

export const FungibleRow = defineComponent({
  props: {
    asset: {
      type: Object as PropType<AvaAsset>,
    },
  },
  setup() {
    const { isDay } = useOwnTheme();
    return {
      isDay,
    };
  },
  computed: {
    iconUrl(): string | null {
      if (!this.asset) return null;

      if (this.isAvaxToken) {
        return "/img/metal_icon_circle.svg";
      }

      return null;
    },
    isBalance(): boolean {
      if (!this.asset) return false;
      if (!this.amount.isZero()) {
        return true;
      }
      return false;
    },
    totalUSD(): Big {
      if (!this.isAvaxToken || !this.asset) return Big(0);
      const usdPrice = this.priceDict.usd;
      const bigAmt = bnToBig(this.amount, this.asset.denomination);
      const usdBig = bigAmt.times(usdPrice);
      return usdBig;
    },
    priceDict(): priceDict {
      return this.$store.state.prices;
    },
    sendLink(): string {
      if (!this.asset) return `/wallet/transfer`;
      return `/wallet/transfer?asset=${this.asset.id}&chain=X`;
    },
    avaxToken(): AvaAsset {
      return this.$store.getters["Assets/AssetAVA"];
    },
    isAvaxToken(): boolean {
      if (!this.asset) return false;

      return this.avaxToken.id === this.asset.id ? true : false;
    },
    name(): string {
      const name = this.asset?.name ?? "";
      // TODO: Remove this hack after network change
      if (name === "AVA") return "AVAX";
      return name;
    },
    symbol(): string {
      const sym = this.asset?.symbol ?? "";

      // TODO: Remove this hack after network change
      if (sym === "AVA") return "AVAX";
      return sym;
    },
    amount() {
      if (!this.asset) return new BN(0);
      const amt = this.asset.getTotalAmount();
      return amt.add(this.evmAvaxBalance);
    },
    amtBig() {
      return bnToBig(this.amount, this.asset?.denomination);
    },
    evmAvaxBalance(): BN {
      const wallet: WalletType | null = this.$store.state.activeWallet;

      if (!this.isAvaxToken || !wallet) {
        return new BN(0);
      }
      // Convert to 9 decimal places
      const bal = wallet.ethBalance;
      const balRnd = bal.divRound(new BN(Math.pow(10, 9).toString()));
      return balRnd;
    },
  },
});
export default FungibleRow;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.asset {
  padding: 14px 0px;
  justify-self: center;

  > * {
    align-self: center;
  }

  .balance_col {
    font-size: 18px;
    text-align: right;
    color: var(--tertiary-color);

    .fiat {
      font-size: 12px;
      color: var(--primary-color-light);
    }
  }

  .name_col {
    padding-left: 15px;
    white-space: nowrap;
    overflow-y: hidden;
    text-overflow: ellipsis;
  }

  .send_col {
    text-align: center;
    opacity: 0.4;
    &:hover {
      opacity: 1;
    }
    img {
      width: 18px;
      object-fit: contain;
    }
  }
}

$icon_w: 40px;
.icon {
  position: relative;
  align-self: center;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  transition-duration: 1s;
  width: $icon_w;
  height: $icon_w;
  border-radius: $icon_w;
  background-color: var(--bg-light);

  p {
    color: var(--primary-color-light);
  }

  img {
    width: 100%;
    object-fit: contain;
  }
}

.hex_bg {
  height: 100%;
  width: 100%;
}

.mobile_only {
  display: none;
}

.name_col {
  span {
    font-size: 12px;
    color: var(--secondary-color);
  }
}

@include mixins.medium-device {
  .asset {
    padding: 6px 0;
  }

  .balance_col {
    span {
      font-size: 15px;
    }
    font-size: 15px;
  }
  .send_col {
    img {
      width: 14px;
    }
  }

  .name_col {
    font-size: 14px;
  }

  $icon_w: 30px;
  .icon {
    width: $icon_w;
    height: $icon_w;
    border-radius: $icon_w;
  }
}

@include mixins.mobile-device {
  .name_col {
    display: none;
  }

  .balance_col {
    font-size: 1rem !important;
  }

  .mobile_only {
    display: initial;
  }
}
</style>
