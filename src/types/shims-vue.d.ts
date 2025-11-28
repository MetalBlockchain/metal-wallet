import type { PostHog } from "posthog-js";
import type { Router } from "vue-router";
import type { Store } from "vuex";

declare module "vue" {
  interface ComponentCustomProperties {
    $store: Store<any>;
    $t: (key: string, ...args: any[]) => string;
    $router: Router;
    $posthog: PostHog;
  }
}
