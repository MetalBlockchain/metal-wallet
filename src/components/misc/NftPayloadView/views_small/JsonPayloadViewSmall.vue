<template>
  <div v-if="!isGeneric" class="json_payload_view">
    <p>{ }</p>
  </div>
  <GenericPayloadViewSmall v-else :payload="payload"></GenericPayloadViewSmall>
</template>
<script lang="ts">
import type { JSONPayload } from "@metalblockchain/metaljs/dist/utils";
import type { PropType } from "vue";
import { defineComponent } from "vue";
import GenericPayloadViewSmall from "@/components/misc/NftPayloadView/views_small/GenericPayloadViewSmall.vue";

export default defineComponent({
  components: {
    GenericPayloadViewSmall,
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
      return false;
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
  color: #0f0 !important;
  background-color: #000 !important;
  height: 100%;
  width: 100%;
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;

  p {
    color: #0f0 !important;
    font-size: 16px;
    word-break: break-word;
    font-weight: bold;
  }
}
</style>
