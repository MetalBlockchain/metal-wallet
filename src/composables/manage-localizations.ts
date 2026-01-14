/**
 * i18n
 */

import { computed } from "vue";
import { useI18n } from "vue-i18n"; // our default language that is preloaded

const loadedLanguages: string[] = ["en"];
const langMapping = new Map([
  ["af", "aafrikans"],
  ["ar", "arabic"],
  ["da", "danish"],
  ["fi", "finnish"],
  ["el", "greek"],
  ["he", "hebrew"],
  ["hu", "hungarian"],
  ["ja", "japanese"],
  ["nb", "norwegian"],
  ["pl", "polish"],
  ["ro", "romanian"],
  ["sr", "serbian"],
  ["sv", "swedish"],
  ["sh", "thai"],
]);

export function manageLocalization() {
  const i18n = useI18n();

  const currentLocale = computed(() => i18n.locale.value);

  function setLanguage(lang: string) {
    i18n.locale.value = lang;
    document.querySelector("html")?.setAttribute("lang", lang);
    return lang;
  }

  async function loadLocalization(lang: string) {
    if (
      currentLocale.value === lang && // If the language was already loaded
      loadedLanguages.includes(lang)
    ) {
      return setLanguage(lang);
    }

    const loadLang = langMapping.get(lang) ?? lang;

    const messages = await import(`@/locales/${loadLang}.json`);

    i18n.setLocaleMessage(lang, messages);

    loadedLanguages.push(lang);
    return setLanguage(lang);
  }

  return {
    loadLocalization,
    currentLocale,
  };
}
