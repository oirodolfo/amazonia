import { fixupConfigRules } from "@eslint/compat";
import css from "@eslint/css";
import js from "@eslint/js";
import json from "@eslint/json";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".turbo/**",
      ".vite/**",
      "**.test.{ts,tsx,js,jsx}",
      "**/__tests__/**",
    ],
  },

  {
    files: ["**/*.{jsx,tsx}"],
    ...fixupConfigRules(pluginReact.configs.flat.recommended)[0],
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },

  ...tseslint.configs.recommended,

  {
    files: ["**/*.json"],
    plugins: { json },
    language: "json/json",
    extends: ["json/recommended"],
  },

  {
    files: ["**/*.jsonc"],
    plugins: { json },
    language: "json/jsonc",
    extends: ["json/recommended"],
  },

  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"],
  },
]);
