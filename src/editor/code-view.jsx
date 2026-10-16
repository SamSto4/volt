"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { generatePageCode } from "@/lib/codegen";
import { manifests } from "@/registry";
import { sections } from "@/registry/sections";
import { useEditor } from "./editor-context";

/**
 * The whole page's code. The selected section's or block's lines are
 * highlighted with a tint and a gutter marker (DESIGN.md §11 Split view) and
 * scrolled into view.
 */
export function CodeView() {
  const tree = useEditor((state) => state.tree);
  const selectedId = useEditor((state) => state.selectedId);
  // Recompute only when the page changes, not on every selection.
  const code = useMemo(() => generatePageCode(tree, { manifests, sections }), [tree]);
  const range = selectedId ? code.ranges.get(selectedId) : undefined;
  const firstHighlighted = useRef(/** @type {HTMLSpanElement | null} */ (null));

  useEffect(() => {
    firstHighlighted.current?.scrollIntoView({ block: "nearest" });
  }, [selectedId, range?.start]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2 rounded-md border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="type-label text-muted-foreground">Page.jsx</span>
        <div className="flex flex-wrap gap-2">
          <CopyButton text={code.module} label="Copy page code" targetId="page-code" />
          <Button variant="secondary" size="sm" onClick={() => download("Page.jsx", code.module)}>
            <Download aria-hidden="true" strokeWidth={1.5} />
            Download Page.jsx
          </Button>
        </div>
      </div>
      {range && (
        <p className="type-small text-muted-foreground">
          Lines {range.start}–{range.end} are the selected {selectedId && tree.nodes[selectedId]?.kind === "section" ? "section" : "block"}.
        </p>
      )}
      <CodeBlock
        code={code.module}
        id="page-code"
        label="Page code"
        highlight={range}
        lineRef={firstHighlighted}
        className="min-h-0 flex-1"
      />
    </div>
  );
}

/**
 * Saves text as a file. Nothing is uploaded: the file is built in the browser.
 * @param {string} filename @param {string} text
 */
function download(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  // Free the memory once the browser has started the download.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
