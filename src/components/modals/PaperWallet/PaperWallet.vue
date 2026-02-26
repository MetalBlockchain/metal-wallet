<template>
  <modal ref="modal" class="print_modal" :title="$t('modal.print.title')">
    <div ref="qr_body" class="qr_body">
      <img
        ref="bg"
        src="@/assets/paper_wallet/bg.png"
        :style="{
          display: 'none',
          height: `${height}px`,
          width: `100%`,
          // width: '100%',
          // paddingTop: `${100 / aspectRatio}%`,
        }"
      />
      <canvas
        ref="pdf"
        class="pdf_preview"
        :style="{
          width: `100%`,
          height: `${height}px`,
          // width: '100%',
          // paddingTop: `${100 / aspectRatio}%`,
        }"
      ></canvas>
      <v-btn block depressed @click="print">{{
        $t("modal.print.submit")
      }}</v-btn>
    </div>
  </modal>
</template>
<script lang="ts">
import type { PropType } from "vue";

import type MnemonicWallet from "@/js/wallets/MnemonicWallet";

import { mapState } from "pinia";
import printjs from "print-js";
import QRCode from "qrcode";
import { defineComponent } from "vue";
import Modal from "@/components/modals/Modal.vue";
import { useRootStore } from "@/stores/pinia/root";

const PDF_W = 8.5;
const PDF_H = 11;

// Contents of the pdf are set according to this value
const designWidth = 525 - 60;
export default defineComponent({
  components: {
    Modal,
  },
  props: {
    wallet: {
      type: Object as PropType<MnemonicWallet>,
    },
  },
  data(): {
    qrImg: HTMLImageElement | null;
    mnemonicImg: HTMLImageElement | null;
    width: number;
    height: number;
  } {
    return {
      qrImg: null,
      mnemonicImg: null,
      width: 100,
      height: 100,
    };
  },
  computed: {
    ...mapState(useRootStore, {
      address: (store) => {
        try {
          const wallet = store.activeWallet;
          if (!wallet) return "-";

          const key = (wallet as MnemonicWallet).externalHelper.getKeyForIndex(
            0,
          );
          if (!key) {
            return "-";
          }
          return key.getAddressString();
        } catch {
          return "-";
        }
      },
    }),
    aspectRatio(): number {
      return PDF_W / PDF_H;
    },
  },
  watch: {
    address: [
      {
        handler: "buildQr",
      },
    ],
    mnemonic: [
      {
        handler: "buildQr",
      },
    ],
  },
  mounted() {
    this.buildQr();
  },
  methods: {
    open() {
      const modal = this.$refs.modal as typeof Modal;
      modal.open();

      new Promise((resolve) => {
        setTimeout(() => {
          this.setSizes();
          resolve(void 0);
        }, 1000);
      }).then(() => {
        this.initBg();
      });
    },
    initBg() {
      const canv = this.$refs.pdf as HTMLCanvasElement;
      const cont = canv.getContext("2d") as CanvasRenderingContext2D;
      const img = this.$refs.bg as HTMLImageElement;

      const w = canv.clientWidth;
      const h = canv.clientHeight;

      const sizeFactor = 3;

      canv.width = w * sizeFactor;
      canv.height = h * sizeFactor;

      cont.scale(sizeFactor, sizeFactor);
      cont.drawImage(img, 0, 0, w, h);

      this.writeInfo();
    },
    writeInfo() {
      const canv = this.$refs.pdf as HTMLCanvasElement;
      const cont = canv.getContext("2d") as CanvasRenderingContext2D;

      // Top Address
      const wrapChar = 25;
      const addr = this.address;
      const addr1 = addr.slice(0, Math.max(0, wrapChar));
      const addr2 = addr.slice(wrapChar);

      cont.font = `${this.designPxToReal(8)}px Helvetica`;
      cont.fillText(
        addr1,
        this.designPxToReal(352),
        this.designPxToReal(140),
        this.designPxToReal(120),
      );
      cont.fillText(
        addr2,
        this.designPxToReal(352),
        this.designPxToReal(150),
        this.designPxToReal(120),
      );
      cont.drawImage(
        this.qrImg as HTMLImageElement,
        this.designPxToReal(352),
        this.designPxToReal(10),
        this.designPxToReal(100),
        this.designPxToReal(100),
      );

      // Bottom Address
      cont.font = `${this.designPxToReal(10)}px Helvetica`;
      cont.fillText(addr, this.designPxToReal(40), this.designPxToReal(380));
      cont.drawImage(
        this.qrImg as HTMLImageElement,
        this.designPxToReal(352),
        this.designPxToReal(335),
        this.designPxToReal(90),
        this.designPxToReal(90),
      );

      // Mnemonic
      const mnemonicWords: string[] =
        this.wallet?.getMnemonic().split(" ") ?? [];
      const row1 = mnemonicWords.slice(0, 8).join(" ");
      const row2 = mnemonicWords.slice(8, 16).join(" ");
      const row3 = mnemonicWords.slice(16).join(" ");
      cont.fillText(row1, this.designPxToReal(40), this.designPxToReal(490));
      cont.fillText(row2, this.designPxToReal(40), this.designPxToReal(505));
      cont.fillText(row3, this.designPxToReal(40), this.designPxToReal(520));
      cont.drawImage(
        this.mnemonicImg as HTMLImageElement,
        this.designPxToReal(352),
        this.designPxToReal(445),
        this.designPxToReal(90),
        this.designPxToReal(90),
      );
    },
    setSizes() {
      // Set height and width
      const contW = (this.$refs.pdf as HTMLCanvasElement).clientWidth;

      this.width = contW;
      this.height = contW / this.aspectRatio;
    },
    designPxToReal(px: number) {
      return (this.width / designWidth) * px;
    },
    print() {
      const canv = this.$refs.pdf as HTMLCanvasElement;
      printjs({
        printable: canv.toDataURL(),
        type: "image",
        imageStyle: "width:100%; margin: 5px;",
        maxWidth: 2800,
        documentTitle: "",
      });
    },
    buildQr() {
      if (this.wallet) {
        QRCode.toDataURL(
          this.address,
          {
            width: this.designPxToReal(100),
          },
          (_: any, url: string) => {
            const img = new Image();
            img.src = url;
            this.qrImg = img;
          },
        );

        QRCode.toDataURL(
          this.wallet.getMnemonic(),
          {
            width: this.designPxToReal(90),
          },
          (_: any, url: string) => {
            const img = new Image();
            img.src = url;
            this.mnemonicImg = img;
          },
        );
      }
    },
  },
});
</script>
<style scoped>
.qr_body {
  width: 525px;
  max-width: 100%;
  padding: 30px;
  margin: 0px auto;
}

.qr_body p {
  word-break: break-all;
}

.pdf_preview {
  /*width: 420px;*/
  /*max-width: 100%;*/
  /*height: 320px;*/
  border: 1px solid #ddd;
}
</style>
