<template>
  <p>{{ tweenedNumber.toLocaleString() }}</p>
</template>
<script lang="ts">
import type { PropType } from "vue";
import Big from "big.js";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    value: {
      type: Object as PropType<Big>,
    },
  },
  data() {
    const tweenedNumber: Big = Big(0);

    return {
      tweenedNumber,
    };
  },
  watch: {
    value: [
      {
        handler: "onValueChange",
      },
    ],
  },
  mounted() {
    this.animate();
  },
  methods: {
    animate() {
      if (this.value) {
        const increment = this.value.gt(this.tweenedNumber);
        const diff = this.value.sub(this.tweenedNumber);
        let step = diff.div(4).abs();

        const thresh = Big(0.01);

        step = step.round(2);

        if (step.lt(thresh)) {
          this.tweenedNumber = this.value.add(0);
          return;
        }

        this.tweenedNumber = increment
          ? this.tweenedNumber.add(step)
          : this.tweenedNumber.sub(step);
        requestAnimationFrame(this.animate);
      }
    },
    onValueChange(_: Big) {
      this.animate();
    },
  },
});
</script>
