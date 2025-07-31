import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier/flat";
// import unicorn from "eslint-plugin-unicorn";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  // ...tseslint.configs.strict,      // Enable for stricter linting.
  // ...tseslint.configs.stylistic,   // Enable for code style rules.
  prettier,
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
    },
    plugins: {},
    rules: {
      // Custom TS rules
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**"],
  },
];
