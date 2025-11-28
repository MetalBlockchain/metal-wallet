import pluginVitest from "@vitest/eslint-plugin";
import prettier from "eslint-config-prettier/flat";
import vuetify from "eslint-config-vuetify";

export default vuetify(
  {
    vue: true,
    ts: { preset: "recommended" },
    stylistic: false,
  },
  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        projectService: true,
      },
    },
  },
  prettier,
);
