import { useTheme } from "vuetify";
import { themeKey } from "@/constants/injection_tokens";

export function useOwnTheme() {
  const themeValue = inject(themeKey, ref("light"));
  const theme = useTheme();

  const isDay = computed(() => themeValue.value === "light");

  const setTheme = (value: string) => {
    themeValue.value = value;
    theme.change(value);
  };

  const setDay = () => {
    setTheme("light");
  };

  const setNight = () => {
    setTheme("dark");
  };

  return {
    theme: themeValue?.value ?? "light",
    isDay,
    setDay,
    setNight,
  };
}
