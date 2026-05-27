<template>
  <div>
    <label>URL</label>
    <input v-model="urlIn" placeholder="https://" @input="onInput" />
  </div>
</template>
<script lang="ts">
import type { UrlFormType } from "@/components/wallet/studio/mint/types";
import { defineComponent } from "vue";

export const UrlForm = defineComponent({
  emits: ["on-input"],
  data() {
    return {
      urlIn: "",
    };
  },
  computed: {
    isValid(): boolean {
      if (this.urlIn.length === 0) {
        return false;
      }

      if (!this.isValidUrl(this.urlIn)) {
        return false;
      }

      return true;
    },
  },
  methods: {
    isValidUrl(url: string) {
      try {
        new URL(url);
      } catch {
        return false;
      }
      return true;
    },
    onInput() {
      let msg: null | UrlFormType = null;

      if (this.isValid) {
        msg = {
          url: this.urlIn,
        };
      }

      if (this.urlIn === "") msg = null;
      this.$emit("on-input", msg);
    },
  },
});
export default UrlForm;
</script>
<style scoped lang="scss">
input {
  width: 100%;
  max-width: 100%;
}
.v-btn {
  margin-top: 14px;
}
</style>
