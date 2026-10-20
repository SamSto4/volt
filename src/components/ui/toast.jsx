"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Tooltip } from "./tooltip";

const VISIBLE_MS = 5000;

/**
 * A short message at the bottom of the screen about something that just
 * happened, with one action, usually Undo (DESIGN.md §10 "Toast").
 *
 * - It goes away after 5 seconds, but the timer pauses while the pointer is
 *   over it or focus is inside it, so nobody loses the button while reaching
 *   for it (WCAG 2.2.1).
 * - Focus never moves to it on its own; that would pull keyboard users away
 *   from their work. The message is announced through a polite live region
 *   that's always on the page (one that appears together with its text often
 *   isn't read at all). Pass announce={false} if you already announce it.
 * - It fades in and rises a few pixels; with reduced motion it only fades.
 *
 * @param {{
 *   open: boolean,
 *   message: string,
 *   onDismiss: () => void,
 *   actionLabel?: string,
 *   onAction?: () => void,
 *   actionKeyshortcuts?: string,
 *   id?: string | number,
 *   announce?: boolean,
 *   className?: string,
 * }} props
 *   onDismiss: called when it times out or the Dismiss button is pressed
 *   actionKeyshortcuts: the action's keyboard shortcut, e.g. "Control+Z Meta+Z"
 *   id: change it to restart the timer for a new toast with the same message
 */
export function Toast({ open, message, onDismiss, actionLabel, onAction, actionKeyshortcuts, id, announce = true, className }) {
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));
  const remaining = useRef(VISIBLE_MS);
  const startedAt = useRef(0);
  // The latest onDismiss, so the timer never calls a stale one.
  const dismiss = useRef(onDismiss);
  useEffect(() => {
    dismiss.current = onDismiss;
  });

  const start = () => {
    clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = setTimeout(() => dismiss.current(), remaining.current);
  };
  const pause = () => {
    clearTimeout(timer.current);
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
  };

  // Each new toast gets the full 5 seconds.
  useEffect(() => {
    if (!open) return;
    remaining.current = VISIBLE_MS;
    start();
    return () => clearTimeout(timer.current);
    // start reads refs only; re-running on its identity would restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, id ?? message]);

  return (
    <>
      {announce && (
        <p role="status" className="sr-only">
          {open ? message : ""}
        </p>
      )}
      {open && (
        <div
          data-slot="toast"
          onPointerEnter={pause}
          onPointerLeave={start}
          onFocus={pause}
          onBlur={(event) => {
            if (!event.currentTarget.contains(/** @type {Node | null} */ (event.relatedTarget))) start();
          }}
          className={cn(
            // Centered by margins between 16px insets, so it never runs off a phone screen.
            "fixed inset-x-4 bottom-6 z-50 mx-auto flex w-fit items-center gap-4 rounded-md border border-border bg-card py-2 pr-2 pl-4 text-card-foreground",
            // Enter: fade in, and rise 8px only when motion is allowed.
            "transition-[opacity,translate] duration-200 ease-out starting:opacity-0 motion-safe:starting:translate-y-2",
            className,
          )}
        >
          <p className="type-small">{message}</p>
          {actionLabel && (
            <Button
              variant="secondary"
              aria-keyshortcuts={actionKeyshortcuts}
              onClick={() => {
                onAction?.();
                onDismiss();
              }}
            >
              {actionLabel}
            </Button>
          )}
          <Tooltip content="Dismiss" kind="label">
            <button
              type="button"
              onClick={onDismiss}
              className="inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors duration-100 hover:bg-accent hover:text-foreground"
            >
              <X aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>
          </Tooltip>
        </div>
      )}
    </>
  );
}
