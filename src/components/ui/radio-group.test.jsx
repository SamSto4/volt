// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./radio-group";

/** @param {Partial<import("react").ComponentProps<typeof RadioGroup>>} props */
function Frequency(props) {
  return (
    <RadioGroup label="How often should we email you?" {...props}>
      <RadioGroupItem value="weekly" label="Every week" description="A short round-up." />
      <RadioGroupItem value="monthly" label="Once a month" />
      <RadioGroupItem value="never" label="Never" />
    </RadioGroup>
  );
}

describe("RadioGroup", () => {
  it("is a radio group named by its question, with one radio per option", () => {
    render(<Frequency />);
    const group = screen.getByRole("radiogroup", { name: "How often should we email you?" });
    expect(group.tagName).toBe("FIELDSET");
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "Every week" })).toHaveAccessibleDescription("A short round-up.");
  });

  it("allows only one choice: choosing another unchecks the first", async () => {
    const user = userEvent.setup();
    render(<Frequency defaultValue="weekly" />);
    expect(screen.getByRole("radio", { name: "Every week" })).toBeChecked();
    await user.click(screen.getByText("Never"));
    expect(screen.getByRole("radio", { name: "Never" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Every week" })).not.toBeChecked();
  });

  it("shares one name, so forms submit the chosen value", () => {
    render(<Frequency name="frequency" />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toHaveAttribute("name", "frequency");
  });

  it("can be controlled with value and onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("monthly");
      return (
        <Frequency
          value={value}
          onValueChange={(next) => {
            onValueChange(next);
            setValue(next);
          }}
        />
      );
    }
    render(<Controlled />);
    expect(screen.getByRole("radio", { name: "Once a month" })).toBeChecked();
    await user.click(screen.getByText("Never"));
    expect(onValueChange).toHaveBeenCalledWith("never");
    expect(screen.getByRole("radio", { name: "Never" })).toBeChecked();
  });

  it("is required without saying it twice, and disables every option at once", () => {
    const { rerender } = render(<Frequency required />);
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-required", "true");
    expect(screen.getByRole("radio", { name: "Every week" })).toBeRequired();
    rerender(<Frequency disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("reads the group's hint as its description", () => {
    render(<Frequency description="You can change this later." />);
    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("You can change this later.");
  });
});
