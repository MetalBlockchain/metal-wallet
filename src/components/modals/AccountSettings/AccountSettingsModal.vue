<template>
  <modal
    ref="modal"
    class="modal_main"
    title="Account Settings"
    @before-close="clear"
  >
    <div class="modal_body">
      <div class="header">
        <template v-if="account">
          <!-- <Identicon :value="account.baseAddresses.join('')"></Identicon> -->
          <p style="text-align: center">{{ account.name }}</p>
        </template>

        <p class="err small" style="text-align: center">
          Clearing your browser cache will remove this account. Make sure you
          have your
          <b>mnemonic phrase</b>
          or
          <b>private key</b>
          saved.
        </p>
      </div>

      <div v-if="!subComponent" class="options">
        <button
          v-if="hasVolatile"
          class="ava_button"
          style="color: var(--warning)"
          @click="saveKeys"
        >
          <fa icon="exclamation-triangle"></fa>
          Save Keys
        </button>
        <button class="ava_button" @click="changePassword">
          Change Password
        </button>
        <button class="ava_button" @click="deleteAccount">
          Delete Account
        </button>
      </div>
      <template v-else>
        <component :is="subComponent" v-if="subComponent"></component>
        <button @click="clear">Cancel</button>
      </template>
    </div>
  </modal>
</template>
<script lang="ts">
import type { iUserAccountEncrypted } from "@/stores/vuex/types";
import { defineComponent } from "vue";
import Identicon from "@/components/misc/Identicon.vue";
import ChangePassword from "@/components/modals/AccountSettings/ChangePassword.vue";
import DeleteAccount from "@/components/modals/AccountSettings/DeleteAccount.vue";
import SaveKeys from "@/components/modals/AccountSettings/SaveKeys.vue";
import Modal from "@/components/modals/Modal.vue";

export const AccountSettingsModal = defineComponent({
  components: {
    ChangePassword,
    Identicon,
    Modal,
  },
  data() {
    const subComponent: any = null;

    return {
      subComponent,
    };
  },
  computed: {
    account(): iUserAccountEncrypted | undefined {
      return this.$store.getters["Accounts/account"];
    },
    hasVolatile() {
      return this.$store.state.volatileWallets.length > 0;
    },
  },
  methods: {
    open() {
      (this.$refs.modal as typeof Modal).open();
    },
    close() {
      (this.$refs.modal as typeof Modal).close();
    },
    clear() {
      this.subComponent = null;
    },
    changePassword() {
      this.subComponent = ChangePassword;
    },
    deleteAccount() {
      this.subComponent = DeleteAccount;
    },
    saveKeys() {
      this.subComponent = SaveKeys;
    },
  },
});
export default AccountSettingsModal;
</script>

<style scoped lang="scss">
.modal_body {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 320px;
  max-width: 100%;
  padding: 20px 30px;
  color: var(--primary-color);
}

.header {
  margin-bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.options {
  display: flex;
  flex-direction: column;

  button {
    padding: 20px 30px;
    width: 100%;
    border-top: 1px solid var(--bg-light);
  }
}
</style>
