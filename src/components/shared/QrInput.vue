<template>
  <div class="qr_input">
    <QRReader class="readerIn" :disabled="disabled" @change="change"
      ><button>
        <fa icon="camera"></fa></button
    ></QRReader>
    <input
      v-model="pk"
      class="pk_in"
      :disabled="disabled"
      :placeholder="placeholder"
      type="text"
      @input="oninput"
    />
  </div>
</template>
<script lang="ts">
import QRReader from "./QrReader.vue";

export const QrInput = defineComponent({
  components: {
    QRReader,
  },
  props: {
    placeholder: String,
    modelValue: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  data(): {
    pk: string | undefined;
  } {
    return {
      pk: "",
    };
  },
  watch: {
    value(val) {
      this.pk = val;
    },
  },
  mounted() {
    this.pk = this.modelValue;
  },
  methods: {
    change(val: string | undefined) {
      this.pk = val;
      this.emit();
    },
    oninput() {
      this.pk = this.pk?.trim();
      this.emit();
    },
    emit() {
      this.$emit("update:modelValue", this.pk);
    },
  },
});
export default QrInput;
</script>
<style scoped>
.qr_input {
  display: flex;
  align-items: center;
  color: #333;
  height: 45px;
  background-color: #f8f8f8;
  margin-bottom: 8px;
}

.qr_input button {
  font-size: 19px;
  height: 100%;
  padding-right: 12px;
  padding-left: 12px;
  border-style: none;
  border-right: 1px solid #d2d2d2;
  text-align: center;
  pointer-events: none;
  opacity: 0.7;
  /*opacity: 0.7;*/
}

.readerIn {
  height: 100%;
}

.pk_in {
  background-color: transparent;
  border-style: none;
  color: inherit;
  outline: none;
  text-align: center;
  width: 100%;
  margin: 0;
  padding: 0px 12px;
}
</style>
