import { defineConfig } from "@playwright/test";

// End-to-end tests in a real browser (CLAUDE.md "Testing"). Unlike the jsdom
// tests, these see real CSS, so axe can check color contrast too.

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  // Fail CI if someone leaves a `test.only` behind.
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // The Chrome already on the machine (GitHub's Ubuntu runners have it too),
    // so there's no separate browser download.
    channel: "chrome",
    trace: "retain-on-failure",
  },
  // Every test runs twice: once per theme. Volt follows the system setting
  // by default, so emulating it is enough to switch themes.
  projects: [
    { name: "light", use: { colorScheme: "light" } },
    { name: "dark", use: { colorScheme: "dark" } },
  ],
  // Tests run against the production build (`pnpm build` first), not the dev
  // server, whose overlay and slower pages would get in the way.
  webServer: {
    command: `pnpm start --port ${PORT}`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
