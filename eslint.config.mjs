import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nx from "@nx/eslint-plugin";
import prettier from "eslint-config-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ── Airbnb + TypeScript (React) ──
const airbnbReact = compat.extends(
  "airbnb",
  "airbnb/hooks",
  "airbnb-typescript",
);

// ── Airbnb + TypeScript (base, no React) ──
const airbnbBase = compat.extends(
  "airbnb-base",
  "airbnb-typescript/base",
);

// ── Rules removed/renamed in typescript-eslint v8 (airbnb-typescript compat) ──
const deprecatedTsRules = {
  "@typescript-eslint/lines-between-class-members": "off",
  "@typescript-eslint/no-throw-literal": "off",
  "@typescript-eslint/no-loss-of-precision": "off",
  "@typescript-eslint/no-duplicate-imports": "off",
};

export default [
  // ── Global ignores ──
  {
    ignores: [
      "**/dist",
      "**/out-tsc",
      "**/prisma/generated",
      "**/generated/**",
      "**/node_modules",
      "**/.nx",
      "_old_monolith_temp/**",
    ],
  },

  // ── Nx base rules ──
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],

  // ── Airbnb React rules (for .tsx/.jsx files) ──
  ...airbnbReact.map((config) => ({
    ...config,
    files: ["**/*.tsx", "**/*.jsx"],
  })),

  // ── Airbnb base rules (for .ts/.js files, no React) ──
  ...airbnbBase.map((config) => ({
    ...config,
    files: ["**/*.ts", "**/*.js"],
  })),

  // ── TypeScript parser — use projectService (auto-finds tsconfig per file) ──
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
  },

  // ── Nx module boundaries ──
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
          depConstraints: [{ sourceTag: "*", onlyDependOnLibsWithTags: ["*"] }],
        },
      ],
    },
  },

  // ── Shared overrides (all files) ──
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      ...deprecatedTsRules,

      // Relax rules that are too strict for this codebase
      "import/prefer-default-export": "off",
      "import/no-extraneous-dependencies": "off",
      "no-underscore-dangle": "off",
      "class-methods-use-this": "off",
      "no-param-reassign": ["warn", { props: false }],
      "no-console": "warn",
      "no-plusplus": "off",
      "no-nested-ternary": "off",
      "no-restricted-syntax": "off",
      "no-bitwise": "off",
      "no-continue": "off",
      "no-await-in-loop": "off",
      "consistent-return": "off",
      "no-unneeded-ternary": "warn",
      "prefer-template": "warn",
      "object-shorthand": "warn",
      "prefer-destructuring": "off",
      "no-empty": "warn",
      "radix": "off",
      "vars-on-top": "off",
      "max-classes-per-file": "off",
      "spaced-comment": "warn",
      "no-restricted-globals": "off",
      "arrow-body-style": "off",
      "one-var": "off",
      "no-else-return": "warn",
      "prefer-const": "warn",
      "default-case": "off",
      "no-return-assign": "off",
      "no-promise-executor-return": "off",
      "global-require": "off",
      "no-lonely-if": "warn",
      "no-void": "off",

      // TypeScript handles these better
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-shadow": "warn",
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/return-await": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/ban-ts-comment": "warn",

      // Import
      "import/order": ["warn", {
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
      }],
      "import/no-cycle": "off",
      "import/extensions": "off",
      "import/export": "off",
      "import/no-named-as-default": "off",
      "import/no-relative-packages": "off",

      // Formatting handled by Prettier
      "max-len": "off",
    },
  },

  // ── React-specific overrides (only .tsx/.jsx) ──
  {
    files: ["**/*.tsx", "**/*.jsx"],
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/require-default-props": "off",
      "react/jsx-props-no-spreading": "off",
      "react/function-component-definition": "off",
      "react/no-unescaped-entities": "warn",
      "react/prop-types": "off",
      "react/destructuring-assignment": "off",
      "react/no-array-index-key": "warn",
      "react/button-has-type": "warn",
      "react/self-closing-comp": "warn",
      "react/no-unstable-nested-components": "warn",
      "react/jsx-no-useless-fragment": "warn",
      "react/no-unused-prop-types": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "jsx-a11y/click-events-have-key-events": "off",
      "jsx-a11y/no-static-element-interactions": "off",
      "jsx-a11y/no-noninteractive-element-interactions": "off",
      "jsx-a11y/anchor-is-valid": "off",
      "jsx-a11y/label-has-associated-control": "off",
      "jsx-a11y/media-has-caption": "off",
      "jsx-a11y/control-has-associated-label": "off",
      "react/jsx-no-constructed-context-values": "warn",
    },
  },

  // ── Prettier (must be last) ──
  prettier,
];
