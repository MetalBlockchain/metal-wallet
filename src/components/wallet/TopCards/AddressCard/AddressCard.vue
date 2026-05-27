<template>
  <div class="addr_card">
    <q-r-modal ref="qr_modal" :address="activeAddress"></q-r-modal>
    <paper-wallet
      v-if="walletType === 'mnemonic'"
      ref="print_modal"
      :wallet="mnemonicWallet"
    ></paper-wallet>
    <p class="addr_info">{{ addressMsg }}</p>
    <div class="bottom_tabs">
      <ChainSelect v-model="chainNow"></ChainSelect>
    </div>
    <div class="bottom">
      <div class="col_qr">
        <canvas ref="qr"></canvas>
      </div>
      <div class="bottom_rest">
        <p class="subtitle">{{ addressLabel }}</p>

        <p class="addr_text" data-cy="wallet_address">
          {{ activeAddress }}
        </p>
        <div class="buts">
          <button
            v-if="chainNow === 'C'"
            class="bech32"
            :data-active="showBech"
            :tooltip="`View the bech32 encoded C-Chain address`"
            @click="toggleBech32"
          >
            Bech32
          </button>
          <button
            class="qr_but"
            :tooltip="$t('top.hover1')"
            @click="viewQRModal"
          ></button>
          <button
            v-if="walletType === 'mnemonic'"
            class="print_but"
            :tooltip="$t('top.hover2')"
            @click="viewPrintModal"
          ></button>
          <!-- TODO Ledger doesn't have action here -->
          <button
            v-if="walletType === 'ledger'"
            class="ledger_but"
            :tooltip="$t('create.verify')"
            @click="() => {}"
          ></button>
          <CopyText
            class="copy_but"
            :tooltip="$t('top.hover3')"
            :value="activeAddress"
          ></CopyText>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type { ChainIdType } from "@/constants";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { WalletNameType } from "@/js/wallets/types";
import { mapState } from "pinia";
import QRCode from "qrcode";
import { defineComponent } from "vue";

import CopyText from "@/components/misc/CopyText.vue";
import PaperWallet from "@/components/modals/PaperWallet/PaperWallet.vue";
import QRModal from "@/components/modals/QRModal.vue";
import ChainSelect from "@/components/wallet/TopCards/AddressCard/ChainSelect.vue";
import { useRootStore } from "@/stores/pinia/root";

export const AddressCard = defineComponent({
  components: {
    CopyText,
    PaperWallet,
    QRModal,
    ChainSelect,
  },
  data(): {
    colorLight: string;
    colorDark: string;
    chainNow: ChainIdType;
    showBech: boolean;
  } {
    const chainNow: ChainIdType = "X";

    return {
      colorLight: "#FFF",
      colorDark: "#242729",
      chainNow,
      showBech: false,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      activeWallet: (store) => store.activeWallet || undefined,
    }),
    mnemonicWallet(): MnemonicWallet | undefined {
      return this.activeWallet as MnemonicWallet;
    },
    addressLabel(): string {
      switch (this.chainNow) {
        default: {
          return this.$t("top.address.title_x") as string;
        }
        case "P": {
          return this.$t("top.address.title_p") as string;
        }
        case "C": {
          return this.showBech
            ? "Derived C-Chain Address"
            : (this.$t("top.address.title_c") as string);
        }
      }
    },
    addressMsg(): string {
      switch (this.chainNow) {
        default: {
          return this.getAddressMsgX();
        }
        case "P": {
          return this.$t("top.address.desc_p") as string;
        }
        case "C": {
          return this.showBech
            ? "Used internally when moving funds to or from C-Chain"
            : (this.$t("top.address.desc_c") as string);
        }
      }
    },
    walletType(): WalletNameType {
      const wallet = this.activeWallet;
      if (!wallet) return "mnemonic";
      return wallet.type;
    },

    address() {
      const wallet = this.activeWallet;
      if (!wallet) {
        return "-";
      }
      return wallet.getCurrentAddressAvm();
    },
    addressPVM() {
      const wallet = this.activeWallet;
      if (!wallet) {
        return "-";
      }

      return wallet.getCurrentAddressPlatform();
    },
    addressEVM() {
      const wallet = this.activeWallet;
      if (!wallet) {
        return "-";
      }

      return wallet.getEvmChecksumAddress();
    },
    addressEVMBech32() {
      const wallet = this.activeWallet;
      if (!wallet) {
        return "-";
      }

      return wallet.getEvmAddressBech();
    },
    activeAddress(): string {
      switch (this.chainNow) {
        case "X": {
          return this.address;
        }
        case "P": {
          return this.addressPVM;
        }
        case "C": {
          return this.showBech ? this.addressEVMBech32 : this.addressEVM;
        }
      }
      return this.address;
    },
    activeIdx(): number {
      const wallet = this.activeWallet as MnemonicWallet;
      const walletType = wallet.type;

      if (walletType === "singleton") return 0;

      switch (this.chainNow) {
        case "X": {
          return wallet.getExternalActiveIndex();
        }
        case "P": {
          return wallet.getPlatformActiveIndex();
        }
        default: {
          return 0;
        }
      }
    },
  },
  watch: {
    activeAddress: [
      {
        handler: "onaddrchange",
      },
    ],
    "$root.theme": [{ immediate: true, handler: "onthemechange" }],
    chainNow: [
      {
        handler: "onChainChange",
      },
    ],
  },
  mounted() {
    this.updateQR();
  },
  methods: {
    toggleBech32() {
      this.showBech = !this.showBech;
    },
    getAddressMsgX() {
      return this.activeWallet?.type === "singleton"
        ? (this.$t("top.address.desc_x_1") as string)
        : (`${this.$t("top.address.desc_x_1")} ${this.$t(
            "top.address.desc_x_2",
          )}` as string);
    },
    viewQRModal() {
      (this.$refs.qr_modal as typeof QRModal).open();
    },
    viewPrintModal() {
      const modal = this.$refs.print_modal as typeof PaperWallet;
      modal.open();
    },
    updateQR() {
      const canvas = this.$refs.qr as HTMLCanvasElement;
      if (!canvas) return;

      const size = canvas.clientWidth;
      QRCode.toCanvas(
        canvas,
        this.activeAddress,
        {
          scale: 6,
          color: {
            light: this.colorLight,
            dark: this.colorDark,
          },
          width: size,
          // height: size,
        },
        function (error: any) {
          if (error) console.error(error);
        },
      );
    },
    onaddrchange() {
      this.updateQR();
    },
    onthemechange(val: string) {
      if (val === "night") {
        this.colorDark = "#E5E5E5";
        this.colorLight = "#242729";
      } else {
        this.colorDark = "#242729";
        this.colorLight = "#FFF";
      }
      this.updateQR();
    },
    onChainChange(val: ChainIdType) {
      if (val !== "C") {
        this.showBech = false;
      }
    },
  },
});
export default AddressCard;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";
@use "@/styles/abstracts/vars";

.addr_card {
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}
.buts {
  width: 100%;
  display: flex;
  align-items: center;
  color: var(--primary-color-light);
  justify-content: flex-end;

  > * {
    font-size: 16px;
    margin-left: 14px;
    position: relative;
    outline: none;
    width: 18px;
    height: 18px;
    opacity: 0.6;

    background-size: contain;
    background-position: center;
    &:hover {
      opacity: 1;
    }
  }
}

.qr_but {
  background-image: url("/img/qr_icon.svg");
}
.print_but {
  background-image: url("/img/faucet_icon.svg");
}
.ledger_but {
  background-image: url("/img/ledger_icon.svg");
}
.copy_but {
  background-image: url("/img/copy_icon.svg");
}

.bech32 {
  font-size: 0.8em;
  font-weight: bold;
  width: auto;

  &[data-active="true"] {
    color: var(--secondary-color) !important;
  }
}

.col_qr {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.mainnet_but {
  background-image: url("/img/modal_icons/mainnet_addr.svg");
}

@include mixins.night-mode {
  .qr_but {
    background-image: url("/img/qr_icon_night.svg");
  }
  .print_but {
    background-image: url("/img/print_icon_night.svg");
  }
  .ledger_but {
    background-image: url("/img/ledger_night.svg");
  }

  .mainnet_but {
    background-image: url("/img/modal_icons/mainnet_addr_night.svg");
  }
}

.addr_info {
  margin: 19px !important;
  margin-bottom: 0 !important;
  background-color: var(--bg-light);
  font-size: 14px;
  font-weight: 400;
  text-align: center;
  padding: 12px 16px;
}

$qr_width: 110px;

.bottom {
  display: grid;
  grid-template-columns: $qr_width 1fr;
  column-gap: 14px;
  padding-right: 18px;
  margin-top: 4px;
  margin-bottom: 4px;
  padding-left: 8px;
  flex-grow: 1;

  canvas {
    width: $qr_width;
    height: $qr_width;
    background-color: transparent;
  }

  .bottom_rest {
    padding-top: 4px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.sub {
  margin: 0px 10px !important;
  text-align: center;
  font-size: 0.7rem;
  background-color: vars.$secondary-color;
  color: #fff;
  padding: 3px 6px;
  border-radius: 3px;
}

.subtitle {
  font-size: 0.7rem;
  color: var(--primary-color-light);
}

.addr_text {
  font-size: 14px;
  font-weight: 500;
  word-break: break-all;
  color: var(--tertiary-color);
  min-height: 55px;
}

@include mixins.medium-device {
  //.bottom{
  //    display: block;
  //}
  .bottom_rest {
    justify-content: space-between;
  }

  .addr_info {
    display: none;
  }
  canvas {
    display: block;
    margin: 0px auto;
  }

  .buts {
    justify-content: space-evenly;

    > * {
      margin: 0;
    }
  }

  .addr_text {
    font-size: 13px;
  }
}

.bottom_tabs {
  width: 100%;
}

@include mixins.mobile-device {
  .addr_info {
    display: none;
  }
}
</style>
