<template>
  <div class="mint_form">
    <div class="cols">
      <div class="utxo_col">
        <div class="utxo">
          <div>
            <v-btn block text @click="clearUtxo">
              {{ $t("studio.mint.utxo_col.change") }}
            </v-btn>
            <div
              v-if="groupUtxos.length > 0"
              style="height: 110px; margin-top: 22px"
            >
              <NftFamilyCardsPreview
                :max="maxPreviewUtxoLen"
                :spread="isSuccess"
                :utxos="groupUtxos"
              ></NftFamilyCardsPreview>
            </div>
            <div v-else class="empty_card">
              <p><fa icon="plus"></fa></p>
            </div>
          </div>
          <div>
            <div>
              <label>{{ $t("studio.mint.utxo_col.label1") }}</label>
              <p>{{ family?.name }}</p>
            </div>
            <div>
              <label>{{ $t("studio.mint.utxo_col.label2") }}</label>
              <p>{{ family?.symbol }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="type_col">
        <div class="type_sel">
          <label>{{ $t("studio.mint.type_col.label1") }}</label>
          <p>{{ $t("studio.mint.type_col.desc") }}</p>
          <v-chip-group v-model="nftFormType" mandatory>
            <v-chip :disabled="isSuccess" value="generic">
              {{ $t("studio.mint.type_col.types.generic") }}
            </v-chip>
            <v-chip :disabled="isSuccess" value="custom">
              {{ $t("studio.mint.type_col.types.custom") }}
            </v-chip>
          </v-chip-group>

          <template v-if="nftFormType === 'custom'">
            <label>{{ $t("studio.mint.type_col.label2") }}</label>
            <v-chip-group v-model="nftType" mandatory>
              <v-chip :disabled="isSuccess" value="utf8">UTF-8</v-chip>
              <v-chip :disabled="isSuccess" value="url">URL</v-chip>
              <v-chip :disabled="isSuccess" value="json">JSON</v-chip>
            </v-chip-group>
          </template>
        </div>
        <p>
          {{ typeDescription }}
        </p>
      </div>
      <div class="form_col">
        <div class="form_cont">
          <Component
            :is="formComponent"
            v-if="nftFormType === 'custom'"
            @on-input="onInput"
          ></Component>
          <GenericForm v-else @on-input="onInput"></GenericForm>
        </div>
        <div>
          <label>{{ $t("studio.mint.form_col.label1") }}</label>
          <input v-model="quantity" min="1" style="width: 100%" type="number" />
        </div>
        <div class="fee">
          <p>
            {{ $t("studio.mint.form_col.fee") }}
            <span>{{ txFee.toLocaleString() }} METAL</span>
          </p>
        </div>
        <v-btn
          v-if="!isSuccess"
          block
          class="button_primary"
          :disabled="!canSubmit"
          :loading="isLoading"
          style="margin: 14px 0"
          @click="submit"
        >
          {{ $t("studio.mint.form_col.submit") }}
        </v-btn>
      </div>

      <div class="right_col">
        <div class="preview">
          <label>{{ $t("studio.mint.preview.label1") }}</label>
          <div v-if="payloadPreview" class="payload_view_cont">
            <NftCard :group-i-d="groupId" :payload="payloadPreview"></NftCard>
          </div>
          <div v-else class="nft_preview preview_holder">
            <p>{{ $t("studio.mint.preview.info1") }}</p>
          </div>
        </div>
        <template v-if="isSuccess">
          <div class="success_cont">
            <p style="color: var(--success)">
              <fa icon="check-circle"></fa>
              {{ $t("studio.mint.preview.success.text1") }}
              <br />
              {{ $t("studio.mint.preview.success.text2") }}
            </p>
            <div>
              <label>{{ $t("studio.mint.preview.success.label1") }}</label>
              <p style="word-break: break-all">{{ txId }}</p>
            </div>
            <v-btn class="button_secondary" depressed small @click="clearUtxo">
              {{ $t("studio.mint.preview.success.back") }}
            </v-btn>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type {
  NFTMintOutput,
  NFTTransferOutput,
  UTXO,
} from "@metalblockchain/metaljs/dist/apis/avm";
import type { PayloadBase } from "@metalblockchain/metaljs/dist/utils";
import type Big from "big.js";
import type { PropType } from "vue";
import type {
  GenericFormType,
  JsonFormType,
  NftMintFormType,
  UrlFormType,
  UtfFormType,
} from "@/components/wallet/studio/mint/types";
import type { NftFamilyDict } from "@/stores/vuex/modules/assets/types";

import {
  JSONPayload,
  URLPayload,
  UTF8Payload,
} from "@metalblockchain/metaljs/dist/utils";
import { defineComponent, ref } from "vue";
import NftFamilyCardsPreview from "@/components/misc/NftFamilyCardsPreview.vue";
import NftPayloadView from "@/components/misc/NftPayloadView/NftPayloadView.vue";
import NftCard from "@/components/wallet/portfolio/NftCard.vue";
import GenericForm from "@/components/wallet/studio/mint/forms/GenericForm.vue";
import JsonForm from "@/components/wallet/studio/mint/forms/JsonForm.vue";
import UrlForm from "@/components/wallet/studio/mint/forms/UrlForm.vue";
import Utf8Form from "@/components/wallet/studio/mint/forms/Utf8Form.vue";
import SelectMintUTXO from "@/components/wallet/studio/mint/SelectMintUtxo/SelectMintUTXO.vue";
import { bnToBig } from "@/helpers/helper";
import { avm, bintools } from "@/misc/AVA";

type NftType = "utf8" | "url" | "json";

export const MintNft = defineComponent({
  components: {
    NftCard,
    NftFamilyCardsPreview,
    GenericForm,
    SelectMintUTXO,
    UrlForm,
    NftPayloadView,
    Utf8Form,
    JsonForm,
  },
  props: {
    mintUtxo: {
      type: Object as PropType<UTXO>,
    },
  },
  emits: ["clear-utxo", "cancel"],
  setup() {
    const quantity = ref(1);
    const nftType = ref<NftType>("url");
    const nftFormType = ref("generic");
    const payloadPreview = ref<PayloadBase>();

    const canSubmit = ref(false);
    const isSuccess = ref(false);
    const isLoading = ref(false);
    const txId = ref("");
    const maxPreviewUtxoLen = ref(18);

    return {
      quantity,
      nftType,
      nftFormType,
      payloadPreview,
      canSubmit,
      isSuccess,
      isLoading,
      txId,
      maxPreviewUtxoLen,
    };
  },
  computed: {
    typeDescription() {
      if (this.nftFormType === "generic") {
        return this.$t("studio.mint.type_col.typeDesc.generic");
      }

      if (this.nftType === "url") {
        return this.$t("studio.mint.type_col.typeDesc.url");
      } else if (this.nftType === "json") {
        return this.$t("studio.mint.type_col.typeDesc.json");
      } else {
        return this.$t("studio.mint.type_col.typeDesc.utf8");
      }
    },
    nftFamsDict(): NftFamilyDict {
      return this.$store.state.Assets.nftFamsDict;
    },
    family() {
      const idBuff = this.mintUtxo?.getAssetID();
      if (!idBuff) return undefined;
      const id = bintools.cb58Encode(idBuff);
      return this.nftFamsDict[id];
    },
    groupId() {
      if (!this.mintUtxo) return undefined;
      return (this.mintUtxo.getOutput() as NFTMintOutput).getGroupID();
    },
    formComponent() {
      switch (this.nftType) {
        case "utf8": {
          return Utf8Form;
        }
        case "url": {
          return UrlForm;
        }
        case "json": {
          return JsonForm;
        }
        default: {
          return Utf8Form;
        }
      }
    },
    payloadContent() {
      if (!this.payloadPreview) return null;
      return this.payloadPreview.getContent().toString();
    },
    nftTitle() {
      try {
        const json = JSON.parse(this.payloadContent || "");
        return json.avalanche.title;
      } catch {
        return "";
      }
    },
    nftDesc() {
      try {
        const json = JSON.parse(this.payloadContent || "");
        return json.avalanche.desc;
      } catch {
        return "";
      }
    },
    txFee(): Big {
      return bnToBig(avm.getTxFee(), 9);
    },
    familyUtxos(): UTXO[] {
      const dict = this.$store.getters["Assets/walletNftDict"];
      // return this.$store.getters.walletNftDict[this.family.id] || []
      return this.family ? dict[this.family.id] || [] : [];
    },
    groupUtxos() {
      const utxos = this.familyUtxos;
      const ids: number[] = [];

      const filtered = utxos.filter((utxo) => {
        const groupId = (utxo.getOutput() as NFTTransferOutput).getGroupID();

        if (ids.includes(groupId)) {
          return false;
        } else {
          ids.push(groupId);
          return true;
        }
      });

      // order by group id
      filtered.sort((a, b) => {
        const gA = (a.getOutput() as NFTTransferOutput).getGroupID();
        const gB = (b.getOutput() as NFTTransferOutput).getGroupID();
        return gA - gB;
      });

      return filtered.slice(0, this.maxPreviewUtxoLen);
    },
  },
  methods: {
    clearUtxo() {
      this.$emit("clear-utxo");
    },
    onInput(form: NftMintFormType | null) {
      if (form === null) {
        this.payloadPreview = undefined;
        this.canSubmit = false;
        return;
      }

      try {
        let payload;
        if (this.nftFormType === "generic") {
          // let dataStr = JSON.stringify((form as GenericFormType).data)
          // payload = new JSONPayload(dataStr)
          payload = new JSONPayload((form as GenericFormType).data);
        } else {
          switch (this.nftType) {
            case "url": {
              payload = new URLPayload((form as UrlFormType).url);
              break;
            }
            case "json": {
              payload = new JSONPayload((form as JsonFormType).data);
              break;
            }
            case "utf8": {
              payload = new UTF8Payload((form as UtfFormType).text);
              break;
            }
            default: {
              payload = new UTF8Payload("hi there");
              break;
            }
          }
        }

        this.payloadPreview = payload;
        this.canSubmit = true;
      } catch (error) {
        console.error(error);
      }
    },
    async submit() {
      const wallet = this.$store.state.activeWallet;
      if (!wallet) return;

      this.isLoading = true;

      try {
        const txId = await wallet.mintNft(
          this.mintUtxo,
          this.payloadPreview,
          this.quantity,
        );
        this.onSuccess(txId);
      } catch (error) {
        console.error(error);
      }
    },
    cancel() {
      this.$emit("cancel");
    },
    onSuccess(txId: string) {
      this.isLoading = false;
      this.isSuccess = true;
      this.txId = txId;

      this.$store.dispatch("Notifications/add", {
        type: "success",
        title: "Success",
        message: "Collectible minted and added to your wallet.",
      });

      setTimeout(() => {
        this.$store.dispatch("Assets/updateUTXOs");
        this.$store.dispatch("History/updateTransactionHistory");
      }, 2000);
    },
    onError(_: any) {
      this.isLoading = false;
    },
  },
});
export default MintNft;
</script>
<style lang="scss">
.mint_form {
  label {
    margin-top: 6px;
    color: var(--primary-color);
    font-size: 14px;
    margin-bottom: 3px;
  }

  p {
    color: var(--primary-color-light);
  }

  input,
  textarea {
    background-color: var(--bg-light);
    padding: 8px 12px;
    display: block;
    font-size: 14px;
    color: var(--primary-color);
  }

  textarea {
    resize: none;
  }

  .type_col {
    display: flex;
    flex-direction: column;

    > p {
      margin-top: 30px !important;
      font-size: 14px;
    }
  }
}
</style>
<style lang="scss" scoped>
@use "@/styles/abstracts/mixins";

.mint_form {
  padding: 10px 0;
}

.options {
  display: flex;

  > div {
    //width: 130px;
    display: flex;
    flex-direction: column;
    margin-right: 12px;
    border: 2px solid var(--bg-light);
    border-radius: 14px;
    padding: 24px 12px;
    text-align: center;
    color: var(--primary-color-light);
    align-items: center;

    &[selected] {
      background-color: var(--bg-light);
    }
    .option_title {
      font-size: 13px;
      font-weight: bold;
    }
    .option_desc {
      font-size: 12px;
    }
  }
}
.utxo {
  display: flex;
  flex-direction: column;
  position: relative;
  height: max-content;

  button {
    //position: absolute;
    font-size: 13px;
    //right: 12px;
    //top: 6px;
    color: var(--secondary-color);
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }
}

$col_pad: 24px;
.cols {
  display: grid;
  grid-template-columns: max-content 1fr 340px 1fr;
  column-gap: $col_pad;
  > div {
    padding-left: $col_pad;
    padding-right: $col_pad;
    border-right: 1px solid var(--bg-light);
  }
}

.right_col {
  display: flex;
  flex-direction: column;
  align-items: center;
  border: none !important;
}

.nft_preview {
  width: 220px;
  max-height: 320px;
  overflow: scroll;

  box-shadow: 1px 1px 4px rgba(0, 0, 0, 0.1);
}
.preview_holder {
  border-color: var(--primary-color-light);
  min-height: 240px;
  text-align: center;
  display: flex;
  padding: 14px;
  border: 1px dashed var(--primary-color);

  p {
    align-self: center;
    font-size: 13px;
    color: var(--primary-color-light);
  }
}
.fee {
  margin-top: 14px;
  font-size: 13px;
  p > span {
    margin-left: 35px;
  }
}

.form_col {
  padding-right: 2vw;
  //border: none !important;
}

.form_cont {
  margin-bottom: 30px;
}
.success_cont {
  max-width: 100%;
  margin: 24px 0;
  text-align: center;
  > div {
    //background-color: var(--bg-light);
    padding: 3px 12px;
    margin: 12px 0;
  }
}

.empty_card {
  width: 50px;
  height: 70px;
  margin: 12px auto;
  background-color: transparent;
  display: flex;
  justify-self: center;
  align-items: center;
  justify-content: center;
  color: var(--primary-color-light);
  border: 2px dashed var(--primary-color-light);
}

.payload_view_cont {
  min-height: 260px;
  width: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

@include mixins.medium-device {
  .cols {
    grid-template-columns: 1fr 1fr;
    row-gap: 24px;
    > div {
      border: none;
      padding: 0;
    }
  }

  .utxo {
    display: grid;
    column-gap: 22px;
    grid-template-columns: max-content 1fr;
  }
}
</style>
