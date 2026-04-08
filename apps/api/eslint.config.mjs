import baseConfig from "../../eslint.config.mjs";

export default [
  ...baseConfig,
  {
    files: ["**/*.ts"],
    rules: {
      // Prisma v6 generates .d.ts/.js (not .ts), causing enforce-module-boundaries to crash
      "@nx/enforce-module-boundaries": "off",
      // NestJS patterns
      "no-useless-constructor": "off",
      "@typescript-eslint/no-useless-constructor": "off",
      "no-empty-function": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];
