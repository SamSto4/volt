// @vitest-environment jsdom
import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import { manifests } from "@/registry";
import ComponentPage from "./[name]/page";
import ComponentsPage from "./page";

// Same scan as the home page (see src/app/page.a11y.test.jsx for its limits),
// over the catalog index and every component's page.

/** @param {Element} container */
async function scan(container) {
  const results = await axe.run(container, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    rules: { "color-contrast": { enabled: false } },
  });
  return results.violations.map(
    (violation) => `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(" ")).join(", ")})`,
  );
}

describe("catalog accessibility", () => {
  it("the components index has no axe violations", async () => {
    const { container } = render(<ComponentsPage />);
    expect(await scan(container)).toEqual([]);
  });

  it.each(manifests.map((manifest) => manifest.name))("the %s page has no axe violations", async (name) => {
    // A Server Component is an async function: call it, then render what it returns.
    const page = await ComponentPage({ params: Promise.resolve({ name }) });
    const { container } = render(page);
    expect(await scan(container)).toEqual([]);
  });
});
