<template>
  <form class="change_pass_form" @submit.prevent="submit">
    <input
      v-model="passOld"
      class="single_line_input"
      placeholder="Old Password"
      type="password"
    />
    <input
      v-model="pass"
      class="single_line_input"
      placeholder="New Password"
      type="password"
    />
    <input
      v-model="passConfirm"
      class="single_line_input"
      placeholder="Confirm Password"
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
import type { ChangePasswordInput } from "@/stores/vuex/modules/accounts/types";
import { defineComponent } from "vue";

export const ChangePassword = defineComponent({
  data() {
    return {
      pass: "",
      passOld: "",
      passConfirm: "",
      error: "",
    };
  },
  computed: {
    canSubmit() {
      if (this.pass.length === 0) return false;
      if (this.passConfirm.length === 0) return false;
      return true;
    },
  },
  methods: {
    errCheck() {
      if (this.pass.length < 9) {
        return "Password must be at least 9 characters.";
      }

      if (this.pass != this.passConfirm) {
        return "Passwords do not match.";
      }

      if (this.pass === this.passOld) {
        return "Your new password must be different from your previous password.";
      }

      return false;
    },
    async submit() {
      this.error = "";
      const err = this.errCheck();
      if (err) {
        this.error = err;
        return;
      }

      const input: ChangePasswordInput = {
        passOld: this.passOld,
        passNew: this.pass,
      };

      this.$store
        .dispatch("Accounts/changePassword", input)
        .then(() => {
          this.$store.dispatch("Notifications/add", {
            title: "Password Changed",
            message: "You can now use your account with your new password.",
          });
          (this.$parent as any)?.close();
        })
        .catch((error) => {
          this.error = error;
        });
    },
  },
});
export default ChangePassword;
</script>
<style scoped lang="scss">
@use "./style";
</style>
