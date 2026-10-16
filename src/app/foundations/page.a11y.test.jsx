// @vitest-environment jsdom
import { render } from "@testing-library/react";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import Foundations from "./page";

// An automated accessibility scan of the home page, which shows every
// component's presets. axe finds structural problems: missing names, broken
// ARIA references, bad heading order, duplicate ids, landmark mistakes.
//
// What it can't do here: jsdom doesn't lay out or paint, so color contrast
// isn't checked (contrast is measured by hand in DESIGN.md, and Playwright +
// axe in a real browser comes later). Automated checks also miss a lot, so
// keyboard flows are still tested by hand and in the component tests.

/** @param {Element} container */
async function scan(container) {
  const results = await axe.run(container, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
    rules: { "color-contrast": { enabled: false } },
  });
  // Print each problem as one readable line if the test fails.
  return results.violations.map(
    (violation) => `${violation.id}: ${violation.help} (${violation.nodes.map((node) => node.target.join(" ")).join(", ")})`,
  );
}

describe("foundations page accessibility", () => {
  // Guards the guard: if axe were misconfigured (no rules running), the
  // real test below would pass for the wrong reason.
  it("the scan really reports problems: an unnamed button fails", async () => {
    const { container } = render(
      <main>
        <button type="button" />
      </main>,
    );
    expect((await scan(container)).join("\n")).toMatch(/^button-name:/m);
  });

  it("has no axe violations at WCAG 2.1 AA and best practice", async () => {
    const { container } = render(<Foundations />);
    expect(await scan(container)).toEqual([]);
  });
});
