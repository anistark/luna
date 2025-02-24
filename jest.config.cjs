module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // Change to "jsdom" if testing in the browser
  roots: ["<rootDir>/tests"], // Ensure tests are included
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transform: {
    "^.+\\.tsx?$": "ts-jest", // Use ts-jest for TypeScript files
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/tests/**/*.test.ts"],
  collectCoverage: true, // Enable coverage report
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/", "/dist/"], // Ignore compiled files
};
