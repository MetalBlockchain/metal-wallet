<template>
  <div>
    <h2>{{ $t("advanced.verify.title") }}</h2>
    <p
      style="margin-bottom: 14px !important; font-size: 14px; font-weight: 500"
    >
      {{ $t("advanced.verify.desc") }}
    </p>
    <div>
      <label>{{ $t("advanced.verify.label1") }}</label>
      <textarea v-model="message"></textarea>
    </div>
    <div>
      <label>{{ $t("advanced.verify.label2") }}</label>
      <textarea v-model="signature"></textarea>
    </div>
    <p class="err">{{ error }}</p>
    <v-btn
      block
      class="button_secondary"
      depressed
      :disabled="!canSubmit"
      small
      @click="verify"
    >
      {{ $t("advanced.verify.submit") }}
    </v-btn>
    <div v-if="addressX" class="result">
      <label>{{ $t("advanced.verify.label3") }}</label>
      <p class="address">{{ addressX }}</p>
      <p class="address">{{ addressP }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Buffer } from "@metalblockchain/metaljs";
import { KeyPair } from "@metalblockchain/metaljs/dist/apis/avm";
import { getPreferredHRP } from "@metalblockchain/metaljs/dist/utils";
import { defineComponent } from "vue";
import { digestMessage } from "@/helpers/helper";
import { ava, bintools } from "@/misc/AVA";

export default defineComponent({
  data() {
    return {
      message: "",
      addressX: "",
      addressP: "",
      signature: "",
      error: "",
    };
  },
  computed: {
    canSubmit() {
      if (!this.message || !this.signature) return false;

      return true;
    },
  },
  deactivated() {
    this.clear();
  },
  methods: {
    submit() {
      this.addressX = "";
      this.addressP = "";
      this.error = "";
      try {
        this.verify();
      } catch (error: any) {
        this.error = error;
      }
    },
    verify() {
      const digest = digestMessage(this.message);
      const digestBuff = Buffer.from(digest.toString("hex"), "hex");

      const networkId = ava.getNetworkID();

      const hrp = getPreferredHRP(networkId);
      const keypair = new KeyPair(hrp, "X");

      const signedBuff = bintools.cb58Decode(this.signature);

      const pubKey = keypair.recover(digestBuff, signedBuff);
      const addressBuff = KeyPair.addressFromPublicKey(pubKey);
      this.addressX = bintools.addressToString(hrp, "X", addressBuff);
      this.addressP = bintools.addressToString(hrp, "P", addressBuff);
    },
    clear() {
      this.message = "";
      this.signature = "";
      this.addressX = "";
      this.addressP = "";
      this.error = "";
    },
  },
});
</script>
<style lang="scss" scoped>
h2 {
  font-size: 20px;
  font-weight: 500;
  color: var(--tertiary-color);
  margin-bottom: 16px;
}
textarea,
input,
.address {
  padding: 6px 12px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  font-size: 13px;
}

label {
  display: block;
  text-align: left;
  color: var(--primary-color-light);
  font-size: 12px;
  margin-bottom: 20px;
  margin-top: 6px;
}

textarea {
  width: 100%;
  resize: none;
  padding: 6px 12px;
  height: 80px;
}

.result {
  margin-top: 6px;
}

.address {
  margin-bottom: 1px !important;
  word-break: break-all;
}
</style>
