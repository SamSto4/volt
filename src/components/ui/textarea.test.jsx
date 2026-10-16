// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TextareaField } from "./textarea";

describe("TextareaField", () => {
  it("is a multi-line textbox named by its label, with the rows it's given", () => {
    render(<TextareaField label="Message" rows={6} />);
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field.tagName).toBe("TEXTAREA");
    expect(field).toHaveAttribute("rows", "6");
  });

  it("keeps line breaks people type", async () => {
    const user = userEvent.setup();
    render(<TextareaField label="Message" />);
    const field = screen.getByRole("textbox", { name: "Message" });
    await user.type(field, "Hello{Enter}there");
    expect(field).toHaveValue("Hello\nthere");
  });

  it("links its hint and error, and marks itself invalid", () => {
    render(<TextareaField label="Message" description="Be kind." error="Write a message first." required />);
    const field = screen.getByRole("textbox", { name: "Message" });
    expect(field).toBeInvalid();
    expect(field).toBeRequired();
    expect(field).toHaveAccessibleDescription("Be kind. Write a message first.");
  });
});
