<template>
  <div>
    <label>{{ $t("studio.mint.forms.utf8.label1") }}</label>
    <div class="input_cont">
      <textarea v-model="val" maxlength="1024" type="text" @input="onInput" />
      <p class="counter">{{ val.length }} / 1024</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { UtfFormType } from "@/components/wallet/studio/mint/types";
import { defineComponent } from "vue";

export const Utf8Form = defineComponent({
  emits: ["on-input"],
  data() {
    return {
      val: "",
    };
  },
  computed: {
    isValid(): boolean {
      if (this.val.length === 0 || this.val.length > 1024) {
        return false;
      }

      return true;
    },
  },
  methods: {
    onInput() {
      let msg: null | UtfFormType = null;

      msg = this.isValid
        ? {
            text: this.val,
          }
        : null;

      this.$emit("on-input", msg);
    },
  },
});
export default Utf8Form;
</script>
<style scoped lang="scss">
textarea {
  width: 100%;
  height: 180px;
  max-width: 100%;
}

.input_cont {
  width: 100%;
}
.v-btn {
  margin-top: 14px;
}
.counter {
  text-align: right;
  font-size: 13px;
  color: var(--primary-color-light);
  padding: 2px;
}
</style>
