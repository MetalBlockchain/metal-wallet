/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from "vue";

// Plugins
import { registerPlugins } from "@/plugins";

// Components
import App from "./App.vue";

// Styles
import "@/styles/main.scss";

// Fixes and extensions
import "@/fixes/big_js";

const app = createApp(App, {
  data: {
    theme: "light",
  },
});

registerPlugins(app);

app.mount("#app");
