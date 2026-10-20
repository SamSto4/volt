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

  it("while loading, ignores clicks but keeps focus and its name", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });

    await user.tab();
    rerender(
      <Button onClick={onClick} loading>
        Save
      </Button>,
    );
    // Same element, still focused: a `disabled` button would have lost focus.
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAccessibleName("Save");

    await user.click(button);
    await user.keyboard("{Enter}");
    expect(onClick).not.toHaveBeenCalled();
  });

  it("while loading, can't submit its form a second time", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((/** @type {import("react").FormEvent} */ event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Sending
        </Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Sending" }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("while loading, shows a spinner that screen readers skip", () => {
    render(<Button loading>Saving</Button>);
    const spinner = screen.getByRole("button").querySelector("svg");
    expect(spinner).toHaveAttribute("aria-hidden", "true");
    // Only spins when reduced motion is off.
    expect(spinner).toHaveClass("motion-safe:animate-spin");
  });

  it("while loading, keeps its label in place (same width), only transparent", () => {
    render(<Button loading>Save changes</Button>);
    const button = screen.getByRole("button", { name: "Save changes" });
    // The text is still laid out, so the button doesn't shrink or grow.
    expect(button).toHaveTextContent("Save changes");
    expect(button).toHaveClass("text-transparent");
    expect(button).not.toHaveClass("text-primary-foreground");
    // The spinner keeps the style's own color, centered over the label.
    expect(button.querySelector("svg")).toHaveClass("absolute", "text-primary-foreground");
  });

  it("isn't busy when it isn't loading", () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy");
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

  it("glows only as the primary button (one glow per view, DESIGN.md §5b)", () => {
    for (const [variant, classes] of Object.entries(variantClasses)) {
      expect(classes.includes("shadow-glow"), variant).toBe(variant === "primary");
    }
    // The press settle is movement, so it only happens with motion allowed.
    expect(variantClasses.primary).toContain("motion-safe:active:translate-y-px");
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
