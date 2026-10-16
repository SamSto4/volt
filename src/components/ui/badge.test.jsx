// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { badgeProps } from "@/registry/badge";
import { Badge, variantClasses } from "./badge";

describe("Badge", () => {
  it("shows its label as text that's read in place with its surroundings", () => {
    render(
      <p>
        Dark mode <Badge>New</Badge>
      </p>,
    );
    // The paragraph reads as one phrase, with the badge's word included.
    expect(screen.getByText(/Dark mode/)).toHaveTextContent("Dark mode New");
  });

  it("is not interactive: no role and no focus stop", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Badge>Beta</Badge>
        <button type="button">Next</button>
      </>,
    );
    const badge = screen.getByText("Beta");

    expect(badge).not.toHaveAttribute("role");
    expect(badge).not.toHaveAttribute("tabindex");
    // Tab goes straight past the badge to the next real control.
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  it("keeps the label's original case in the DOM; uppercase is only CSS", () => {
    render(<Badge>New</Badge>);
    const badge = screen.getByText("New");
    expect(badge.textContent).toBe("New");
    expect(badge).toHaveClass("type-label");
  });

  it("lets a caller's className override the defaults", () => {
    render(<Badge className="px-4">Wide</Badge>);
    const badge = screen.getByText("Wide");
    expect(badge).toHaveClass("px-4");
    expect(badge).not.toHaveClass("px-2");
  });
});

describe("Badge and its manifest", () => {
  it("has classes for exactly the styles the manifest allows", () => {
    const variants = badgeProps.shape.variant.unwrap().options;
    expect(Object.keys(variantClasses).sort()).toEqual([...variants].sort());
  });

  it("uses the manifest's default style when none is given", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default")).toHaveAttribute("data-variant", badgeProps.parse({}).variant);
  });
});
