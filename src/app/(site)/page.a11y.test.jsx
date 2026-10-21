// @vitest-environment jsdom
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { describe, expect, it } from "vitest";
import Home from "./page";

// axe at WCAG 2.1 A/AA + best practice. jsdom doesn't lay out or paint, so
// color contrast isn't checked here (it's measured by hand in DESIGN.md), and
// automated checks only catch part of WCAG: keyboard flows are tested too.

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
    // The hero's and the closing section's: the same action, in the same words.
    for (const link of screen.getAllByRole("link", { name: "Open the editor" })) expect(link).toHaveAttribute("href", "/editor");
    expect(screen.getByRole("link", { name: /^Browse \d+ components$/ })).toHaveAttribute("href", "/components");
  });

  it("shows a live component and the exact code it produces, side by side", async () => {
    const user = userEvent.setup();
    render(<Home />);
    const demo = within(screen.getByRole("complementary", { name: "A live component and its code" }));
    // Starts on the Alert: the live component, and the JSX that makes it.
    expect(demo.getByText("Scheduled maintenance")).toBeInTheDocument();
    expect(demo.getByLabelText("Alert code")).toHaveTextContent("<AlertTitle>Scheduled maintenance</AlertTitle>");

    // Another preset changes the preview and the code together.
    await user.click(demo.getByRole("button", { name: "Danger" }));
    expect(demo.getByLabelText("Alert code")).toHaveTextContent('<Alert tone="danger">');
    expect(demo.queryByText("Scheduled maintenance")).not.toBeInTheDocument();

    // A Button: a live, working one, with its code.
    await user.click(demo.getByRole("radio", { name: "Button" }));
    expect(demo.getByRole("button", { name: "Get started" })).toBeInTheDocument();
    expect(demo.getByLabelText("Button code")).toHaveTextContent("<Button>Get started</Button>");

    // Another component starts on its own first preset, and is usable right there.
    await user.click(demo.getByRole("radio", { name: "Accordion" }));
    const question = demo.getByRole("button", { name: "Can I return an item?" });
    await user.click(question);
    expect(question).toHaveAttribute("aria-expanded", "true");
    expect(demo.getByLabelText("Accordion code")).toHaveTextContent("AccordionTrigger");
  });

  it("ends on the same action it opens with, under the same name", () => {
    render(<Home />);
    expect(screen.getAllByRole("link", { name: "Open the editor" })).toHaveLength(2);
    const closing = screen.getByRole("region", { name: "Ready to put them on a real page?" });
    expect(within(closing).getByRole("link", { name: "Open the editor" })).toHaveAttribute("href", "/editor");
  });
});
