<template>
  <button @click="toggle">
    <img v-if="val" src="@/assets/theme_toggle/night.svg" />
    <img v-else src="@/assets/theme_toggle/day.svg" />
  </button>
</template>
<script lang="ts">
import "reflect-metadata";
import { Vue, Component } from "vue-property-decorator";

@Component
export class DayNightToggle extends Vue {
  val = false;
  setNight() {
    this.val = true;
    localStorage.setItem("theme", "night");
    document.documentElement.setAttribute("data-theme", "night");
    (this.$root.$data as any).theme = "night";
  }
  setDay() {
    this.val = false;
    localStorage.setItem("theme", "day");
    document.documentElement.setAttribute("data-theme", "day");
    (this.$root.$data as any).theme = "day";
  }
  toggle() {
    this.val = !this.val;
    if (this.val) {
      this.setNight();
    } else {
      this.setDay();
    }
  }
  mounted() {
    const theme = localStorage.getItem("theme");

    if (!theme) {
      this.setDay();
      return;
    }

    if (theme === "night") {
      this.setNight();
    }
  }
}

export default DayNightToggle;
</script>
<style scoped lang="scss">
button {
  display: flex;
  align-items: center;
  img {
    max-height: 18px;
  }
}
</style>
