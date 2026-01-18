import * as fs from "node:fs";
import * as path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import prettier from "eslint-plugin-prettier/recommended";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import globals from "globals";

// Read .gitignore for automatic ignore patterns
const gitignorePath = path.join(import.meta.dirname, ".gitignore");
const gitignoreConfig = fs.existsSync(gitignorePath) ? [includeIgnoreFile(gitignorePath)] : [];

/**
 * Rule to restrict direct process.env access (use t3-env instead)
 */
export const restrictEnvAccess = tseslint.config(
  { ignores: ["**/env.ts", "**/*keys.ts"] },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message: "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          name: "process",
          importNames: ["env"],
          message: "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
    },
  }
);

export default tseslint.config(
  // Ignore files from .gitignore
  ...gitignoreConfig,

  // Additional ignore patterns (explicit to avoid scanning large directories)
  {
    ignores: [
      "**/*.config.*",
      "**/.source/**",
      ".pnpm-store/**",
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/build/**",
      "**/.turbo/**",
    ],
  },

  // Base configuration for all JS/TS files
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
    },
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      ...turboPlugin.configs.recommended.rules,
      "turbo/no-undeclared-env-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    },
  },

  // React config for JSX/TSX files
  {
    files: ["**/*.{jsx,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
  },

  // Node.js files (API, packages, etc.)
  {
    files: ["**/packages/**/*.ts", "**/api/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },

  // Prettier - runs Prettier as an ESLint rule
  prettier,

  // Linter options
  {
    linterOptions: { reportUnusedDisableDirectives: true },
  }
);
