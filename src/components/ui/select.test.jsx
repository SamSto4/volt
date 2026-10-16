// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { SelectField } from "./select";

function PlanSelect() {
  return (
    <SelectField label="Plan" description="You can change it later.">
      <option value="Free">Free</option>
      <option value="Pro">Pro</option>
    </SelectField>
  );
}

describe("SelectField", () => {
  it("is a native select named by its label and described by its hint", () => {
    render(<PlanSelect />);
    const select = screen.getByRole("combobox", { name: "Plan" });
    expect(select.tagName).toBe("SELECT");
    expect(select).toHaveAccessibleDescription("You can change it later.");
  });

  it("lets people choose an option", async () => {
    const user = userEvent.setup();
    render(<PlanSelect />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Plan" }), "Pro");
    expect(screen.getByRole("option", { name: "Pro" })).toHaveProperty("selected", true);
  });

  it("hides its decorative arrow from screen readers", () => {
    const { container } = render(<PlanSelect />);
    expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
