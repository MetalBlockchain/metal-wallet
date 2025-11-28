<template>
  <div class="utf_payload_view">
    <p>{{ text }}</p>
  </div>
</template>
<script lang="ts">
import type { UTF8Payload } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    payload: {
      type: Object as PropType<UTF8Payload>,
    },
  },
  computed: {
    text() {
      return this.payload?.getContent().toString() ?? "";
    },
  },
});
</script>
<style scoped lang="scss">
p {
  height: 100%;
  font-size: 13px;
  padding: 12px 24px;
  word-break: break-word;
  overflow: scroll;
  background-color: var(--bg-light) !important;
  color: var(--primary-color) !important;
}
</style>
