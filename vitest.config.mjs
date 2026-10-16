import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Same `@/` alias as jsconfig.json, so tests import exactly like app code.
    // fileURLToPath (not URL.pathname) because the project path contains spaces.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    // Unit and integration tests sit next to the code they test: foo.js -> foo.test.js.
    include: ["src/**/*.test.{js,jsx}"],
    // Playwright owns tests/e2e; Vitest must not try to run those files.
    exclude: ["node_modules", ".next", "tests/e2e/**"],
    // Tests run in Node by default. Component tests opt into a simulated
    // browser with a `// @vitest-environment jsdom` comment at the top.
    setupFiles: ["./src/test/setup.js"],
  },
});
