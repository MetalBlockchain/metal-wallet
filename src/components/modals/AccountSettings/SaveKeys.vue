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

export const SaveKeys = defineComponent({
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
    submit() {
      this.error = "";
      this.$store
        .dispatch("Accounts/saveKeys", this.pass)
        .then(() => {
          this.$store.dispatch("Notifications/add", {
            title: "Keys Saved",
            message: "Your account is updated with new keys.",
          });
          (this.$parent as any)?.close();
        })
        .catch((error) => {
          this.error = error;
        });
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
