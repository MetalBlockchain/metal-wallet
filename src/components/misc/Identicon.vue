<template>
  <img ref="image_tag" :height="diameter" :width="diameter" />
</template>

<script lang="ts">
import makeBlockie from "ethereum-blockies-base64";
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    value: {
      type: String,
    },
    diameter: { default: 40, type: Number },
  },
  watch: {
    value: [
      {
        handler: "onValueChange",
      },
    ],
  },
  mounted() {
    this.generateImage();
  },
  methods: {
    generateImage() {
      if (this.value) {
        const base64 = makeBlockie(this.value);
        (this.$refs.image_tag as HTMLImageElement).src = base64;
      }
    },
    onValueChange() {
      this.generateImage();
    },
  },
});
</script>
<style scoped lang="scss">
img {
  border-radius: 100%;
}
</style>
