// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Dialog } from "./dialog";

// jsdom gets a showModal()/close() stand-in (src/test/setup.js). These tests
// cover Volt's own behavior; the focus trap and native Escape come from real
// browsers and aren't simulated.

function DeleteDialog(/** @type {{ onConfirm?: () => void }} */ { onConfirm }) {
  return (
    <Dialog
      trigger="Delete page"
      title="Delete this page?"
      description="This can't be undone."
      confirmLabel="Delete page"
      tone="danger"
      onConfirm={onConfirm}
    />
  );
}

describe("Dialog", () => {
  it("opens from its button as a named, described dialog with Cancel focused", async () => {
    const user = userEvent.setup();
    render(<DeleteDialog />);
    const trigger = screen.getByRole("button", { name: "Delete page" });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Delete this page?" });
    expect(dialog).toHaveAccessibleDescription("This can't be undone.");
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveFocus();
  });

  it("Cancel closes it and returns focus to the trigger, without confirming", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteDialog onConfirm={onConfirm} />);
    const trigger = screen.getByRole("button", { name: "Delete page" });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();
    expect(trigger).toHaveFocus();
  });

  it("Confirm runs onConfirm and closes", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<DeleteDialog onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Delete page" }));
    // Two buttons are called "Delete page" now: the trigger and the confirm.
    const [, confirm] = screen.getAllByRole("button", { name: "Delete page" });
    await user.click(confirm);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the backdrop (the dialog element itself) is clicked", async () => {
    const user = userEvent.setup();
    render(<DeleteDialog />);
    await user.click(screen.getByRole("button", { name: "Delete page" }));
    await user.click(screen.getByRole("dialog"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("uses danger buttons for the danger tone", async () => {
    const user = userEvent.setup();
    render(<DeleteDialog />);
    expect(screen.getByRole("button", { name: "Delete page" })).toHaveAttribute("data-variant", "danger");
    await user.click(screen.getByRole("button", { name: "Delete page" }));
    const [, confirm] = screen.getAllByRole("button", { name: "Delete page" });
    expect(confirm).toHaveAttribute("data-variant", "danger");
  });
});
