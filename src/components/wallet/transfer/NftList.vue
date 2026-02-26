<template>
  <div v-if="!isEmpty">
    <AvmNftSelectModal
      ref="select_modal"
      :disabled-ids="usedNftIds"
      @select="addNft"
    ></AvmNftSelectModal>
    <div class="added_list">
      <NftListItem
        v-for="utxo in addedNfts"
        :key="utxo.getUTXOID()"
        class="nft_icon"
        :disabled="disabled"
        :sample="utxo"
        @change="setGroupUtxos"
        @remove="remove"
      ></NftListItem>
      <div class="nft_icon card nft_add">
        <button v-if="!disabled" class="add_but" @click="showPopup">
          <fa icon="plus"></fa>
          <br />
          Add Collectible
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type {
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type {
  IGroupDict,
  IGroupQuantity,
} from "@/components/wallet/studio/mint/types";
import type { IWalletNftDict } from "@/stores/types";

import type { NftFamilyDict } from "@/stores/types/assets";
import { defineComponent, ref } from "vue";
import AvmNftSelectModal from "@/components/modals/AvmNftSelectModal.vue";
import NftListItem from "@/components/wallet/transfer/NftListItem.vue";
import { getPayloadFromUTXO } from "@/helpers/helper";
import { bintools } from "@/misc/AVA";

export const NftList = defineComponent({
  components: {
    AvmNftSelectModal,
    NftListItem,
  },
  props: {
    disabled: { default: false, type: Boolean },
  },
  emits: ["change"],
  setup() {
    const addedNfts = ref<UTXO[]>();
    const groupUtxos = ref<IGroupDict>();
    return {
      addedNfts,
      groupUtxos,
    };
  },
  computed: {
    payloads() {
      return (
        this.addedNfts?.map((utxo) => {
          return getPayloadFromUTXO(utxo);
        }) ?? []
      );
    },
    isEmpty(): boolean {
      return this.nftUTXOs.length === 0;
    },
    nftUTXOs(): UTXO[] {
      return this.$store.state.Assets.nftUTXOs;
    },
    nftDict(): IWalletNftDict {
      // return this.$store.getters.walletNftDict
      return this.$store.getters["Assets/walletNftDict"];
    },
    nftFamsDict(): NftFamilyDict {
      return this.$store.state.Assets.nftFamsDict;
    },
    usedNftIds() {
      return (
        this.addedNfts?.map((utxo) => {
          return utxo.getUTXOID();
        }) ?? []
      );
    },
  },
  activated() {},
  deactivated() {
    this.clear();
  },
  methods: {
    setGroupUtxos(val: IGroupQuantity) {
      if (this.groupUtxos) {
        this.groupUtxos[val.id] = val.utxos;
        this.emit();
      }
    },
    emit() {
      const utxos = [];

      for (const id in this.groupUtxos) {
        const gUtxos = this.groupUtxos[id];
        if (gUtxos) {
          utxos.push(...gUtxos);
        }
      }

      this.$emit("change", utxos);
    },
    clear() {
      this.addedNfts = [];
      this.groupUtxos = {};
      this.emit();
    },
    addNft(utxo: UTXO) {
      this.addedNfts?.push(utxo);
    },
    remove(utxo: UTXO) {
      const famId = bintools.cb58Encode(utxo.getAssetID());
      const groupId = (utxo.getOutput() as NFTTransferOutput).getGroupID();

      // Clear from selected utxos list
      const dictId = `${famId}_${groupId}`;
      if (this.groupUtxos) {
        delete this.groupUtxos[dictId];
      }

      const utxos = this.addedNfts ?? [];
      for (const [i, utxo_] of utxos.entries()) {
        if (utxo_.getUTXOID() === utxo.getUTXOID()) {
          this.addedNfts?.splice(i, 1);
        }
      }

      this.emit();
    },
    showPopup() {
      (this.$refs.select_modal as typeof AvmNftSelectModal).open();
    },
  },
});
export default NftList;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/mixins";

$nft_w: 90px;

.added_list {
  display: flex;
  flex-wrap: wrap;
}
.nft_icon {
  flex-shrink: 0;
  flex-grow: 0;
  position: relative;
  width: $nft_w;
  height: $nft_w;
  background-color: var(--bg-light);
  border-radius: 3px;
  margin: 4px;
  margin-bottom: 50px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:first-of-type {
    margin-left: 0;
  }
}

.nft_add {
  background-color: transparent;
  box-shadow: none !important;
}
.add_but {
  height: 100%;
  width: 100%;
  padding: 14px;
  border: 1px dashed var(--primary-color-light);
  cursor: pointer;
  font-size: 12px;
  opacity: 0.5;
  text-align: center;
  transition-duration: 0.2s;

  &:hover {
    opacity: 1;
  }
}

@include mixins.mobile-device {
  .added_list {
    display: grid;
    grid-gap: 12px;
    row-gap: 22px;
    grid-template-columns: repeat(4, 1fr);
  }

  .nft_icon {
    width: 100%;
    padding-top: 100%;
    position: relative;
    height: 0;
    margin: 0;
  }

  .add_but {
    position: absolute;
    top: 0;
  }
}
</style>
