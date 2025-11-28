<template>
  <button @click="toggle">
    <img v-if="val" src="@/assets/theme_toggle/night.svg" />
    <img v-else src="@/assets/theme_toggle/day.svg" />
  </button>
</template>
<script lang="ts">
import { defineComponent } from "vue";
import { useOwnTheme } from "@/composables/use-own-theme";

export const DayNightToggle = defineComponent({
  setup() {
    const { setNight, setDay } = useOwnTheme();
    return {
      setNight,
      setDay,
    };
  },
  data() {
    return {
      val: false,
    };
  },
  mounted() {
    const theme = localStorage.getItem("theme");

    if (!theme) {
      this.setOwnDay();
      return;
    }

    if (theme === "dark") {
      this.setOwnNight();
    }
  },
  methods: {
    setOwnNight() {
      this.val = true;
      this.setValue("dark");
      this.setNight();
    },
    setOwnDay() {
      this.val = false;
      this.setValue("light");
      this.setDay();
    },
    toggle() {
      this.val = !this.val;
      if (this.val) {
        this.setOwnNight();
      } else {
        this.setOwnDay();
      }
    },
    setValue(value: string) {
      localStorage.setItem("theme", value);
      document.documentElement.dataset.theme = value;
    },
  },
});

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
