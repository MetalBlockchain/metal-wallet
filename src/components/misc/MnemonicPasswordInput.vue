<template>
  <div class="input_cont">
    <span v-for="i in 24" :key="i">
      {{ i }}.
      <input
        :ref="`in_${i - 1}`"
        autocapitalize="off"
        autocomplete="off"
        type="password"
        @blur="onBlur"
        @focus="onFocus"
        @input="onInput($event, i - 1)"
        @paste="onPaste"
      />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

const SIZE = 24;
export default defineComponent({
  emits: ["change"],
  methods: {
    onFocus(ev: any) {
      ev.target.setAttribute("type", "text");
    },
    onBlur(ev: any) {
      ev.target.setAttribute("type", "password");
    },
    onPaste(e: any) {
      e.preventDefault();
    },
    onInput(ev: any, index: number) {
      const val: string = ev.target.value.trim();
      const words: string[] = val.split(" ").filter((w) => w !== "");

      if (words.length > 1) {
        for (const [i, word] of words.entries()) {
          const wordIndex = index + i;
          if (wordIndex >= SIZE) continue;

          //@ts-ignore
          const dom = this.$refs[`in_${wordIndex}`][0];
          dom.value = word;
          dom.focus();
        }
      }

      this.emitValue();
    },
    emitValue() {
      let val = "";
      for (let i = 0; i < SIZE; i++) {
        //@ts-ignore
        const input = this.$refs[`in_${i}`][0];
        val += `${input.value} `;
      }

      this.$emit("change", val.trim());
    },
  },
});
</script>
<style scoped lang="scss">
.input_cont {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  //grid-gap: 1em;
  width: 100%;

  span {
    text-align: left;
    white-space: nowrap;
    margin: 0.7em;
    display: grid;
    grid-template-columns: 2em 1fr;
  }

  input {
    border-bottom: 1px solid var(--primary-color-light);
    width: 8ch;
    border-radius: 2px;
    color: var(--primary-color);
  }
}
</style>
