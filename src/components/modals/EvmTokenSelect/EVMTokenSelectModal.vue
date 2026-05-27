<template>
  <modal ref="modal" class="modal_main" title="Select Token">
    <div class="token_select_body">
      <div class="list">
        <div class="token_row" @click="select('native')">
          <img class="col_img" src="/img/metal_icon_circle.svg" />
          <div class="col_name">
            <p>METAL</p>
            <p>Metal</p>
          </div>
          <p class="col_bal">{{ avaxBalance.toLocaleString() }}</p>
        </div>
        <div
          v-for="t in tokens"
          :key="t.data.address"
          class="token_row"
          @click="select(t)"
        >
          <img v-if="t.data.logoURI" class="col_img" :src="t.data.logoURI" />
          <p v-else class="col_img">?</p>
          <div class="col_name">
            <p>{{ t.data.symbol }}</p>
            <p>{{ t.data.name }}</p>
          </div>
          <p class="col_bal">{{ t.balanceBig.toLocaleString() }}</p>
        </div>
      </div>
      <div class="nft_list">
        <ERC721Row
          v-for="t in erc721s"
          :key="t.contractAddress"
          class="nft_row"
          :token="t"
          @select="onERC721Select"
        ></ERC721Row>
      </div>
    </div>
  </modal>
</template>

<script lang="ts">
import type { iErc721SelectInput } from "@/components/misc/EVMInputDropdown/types";
import type Erc20Token from "@/js/Erc20Token";
import type ERC721Token from "@/js/ERC721Token";
import type { WalletType } from "@/js/wallets/types";
import Big from "big.js";
import { defineComponent } from "vue";
import ERC721Row from "@/components/modals/EvmTokenSelect/ERC721Row.vue";
import Modal from "@/components/modals/Modal.vue";
import { bnToBig } from "@/helpers/helper";

export const EVMTokenSelectModal = defineComponent({
  components: {
    ERC721Row,
    Modal,
  },
  emits: ["select", "select-collectible"],
  computed: {
    tokens(): Erc20Token[] {
      const tokens: Erc20Token[] =
        this.$store.getters["Assets/networkErc20Tokens"];
      const filt = tokens.filter((t) => {
        if (t.balanceBN.isZero()) return false;
        return true;
      });
      return filt;
    },
    erc721s(): ERC721Token[] {
      return this.$store.getters["Assets/ERC721/networkContracts"];
    },
    avaxBalance(): Big {
      const w: WalletType | null = this.$store.state.activeWallet;
      if (!w) return Big(0);
      const balBN = w.ethBalance;
      return bnToBig(balBN, 18);
    },
  },
  methods: {
    open(): void {
      const modal = this.$refs.modal as typeof Modal;
      modal.open();
    },
    select(token: Erc20Token | "native") {
      this.$emit("select", token);
      this.close();
    },
    onERC721Select(val: iErc721SelectInput) {
      this.$emit("select-collectible", val);
      this.close();
    },
    close() {
      (this.$refs.modal as typeof Modal).close();
    },
  },
});
export default EVMTokenSelectModal;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.token_select_body {
  width: 420px;
  max-width: 100%;
  //padding: 10px 20px;
}

.list {
  //position: absolute;
  //top: 0;
  //left: 100%;
  //width: 260px;
  //max-height: 0px;
  max-height: 70vh;
  overflow: scroll;
  z-index: 2;
  border-radius: 4px;
}

$logo_w: 38px;

.token_row,
.nft_row {
  padding: 10px 20px;
}

.nft_row {
  border-top: 1px solid var(--bg-light);
}
.token_row {
  font-size: 15px;
  display: grid;
  grid-template-columns: max-content max-content 1fr;
  column-gap: 12px;
  cursor: pointer;
  user-select: none;

  > * {
    align-self: center;
  }

  img {
    object-fit: contain;
  }

  &:hover {
    background-color: var(--bg-light);

    .col_img {
      background-color: var(--primary-color);
      color: var(--bg-wallet);
    }
  }
}

.col_img {
  width: $logo_w;
  height: $logo_w;
  border-radius: $logo_w;
  background-color: var(--bg-light);
  text-align: center;
  line-height: $logo_w;
}

.col_bal {
  text-align: right;
}

.col_name {
  p:last-of-type {
    font-size: 13px;
    color: var(--primary-color-light);
  }
}

@include mixins.mobile-device {
  .token_select_body {
    width: 100%;
    height: 40vh;
    overflow: scroll;
  }
}
</style>
