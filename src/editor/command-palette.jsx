"use client";

import { useEffect, useRef, useState } from "react";
import { Command } from "@/components/ui/command";
import { searchCommands } from "./commands.js";

/**
 * The command palette (DESIGN.md §10): a centered dialog with fuzzy search,
 * shortcuts right-aligned in mono, and recent commands first.
 *
 * It's a native <dialog> (focus trapped inside, Escape closes) around Volt's
 * Command, which does the keyboard and screen-reader work. This file only
 * adds the ranking (searchCommands) and remembers recent commands.
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
  const [query, setQuery] = useState("");
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

  /** @param {import("@/components/ui/command").CommandItem} item */
  function run(item) {
    const command = results.find((candidate) => candidate.id === item.id);
    if (!command) return;
    setRecent((current) => [command.id, ...current.filter((id) => id !== command.id)].slice(0, 5));
    setQuery("");
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
      <Command
        label="Search commands"
        listLabel="Commands"
        countLabel={(count) => (count === 1 ? "1 command" : `${count} commands`)}
        placeholder="Add a component, jump to a layer, change the view…"
        query={query}
        onQueryChange={setQuery}
        results={results}
        onSelect={run}
        inputRef={input}
        empty={<p>No commands match “{query}”.</p>}
      />
    </dialog>
  );
}
