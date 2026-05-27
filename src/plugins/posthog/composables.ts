import { inject } from "vue";
import { posthogKey } from "./injection_symbols";

export function usePosthog() {
  return inject(posthogKey);
}
