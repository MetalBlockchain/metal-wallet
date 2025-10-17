import type { PostHog } from "posthog-js";

// 1. Make sure to import 'vue' before declaring augmented types
import Vue from "vue";

interface RootInstanceType {
  theme: string;
}

// 2. Specify a file with the types you want to augment
//    Vue has the constructor type in types/vue.d.ts
declare module "vue/types/vue" {
  // 3. Declare augmentation for Vue
  interface Vue {
    readonly $root: Vue & {
      $data: {
        theme: string;
      };
    };
    $posthog: PostHog;
  }
}
