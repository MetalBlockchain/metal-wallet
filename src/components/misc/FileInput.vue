<template>
  <div class="file_input hover_border">
    <input ref="input" :multiple="multiple" type="file" @input="oninput()" />
    <p v-if="fileNum === 0">
      <span class="upload_text">Upload a file</span>
      or drag and drop
    </p>
    <p v-else-if="files">{{ files[0]?.name }}</p>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export const FileInput = defineComponent({
  props: {
    multiple: { default: false, type: Boolean },
    readType: { default: "raw", type: String },
  },
  emits: ["change"],
  data(): {
    files: FileList | null;
  } {
    return {
      files: null,
    };
  },
  computed: {
    fileNum() {
      if (!this.files) return 0;
      return this.files.length;
    },
  },
  methods: {
    oninput() {
      const input = this.$refs.input as HTMLInputElement;
      this.files = input.files as FileList;
      if (this.readType === "raw") {
        if (this.multiple) {
          this.$emit("change", this.files);
        } else {
          this.$emit("change", this.files[0]);
        }
      } else {
        this.read();
      }
    },
    read() {
      if (!this.files) return;

      const reader = new FileReader(); // no arguments
      reader.addEventListener("load", () => {
        this.$emit("change", reader.result);
      });
      reader.addEventListener("error", () => {
        console.log(reader.error);
      });

      if (this.readType === "text" && this.files[0]) {
        // eslint-disable-next-line unicorn/prefer-blob-reading-methods
        reader.readAsText(this.files[0]);
      }
    },
    clear() {
      const input = this.$refs.input as HTMLInputElement;
      input.value = "";
      this.files = null;
    },
  },
});
export default FileInput;
</script>
<style scoped lang="scss">
@use "@/styles/abstracts/vars";

.file_input {
  position: relative;
  padding: 8px 18px;
  cursor: pointer;
  /* color: main.$primary-color; */
  color: rgb(118, 118, 118);
  background-color: vars.$background-color !important;
  border: 1px solid;
  border-radius: 6px;
  max-width: 100%;
  border-color: vars.$primary-color;
  font-family: "Inter", sans-serif;
  font-weight: 700;
}

input {
  z-index: 2;
  cursor: pointer;
  position: absolute;
  border: none !important;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  opacity: 0;
}

p {
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload_text {
  color: var(--secondary-color);
}
</style>
