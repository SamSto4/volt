// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import Home from "./page";

// Same axe settings and limits as src/app/foundations/page.a11y.test.jsx.

describe("home page", () => {
  it("has no axe violations at WCAG 2.1 AA and best practice", async () => {
    const { container } = render(<Home />);
    const results = await axe.run(container, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"] },
      rules: { "color-contrast": { enabled: false } },
    });
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  it("has one h1 and links (not buttons) to the editor and the catalog", () => {
    render(<Home />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Open the editor" })).toHaveAttribute("href", "/editor");
    expect(screen.getByRole("link", { name: /^Browse \d+ components$/ })).toHaveAttribute("href", "/components");
  });

  it("its example components are live: the tabs switch", async () => {
    const user = userEvent.setup();
    render(<Home />);
    await user.click(screen.getByRole("tab", { name: "Vite" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent("src/components");
  });
});
