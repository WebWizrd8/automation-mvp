/* eslint-env node */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  verbose: true,
  detectOpenHandles: true,
  roots: ["<rootDir>/src"],
  setupFiles: ["./jest.setup.cjs"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/dist/"],
};
