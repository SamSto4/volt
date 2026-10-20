// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "./button";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("names what's missing in a real heading, at the level it's given", () => {
    const { rerender } = render(<EmptyState title="No saved pages yet" />);
    expect(screen.getByRole("heading", { level: 3, name: "No saved pages yet" })).toBeInTheDocument();
    rerender(<EmptyState title="No saved pages yet" level={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "No saved pages yet" })).toBeInTheDocument();
  });

  it("offers its one action, and hides the decorative icon", () => {
    render(
      <EmptyState title="No saved pages yet" description="Pages you save show up here.">
        <Button variant="secondary">Start a new page</Button>
      </EmptyState>,
    );
    expect(screen.getByRole("button", { name: "Start a new page" })).toBeInTheDocument();
    expect(screen.getByText("Pages you save show up here.")).toBeInTheDocument();
    for (const icon of document.querySelectorAll("svg")) expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
