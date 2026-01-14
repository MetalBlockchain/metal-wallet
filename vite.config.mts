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
          vuex: ["createStore"],
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
    })
  ],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("@metalblockchain/metaljs")) {
              return "vendor_metaljs";
            } else if (id.includes("@metalblockchain/glacier-sdk")) {
              return "vendor_metal_glacier";
            } else if (id.includes("@metalblockchain/metal-wallet-sdk")) {
              return "vendor_metal_wallet_sdk";
            } else if (id.includes("@fortawesome")) {
              return "vendor_fortawesome";
            } else if(id.includes('@ledgerhq')) {
              return "vendor_ledger";
            } else if(id.includes('@zxing')) {
              return "vendor_zxing";
            } else if(id.includes('@metamask')) {
              return "vendor_metamask";
            } else if(id.includes('bitcoinjs-lib')) {
              return "vendor_bitcoinjs_lib";
            } else if(id.includes('@ethereumjs')) {
              return "vendor_ethereumjs";
            } else if(id.includes('ethers')) {
              return "vendor_ethers";
            } else if(id.includes('@avalabs')) {
              return "vendor_avalabs";
            } else if(id.includes('date-fns')) {
              return "vendor_date_fns";
            } else if(id.includes('vuetify')) {
              return "vendor_vuetify";
            } else if(id.includes('browserify-')) {
              return "vendor_browserify_";
            } else if(id.includes('ethereumjs-')) {
              return "vendor_ethereumjs_";
            }
            return "vendor"; // all other package goes here
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ["vuetify", "vue-router", "tiny-secp256k1"],
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
