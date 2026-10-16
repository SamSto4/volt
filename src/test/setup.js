// Runs before every test file (see vitest.config.mjs).
import "@testing-library/jest-dom/vitest"; // adds matchers like toBeDisabled() and toHaveAccessibleName()
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom doesn't lay out pages, so it has no scrollIntoView. Code that scrolls
// (the editor's Code view) gets a no-op instead of crashing the test.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// Unmount whatever a test rendered, so the next test starts with an empty page.
afterEach(() => {
  cleanup();
});
