import { createI18n } from "vue-i18n";
import en from "@/locales/en.json";

// Create VueI18n instance with options
export default createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: "en", // set locale
  fallbackLocale: "en",
  messages: {
    en
  },
});
