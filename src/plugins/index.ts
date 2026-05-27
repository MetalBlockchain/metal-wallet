/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */
// Types
import type { App } from "vue";

import { library } from "@fortawesome/fontawesome-svg-core";

import { faBtc, faGoogle } from "@fortawesome/free-brands-svg-icons";
import { faSquare } from "@fortawesome/free-regular-svg-icons";

import {
  faAngleLeft,
  faAngleRight,
  faArrowLeft,
  faArrowRight,
  faBars,
  faBoxes,
  faCalendar,
  faCamera,
  faCaretDown,
  faCheckCircle,
  faCheckSquare,
  faChevronDown,
  faClock,
  faCog,
  faCopy,
  faCreditCard,
  faDna,
  faDollarSign,
  faDownload,
  faEllipsisH,
  faExchangeAlt,
  faExclamationTriangle,
  faExpand,
  faEye,
  faEyeSlash,
  faFileCsv,
  faFileExcel,
  faFilter,
  faFont,
  faGlasses,
  faGlobe,
  faHistory,
  faInfoCircle,
  faKey,
  faLink,
  faList,
  faListOl,
  faLock,
  faMinus,
  faPlus,
  faPrint,
  faQrcode,
  faQuestionCircle,
  faQuoteRight,
  faRandom,
  faRocket,
  faSearch,
  faShare,
  faSignInAlt,
  faSignOutAlt,
  faSpinner,
  faSync,
  faTimes,
  faTimesCircle,
  faTint,
  faTrash,
  faUnlink,
  faUnlock,
  faUpload,
  faUsers,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";

// Styles
// import '@mdi/font/css/materialdesignicons.css'

// Plugins

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { createHead } from "@unhead/vue/client";
// Composables
import { createVuetify } from "vuetify";

import { aliases, fa } from "vuetify/iconsets/fa-svg";

import router from "@/router";
import vuex from "@/stores/vuex";

import i18n from "./i18n";
import { posthogPlugin } from "./posthog";
import "vuetify/styles";
import "unfonts.css";

library.add(
  faDollarSign,
  faBtc,
  faTimesCircle,
  faSignOutAlt,
  faSignInAlt,
  faCaretDown,
  faHistory,
  faGlobe,
  faExchangeAlt,
  faDna,
  faCamera,
  faEllipsisH,
  faDownload,
  faCheckCircle,
  faCheckSquare,
  faTimes,
  faPlus,
  faMinus,
  faSync,
  faExclamationTriangle,
  faPrint,
  faQrcode,
  faCopy,
  faKey,
  faFileExcel,
  faList,
  faTrash,
  faUpload,
  faCreditCard,
  faArrowRight,
  faArrowLeft,
  faTint,
  faChevronDown,
  faBars,
  faCog,
  faSearch,
  faListOl,
  faGoogle,
  faSpinner,
  faInfoCircle,
  faLink,
  faQuoteRight,
  faLock,
  faEye,
  faEyeSlash,
  faQuestionCircle,
  faUsers,
  faFilter,
  faFont,
  faBoxes,
  faUnlock,
  faRandom,
  faAngleLeft,
  faAngleRight,
  faExpand,
  faShare,
  faVideo,
  faUnlink,
  faFileCsv,
  faGlasses,
  faRocket,
  faCalendar,
  faClock,
  faSquare,
);

export function registerPlugins(app: App) {
  app.component("font-awesome-icon", FontAwesomeIcon); // Register component globally
  app.component("fa", FontAwesomeIcon);

  const vuetify = createVuetify({
    theme: {
      defaultTheme: "light",
      themes: {
        light: {
          dark: false,
          colors: {
            primary: "#112EBD",
            secondary: "#06f",
            accent: "#82B1FF",
            error: "#ff9090",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#ecce73",
          },
        },
      },
    },
    icons: {
      defaultSet: "fa",
      aliases,
      sets: {
        fa,
      },
    },
  });

  const POSTHOG_DEV_APP_ID = "phc_6HUmT6KtEAPlKpIw9lKf6mpIog3YU1ClbcylLudAcb0";
  const POSTHOG_DEV_HOST_URL = "https://proxy-api.avax.network/ph";

  app
    .use(vuetify)
    .use(i18n)
    .use(router)
    .use(vuex)
    .use(
      createHead({
        init: [
          {
            title: "Fastest Performing and Secure DeFi Wallet",
            titleTemplate: "%s | Metal Wallet",
            meta: [
              {
                name: "description",
                content:
                  "Metal wallet is a simple, highly secure, non-custodial crypto wallet for storing METAL.",
              },
              {
                name: "description",
                content:
                  "Metal wallet is a simple, highly secure, non-custodial crypto wallet for storing METAL.",
              },
              {
                name: "og:title",
                content:
                  "Fastest Performing and Secure DeFi Wallet | Metal Wallet",
              },
            ],
          },
        ],
      }),
    )
    .use(posthogPlugin, {
      api_key: POSTHOG_DEV_APP_ID,
      api_host: POSTHOG_DEV_HOST_URL,
    });
}
