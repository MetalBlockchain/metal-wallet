import type { PostHog } from "posthog-js";

export const posthogKey = Symbol(
  import.meta.env.DEV ? "posthog" : "",
) as InjectionKey<PostHog>;
