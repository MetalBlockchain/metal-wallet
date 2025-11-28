<template>
  <modal ref="modal" :title="$t('modal.qr.title')">
    <div class="qr_body">
      <canvas ref="qr"></canvas>
      <p>{{ address }}</p>
      <CopyText class="copyBut" :value="address">{{
        $t("modal.qr.copy")
      }}</CopyText>
    </div>
  </modal>
</template>
<script lang="ts">
import QRCode from "qrcode";
import CopyText from "../misc/CopyText.vue";
import Modal from "./Modal.vue";

export default defineComponent({
  components: {
    Modal,
    CopyText,
  },
  props: {
    address: { default: "-", type: String },
  },
  data() {
    return {
      colorDark: "#242729",
      colorLight: "#FFF",
    };
  },
  watch: {
    address: [{ immediate: true, handler: "onaddrchange" }],
    "$root.theme": [{ immediate: true, handler: "onthemechange" }],
  },
  methods: {
    open() {
      (this.$refs.modal as typeof Modal).open();

      nextTick(() => {
        this.updateQR();
      });
    },
    updateQR() {
      if (!this.address) return;
      const canvas = this.$refs.qr;
      QRCode.toCanvas(
        canvas,
        this.address,
        {
          scale: 6,
          color: {
            light: this.colorLight,
            dark: this.colorDark,
          },
        },
        (error) => {
          if (error) console.error(error);
        },
      );
    },
    onaddrchange(val: string) {
      if (val) {
        this.updateQR();
      }
    },
    onthemechange(val: string) {
      if (val === "night") {
        this.colorDark = "#E5E5E5";
        this.colorLight = "#242729";
      } else {
        this.colorDark = "#242729";
        this.colorLight = "#FFF";
      }
      this.updateQR();
    },
  },
});
</script>
<style scoped lang="scss">
.qr_body {
  padding: 30px;
  text-align: center;
}

.qr_body p {
  word-break: break-all;
  text-align: center;
}
canvas {
  width: 220px;
  height: 220px;
}

.copyBut {
  /*width: 20px;*/
  /*height: 20px;*/
  margin: 15px auto;
  margin-bottom: 0;
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
  /*display: block;*/
  /*margin: 0px auto;*/
}
</style>
