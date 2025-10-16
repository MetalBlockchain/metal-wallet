import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import legacy from "@vitejs/plugin-legacy";
import vue2 from "@vitejs/plugin-vue2";
import { nodePolyfills } from "vite-plugin-node-polyfills";

import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills(),
    vue2(),
    legacy({
      targets: ["ie >= 11"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    "process.env": JSON.stringify(process.env),
    "process.browser": JSON.stringify("true"),
    // global: "globalThis",
  },
  css: {
    // TODO Review these rules
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        silenceDeprecations: ["legacy-js-api"],
      },
    },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "buffer/": "buffer",
    },
  },
});
