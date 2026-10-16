"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Copies text to the clipboard (DESIGN.md §10 "Copy button"):
 * - always says what it copies ("Copy code")
 * - shows "Copied" only after the clipboard really accepted the text
 * - keeps focus on itself and announces the result in a polite live region
 * - on failure says "Couldn't copy" and selects the text so it can be copied by hand
 *
 * @param {{ text: string, label?: string, targetId?: string }} props
 *   targetId: the element holding the text, selected if copying fails
 */
export function CopyButton({ text, label = "Copy code", targetId }) {
  const [status, setStatus] = useState(/** @type {"idle" | "copied" | "failed"} */ ("idle"));
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));

  // Clear a pending reset if the button disappears first.
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      timer.current = setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("failed");
      selectTarget(targetId);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={copy}>
        {status === "copied" ? <Check aria-hidden="true" strokeWidth={1.5} /> : <Copy aria-hidden="true" strokeWidth={1.5} />}
        {status === "copied" ? "Copied" : status === "failed" ? "Couldn't copy" : label}
      </Button>
      {/* Always in the DOM, so screen readers notice when its text changes. */}
      <span role="status" className="sr-only">
        {status === "copied" ? "Copied" : status === "failed" ? "Couldn't copy. The code is selected, so you can copy it yourself." : ""}
      </span>
    </>
  );
}

/** @param {string | undefined} id */
function selectTarget(id) {
  const target = id ? document.getElementById(id) : null;
  const selection = window.getSelection();
  if (!target || !selection) return;
  const range = document.createRange();
  range.selectNodeContents(target);
  selection.removeAllRanges();
  selection.addRange(range);
}
