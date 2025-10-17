<template>
  <div class="display_copy">
    <input class="disp" type="text" disabled v-model="value" />
    <copy-text :value="value" class="copy" @copy="oncopy()">
      <fa icon="copy"></fa>
    </copy-text>
  </div>
</template>
<script lang="ts">
import { CopyText } from "@avalabs/vue_components";
import "reflect-metadata";
import { Vue, Component, Prop } from "vue-property-decorator";
@Component({
  components: {
    CopyText,
  },
})
export class TextDisplayCopy extends Vue {
  @Prop()
  value!: string;

  oncopy() {
    this.$store.dispatch("Notifications/add", {
      title: "Copy",
      message: "Copied to clipboard.",
    });
    this.$emit("copy", this.value);
  }
}

export default TextDisplayCopy;
</script>
<style scoped>
.display_copy {
  display: flex;
  background-color: #e2e2e2;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #d2d2d2;
}

.disp {
  padding: 6px;
  flex-grow: 1;
  text-align: center;
}

.copy {
  width: 50px;
  background-color: #cecece;
  color: #676767;
}

.copy:hover {
  background-color: #f2f2f2;
  color: #42b983;
}
</style>
