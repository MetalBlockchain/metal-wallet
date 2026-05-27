<template>
  <div v-if="!isGeneric" class="json_payload_view">
    <textarea v-model="val" cols="30" disabled row="200"></textarea>
  </div>
  <GenericPayloadView v-else :payload="payload"></GenericPayloadView>
</template>
<script lang="ts">
import type { JSONPayload } from "@metalblockchain/metaljs/dist/utils";

import type { PropType } from "vue";
import { defineComponent } from "vue";
import GenericPayloadView from "@/components/misc/NftPayloadView/views/GenericPayloadView.vue";

export default defineComponent({
  components: {
    GenericPayloadView,
  },
  props: {
    payload: {
      type: Object as PropType<JSONPayload>,
    },
  },
  data() {
    return {
      val: "",
    };
  },
  computed: {
    jsonText() {
      const data = this.text;
      try {
        const obj = JSON.parse(data);
        return JSON.stringify(obj, undefined, 4);
      } catch {
        return data;
      }
    },
    text(): string {
      return this.payload?.getContent().toString() ?? "";
    },
    isGeneric() {
      const data = this.text;
      try {
        const obj = JSON.parse(data);

        return obj.hasOwnProperty("avalanche") ? true : false;
      } catch {
        return false;
      }
    },
  },
  watch: {
    payload: [
      {
        handler: "onPayloadChange",
      },
    ],
  },
  mounted() {
    this.updateText();
  },
  methods: {
    updateText() {
      this.val = this.jsonText;
    },
    onPayloadChange() {
      this.updateText();
    },
  },
});
</script>
<style scoped lang="scss">
.json_payload_view {
  overflow: scroll;
}
textarea {
  display: block;
  padding: 12px;
  width: 100%;
  height: 100%;
  min-height: 140px;
  font-size: 12px !important;
  background-color: #000 !important;
  font-family: monospace !important;
  color: #0f0 !important;
  resize: none;
  border: none !important;
}
p {
  font-size: 13px;
  padding: 12px 24px;
  word-break: break-word;
  overflow: scroll;
  background-color: var(--bg-light);
  color: var(--primary-color);
}
</style>
