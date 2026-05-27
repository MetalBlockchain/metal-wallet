<template>
  <form @submit.prevent="submit">
    <p>You have unsaved keys on your account.</p>
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
      Submit
    </v-btn>
  </form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { useAccountsStore } from "@/stores/pinia/accounts";
import { useNotificationsStore } from "@/stores/pinia/notifications";

export const SaveKeys = defineComponent({
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
        await this.accountsStore.saveKeys(this.pass);
        this.notificationsStore.add({
          title: "Keys Saved",
          message: "Your account is updated with new keys.",
        });
      } catch (error) {
        this.error = (error as Error).message;
      }
    },
  },
});
export default SaveKeys;
</script>
<style scoped lang="scss">
@use "./style";

p {
  white-space: normal;
}
</style>
