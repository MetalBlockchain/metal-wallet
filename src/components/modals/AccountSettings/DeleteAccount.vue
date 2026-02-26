<template>
  <form @submit.prevent="submit">
    <input
      v-model="pass"
      class="single_line_input"
      placeholder="Password"
      type="password"
    />
    <p class="err">{{ error }}</p>
    <v-btn
      block
      class="button_secondary"
      depressed
      :disabled="!canSubmit"
      small
      type="submit"
    >
      Delete
    </v-btn>
  </form>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useAccountsStore } from "@/stores/pinia/accounts";
import { useNotificationsStore } from "@/stores/pinia/notifications";

export default defineComponent({
  setup() {
    const accountsStore = useAccountsStore();
    const notificationsStore = useNotificationsStore();
    return {
      accountsStore,
      notificationsStore,
    };
  },
  data() {
    return {
      pass: "",
      error: "",
    };
  },
  computed: {
    canSubmit() {
      if (this.pass.length === 0) return false;
      return true;
    },
  },
  methods: {
    async submit() {
      this.error = "";
      try {
        await this.accountsStore.deleteAccount(this.pass);
        this.notificationsStore.add({
          title: "Account Deleted",
          message: "Your wallet is no longer stored on this browser.",
        });
      } catch (error) {
        this.error = (error as Error).message;
      }
    },
  },
});
</script>
<style scoped lang="scss">
@use "./style";
</style>
