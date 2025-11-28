/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

declare const __APP_VERSION__: string;

declare module "vuex" {
  export * from "vuex/types/helpers.d.ts";
  export * from "vuex/types/index.d.ts";
  export * from "vuex/types/logger.d.ts";
  export * from "vuex/types/vue.d.ts";
}

declare module "vue-virtual-scroller";
