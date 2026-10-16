"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useEditor, useEditorStore } from "./editor-context";

const VISIBLE_MS = 5000;

/**
 * The undo toast (DESIGN.md §10): bottom-center, raised, hairline border,
 * with Undo for the removal that just happened. It goes away after 5
 * seconds, but the timer pauses while the pointer is over it or focus is in
 * it, so nobody loses the button while reaching for it.
 *
 * Focus never moves here on its own. The removal is already announced in the
 * editor's live region ("… Undo brings it back."), and Cmd/Ctrl+Z works too.
 *
 * @param {{ onUndo: () => void }} props
 */
export function UndoToast({ onUndo }) {
  const store = useEditorStore();
  const toast = useEditor((state) => state.toast);
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));
  const remaining = useRef(VISIBLE_MS);
  const startedAt = useRef(0);

  const start = () => {
    clearTimeout(timer.current);
    startedAt.current = Date.now();
    timer.current = setTimeout(() => store.getState().dismissToast(), remaining.current);
  };
  const pause = () => {
    clearTimeout(timer.current);
    remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
  };

  // Each new toast gets the full 5 seconds.
  useEffect(() => {
    if (!toast) return;
    remaining.current = VISIBLE_MS;
    start();
    return () => clearTimeout(timer.current);
    // start reads refs only; re-running on its identity would restart the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast?.id]);

  if (!toast) return null;

  return (
    <div
      data-slot="toast"
      onPointerEnter={pause}
      onPointerLeave={start}
      onFocus={pause}
      onBlur={(event) => {
        if (!event.currentTarget.contains(/** @type {Node | null} */ (event.relatedTarget))) start();
      }}
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-md border border-border bg-card py-2 pr-2 pl-4"
    >
      <p className="type-small">{toast.message}</p>
      <Button
        variant="secondary"
        size="sm"
        aria-keyshortcuts="Control+Z Meta+Z"
        onClick={() => {
          onUndo();
          store.getState().dismissToast();
        }}
      >
        Undo
      </Button>
      <Tooltip content="Dismiss" kind="label">
        <button
          type="button"
          onClick={() => store.getState().dismissToast()}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X aria-hidden="true" size={20} strokeWidth={1.5} />
        </button>
      </Tooltip>
    </div>
  );
}
