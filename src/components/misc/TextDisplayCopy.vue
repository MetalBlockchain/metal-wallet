<template>
  <div class="display_copy">
    <input class="disp" disabled :model-value="value" type="text" />
    <copy-text-shared class="copy" :value="value" @copy="oncopy()">
      <fa icon="copy"></fa>
    </copy-text-shared>
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import CopyTextShared from "@/components/shared/CopyTextShared.vue";
import { useNotificationsStore } from "@/stores/pinia/notifications";

export const TextDisplayCopy = defineComponent({
  components: {
    CopyTextShared,
  },
  props: {
    value: {
      type: String,
    },
  },
  emits: ["copy"],
  setup() {
    const notificationsStore = useNotificationsStore();
    return { notificationsStore };
  },
  methods: {
    oncopy() {
      this.notificationsStore.add({
        title: "Copy",
        message: "Copied to clipboard.",
      });
      this.$emit("copy", this.value);
    },
  },
});

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
