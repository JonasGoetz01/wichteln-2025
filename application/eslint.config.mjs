import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    files: ["**/*.ts", "**/*.tsx"],
    ignores: [".now/*", ".next/*", "node_modules/*", ".git/*", "dist/*"],
    rules: {
      "import/order": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "react/no-unescaped-entities": "warn",
      "react/jsx-sort-props": "off",
      "padding-line-between-statements": "off",
    },
  },
  {
    files: ["app/api/**/*.ts", "app/api/**/*.tsx"],
    rules: {
      "no-console": "off",
    },
  },
];

export default eslintConfig;
