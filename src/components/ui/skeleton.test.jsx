// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonGroup } from "./skeleton";

describe("Skeleton", () => {
  it("says what's loading once, as a polite status, and hides the shapes", () => {
    render(
      <SkeletonGroup label="Loading metrics">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-10 w-1/2" />
      </SkeletonGroup>,
    );
    expect(screen.getByRole("status")).toHaveTextContent(/^Loading metrics$/);
    for (const shape of document.querySelectorAll("[data-slot=skeleton]")) expect(shape).toHaveAttribute("aria-hidden", "true");
  });

  it("pulses only when reduced motion is off", () => {
    render(<Skeleton data-testid="shape" />);
    const shape = screen.getByTestId("shape", { suggest: false });
    expect(shape).toHaveClass("motion-safe:animate-pulse");
    expect(shape).not.toHaveClass("animate-pulse");
  });

  it("takes its size from the caller", () => {
    render(<Skeleton data-testid="shape" className="h-10 w-1/2" />);
    const shape = screen.getByTestId("shape", { suggest: false });
    expect(shape).toHaveClass("h-10", "w-1/2");
    expect(shape).not.toHaveClass("h-4", "w-full");
  });
});
