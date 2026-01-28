import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["packages/core/src/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "extension/**"],
    coverage: {
      provider: "v8",
      reportsDirectory: "./coverage",
      reporter: ["text", "html"],
      include: ["packages/core/src/**/*.ts"],
      exclude: ["**/*.d.ts", "**/*.test.ts"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
});
