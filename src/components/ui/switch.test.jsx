// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("is a switch named by its visible label, described by its hint, and off by default", () => {
    render(<Switch label="Dark mode" description="Easier on the eyes." />);
    const control = screen.getByRole("switch", { name: "Dark mode" });
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAccessibleDescription("Easier on the eyes.");
  });

  it("toggles with a click, with Space and with Enter", async () => {
    const user = userEvent.setup();
    render(<Switch label="Dark mode" />);
    const control = screen.getByRole("switch");
    await user.click(control);
    expect(control).toHaveAttribute("aria-checked", "true");
    await user.keyboard(" ");
    expect(control).toHaveAttribute("aria-checked", "false");
    await user.keyboard("{Enter}");
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("starts on with defaultChecked, and follows `checked` when controlled", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { rerender } = render(<Switch label="A" defaultChecked />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
    rerender(<Switch label="B" checked={false} onCheckedChange={onCheckedChange} />);
    await user.click(screen.getByRole("switch", { name: "B" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch", { name: "B" })).toHaveAttribute("aria-checked", "false");
  });

  it("can't be toggled when disabled", async () => {
    const user = userEvent.setup();
    render(<Switch label="A" disabled />);
    await user.click(screen.getByRole("switch"));
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
});
