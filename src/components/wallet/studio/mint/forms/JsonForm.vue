<template>
  <div>
    <label>{{ $t("studio.mint.forms.json.label1") }}</label>
    <div class="input_cont">
      <textarea v-model="data" maxlength="1024" type="text" @input="onInput" />
      <p class="counter">{{ data.length }} / 1024</p>
    </div>
  </div>
</template>
<script lang="ts">
import type { JsonFormType } from "@/components/wallet/studio/mint/types";
import { defineComponent } from "vue";

// const JSONEditor = require('jsoneditor')

export const JsonForm = defineComponent({
  emits: ["on-input"],
  data() {
    return {
      data: "{\n\n}",
    };
  },
  computed: {
    isValid(): boolean {
      const data = this.data;

      if (data.length === 0) return false;
      try {
        JSON.parse(data);
      } catch {
        return false;
      }
      return true;
    },
  },
  methods: {
    onInput() {
      let msg: null | JsonFormType = null;

      msg = this.isValid
        ? {
            data: this.data,
          }
        : null;

      this.$emit("on-input", msg);
    },
  },
});
export default JsonForm;
</script>
<style scoped lang="scss">
textarea,
.editor {
  width: 100%;
  height: 180px;
  max-width: 100%;
}

.editor {
  position: relative;
  //overflow: scroll;
  background-color: var(--bg-light);
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
