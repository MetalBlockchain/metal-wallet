import { fileURLToPath, URL } from "node:url";
import Vue from "@vitejs/plugin-vue";
// Plugins
import AutoImport from "unplugin-auto-import/vite";
import Fonts from "unplugin-fonts/vite";
import Components from "unplugin-vue-components/vite";
// Utilities
import { defineConfig } from "vite";
import commonjs from "vite-plugin-commonjs";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import topLevelAwait from "vite-plugin-top-level-await";
import Vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import wasm from "vite-plugin-wasm";

import pkg from "./package.json";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    commonjs({
      filter(id) {
        if (id.includes("node_modules/randomfill")) {
          return true;
        }
      },
    }),
    nodePolyfills(),
    AutoImport({
      imports: [
        "vue",

        {
          "vue-router": ["useRoute", "useRouter"],
          pinia: ["defineStore", "storeToRefs"],
        },
      ],
      dts: "src/auto-imports.d.ts",
      eslintrc: {
        enabled: true,
      },
      vueTemplate: true,
    }),
    Components({
      dts: "src/components.d.ts",
    }),
    Vue({
      template: { transformAssetUrls },
    }),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: "src/styles/settings.scss",
      },
    }),
    Fonts({
      fontsource: {
        families: [
          {
            name: "Roboto",
            weights: [100, 300, 400, 500, 700, 900],
            styles: ["normal", "italic"],
          },
          {
            name: "Inter",
            weights: [100, 300, 400, 500, 700, 900],
            styles: ["normal", "italic"],
          },
        ],
      },
      custom: {
        families: [],
        preload: false,
        prefetch: true,
      },
    }),
  ],
  build: {
    target: ["chrome111", "edge111", "firefox114", "safari16.4"],
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("vue") || id.includes("pinia")) {
              return "vue";
            }

            if (id.includes("web3/")) {
              return "vendor_web3";
            }

            if (id.includes("@ledgerhq")) {
              return "vendor_ledger";
            }
            if (id.includes("@metalblockchain/glacier-sdk")) {
              return "vendor_metal_glacier";
            }

            if (id.includes("@metalblockchain/metal-wallet-sdk")) {
              return "vendor_metal_wallet_sdk";
            }

            if (id.includes("@noble")) {
              return "vendor_noble";
            }

            if (id.includes("big.js")) {
              return "vendor_big_js";
            }

            if (id.includes("@fortawesome")) {
              return "vendor_fortawesome";
            }

            if (id.includes("@zxing")) {
              return "vendor_zxing";
            }

            if (id.includes("bitcoinjs-lib")) {
              return "vendor_bitcoinjs_lib";
            }

            if (id.includes("@ethereumjs")) {
              return "vendor_ethereumjs";
            }

            if (id.includes("@avalabs")) {
              return "vendor_avalabs";
            }
            if (id.includes("date-fns")) {
              return "vendor_date_fns";
            }

            if (id.includes("moment")) {
              return "vendor_moment";
            }

            if (id.includes("qrcode")) {
              return "vendor_qrcode";
            }

            if (
              id.includes("posthog-js") ||
              id.includes("@opentelemetry") ||
              id.includes("@posthog") ||
              id.includes("preact") ||
              id.includes("query-selector-shadow-dom") ||
              id.includes("core-js") ||
              id.includes("dompurify") ||
              id.includes("fflate") ||
              id.includes("web-vitals")
            ) {
              return "vendor_posthog";
            }

            return "vendor"; // all other package goes here
          }
        },
      },
    },
  },
  optimizeDeps: {
    // "tiny-secp256k1"
    exclude: ["vuetify", "vue-router"],
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    "process.env": {},
    "process.browser": JSON.stringify("true"),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
    extensions: [".js", ".json", ".jsx", ".mjs", ".ts", ".tsx", ".vue"],
  },
  server: {
    port: 3000,
  },
});
