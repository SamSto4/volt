// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { inputProps } from "@/registry/input";
import { Input, InputField } from "./input";

describe("InputField", () => {
  it("is named by its visible label", () => {
    render(<InputField label="Email" type="email" />);
    expect(screen.getByRole("textbox", { name: "Email" })).toBeInTheDocument();
  });

  it("focuses the field when its label is clicked", async () => {
    const user = userEvent.setup();
    render(<InputField label="Email" />);
    await user.click(screen.getByText("Email"));
    expect(screen.getByRole("textbox", { name: "Email" })).toHaveFocus();
  });

  it("gives each field on a page its own id, so labels never point at the wrong field", async () => {
    const user = userEvent.setup();
    render(
      <>
        <InputField label="First name" />
        <InputField label="Last name" />
      </>,
    );
    await user.click(screen.getByText("Last name"));
    expect(screen.getByRole("textbox", { name: "Last name" })).toHaveFocus();
    expect(screen.getByRole("textbox", { name: "First name" }).id).not.toBe(
      screen.getByRole("textbox", { name: "Last name" }).id,
    );
  });

  it("reads the hint as the field's description", () => {
    render(<InputField label="Display name" description="Shown on your public pages." />);
    expect(screen.getByRole("textbox", { name: "Display name" })).toHaveAccessibleDescription(
      "Shown on your public pages.",
    );
  });

  it("marks the field invalid and reads the error with the hint", () => {
    render(
      <InputField
        label="Website"
        description="Your portfolio or blog."
        error="Enter a full address, like https://example.com."
      />,
    );
    const field = screen.getByRole("textbox", { name: "Website" });
    expect(field).toBeInvalid();
    expect(field).toHaveAccessibleDescription(
      "Your portfolio or blog. Enter a full address, like https://example.com.",
    );
  });

  it("without a hint or error, has no description and isn't marked invalid", () => {
    render(<InputField label="Email" />);
    const field = screen.getByRole("textbox", { name: "Email" });
    expect(field).not.toHaveAttribute("aria-describedby");
    expect(field).not.toHaveAttribute("aria-invalid");
  });

  it("is required without saying “required” twice to screen readers", () => {
    render(<InputField label="Email" required />);
    const field = screen.getByRole("textbox", { name: "Email" });
    expect(field).toBeRequired();
    // The visible "(required)" is aria-hidden, so the name stays just "Email".
    expect(field).toHaveAccessibleName("Email");
    expect(screen.getByText("(required)")).toBeVisible();
  });

  it("accepts typing", async () => {
    const user = userEvent.setup();
    render(<InputField label="Email" />);
    const field = screen.getByRole("textbox", { name: "Email" });
    await user.type(field, "sam@example.com");
    expect(field).toHaveValue("sam@example.com");
  });

  it("when disabled, can't be typed into", async () => {
    const user = userEvent.setup();
    render(<InputField label="Email" disabled />);
    const field = screen.getByRole("textbox", { name: "Email" });
    expect(field).toBeDisabled();
    await user.type(field, "x");
    expect(field).toHaveValue("");
  });
});

describe("Input", () => {
  it("lets a caller's className override the defaults", () => {
    render(<Input aria-label="Search" className="h-12" />);
    const field = screen.getByRole("textbox", { name: "Search" });
    expect(field).toHaveClass("h-12");
    expect(field).not.toHaveClass("h-10");
  });
});

describe("InputField and its manifest", () => {
  const types = inputProps.shape.type.unwrap().options;

  it.each(types)("renders a field of type '%s'", (type) => {
    render(<InputField label="Field" type={type} />);
    expect(screen.getByLabelText("Field")).toHaveAttribute("type", type);
  });

  it("renders the manifest's defaults as a valid, labeled field", () => {
    const { label, ...props } = inputProps.parse({});
    render(<InputField label={label} {...props} />);
    const field = screen.getByLabelText(label);
    expect(field).toHaveAttribute("type", props.type);
    expect(field).not.toBeInvalid();
  });
});
