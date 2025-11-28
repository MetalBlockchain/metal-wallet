import { createI18n } from "vue-i18n";
import af from "@/locales/aafrikans.json";
import ar from "@/locales/arabic.json";
import ca from "@/locales/ca.json";
import cs from "@/locales/cs.json";
import da from "@/locales/danish.json";
import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fi from "@/locales/finnish.json";
import fr from "@/locales/fr.json";
import el from "@/locales/greek.json";
import he from "@/locales/hebrew.json";
import hu from "@/locales/hungarian.json";
import it from "@/locales/it.json";
import ja from "@/locales/japanese.json";
import kr from "@/locales/kr.json";
import nl from "@/locales/nl.json";
import nb from "@/locales/norwegian.json";
import pl from "@/locales/polish.json";
import pt from "@/locales/pt.json";
import ro from "@/locales/romanian.json";
import ru from "@/locales/ru.json";
import sr from "@/locales/serbian.json";
import sv from "@/locales/swedish.json";
import th from "@/locales/thai.json";
import tr from "@/locales/tr.json";
import uk from "@/locales/uk.json";
import vn from "@/locales/vn.json";
import zh_hans from "@/locales/zh_hans.json";
import zh_hant from "@/locales/zh_hant.json";

const messages = {
  en,
  fr,
  tr,
  it,
  es,
  de,
  kr,
  ru,
  zh_hant,
  zh_hans,
  pt,
  vn,
  nl,
  uk,
  ca,
  cs,
  af,
  ar,
  da,
  fi,
  el,
  he,
  hu,
  nb,
  pl,
  ro,
  sr,
  sv,
  th,
  ja,
};

// Create VueI18n instance with options
export default createI18n({
  legacy: false, // you must set `false`, to use Composition API
  locale: "en", // set locale
  fallbackLocale: "en",
  messages, // set locale messages
});
