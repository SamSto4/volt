// @vitest-environment jsdom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Toast } from "./toast";

/** A button that shows a toast, like a page would use it. */
function Demo({ onUndo = () => {}, announce = true }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Remove section
      </button>
      <Toast
        open={open}
        message="Pricing section removed."
        actionLabel="Undo"
        onAction={onUndo}
        onDismiss={() => setOpen(false)}
        announce={announce}
      />
    </>
  );
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });
  // fireEvent rather than user-event here: user-event waits on timers between
  // steps, which never fire while the clock is fake.

  it("announces its message through a live region that was already on the page", () => {
    render(<Demo />);
    const status = screen.getByRole("status");
    expect(status).toBeEmptyDOMElement();
    fireEvent.click(screen.getByRole("button", { name: "Remove section" }));
    expect(status).toHaveTextContent("Pricing section removed.");
  });

  it("doesn't take focus: keyboard users stay where they were", () => {
    render(<Demo />);
    const trigger = screen.getByRole("button", { name: "Remove section" });
    // fireEvent doesn't focus on click like a real pointer does, so focus first.
    act(() => trigger.focus());
    fireEvent.click(trigger);
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("runs its action and then closes", () => {
    const onUndo = vi.fn();
    render(<Demo onUndo={onUndo} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove section" }));
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(onUndo).toHaveBeenCalledOnce();
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  it("goes away after 5 seconds, but not while the pointer is over it", () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Remove section" }));
    const toast = /** @type {HTMLElement} */ (screen.getByText("Pricing section removed.", { selector: "[data-slot=toast] p" }).parentElement);

    act(() => vi.advanceTimersByTime(3000));
    fireEvent.pointerEnter(toast);
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();

    // Leaving resumes the countdown with the 2 seconds that were left.
    fireEvent.pointerLeave(toast);
    act(() => vi.advanceTimersByTime(1900));
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole("button", { name: "Undo" })).not.toBeInTheDocument();
  });

  it("pauses while focus is inside it", () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Remove section" }));
    act(() => screen.getByRole("button", { name: "Undo" }).focus());
    act(() => vi.advanceTimersByTime(10_000));
    expect(screen.getByRole("button", { name: "Undo" })).toHaveFocus();
  });

  it("can be dismissed with its own button, named by its tooltip", () => {
    render(<Demo />);
    fireEvent.click(screen.getByRole("button", { name: "Remove section" }));
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Pricing section removed.", { selector: "[data-slot=toast] p" })).not.toBeInTheDocument();
  });

  it("leaves announcing to the caller with announce={false}", () => {
    render(<Demo announce={false} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove section" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
