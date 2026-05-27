<template>
  <div class="hex_img">
    <img v-if="!isAva" class="hex_img" src="@/assets/hex.svg" />
    <img v-else class="hex_img" src="@/assets/hex_ava.svg" />
  </div>
</template>
<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    isAva: { default: false, type: Boolean },
  },
});
</script>
<style scoped lang="scss">
.hex_img {
  display: flex;
  justify-content: center;
  align-items: center;
}

img.hex_img {
  width: 100% !important;
  object-position: center;
  object-fit: contain;
}
</style>
