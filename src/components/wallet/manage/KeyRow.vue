<template>
  <div class="addressItem" :selected="isDefault">
    <ExportKeys
      v-if="walletType === 'mnemonic' && mnemonicWallet"
      ref="export_wallet"
      :wallets="[mnemonicWallet]"
    ></ExportKeys>
    <MnemonicPhraseModal
      v-if="walletType === 'mnemonic'"
      ref="modal"
      :phrase="mnemonicPhrase"
    ></MnemonicPhraseModal>
    <HdDerivationListModal
      v-if="isHDWallet && mnemonicWallet"
      ref="modal_hd"
      :wallet="mnemonicWallet"
    ></HdDerivationListModal>
    <PrivateKey
      v-if="walletType === 'singleton'"
      ref="modal_priv_key"
      :private-key="privateKey"
    ></PrivateKey>
    <PrivateKey
      v-if="walletType !== 'ledger'"
      ref="modal_priv_key_c"
      :private-key="privateKeyC"
    ></PrivateKey>
    <XpubModal v-if="isHDWallet" ref="modal_xpub" :xpub="xpubXP"></XpubModal>
    <div class="rows">
      <div class="header">
        <template v-if="isDefault">
          <img class="key_logo" src="@/assets/key_active.svg" />
        </template>
        <template v-else>
          <img v-if="isDay" class="key_logo" src="@/assets/key_inactive.svg" />
          <img v-else class="key_logo" src="@/assets/key_inactive_night.png" />
        </template>
        <div class="header_cols">
          <div class="detail">
            <p class="addressVal">
              <b>{{ walletTitle }}</b>
            </p>
            <Tooltip v-if="isVolatile" :text="$t('keys.tooltip')">
              <fa class="volatile_alert" icon="exclamation-triangle"></fa>
            </Tooltip>
          </div>
          <div class="buts">
            <button v-if="!isDefault" class="selBut" @click="select">
              <span>{{ $t("keys.activate_key") }}</span>
            </button>
            <Tooltip
              v-if="!isDefault"
              class="row_but circle"
              :text="$t('keys.remove_key')"
              @click="remove"
            >
              <img src="@/assets/trash_can_dark.svg" style="height: 16px" />
            </Tooltip>
            <Tooltip
              v-if="walletType !== 'singleton'"
              class="row_but circle"
              :text="$t('keys.hd_addresses')"
              @click="showPastAddresses"
            >
              <fa icon="list-ol"></fa>
            </Tooltip>
            <Tooltip
              v-if="walletType === 'mnemonic'"
              class="row_but circle"
              :text="$t('keys.export_key')"
              @click="showExportModal"
            >
              <fa icon="upload"></fa>
            </Tooltip>
            <div class="text_buts">
              <button v-if="walletType == 'mnemonic'" @click="showModal">
                {{ $t("keys.view_key") }}
              </button>
              <button
                v-if="walletType == 'singleton'"
                @click="showPrivateKeyModal"
              >
                {{ $t("keys.view_priv_key") }}
              </button>
              <button
                v-if="walletType !== 'ledger'"
                @click="showPrivateKeyCModal"
              >
                {{ $t("keys.view_priv_key_c") }}
              </button>
              <button v-if="isHDWallet" @click="showXpub">Show XPUB</button>
            </div>
          </div>
        </div>
      </div>

      <div class="header">
        <div></div>
        <div>
          <p v-if="Object.keys(balances).length === 0" class="balance_empty">
            {{ $t("keys.empty") }}
          </p>
          <div v-else class="addressBalance bal_cols">
            <p>This key has:</p>
            <div class="bal_rows">
              <p v-for="bal in balances" :key="bal.id">
                {{ bal.toString() }}
                <b>{{ bal.symbol }}</b>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { AbstractHdWallet } from "@/js/wallets/AbstractHdWallet";
import type MnemonicPhrase from "@/js/wallets/MnemonicPhrase";
import type MnemonicWallet from "@/js/wallets/MnemonicWallet";
import type { SingletonWallet } from "@/js/wallets/SingletonWallet";
import type { WalletNameType, WalletType } from "@/js/wallets/types";
import type { AmountOutput } from "@metalblockchain/metaljs/dist/apis/avm";
import type { PropType } from "vue";

import { mapState } from "pinia";
import { defineComponent } from "vue";
import Tooltip from "@/components/misc/Tooltip.vue";
import ExportKeys from "@/components/modals/ExportKeys.vue";
import HdDerivationListModal from "@/components/modals/HdDerivationList/HdDerivationListModal.vue";
import MnemonicPhraseModal from "@/components/modals/MnemonicPhraseModal.vue";
import PrivateKey from "@/components/modals/PrivateKey.vue";
import XpubModal from "@/components/modals/XpubModal.vue";
import { useOwnTheme } from "@/composables/use-own-theme";
import AvaAsset from "@/js/AvaAsset";
import { bintools } from "@/misc/AVA";
import { useAssetsStore } from "@/stores/pinia/assets";
import { useRootStore } from "@/stores/pinia/root";

export interface IKeyBalanceDict {
  [key: string]: AvaAsset;
}

export const KeyRow = defineComponent({
  components: {
    MnemonicPhraseModal,
    HdDerivationListModal,
    Tooltip,
    ExportKeys,
    PrivateKey,
    XpubModal,
  },
  props: {
    wallet: {
      type: Object as PropType<WalletType>,
    },
    isDefault: { default: false, type: Boolean },
  },
  emits: ["remove", "select"],
  setup() {
    const { isDay } = useOwnTheme();
    return {
      isDay,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      mnemonicWallet: (store): MnemonicWallet | null =>
        store.activeWallet as MnemonicWallet,
      isVolatile: (store) => {
        if (!store.activeWallet) return false;
        return store.volatileWallets.includes(store.activeWallet);
      },
      walletTitle: (store) => {
        return store.activeWallet?.getBaseAddress();
      },
      walletType: (store): WalletNameType => {
        return store.activeWallet?.type ?? "mnemonic";
      },
    }),
    ...mapState(useAssetsStore, ["assetsDict"]),
    balances(): IKeyBalanceDict {
      if (!this.wallet?.getUTXOSet()) return {};

      const res: IKeyBalanceDict = {};

      const addrUtxos = this.wallet.getUTXOSet().getAllUTXOs();
      for (const utxo of addrUtxos) {
        // ignore NFTS and mint outputs
        //TODO: support nfts
        const outId = utxo.getOutput().getOutputID();
        if (outId === 11 || outId === 6 || outId === 10) continue;

        const utxoOut = utxo.getOutput() as AmountOutput;

        const amount = utxoOut.getAmount();
        const assetIdBuff = utxo.getAssetID();
        const assetId = bintools.cb58Encode(assetIdBuff);

        const assetObj: AvaAsset | undefined = this.assetsDict[assetId];

        if (!assetObj) {
          const name = "?";
          const symbol = "?";
          const denomination = 0;

          const newAsset = new AvaAsset(assetId, name, symbol, denomination);
          newAsset.addBalance(amount);

          res[assetId] = newAsset;
          continue;
        }

        const asset = res[assetId];
        if (asset) {
          asset.addBalance(amount);
        } else {
          const name = assetObj.name;
          const symbol = assetObj.symbol;
          const denomination = assetObj.denomination;

          const newAsset = new AvaAsset(assetId, name, symbol, denomination);
          newAsset.addBalance(amount);

          res[assetId] = newAsset;
        }
      }

      return res;
    },

    isHDWallet() {
      return ["mnemonic", "ledger"].includes(this.walletType);
    },
    mnemonicPhrase(): MnemonicPhrase | undefined {
      if (this.walletType !== "mnemonic") return undefined;
      const wallet = this.wallet as MnemonicWallet;
      return wallet.getMnemonicEncrypted();
    },
    privateKey(): string | undefined {
      if (this.walletType !== "singleton") return undefined;
      const wallet = this.wallet as SingletonWallet;
      return wallet.key;
    },
    privateKeyC(): string | undefined {
      if (this.walletType === "ledger") return undefined;
      const wallet = this.wallet as SingletonWallet | MnemonicWallet;
      return wallet.ethKey;
    },
    xpubXP() {
      if (this.isHDWallet) {
        return (this.wallet as AbstractHdWallet).getXpubXP();
      }
      return undefined;
    },
  },
  methods: {
    remove() {
      this.$emit("remove", this.wallet);
    },
    select() {
      this.$emit("select", this.wallet);
    },
    showModal() {
      (this.$refs.modal as typeof MnemonicPhraseModal).open();
    },
    showXpub() {
      (this.$refs.modal_xpub as typeof XpubModal).open();
    },
    showPastAddresses() {
      (this.$refs.modal_hd as typeof HdDerivationListModal).open();
    },
    showExportModal() {
      (this.$refs.export_wallet as typeof ExportKeys).open();
    },
    showPrivateKeyModal() {
      (this.$refs.modal_priv_key as typeof PrivateKey).open();
    },
    showPrivateKeyCModal() {
      (this.$refs.modal_priv_key_c as typeof PrivateKey).open();
    },
  },
});
export default KeyRow;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

.addressItem {
  font-size: 14px;
  /*display: grid;*/
  /*grid-template-columns: 1fr max-content;*/
  /*grid-gap: 15px;*/
  overflow: auto;

  > * {
    align-self: center;
    overflow: auto;
  }
}

.key_logo {
  width: 32px;
}

.hdlist {
  grid-column: 1/3;
}

.buts {
  display: flex;
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;

  > * {
    margin: 0px 8px !important;
  }

  button {
    font-size: 16px;
  }

  $but_w: 32px;
  .circle {
    width: $but_w;
    height: $but_w;
    border-radius: $but_w;
    background-color: rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
    align-self: center;

    &:hover {
      background-color: var(--bg);
    }
  }

  .text_buts {
    display: flex;
    flex-direction: column;
    > button {
      text-align: right;
      font-size: 13px;

      &:hover {
        color: var(--secondary-color);
      }
    }
  }
}

.row_but {
  margin: 0 12px;
}

.rows {
  overflow: auto;
}
.addressItem .selBut {
  flex-shrink: 0;
  flex-grow: 1;
  /*background-color: #C0C0CD;*/
  color: #867e89;
  padding: 4px 8px;

  span {
    font-size: 12px;
    line-height: normal;
  }
}

.addressItem {
  .selBut {
  }
}

.header {
  display: grid;
  grid-template-columns: 32px 1fr;
  grid-gap: 14px;
  /*align-items: center;*/
}

.header_cols {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail {
  overflow: auto;
  display: flex;
  align-items: center;

  /*grid-template-columns: max-content max-content;*/
  /*column-gap: 15px;*/
}

.label {
  font-weight: bold;
}
.addressVal {
  overflow: auto;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  color: var(--tertiary-color);

  span {
    font-weight: normal;
    margin-right: 8px;
  }
}

.del {
  align-self: start;
  opacity: 0.4;

  &:hover {
    opacity: 1;
  }
}

.addressBalance {
  display: flex;
  white-space: nowrap;
  color: var(--primary-color);
  .bal_rows p {
    font-weight: bold;
    padding: 0px 8px;
    margin-bottom: 4px;
  }
  p {
    border-radius: 3px;
  }
}

.bal_cols {
  display: flex;
}

.bal_rows {
  display: flex;
  flex-direction: column;
}

.balance_empty {
  color: var(--primary-color);
}

.volatile_alert {
  color: var(--warning);
  font-size: 15px;
  margin-left: 6px;
}

@include mixins.mobile-device {
  .header_cols {
    display: block;
  }

  .detail {
    text-align: right;
  }

  .bal_cols {
    border-top: 1px solid #ddd;
    padding-top: 12px;
    margin-top: 12px;
  }
}
</style>
