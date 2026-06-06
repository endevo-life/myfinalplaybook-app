module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.[jt]sx?$": ["babel-jest", { configFile: "./babel.config.js" }],
  },
  transformIgnorePatterns: [
    "node_modules/(?!(expo|@expo|@react-native-async-storage)/)",
  ],
  moduleNameMapper: {
    // Path alias
    "^@/(.*)$": "<rootDir>/src/$1",
    // Mock all asset files
    "\\.(png|jpg|jpeg|gif|mp4|mov|svg)$": "<rootDir>/__mocks__/fileMock.js",
    // Use the official AsyncStorage mock
    "@react-native-async-storage/async-storage":
      "@react-native-async-storage/async-storage/jest/async-storage-mock",
  },
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/hooks/**/*.ts",
    "!**/*.d.ts",
  ],
};
