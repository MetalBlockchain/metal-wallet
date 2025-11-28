<template>
  <div class="erc_row">
    <img v-if="token?.data.logoURI" :src="token.data.logoURI" />
    <div v-else class="no_logo">
      <p>?</p>
    </div>
    <p class="col_name">
      {{ token?.data.name }} ({{ token?.data.symbol }})
      <span>ERC20</span>
    </p>
    <router-link v-if="isBalance" class="send_col" :to="sendLink">
      <img v-if="isDay" src="@/assets/sidebar/transfer_nav.svg" />
      <img v-else src="@/assets/sidebar/transfer_nav_night.svg" />
    </router-link>
    <p class="balance_col">{{ balText }} {{ token?.data.symbol }}</p>
  </div>
</template>
<script lang="ts">
import type { PropType } from "vue";
import type Erc20Token from "@/js/Erc20Token";
import { defineComponent } from "vue";
import { useOwnTheme } from "@/composables/use-own-theme";

export const ERC20Row = defineComponent({
  props: {
    token: {
      type: Object as PropType<Erc20Token>,
    },
  },
  setup() {
    const { isDay } = useOwnTheme();
    return {
      isDay,
    };
  },
  computed: {
    balText() {
      return this.token?.balanceBig.toLocaleString() ?? "";
    },
    isBalance() {
      return !this.token?.balanceBN.isZero();
    },
    sendLink() {
      return `/wallet/transfer?chain=C&token=${this.token?.data.address}`;
    },
  },
});
export default ERC20Row;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.erc_row {
  > * {
    align-self: center;
  }
  padding: 14px 0px;
  //display: grid;
  //grid-template-columns: 30px;
}

img {
  object-fit: contain;
  width: 40px;
  height: 40px;
  border-radius: 40px;
  justify-self: center;
}

.balance_col {
  text-align: right;
  font-size: 18px;
  color: var(--tertiary-color) !important;

  span {
    color: var(--tertiary-color) !important;
  }
}

.col_name {
  padding-left: 15px;

  span {
    font-size: 12px;
    color: var(--secondary-color);
  }
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

.no_logo {
  text-align: center;
  height: 40px;
  width: 40px;
  border-radius: 40px;
  align-self: center;
  justify-self: center;
  background-color: var(--bg-light);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--primary-color-light);
}

@include mixins.medium-device {
  .erc_row {
    padding: 6px 0;
  }

  $logo_w: 30px;
  img,
  .no_logo {
    width: $logo_w;
    height: $logo_w;
    border-radius: $logo_w;
  }
}
</style>
