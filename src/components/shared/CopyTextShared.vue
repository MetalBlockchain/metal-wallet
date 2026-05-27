<template>
  <div class="copyBut">
    <button @click="copy"><slot></slot></button>
    <input ref="copytext" :value="value" />
  </div>
</template>
<script lang="ts">
export const CopyTextShared = defineComponent({
  props: {
    value: String,
  },
  emits: ["copy"],
  methods: {
    copy() {
      const copytext = this.$refs.copytext as HTMLInputElement;
      copytext.select();
      copytext.setSelectionRange(0, 99_999);
      document.execCommand("copy");
      this.$emit("copy", this.value);
    },
  },
});
export default CopyTextShared;
</script>
<style scoped>
.copyBut {
  display: inline-block;
}
.copyBut button {
  width: 100%;
  height: 100%;
}
.copyBut input {
  width: 1px;
  position: absolute;
  opacity: 0;
}
</style>
