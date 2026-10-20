// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import TryPage from "./page";

// axe at WCAG 2.1 A/AA + best practice, in jsdom (structure only: color
// contrast is checked in a real browser by tests/e2e/a11y.spec.js, and the
// keyboard walk by tests/e2e/try.spec.js).

describe("Try it page", () => {
  it("has no axe violations at WCAG 2.1 AA and best practice", async () => {
    const { container } = render(<TryPage />);
    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it("has one h1, a group h2 for each kind of component, and headings that never skip a level", () => {
    render(<TryPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const groups = screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent);
    expect(groups).toEqual(["Actions", "Inputs", "Display", "Feedback", "Overlays", "States", "Ready to put them on a real page?"]);
    const levels = screen.getAllByRole("heading").map((heading) => Number(heading.tagName.slice(1)));
    levels.forEach((level, index) => {
      if (index > 0) expect(level - levels[index - 1]).toBeLessThanOrEqual(1);
    });
  });

  it("has exactly one primary action outside the specimens: Open the editor", () => {
    render(<TryPage />);
    const closing = screen.getByRole("region", { name: "Ready to put them on a real page?" });
    expect(within(closing).getByRole("link", { name: "Open the editor" })).toHaveAttribute("href", "/editor");
    // The hero has no buttons, only the jump link to the gallery.
    const hero = screen.getByRole("region", { name: /See how Volt feels/ });
    expect(within(hero).getByRole("link", { name: "Browse components" })).toHaveAttribute("href", "#showcase");
    expect(within(hero).queryByRole("button")).not.toBeInTheDocument();
  });

  it("shows the email error until the address is fixed and the field is left", async () => {
    const user = userEvent.setup();
    render(<TryPage />);
    const email = screen.getByRole("textbox", { name: "Contact email" });
    expect(email).toHaveAccessibleDescription("Enter an email address like name@example.com.");
    await user.clear(email);
    await user.type(email, "sam@example.com");
    await user.tab();
    expect(email).not.toHaveAttribute("aria-invalid");
    expect(email).not.toHaveAccessibleDescription();
  });
});
