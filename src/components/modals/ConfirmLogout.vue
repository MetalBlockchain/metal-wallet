<template>
  <modal
    ref="modal"
    :can-close="false"
    class="modal_main"
    title="Confirm Logout"
  >
    <div class="confirm_body">
      <p style="text-align: center">
        {{ $t("logout.confirmation") }}
      </p>

      <div
        style="
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 14px;
        "
      >
        <v-btn
          class="ava_button button_secondary"
          :loading="isLoading"
          @click="submit"
        >
          {{ $t("logout.button_conf") }}
        </v-btn>
        <button class="ava_button_secondary" @click="close">
          {{ $t("logout.button_cancel") }}
        </button>
      </div>
    </div>
  </modal>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";

export const ConfirmLogout = defineComponent({
  components: {
    Modal,
  },
  props: {
    phrase: { default: "", type: String },
  },
  data() {
    return {
      isLoading: false,
    };
  },
  methods: {
    open(): void {
      const modal = this.$refs.modal as typeof Modal;
      modal.open();
    },
    close(): void {
      const modal = this.$refs.modal as typeof Modal;
      modal.close();
    },
    async submit() {
      this.isLoading = true;

      await this.$store.dispatch("logout");
      await this.$store.dispatch("Notifications/add", {
        title: "Logout",
        message: "You have successfully logged out of your wallet.",
      });
      this.isLoading = false;
      this.close();
    },
  },
});
export default ConfirmLogout;
</script>
<style scoped lang="scss">
.confirm_body {
  width: 400px;
  max-width: 100%;
  padding: 30px;
}
</style>
