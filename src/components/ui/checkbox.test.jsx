// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
  it("is a native checkbox named by its label, ticked by clicking the label or pressing Space", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Send me the newsletter" />);
    const box = screen.getByRole("checkbox", { name: "Send me the newsletter" });
    await user.click(screen.getByText("Send me the newsletter"));
    expect(box).toBeChecked();
    await user.keyboard(" ");
    expect(box).not.toBeChecked();
  });

  it("is required without saying it twice, and reads its hint", () => {
    render(<Checkbox label="I agree" description="Read the terms first." required />);
    const box = screen.getByRole("checkbox", { name: "I agree" });
    expect(box).toBeRequired();
    expect(box).toHaveAccessibleDescription("Read the terms first.");
  });

  it("starts ticked with defaultChecked", () => {
    render(<Checkbox label="A" defaultChecked />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });
});
