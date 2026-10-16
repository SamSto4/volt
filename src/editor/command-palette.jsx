"use client";

import { Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { searchCommands } from "./commands.js";

/**
 * The command palette (DESIGN.md §10): a centered dialog with fuzzy search,
 * shortcuts right-aligned in mono, and recent commands first.
 *
 * It's a native <dialog> (focus trapped inside, Escape closes) holding the
 * WAI-ARIA combobox pattern: focus stays in the text box while Up/Down move
 * an "active" option, announced through aria-activedescendant. Enter runs it.
 *
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   commands: import("./commands.js").Command[],
 * }} props
 */
export function CommandPalette({ open, onClose, commands }) {
  const dialog = useRef(/** @type {HTMLDialogElement | null} */ (null));
  const input = useRef(/** @type {HTMLInputElement | null} */ (null));
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState(/** @type {string[]} */ ([]));

  // Open and close the native dialog to match `open`.
  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      element.showModal();
      input.current?.focus();
    } else if (!open && element.open) {
      element.close();
    }
  }, [open]);

  const results = searchCommands(commands, query, recent);
  // Keep the active option inside the list as results change.
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));
  const optionId = (/** @type {number} */ index) => `${listId}-option-${index}`;

  /** @param {import("./commands.js").Command} command */
  function run(command) {
    setRecent((current) => [command.id, ...current.filter((id) => id !== command.id)].slice(0, 5));
    setQuery("");
    setActive(0);
    // Close first: closing returns focus to where it was, and the command may
    // then move focus somewhere new (a block it just added).
    dialog.current?.close();
    command.run();
  }

  return (
    <dialog
      ref={dialog}
      aria-label="Command palette"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialog.current?.close();
      }}
      className="m-auto w-full max-w-xl rounded-md border border-border bg-card p-0 text-card-foreground backdrop:bg-foreground/50"
    >
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search aria-hidden="true" size={20} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
          <label htmlFor={`${listId}-input`} className="sr-only">
            Search commands
          </label>
          <input
            ref={input}
            id={`${listId}-input`}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={results.length > 0 ? optionId(activeIndex) : undefined}
            autoComplete="off"
            value={query}
            placeholder="Add a component, jump to a layer, change the view…"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                if (results.length === 0) return;
                const step = event.key === "ArrowDown" ? 1 : -1;
                setActive((activeIndex + step + results.length) % results.length);
              } else if (event.key === "Enter" && results[activeIndex]) {
                event.preventDefault();
                run(results[activeIndex]);
              }
            }}
            className="h-12 w-full min-w-0 rounded-sm bg-transparent type-body text-foreground placeholder:text-muted-foreground"
          />
        </div>

        <ul id={listId} role="listbox" aria-label="Commands" className="max-h-80 overflow-y-auto p-2">
          {results.map((command, index) => (
            <li
              key={command.id}
              id={optionId(index)}
              role="option"
              aria-selected={index === activeIndex}
              onClick={() => run(command)}
              onPointerMove={() => setActive(index)}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded-sm px-3 py-2 type-small",
                index === activeIndex && "bg-accent",
              )}
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-medium">{command.title}</span>
                <span className="text-muted-foreground">{command.group}</span>
              </span>
              {command.shortcut && (
                <kbd className="shrink-0 rounded-sm border border-border px-2 type-code text-muted-foreground">{command.shortcut}</kbd>
              )}
            </li>
          ))}
        </ul>
        {results.length === 0 && (
          <p className="px-4 pb-4 type-small text-muted-foreground">No commands match “{query}”.</p>
        )}
        {/* How many results, for screen readers, as the list changes. */}
        <p role="status" className="sr-only">
          {results.length === 1 ? "1 command" : `${results.length} commands`}
        </p>
      </div>
    </dialog>
  );
}
