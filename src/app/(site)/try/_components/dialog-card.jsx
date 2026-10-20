"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { ShowcaseCard } from "./showcase";

/**
 * A real modal: focus moves into it and stays there, Escape closes it, and
 * focus goes back to the button that opened it.
 *
 * @param {{ className?: string }} [props]  className: the card's column span, set by the page
 */
export function DialogCard({ className } = {}) {
  const [result, setResult] = useState("");
  return (
    <ShowcaseCard
      className={className}
      id="dialog"
      title="Confirm dialog"
      context="Settings · Destructive actions"
      note="Cancel is focused first: the safe choice for something you can't undo."
    >
      {/* A wrapper so the trigger keeps its own width in the column. */}
      <div>
        <Dialog
          trigger="Delete page"
          tone="danger"
          title="Delete the Pricing page?"
          description="This removes the page and its three sections. You can't undo this."
          confirmLabel="Delete page"
          onConfirm={() => setResult("Deleted. Not really: nothing on this page is saved.")}
        />
      </div>
      <p role="status" className="type-small text-muted-foreground">
        {result}
      </p>
    </ShowcaseCard>
  );
}
