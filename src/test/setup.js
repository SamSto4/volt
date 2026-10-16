// Runs before every test file (see vitest.config.mjs).
import "@testing-library/jest-dom/vitest"; // adds matchers like toBeDisabled() and toHaveAccessibleName()
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Unmount whatever a test rendered, so the next test starts with an empty page.
afterEach(() => {
  cleanup();
});
