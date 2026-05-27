<template>
  <img v-if="isDay" :src="day" />
  <img v-else :src="night" />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useOwnTheme } from "@/composables/use-own-theme";

export default defineComponent({
  props: {
    day: {
      type: String,
    },
    night: {
      type: String,
    },
  },
  setup() {
    const { isDay } = useOwnTheme();
    return {
      isDay,
    };
  },
});
</script>
<style scoped lang="scss"></style>
