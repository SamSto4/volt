// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { buttonProps } from "@/registry/button";
import { Button, sizeClasses, variantClasses } from "./button";

// Behavior and accessibility tests, not markup snapshots: they check what a
// user (or a screen reader) experiences, so restyling won't break them.

describe("Button", () => {
  it("is a button whose accessible name is its visible label", () => {
    render(<Button>Get started</Button>);
    expect(screen.getByRole("button")).toHaveAccessibleName("Get started");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("can be reached with Tab and activated with Enter and with Space", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.tab();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
  });

  it("doesn't submit a surrounding form unless type='submit' is set", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((/** @type {import("react").FormEvent} */ event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button>Add another</Button>
        <Button type="submit">Send</Button>
      </form>,
    );

    await user.click(screen.getByRole("button", { name: "Add another" }));
    expect(onSubmit).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("when disabled, can't be focused or clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save" });

    expect(button).toBeDisabled();
    await user.tab();
    expect(button).not.toHaveFocus();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("lets a caller's className override the defaults", () => {
    render(<Button className="px-6">Wide</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("px-6");
    expect(button).not.toHaveClass("px-4");
  });
});

// The manifest decides which styles and sizes exist (it drives the inspector),
// and the component decides how they look. These tests keep the two in sync.
describe("Button and its manifest", () => {
  const variants = buttonProps.shape.variant.unwrap().options;
  const sizes = buttonProps.shape.size.unwrap().options;

  it("has classes for exactly the styles the manifest allows", () => {
    expect(Object.keys(variantClasses).sort()).toEqual([...variants].sort());
  });

  it("has classes for exactly the sizes the manifest allows", () => {
    expect(Object.keys(sizeClasses).sort()).toEqual([...sizes].sort());
  });

  it("uses the manifest's defaults when no props are given", () => {
    const defaults = buttonProps.parse({});
    render(<Button>Default</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("data-variant", defaults.variant);
    expect(button).toHaveAttribute("data-size", defaults.size);
  });
});
