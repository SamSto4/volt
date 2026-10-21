"use client";

import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Volt tooltip (DESIGN.md §10): ink fill, surface text, `small` type,
// radius-sm, after a 400ms hover delay, and on keyboard focus.
//
// WCAG 1.4.13 (content on hover or focus) asks for three things, all here:
// - dismissible: Escape hides it without moving focus or the pointer;
// - hoverable: the pointer can move onto the tooltip without it vanishing;
// - persistent: it stays until the pointer leaves, focus moves, or Escape.

const HOVER_DELAY_MS = 400;

/**
 * @param {{
 *   content: string,
 *   children: import("react").ReactElement<any>,
 *   kind?: "label" | "description",
 *   side?: "top" | "bottom",
 *   className?: string,
 * }} props
 *   kind: "label" when the tooltip *is* the trigger's name (icon-only buttons:
 *   the text becomes its accessible name via aria-labelledby); "description"
 *   for extra information (aria-describedby).
 */
export function Tooltip({ content, children, kind = "description", side = "top", className }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));

  // Clear a pending show if the tooltip unmounts first.
  useEffect(() => () => clearTimeout(timer.current), []);

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setOpen(false);
  };

  const trigger = isValidElement(children)
    ? cloneElement(children, kind === "label" ? { "aria-labelledby": id } : { "aria-describedby": id })
    : children;

  return (
    <span
      data-slot="tooltip"
      className={cn("relative inline-flex", className)}
      onPointerEnter={() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(true), HOVER_DELAY_MS);
      }}
      // Leaving the trigger *and* the tooltip (it's inside this span) hides it.
      onPointerLeave={hide}
      onFocus={(event) => {
        // Keyboard focus only: a mouse click shouldn't pop a tooltip.
        if (isFocusVisible(event.target)) show();
      }}
      onBlur={hide}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          // Close the tooltip only; don't let Escape also close a dialog or clear a selection.
          event.stopPropagation();
          hide();
        }
      }}
    >
      {trigger}
      <span
        id={id}
        role="tooltip"
        // In the DOM even when hidden, so aria-labelledby/-describedby always
        // resolve. Hidden elements still count for those relationships.
        hidden={!open}
        className={cn(
          "absolute left-1/2 z-50 w-max max-w-64 -translate-x-1/2 rounded-sm bg-foreground px-2 py-1 type-small text-background",
          // Fades in as `hidden` lifts, moving 4px toward its trigger's far
          // side only when motion is allowed.
          "transition-[opacity,translate] duration-200 ease-out starting:opacity-0",
          side === "top" ? "bottom-full mb-2 motion-safe:starting:translate-y-1" : "top-full mt-2 motion-safe:starting:-translate-y-1",
        )}
      >
        {content}
      </span>
    </span>
  );
}

/** @param {EventTarget} target */
function isFocusVisible(target) {
  try {
    return /** @type {Element} */ (target).matches(":focus-visible");
  } catch {
    // Older engines without :focus-visible: show it, which errs on the side of access.
    return true;
  }
}
