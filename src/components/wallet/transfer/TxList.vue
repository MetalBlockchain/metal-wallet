<template>
  <div>
    <div class="table_title">
      <p>{{ $t("transfer.tx_list.amount") }}</p>
      <p>{{ $t("transfer.tx_list.token") }}</p>
    </div>
    <div v-for="(tx, i) in tx_list" :key="tx.uuid" class="list_item">
      <currency-input-dropdown
        class="list_in"
        :disabled="disabled"
        :disabled-assets="disabledAssets?.at(i)"
        :initial="tx.asset.id"
        @change="oninputchange(i, $event)"
      ></currency-input-dropdown>
      <button
        v-if="(i !== 0 || tx_list.length > 1) && !disabled"
        class="remove_but"
        @click="removeTx(i)"
      >
        <img src="@/assets/trash_can_dark.svg" />
      </button>
    </div>
    <button v-if="showAdd" block class="add_asset" depressed @click="addTx()">
      <fa icon="plus"></fa>
      Add Asset
    </button>
    <!--        <p class="chain_warn">{{$t('transfer.chain_warn')}}</p>-->
  </div>
</template>
<script lang="ts">
import type {
  ICurrencyInputDropdownValue,
  ITransaction,
} from "@/components/wallet/transfer/types";

import type AvaAsset from "@/js/AvaAsset";
import type { AssetsDict } from "@/stores/types/assets";
import { BN } from "@metalblockchain/metaljs";
import { v1 as uuidv1 } from "uuid";
import { defineComponent } from "vue";
import CurrencyInputDropdown from "@/components/misc/CurrencyInputDropdown.vue";

export const TxList = defineComponent({
  components: {
    CurrencyInputDropdown,
  },
  props: {
    disabled: { default: false, type: Boolean },
  },
  emits: ["change"],
  setup() {
    const tx_list = ref<ITransaction[]>([]);
    const disabledAssets = ref<AvaAsset[][]>();
    const next_initial = ref<AvaAsset | null>(null);
    disabledAssets.value = [];
    return {
      tx_list,
      disabledAssets,
      next_initial,
    };
  },
  computed: {
    assets_list(): AvaAsset[] {
      // return this.$store.getters.walletAssetsArray
      return this.$store.getters["Assets/walletAssetsArray"];
    },
    assets(): AssetsDict {
      // return this.$store.getters.walletAssetsDict
      return this.$store.getters["Assets/walletAssetsDict"];
    },
    showAdd(): boolean {
      if (this.disabled) return false;
      if (
        this.tx_list.length === this.assets_list.length ||
        this.assets_list.length === 0
      ) {
        return false;
      }
      return true;
    },
  },
  watch: {
    assets_list: [
      {
        handler: "onAssetListChange",
      },
    ],
  },
  activated() {
    this.reset();
  },
  deactivated() {
    this.reset();
  },
  methods: {
    updateUnavailable(): void {
      const res: AvaAsset[][] = [];
      const allDisabled = [];

      for (let i = 0; i < this.tx_list.length; i++) {
        const localDisabled: AvaAsset[] = [];

        const tx = this.tx_list[i];
        if (tx) {
          allDisabled.push(tx.asset);
          for (let n = 0; n < this.tx_list.length; n++) {
            if (i === n) continue;

            const assetNow = this.tx_list?.at(n)?.asset;
            if (assetNow) {
              localDisabled.push(assetNow as AvaAsset);
            }
          }
        }
        res.push(localDisabled);
      }

      this.next_initial = null;
      for (let i = 0; i < this.assets_list.length; i++) {
        const asset = this.assets_list[i];
        if (asset && !allDisabled.includes(asset)) {
          this.next_initial = asset;
          break;
        }
      }

      this.disabledAssets = res;
    },
    oninputchange(index: number, event: ICurrencyInputDropdownValue): void {
      const asset = event.asset;
      const amt = event.amount;

      if (!asset) return;

      const tx = this.tx_list[index];
      if (!tx) return;

      tx.asset = asset;
      tx.amount = amt;

      this.updateUnavailable();

      this.$emit("change", this.tx_list);
    },
    removeTx(index: number): void {
      this.tx_list.splice(index, 1);
      this.updateUnavailable();
      this.$emit("change", this.tx_list);
    },
    addTx(id?: string): void {
      if (this.tx_list.length >= this.assets_list.length) {
        return;
      }

      const uuid = uuidv1();

      if (id) {
        this.tx_list.push({
          uuid: uuid,
          asset: this.assets[id],
          amount: new BN(0),
        } as ITransaction);
      } else if (this.next_initial) {
        this.tx_list.push({
          uuid: uuid,
          asset: this.next_initial,
          amount: new BN(0),
        });
      }
      this.$emit("change", this.tx_list);
    },
    clear(): void {
      for (let i = this.tx_list.length - 1; i >= 0; i--) {
        this.removeTx(i);
      }
    },
    addDefaultAsset() {
      this.next_initial = this.assets_list[0] as AvaAsset;
      if (this.$route.query.asset) {
        const assetId = this.$route.query.asset as string;
        this.addTx(assetId);
      } else {
        this.addTx();
      }
    },
    reset() {
      this.clear();
      this.addDefaultAsset();
    },
    onAssetListChange() {
      this.updateUnavailable();
    },
  },
});
export default TxList;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

$right_pad: 60px;

.chain_warn {
  color: var(--primary-color-light);
  font-size: 12px;
  margin: 6px 0 !important;
}

.table_title {
  display: grid;
  grid-template-columns: 1fr 140px;
  padding-right: $right_pad;
}
.table_title p {
  display: block;
  text-align: left;
  font-size: 14px;
  font-weight: bold;
  padding: 12px 0;
  color: var(--tertiary-color);

  &:last-of-type {
    text-align: right;
  }
}
.table_title p:first-of-type {
  flex-grow: 1;
}

.list_item {
  position: relative;
  display: grid;
  grid-template-columns: 1fr $right_pad;
  /*flex-direction: column;*/
  margin-bottom: 14px;
  border-radius: 3px !important;

  &:last-of-type {
    margin-bottom: 0px;
  }

  .remove_but {
    height: 20px;
    opacity: 0.6;
    justify-self: center;

    &:hover {
      opacity: 1;
    }
    img {
      height: 100%;
      object-fit: contain;
    }
  }
}

.list_in {
  flex-grow: 1;
}

.list_item button {
  width: max-content;
  text-align: right;
  /*align-self: flex-end;*/
  font-size: 12px;
  color: var(--primary-color-light);
  margin-top: 10px;
  margin-bottom: 10px;

  &:hover {
    opacity: 0.7;
  }
}

.add_asset {
  width: calc(100% - #{$right_pad});
  border: 1px dashed var(--primary-color-light);
  margin-top: 10px;
  padding: 8px;
  border-radius: 0;
  color: var(--primary-color-light);
  font-size: 14px;
  opacity: 0.3;
  transition-duration: 0.2s;

  &:hover {
    opacity: 1;
    color: var(--primary-color);
  }
}

/*.list_item:before{*/
/*    content: '';*/
/*    position: absolute;*/
/*    height: 100%;*/
/*    width: 11px;*/
/*    border-right: 1px dashed #d2d2d2;*/
/*    opacity: 0.4;*/
/*}*/

.list_item[empty] button {
  opacity: 0.8;
}
.list_item[empty] .list_in,
.list_item[empty]:before {
  opacity: 0.1;
  transition-duration: 0.2s;
}
.list_item[empty] button:hover {
  opacity: 1;
}
.list_item[empty] .list_in {
  pointer-events: none;
}

@include mixins.mobile-device {
  .list_item {
    column-gap: 12px;
    grid-template-columns: 1fr max-content;
  }

  .add_asset {
    width: 100%;
  }
}
</style>
