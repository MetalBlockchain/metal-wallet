<template>
  <Modal
    ref="modal"
    :can-close="false"
    :title="$t('modal.activateWallet.title')"
  >
    <div class="remember_modal">
      <p>{{ $t("modal.activateWallet.desc") }}</p>
      <form autocomplete="off" @submit.prevent="onsubmit">
        <input
          v-model="password"
          class="password"
          placeholder="Password"
          type="password"
        />
        <p class="err">{{ err }}</p>
        <v-btn
          class="ava_button button_primary submit"
          depressed
          :loading="isLoading"
          type="submit"
        >
          {{ $t("modal.activateWallet.submit") }}
        </v-btn>
        <button class="cancel_but ava_button_secondary" @click="cancel">
          {{ $t("modal.activateWallet.cancel") }}
          <br />
          {{ $t("modal.activateWallet.cancel2") }}
        </button>
      </form>
    </div>
  </Modal>
</template>
<script lang="ts">
import type { AllKeyFileDecryptedTypes, AllKeyFileTypes } from "@/js/IKeystore";
import type { SaveAccountInput } from "@/stores/vuex/types";
import { defineComponent } from "vue";
import { extractKeysFromDecryptedFile, readKeyFile } from "@/js/Keystore";
import Modal from "../Modal.vue";

export const UpgradeToAccountModal = defineComponent({
  components: { Modal },
  data() {
    return {
      password: "",
      isLoading: false,
      err: "",
    };
  },
  watch: {
    "$store.state.isAuth": [
      {
        handler: "onauthchange",
      },
    ],
  },
  mounted() {
    this.openIfValid();
  },
  methods: {
    openIfValid() {
      const w = localStorage.getItem("w");
      if (w) {
        this.open();
      }
    },
    async onsubmit() {
      this.isLoading = true;
      this.err = "";
      const w = localStorage.getItem("w");
      if (!w) return;
      const pass = this.password;
      const fileData: AllKeyFileTypes = JSON.parse(w);
      try {
        const keyFile: AllKeyFileDecryptedTypes = await readKeyFile(
          fileData,
          pass,
        );
        this.isLoading = false;
        const accessInput = extractKeysFromDecryptedFile(keyFile);
        await this.$store.dispatch("accessWalletMultiple", {
          keys: accessInput,
          activeIndex: keyFile.activeIndex,
        });

        // If they are using an old keystore version upgrade to a new one
        // if (keyFile.version !== KEYSTORE_VERSION) {
        //     let wallets = this.$store.state.wallets as MnemonicWallet[]
        //     let wallet = this.$store.state.activeWallet as
        //         | MnemonicWallet
        //         | SingletonWallet
        //         | null
        //     if (!wallet) throw new Error('No active wallet.')
        //     let activeIndex = wallets.findIndex((w) => w.id == wallet!.id)
        //     let file = await makeKeyfile(wallets, pass, activeIndex)
        //     let fileString = JSON.stringify(file)
        //     localStorage.setItem('w', fileString)
        // }

        // Save the wallets to an account using the same password
        const accountIn: SaveAccountInput = {
          password: pass,
          accountName: "Account 1",
        };
        await this.$store.dispatch("Accounts/saveAccount", accountIn);

        // Wont be using this anymore
        localStorage.removeItem("w");

        // These are not volatile wallets since they are loaded from storage
        this.$store.state.volatileWallets = [];
        this.password = "";
        this.close();
      } catch (error) {
        this.isLoading = false;
        this.err =
          error === "INVALID_PASS"
            ? (this.$t("modal.activateWallet.err1") as string)
            : (this.$t("modal.activateWallet.err2") as string);
        return;
      }
    },
    cancel() {
      localStorage.removeItem("w");
      this.close();
    },
    close() {
      //@ts-ignore
      this.$refs.modal.close();
    },
    open() {
      //@ts-ignore
      this.$refs.modal.open();
    },
    onauthchange(val: boolean) {
      if (!val) {
        this.openIfValid();
      }
    },
  },
});
export default UpgradeToAccountModal;
</script>
<style scoped lang="scss">
.remember_modal {
  padding: 30px;
}
form {
  display: flex;
  flex-direction: column;
  > * {
    margin: 6px 0px;
  }
}
.cancel_but {
  color: var(--primary-color-light);
  font-size: 0.8rem !important;
  text-transform: none !important;
}
.password {
  background-color: var(--bg-light);
  color: var(--primary-color);
  padding: 6px 14px;
}
.submit {
  margin-top: 30px;
}
.err {
  color: var(--error);
}
</style>
