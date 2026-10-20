"use client";

import { useId, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** @typedef {import("@/registry/dialog").DialogProps} DialogProps */

/**
 * A confirmation dialog on the native <dialog> element, opened with
 * showModal(). The browser then provides what hand-built modals often get
 * wrong: focus moves into the dialog and stays there, Escape closes it, and
 * the rest of the page is inert (unreachable by Tab and screen readers).
 * Focus goes back to the button that opened it.
 *
 * Volt styling (DESIGN.md §10): raised surface, hairline border, radius-md,
 * a dimmed backdrop, no shadow.
 *
 * @param {{
 *   trigger: string,
 *   title: string,
 *   description: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   tone?: DialogProps["tone"],
 *   onConfirm?: () => void,
 *   children?: import("react").ReactNode,
 * }} props
 */
export function Dialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  children,
}) {
  const id = useId();
  const dialog = useRef(/** @type {HTMLDialogElement | null} */ (null));
  const opener = useRef(/** @type {HTMLButtonElement | null} */ (null));

  const close = () => dialog.current?.close();

  return (
    <>
      <Button ref={opener} variant={tone === "danger" ? "danger" : "secondary"} aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>
        {trigger}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        // Every way of closing (Cancel, Confirm, Escape, the backdrop) ends here.
        onClose={() => opener.current?.focus()}
        // A click on the backdrop lands on the <dialog> itself, not its content.
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        className={cn(
          "m-auto w-full max-w-md rounded-md border border-border bg-card p-0 text-card-foreground",
          "backdrop:bg-foreground/50",
          // Opening (DESIGN.md §7, motion-slow): fades in and rises 8px; with
          // reduced motion it only fades. @starting-style is where it starts from.
          "transition-[opacity,translate] duration-300 ease-out starting:open:opacity-0 motion-safe:starting:open:translate-y-2",
        )}
      >
        <div className="flex flex-col gap-4 p-6">
          <h2 id={`${id}-title`} className="type-heading-2">
            {title}
          </h2>
          <p id={`${id}-description`} className="text-muted-foreground">
            {description}
          </p>
          {children}
          {/* Cancel comes first, so it's what showModal() focuses: the safe
              choice for anything that can't be undone. */}
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={close}>
              {cancelLabel}
            </Button>
            <Button
              variant={tone === "danger" ? "danger" : "primary"}
              onClick={() => {
                onConfirm?.();
                close();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
