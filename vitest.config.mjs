import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      DATABASE_URL: "",
      VITEST: "true",
    },
  },
});
