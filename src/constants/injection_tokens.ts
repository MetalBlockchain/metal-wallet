import type { InjectionKey, Ref } from "vue";
export const themeKey = Symbol(
  import.meta.env.DEV ? "theme" : "",
) as InjectionKey<Ref<string>>;
