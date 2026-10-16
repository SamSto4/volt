// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { cardProps } from "@/registry/card";
import { Card, CardDescription, CardHeader, CardTitle } from "./card";

/** @param {{ level?: 2 | 3 | 4 }} [props] */
function PlanCard({ level } = {}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle level={level}>Starter plan</CardTitle>
        <CardDescription>Everything you need to publish your first page.</CardDescription>
      </CardHeader>
    </Card>
  );
}

describe("Card", () => {
  it("gives its title a real heading, level 3 by default", () => {
    render(<PlanCard />);
    expect(screen.getByRole("heading", { level: 3, name: "Starter plan" })).toBeInTheDocument();
  });

  it("uses the heading level it's given", () => {
    render(<PlanCard level={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Starter plan" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });

  it("shows the description as text, not as another heading", () => {
    render(<PlanCard />);
    expect(screen.getByText("Everything you need to publish your first page.").tagName).toBe("P");
    expect(screen.getAllByRole("heading")).toHaveLength(1);
  });

  it("is not interactive: Tab goes past it", async () => {
    const user = userEvent.setup();
    render(
      <>
        <PlanCard />
        <button type="button">Next</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
  });

  it("lets a caller's className override the defaults", () => {
    render(<Card data-testid="card" className="p-10" />);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("p-10");
    expect(card).not.toHaveClass("p-4");
  });
});

describe("Card and its manifest", () => {
  const levels = [...cardProps.shape.headingLevel.unwrap().values];

  it.each(levels)("renders an h%i when the manifest's heading level is %i", (level) => {
    render(<PlanCard level={level} />);
    expect(screen.getByRole("heading", { level, name: "Starter plan" })).toBeInTheDocument();
  });

  it("defaults to the same heading level as the manifest", () => {
    render(<PlanCard />);
    const { headingLevel } = cardProps.parse({});
    expect(screen.getByRole("heading", { name: "Starter plan" }).tagName).toBe(`H${headingLevel}`);
  });
});
