/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
  root: true,
  ignorePatterns: [
    "node_modules/",
    "**/node_modules/",
    "/**/node_modules/*",
    "out/",
    "dist/",
    "build/",
  ],
};
