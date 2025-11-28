<template>
  <div class="new_family">
    <div>
      <p>{{ $t("studio.family.desc") }}</p>
      <form v-if="!isSuccess" @submit.prevent="submit">
        <div style="display: flex">
          <div style="flex-grow: 1">
            <label>{{ $t("studio.family.label1") }}</label>
            <input
              v-model="name"
              maxlength="128"
              placeholder="Name"
              style="width: 100%"
              type="text"
            />
          </div>
          <div class="symbol">
            <label>{{ $t("studio.family.label2") }}</label>
            <input
              v-model="symbol"
              max="4"
              maxlength="4"
              placeholder="xxxx"
              type="text"
            />
          </div>
        </div>

        <div>
          <label>{{ $t("studio.family.label3") }}</label>
          <input
            v-model="groupNum"
            max="1024"
            min="1"
            placeholder="Name of the Collection"
            type="number"
          />
        </div>
        <div>
          <p>
            {{ $t("studio.family.fee") }}: {{ txFee.toLocaleString() }} METAL
          </p>
        </div>
        <p v-if="error" class="err">{{ error }}</p>
        <v-btn
          class="button_secondary"
          :loading="isLoading"
          small
          type="submit"
        >
          {{ $t("studio.family.submit") }}
        </v-btn>
      </form>
      <div v-if="isSuccess" class="success_cont">
        <p style="color: var(--success); margin: 12px 0 !important">
          <fa icon="check-circle"></fa>
          {{ $t("studio.family.success.desc") }}
        </p>
        <div>
          <label>{{ $t("studio.family.success.label1") }}</label>
          <p style="word-break: break-all">{{ txId }}</p>
        </div>
        <div>
          <label>{{ $t("studio.family.success.label2") }}</label>
          <p>{{ name }}</p>
        </div>
        <div>
          <label>{{ $t("studio.family.success.label3") }}</label>
          <p>{{ symbol }}</p>
        </div>
        <div>
          <label>{{ $t("studio.family.success.label4") }}</label>
          <p>{{ groupNum }}</p>
        </div>
        <v-btn class="button_secondary" depressed small @click="cancel">
          {{ $t("studio.family.back") }}
        </v-btn>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import type Big from "big.js";
import { defineComponent } from "vue";
import { bnToBig } from "@/helpers/helper";
import { pChain } from "@/misc/AVA";

export const NewCollectibleFamily = defineComponent({
  emits: ["cancel"],
  data() {
    return {
      name: "",
      symbol: "",
      groupNum: 1,
      isLoading: false,
      isSuccess: false,
      error: "",
      txId: "",
    };
  },
  computed: {
    txFee(): Big {
      return bnToBig(pChain.getCreationTxFee(), 9);
    },
    mintUtxos() {
      // return this.$store.getters.walletNftMintUTXOs
      return this.$store.state.Assets.nftMintUTXOs;
    },
  },
  watch: {
    symbol: [
      {
        handler: "onSymbolChange",
      },
    ],
  },
  methods: {
    validate(): boolean {
      if (this.symbol.length === 0) {
        this.error = "You must provide a symbol.";
        return false;
      } else if (this.symbol.length > 4) {
        this.error = "Symbol must be 4 characters max.";
        return false;
      } else if (this.groupNum < 1) {
        this.error = "Number of groups must be at least 1.";
        return false;
      }
      return true;
    },
    async submit() {
      if (!this.validate()) {
        return;
      }
      const wallet = this.$store.state.activeWallet;
      if (!wallet) return;

      this.error = "";
      this.isLoading = true;

      const nameTrimmed = this.name.trim();
      const symbolTrimmed = this.symbol.trim();

      try {
        const txId = await wallet.createNftFamily(
          nameTrimmed,
          symbolTrimmed,
          this.groupNum,
        );
        console.log(txId);
        this.onSuccess(txId);
      } catch (error) {
        this.onError(error);
      }
    },
    cancel() {
      this.$emit("cancel");
    },
    onError(e: any) {
      this.error = e;
      console.error(e);
      this.isLoading = false;
    },
    onSuccess(txId: string) {
      this.isLoading = false;
      this.isSuccess = true;
      this.txId = txId;

      this.$store.dispatch("Notifications/add", {
        type: "success",
        title: "Success",
        message: "Collectible family created.",
      });

      setTimeout(() => {
        this.$store.dispatch("Assets/updateUTXOs");
        this.$store.dispatch("History/updateTransactionHistory");
      }, 3000);
    },
    onSymbolChange(val: string) {
      let newVal = val.toUpperCase();
      // Remove numbers
      newVal = newVal.replace(/[0-9]/g, "");
      this.symbol = newVal;
    },
  },
});
export default NewCollectibleFamily;
</script>
<style scoped lang="scss">
.new_family {
  max-width: 100%;
  width: 340px;
  //display: grid;
  //grid-template-columns: 1fr 350px;
}
form > div {
  margin: 12px 0;
}

label {
  margin-top: 6px;
  color: var(--primary-color-light);
  font-size: 14px;
  margin-bottom: 3px;
}

input {
  display: block;
  background-color: var(--bg-light);
  color: var(--primary-color);
  padding: 6px 14px;
  font-size: 13px;
}

.symbol {
  margin-left: 12px;
  > input {
    width: 60px;
    text-align: center;
  }
}

.groups {
  //display: grid;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  //grid-template-columns: repeat(5, 1fr);

  > div {
    margin: 4px;
    background-color: var(--bg-light);
    width: 45px;
    height: 45px;
  }
}

.success_cont {
  > div {
    padding: 3px 12px;
    margin-bottom: 5px;
    background-color: var(--bg-light);
  }

  .v-btn {
    margin-top: 12px;
  }
}
</style>
