/* eslint-env node */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
    parserOptions: {
    project: "./tsconfig.json"  // Replace with the path to your tsconfig.json file
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-floating-promises": ["error"]
  },
  root: true,
  ignorePatterns: [
    ".eslintrc.cjs",
    "node_modules/",
    "**/node_modules/",
    "/**/node_modules/*",
    "out/",
    "dist/",
    "build/",
  ],
};
