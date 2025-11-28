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

export default defineComponent({
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
      await this.$store
        .dispatch("Accounts/deleteAccount", this.pass)
        .then(() => {
          this.$store.dispatch("Notifications/add", {
            title: "Account Deleted",
            message: "Your wallet is no longer stored on this browser.",
          });
        })
        .catch((error) => {
          this.error = error;
        });
    },
  },
});
</script>
<style scoped lang="scss">
@use "./style";
</style>
