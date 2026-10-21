"use client";

import { useEffect, useRef, useState } from "react";
import { Command } from "@/components/ui/command";
import { matchScore } from "@/editor/commands.js";
import { DEMO_COMMANDS } from "./demo-data";
import { ShowcaseCard } from "./showcase";

/**
 * The results for a query, best first, using the editor palette's fuzzy
 * matching (word starts beat substrings, which beat letters in order).
 *
 * @param {string} query
 */
function search(query) {
  if (!query.trim()) return DEMO_COMMANDS;
  return DEMO_COMMANDS.map((item) => ({ item, score: Math.max(matchScore(item.title, query), matchScore(item.group ?? "", query) - 5) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

/**
 * A search panel on the page: type, arrow through results, Enter to open one.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function CommandCard({ className } = {}) {
  const [query, setQuery] = useState("");
  const [opened, setOpened] = useState("");
  const input = useRef(/** @type {HTMLInputElement | null} */ (null));

  // ⌘K (Ctrl+K on Windows and Linux) jumps to the search box from anywhere on the page.
  useEffect(() => {
    /** @param {KeyboardEvent} event */
    function onKeyDown(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.current?.focus();
        input.current?.scrollIntoView({ block: "center" });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <ShowcaseCard
      className={className}
      id="command"
      title="Command panel"
      context="Apps · Search"
      note="Try “price”, “phone” or “exp”. Up and Down move, Enter opens."
    >
      <div className="rounded-md border border-border bg-card">
        <Command
          label="Search the example project"
          placeholder="Search pages, sections and actions…"
          hint="⌘K"
          query={query}
          onQueryChange={setQuery}
          results={search(query)}
          onSelect={(item) => {
            setOpened(item.title);
            setQuery("");
          }}
          inputRef={input}
          empty={<p>Nothing matches “{query}”. Try a shorter word.</p>}
        />
      </div>
      <p aria-live="polite" className="type-small text-muted-foreground">
        {opened ? `You chose “${opened}”. In a real app, this is where it would open.` : ""}
      </p>
    </ShowcaseCard>
  );
}
