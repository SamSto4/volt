import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Unit and integration tests sit next to the code they test: foo.js -> foo.test.js.
    include: ["src/**/*.test.{js,jsx}"],
    // Playwright owns tests/e2e; Vitest must not try to run those files.
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    // There are no tests yet. The first real ones arrive with the component
    // manifests; until then `pnpm test` succeeds without pretending to test anything.
    passWithNoTests: true,
  },
});
