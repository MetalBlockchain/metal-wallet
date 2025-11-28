<template>
  <div class="access_card">
    <div class="content">
      <h1>Private Key</h1>
      <form @submit.prevent="access">
        <v-text-field
          v-model="privatekey"
          class="pass"
          dense
          flat
          hide-details
          label="Private Key"
          solo
          type="password"
        ></v-text-field>
        <p class="err">{{ error }}</p>
        <v-btn
          class="ava_button button_secondary"
          depressed
          :disabled="!canSubmit"
          :loading="isLoading"
          @click="access"
        >
          Access Wallet
        </v-btn>
      </form>
      <router-link class="link" to="/access">Cancel</router-link>
    </div>
  </div>
</template>
<script lang="ts">
import { strip0x } from "@metalblockchain/metal-wallet-sdk";
import { defineComponent } from "vue";

export const PrivateKey = defineComponent({
  data() {
    return {
      privatekey: "",
      isLoading: false,
      error: "",
    };
  },
  computed: {
    canSubmit(): boolean {
      if (!this.privatekey) {
        return false;
      }
      return true;
    },
  },
  methods: {
    async access() {
      if (!this.canSubmit || this.isLoading) return;
      this.error = "";
      this.isLoading = true;
      const key = strip0x(this.privatekey);

      try {
        await this.$store.dispatch("accessWalletSingleton", key);
        this.onsuccess();
      } catch {
        this.onerror("Invalid Private Key.");
      }
    },
    onsuccess() {
      this.isLoading = false;
      this.privatekey = "";
    },
    onerror(e: any) {
      this.error = e;
      this.privatekey = "";
      this.isLoading = false;
    },
  },
});
export default PrivateKey;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";
@use "@/styles/abstracts/mixins";
.pass {
  // background-color: var(--gray50) !important;
  // margin-bottom: 10px;
}
.ava_button {
  width: 100%;
  margin-bottom: 22px;
}
.access_card {
  /*max-width: 80vw;*/
  padding: vars.$container-padding;
  width: 100%;
  /*max-width: 240px;*/
  /*max-width: 1000px;*/
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 6px;
}

.content {
  width: 340px;
  max-width: 100%;
  margin: 0px auto;
}

h1 {
  font-size: vars.$m-size;
  font-weight: 700;
  color: var(--tertiary-color);
  margin-bottom: 30px;
}

.file_in {
  margin: 30px auto 10px;
  font-size: 13px;
  border: none !important;
  background-color: var(--bg) !important;
}

a {
  text-decoration: underline !important;
  margin: 10px 0 20px;
}

.link {
  color: var(--secondary-color);
}

.remember {
  margin: 12px 0;
}

.err {
  font-size: 13px;
  color: var(--error);
  margin: 14px 0px !important;
}

@include mixins.mobile-device {
  h1 {
    font-size: vars.$m-size-mobile;
  }
  .but_primary {
    width: 100%;
  }
}
</style>
