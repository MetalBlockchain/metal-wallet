import Vue from "vue";
import VueMeta from "vue-meta";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import { Datetime } from "vue-datetime";
import "vue-datetime/dist/vue-datetime.css";

import { BootstrapVue } from "bootstrap-vue";
import vuetify from "./plugins/vuetify";

import i18n from "./plugins/i18n";
import posthogPlugin from "./plugins/posthog";

// Install Posthog
Vue.use(posthogPlugin);

// Install BootstrapVue
Vue.use(BootstrapVue);

Vue.use(VueMeta);

Vue.component("datetime", Datetime);

Vue.config.productionTip = false;

const app = new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
  mounted() {
    // Reveal app version
    console.log(`App Version: ${__APP_VERSION__}`);
    // Hide loader once vue is initialized
    const loader = document.getElementById("app_loading");
    if (loader) {
      loader.style.display = "none";
    }
  },
  data: {
    theme: "day",
  },
}).$mount("#app");

if ((window as any).Cypress) {
  // only available during E2E tests
  (window as any).app = app;
}

// Extending Big.js with a helper function
import Big from "big.js";

declare module "big.js" {
  interface Big {
    toLocaleString(toFixed?: number): string;
  }
}

Big.prototype.toLocaleString = function (toFixed = 9) {
  const fixedStr = this.toFixed(toFixed);
  const split = fixedStr.split(".");
  const wholeStr = parseInt(split[0]).toLocaleString("en-US");

  if (split.length === 1) {
    return wholeStr;
  } else {
    let remainderStr = split[1];

    // remove trailing 0s
    let lastChar = remainderStr.charAt(remainderStr.length - 1);
    while (lastChar === "0") {
      remainderStr = remainderStr.substring(0, remainderStr.length - 1);
      lastChar = remainderStr.charAt(remainderStr.length - 1);
    }

    const trimmed = remainderStr.substring(0, toFixed);
    if (!trimmed) return wholeStr;
    return `${wholeStr}.${trimmed}`;
  }
};
