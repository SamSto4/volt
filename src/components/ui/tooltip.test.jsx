// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { tooltipProps } from "@/registry/tooltip";
import { Button } from "./button";
import { Tooltip } from "./tooltip";

describe("Tooltip", () => {
  it("describes its control, so screen readers read it after the name", () => {
    render(
      <Tooltip content="Keeps your changes without publishing them.">
        <Button>Save draft</Button>
      </Tooltip>,
    );
    const button = screen.getByRole("button", { name: "Save draft" });
    expect(button).toHaveAccessibleDescription("Keeps your changes without publishing them.");
  });

  it("as a label, becomes an icon-only button's accessible name", () => {
    render(
      <Tooltip content="Undo" kind="label">
        <Button variant="ghost">
          <svg aria-hidden="true" />
        </Button>
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
  });

  it("appears after a 400ms hover, and stays while the pointer is on the tooltip itself", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hint">
        <Button>Save</Button>
      </Tooltip>,
    );
    const started = Date.now();
    await user.hover(screen.getByRole("button"));
    // Not straight away: the delay keeps tooltips from flashing as the pointer passes.
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(await screen.findByRole("tooltip", {}, { timeout: 1000 })).toHaveTextContent("Hint");
    expect(Date.now() - started).toBeGreaterThanOrEqual(390);
    // Moving from the button onto the tooltip keeps it open: hoverable. These
    // events carry relatedTarget the way a browser sends them (user-event's
    // hover doesn't, in jsdom, which would look like leaving the wrapper).
    const button = screen.getByRole("button");
    const tooltip = screen.getByRole("tooltip");
    fireEvent.pointerOut(button, { relatedTarget: tooltip });
    fireEvent.pointerOver(tooltip, { relatedTarget: button });
    expect(screen.getByRole("tooltip")).toBeVisible();
    // Leaving the whole thing hides it.
    fireEvent.pointerOut(tooltip, { relatedTarget: document.body });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("appears on keyboard focus and Escape dismisses it without moving focus", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hint">
        <Button>Save</Button>
      </Tooltip>,
    );
    await user.tab();
    expect(screen.getByRole("tooltip")).toBeVisible();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toHaveFocus();
  });

  it("Escape closes only the tooltip, not whatever is around it", async () => {
    const user = userEvent.setup();
    const onOuterEscape = vi.fn();
    render(
      <div onKeyDown={(event) => event.key === "Escape" && onOuterEscape()}>
        <Tooltip content="Hint">
          <Button>Save</Button>
        </Tooltip>
      </div>,
    );
    await user.tab();
    await user.keyboard("{Escape}");
    expect(onOuterEscape).not.toHaveBeenCalled();
  });
});

describe("Tooltip and its manifest", () => {
  it("renders the defaults as a described button", () => {
    const { label, content } = tooltipProps.parse({});
    render(
      <Tooltip content={content}>
        <Button variant="secondary">{label}</Button>
      </Tooltip>,
    );
    expect(screen.getByRole("button", { name: label })).toHaveAccessibleDescription(content);
  });
});
