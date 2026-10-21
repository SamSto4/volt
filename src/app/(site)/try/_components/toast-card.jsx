"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { DEMO_SECTIONS } from "./demo-data";
import { ShowcaseCard } from "./showcase";

/**
 * Remove a section, then bring it back from the toast. The undo is real: it
 * puts the section back where it was.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function ToastCard({ className } = {}) {
  const [sections, setSections] = useState(DEMO_SECTIONS);
  const [removed, setRemoved] = useState(/** @type {{ name: string, index: number, id: number } | null} */ (null));
  // Counts removals, so each toast gets a new id (and a fresh 5 seconds).
  const removals = useRef(0);

  /** @param {string} name */
  function remove(name) {
    const index = sections.indexOf(name);
    setSections(sections.filter((section) => section !== name));
    // A new id restarts the toast's timer even if the message repeats.
    removals.current += 1;
    setRemoved({ name, index, id: removals.current });
  }

  function undo() {
    if (!removed) return;
    const { name, index } = removed;
    // Put it back at its old position: copy, then insert.
    setSections((current) => [...current.slice(0, index), name, ...current.slice(index)]);
  }

  return (
    <ShowcaseCard className={className} id="toast" title="Toast with undo" context="Editors · Lists" note="It waits while you point at it or tab into it.">
      <ul aria-label="Sections on the page" className="flex flex-col gap-2">
        {sections.map((name) => (
          <li key={name} className="flex items-center justify-between gap-2 rounded-sm border border-border bg-card py-1 pr-1 pl-3 type-small">
            {name}
            <Button variant="ghost" size="sm" onClick={() => remove(name)}>
              <X aria-hidden="true" strokeWidth={1.5} />
              Remove<span className="sr-only"> {name}</span>
            </Button>
          </li>
        ))}
      </ul>
      {sections.length === 0 && <p className="type-small text-muted-foreground">No sections left. Undo brings the last one back.</p>}
      {sections.length < DEMO_SECTIONS.length && (
        <Button variant="secondary" size="sm" className="w-fit" onClick={() => {
            setSections(DEMO_SECTIONS);
            // Nothing left to undo, so the toast goes too.
            setRemoved(null);
          }}>
          Put them all back
        </Button>
      )}
      <Toast
        open={removed !== null}
        id={removed?.id}
        message={removed ? `${removed.name} section removed.` : ""}
        actionLabel="Undo"
        onAction={undo}
        onDismiss={() => setRemoved(null)}
      />
    </ShowcaseCard>
  );
}
