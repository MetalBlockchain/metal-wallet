<template>
  <!--    <p @keydown.up="up" @keydown.down="down"-->
  <!--       @input="input" >{{display}}</p>-->
  <input
    v-model="raw"
    contenteditable="false"
    type="text"
    @change="change"
    @input="input"
    @keydown.down="down"
    @keydown.up="up"
  />
</template>
<script lang="ts">
import { BN } from "@metalblockchain/metaljs";
import Big from "big.js";

export const BigNumInput = defineComponent({
  props: {
    denomination: {
      type: Number,
      default: 0,
    },
    max: {
      type: [BN, null],
    },
    min: {
      type: Number,
      default: 0,
    },
  },
  emits: ["change"],
  data(): {
    raw: string;
    value: Big | null;
  } {
    return {
      raw: "0",
      value: null,
    };
  },
  computed: {
    stepSize() {
      return Math.pow(10, -this.denomination);
    },
    bigMax() {
      if (this.max) {
        // this.max is a BN in satoshis
        const satoshi = Big(this.max.toString());
        const divider = Big(10).pow(this.denomination);
        return satoshi.div(divider);
      }
      return null;
    },
    bigMin() {
      if (this.min !== undefined) {
        return Big(this.min);
      }
      return null;
    },
  },
  watch: {
    denomination() {
      this.cleanInput();
    },
  },
  created() {
    this.value = new Big(0);
  },
  mounted() {
    this.cleanInput();
  },
  methods: {
    // Emit in BN as satoshis!
    emit() {
      if (this.value) {
        // console.log(this.value.toString());
        const tens = Big(10).pow(this.denomination);
        const satoshis = this.value.times(tens);
        const bn = new BN(satoshis.toFixed(0));
        this.$emit("change", bn);
      }
    },
    change(_: Event) {
      this.cleanInput();
    },
    input(ev: InputEvent) {
      ev.preventDefault();
      const data = ev.data;

      if (data !== null) {
        const num = Number.parseInt(data);
        if (Number.isNaN(num)) {
          this.cleanInput();
        }
      }
    },
    cleanInput() {
      let rawnum;
      // console.log('Raw:',this.raw);
      try {
        if (this.raw === "") this.raw = "0";
        rawnum = new Big(this.raw);
      } catch {
        rawnum = this.value;
      }

      if (this.bigMax != null && rawnum) {
        if (rawnum.gt(this.bigMax)) {
          rawnum = this.bigMax;
        } else if (this.bigMin && rawnum.lt(this.bigMin)) {
          rawnum = this.bigMin;
        }
      }
      this.value = rawnum;
      this.raw = rawnum ? rawnum.toFixed(this.denomination) : "";
      this.emit();
    },
    maxout() {
      if (this.bigMax) {
        this.value = this.bigMax;
        this.valueToRaw();
      }
    },
    up(_: Event) {
      if (this.value) {
        this.value = this.value.plus(this.stepSize);
      }
      this.valueToRaw();
    },
    valueToRaw() {
      let val = this.value;
      if (this.bigMax != null && val) {
        if (val.gt(this.bigMax)) {
          val = this.bigMax;
          this.value = val;
        } else if (this.bigMin && val.lt(this.bigMin)) {
          val = this.bigMin;
          this.value = val;
        }
      }
      this.raw = val ? val.toFixed(this.denomination) : "";
      this.emit();
    },
    down(_: Event) {
      if (this.value) {
        this.value = this.value.minus(this.stepSize);
        this.valueToRaw();
      }
    },
  },
});
export default BigNumInput;
</script>
