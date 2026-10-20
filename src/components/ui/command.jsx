"use client";

import { CornerDownLeft, Search } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * @typedef {object} CommandItem
 * @property {string} id
 * @property {string} title
 * @property {string} [group]     shown under the title, e.g. "Components"
 * @property {string} [shortcut]  shown right-aligned in mono, e.g. "⌘Z"
 */

/**
 * A search box with a list of results you move through by keyboard, the
 * WAI-ARIA combobox pattern (DESIGN.md §10 "Command palette"):
 *
 *   - focus stays in the text box; Up/Down (and Home/End) move an "active"
 *     result, which aria-activedescendant points at so screen readers read it
 *   - Enter chooses the active result; clicking one works too
 *   - a hidden status says how many results there are as you type
 *
 * It doesn't search on its own: you pass the query and the results, so each
 * caller decides how matching works (the editor's palette ranks by recent
 * use and synonyms). Put it in a dialog for a ⌘K palette, or on the page.
 *
 * @param {{
 *   label: string,
 *   query: string,
 *   onQueryChange: (query: string) => void,
 *   results: CommandItem[],
 *   onSelect: (item: CommandItem) => void,
 *   placeholder?: string,
 *   listLabel?: string,
 *   countLabel?: (count: number) => string,
 *   empty?: import("react").ReactNode,
 *   hint?: string,
 *   inputRef?: import("react").Ref<HTMLInputElement>,
 *   className?: string,
 * }} props
 *   label: the search box's name, e.g. "Search commands" (not shown; the icon shows it)
 *   countLabel: what the hidden status says, e.g. (n) => `${n} commands`
 *   empty: shown when nothing matches
 *   hint: a keyboard shortcut shown inside the search box, e.g. "⌘K"
 */
export function Command({
  label,
  query,
  onQueryChange,
  results,
  onSelect,
  placeholder,
  listLabel = "Results",
  countLabel = (count) => (count === 1 ? "1 result" : `${count} results`),
  empty,
  hint,
  inputRef,
  className,
}) {
  const id = useId();
  const listId = `${id}-list`;
  const optionId = (/** @type {number} */ index) => `${id}-option-${index}`;
  const [active, setActive] = useState(0);
  const list = useRef(/** @type {HTMLUListElement | null} */ (null));
  // Keep the active result inside the list as results change.
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  // Keep the active result in view when arrowing through a long list.
  useEffect(() => {
    list.current?.querySelector(`#${CSS.escape(optionId(activeIndex))}`)?.scrollIntoView({ block: "nearest" });
    // optionId only depends on id, which never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  /** @param {import("react").KeyboardEvent<HTMLInputElement>} event */
  function handleKeyDown(event) {
    const last = results.length - 1;
    /** @type {Record<string, () => number>} */
    const moves = {
      ArrowDown: () => (activeIndex === last ? 0 : activeIndex + 1),
      ArrowUp: () => (activeIndex === 0 ? last : activeIndex - 1),
      Home: () => 0,
      End: () => last,
    };
    if (event.key in moves) {
      // Home/End keep their usual meaning (move the text cursor) unless there are results.
      if (results.length === 0) return;
      event.preventDefault();
      setActive(moves[event.key]());
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      setActive(0);
      onSelect(results[activeIndex]);
    }
  }

  return (
    <div data-slot="command" className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2 border-b border-border px-4">
        <Search aria-hidden="true" size={20} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
        <label htmlFor={`${id}-input`} className="sr-only">
          {label}
        </label>
        <input
          ref={inputRef}
          id={`${id}-input`}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={results.length > 0 ? optionId(activeIndex) : undefined}
          aria-keyshortcuts={hint ? hintToKeyshortcuts(hint) : undefined}
          autoComplete="off"
          spellCheck={false}
          value={query}
          placeholder={placeholder}
          onChange={(event) => {
            onQueryChange(event.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          className="h-12 w-full min-w-0 rounded-sm bg-transparent type-body text-foreground placeholder:text-muted-foreground"
        />
        {hint && (
          <kbd aria-hidden="true" className="shrink-0 rounded-sm border border-border px-2 type-code text-muted-foreground">
            {hint}
          </kbd>
        )}
      </div>

      <ul ref={list} id={listId} role="listbox" aria-label={listLabel} className="max-h-80 overflow-y-auto p-2">
        {results.map((item, index) => (
          <li
            key={item.id}
            id={optionId(index)}
            role="option"
            aria-selected={index === activeIndex}
            onClick={() => {
              setActive(0);
              onSelect(item);
            }}
            onPointerMove={() => setActive(index)}
            className={cn(
              "flex cursor-pointer items-center justify-between gap-4 rounded-sm px-3 py-2 type-small",
              index === activeIndex && "bg-accent",
            )}
          >
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-medium">{item.title}</span>
              {item.group && <span className="text-muted-foreground">{item.group}</span>}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {item.shortcut && (
                <kbd className="rounded-sm border border-border px-2 type-code text-muted-foreground">{item.shortcut}</kbd>
              )}
              {/* The active result also shows the Enter key, so it's marked by a
                  shape, not only the faint hover fill, and says what Enter does. */}
              {index === activeIndex && (
                <CornerDownLeft aria-hidden="true" size={16} strokeWidth={1.5} className="text-muted-foreground" />
              )}
            </span>
          </li>
        ))}
      </ul>
      {results.length === 0 && empty && <div className="px-4 pb-4 type-small text-muted-foreground">{empty}</div>}
      {/* How many results, for screen readers, as the list changes. */}
      <p role="status" className="sr-only">
        {countLabel(results.length)}
      </p>
    </div>
  );
}

/**
 * "⌘K" -> "Meta+K Control+K": the shortcut in aria-keyshortcuts' format.
 * @param {string} hint
 */
function hintToKeyshortcuts(hint) {
  const key = hint.replace(/[⌘⌃]/g, "").toUpperCase();
  return hint.includes("⌘") ? `Meta+${key} Control+${key}` : key;
}
