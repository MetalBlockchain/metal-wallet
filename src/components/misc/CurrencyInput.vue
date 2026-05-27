<template>
  <div class="curr_in" :disabled="disabled">
    <button v-if="canMax" @click="maxOut">MAX</button>
    <input
      ref="in"
      :min="minVal"
      placeholder="0.00"
      :step="tickSize"
      type="number"
      :value="modelValue"
      @input="handleInput"
    />
    <p>{{ currency }}</p>
  </div>
</template>
<script>
export const CurrencyInput = defineComponent({
  props: {
    currency: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Number,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    precision: {
      type: Number,
      default: 2,
    },
    tickSize: {
      type: Number,
      default: null,
    },
    maxVal: {
      type: Number,
      default: null,
    },
  },
  emits: ["change"],
  computed: {
    // currency(){
    //     if(!this.balanceItem) return '';
    //     return this.balanceItem.id;
    // },
    // max(){
    //     return this.balanceItem.data.availableBalance;
    // },
    canMax() {
      return this.maxVal != null;
    },
    minVal() {
      if (this.tick_size) return this.tick_size;
      return 0;
    },
  },
  methods: {
    handleInput() {
      let val = Number.parseFloat(this.$refs.in.value);

      if (this.canMax) {
        const max = this.maxVal;
        if (val > max && max != 0) {
          val = max;
        }
      }

      this.$emit("change", val);
    },
    maxOut() {
      this.$emit("change", this.maxVal);
    },
  },
});
export default CurrencyInput;
</script>
<style scoped>
.curr_in[disabled] {
  opacity: 0.3;
  user-select: none;
  pointer-events: none;
}
.curr_in {
  margin: 2px 0px;
  background-color: #413e44;
  display: flex;
  font-size: 12px;
  color: #d2d2d2;
  align-items: center;
  min-height: 28px;
}

.curr_in button {
  padding: 0px 15px;
  outline: none;
  text-decoration: underline;
}

.curr_in_tog {
  border-left: 1px solid #3a3144;
  box-shadow: none;
  background-color: transparent !important;
}
input {
  text-align: right;
  outline: none;
  flex-grow: 1;
}
p {
  flex-basis: 40px;
  margin: 0 !important;
  font-weight: bold;
  text-align: center;
}

.v-btn {
  border-radius: 0;
  color: #d2d2d2;
}
</style>
