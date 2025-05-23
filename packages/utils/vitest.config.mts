import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["src/**/*.{test,spec}.{js,ts}"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
})
