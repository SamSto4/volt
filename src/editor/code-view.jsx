"use client";

import { Download } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { Button } from "@/components/ui/button";
import { useStoredChoice } from "@/components/use-stored-choice";
import { generatePageCode } from "@/lib/codegen";
import { installCommand, PACKAGE_MANAGERS, packagesFor } from "@/lib/install/guide.js";
import { manifests } from "@/registry";
import { sections } from "@/registry/sections";
import { download } from "./download.js";
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
      <PageRequirements tree={tree} />
    </div>
  );
}

/**
 * What a project needs to use this page's code: one install command for every
 * package its components use, and a link to each component's guide.
 *
 * @param {{ tree: import("./store/tree.js").Tree }} props
 */
function PageRequirements({ tree }) {
  const [manager] = useStoredChoice("volt:package-manager", PACKAGE_MANAGERS, "npm");
  const used = manifests.filter((manifest) =>
    Object.values(tree.nodes).some((node) => node.kind === "block" && node.component === manifest.name),
  );
  if (used.length === 0) return null;
  const packages = [...new Set(used.flatMap((manifest) => packagesFor(manifest)))].sort();
  const command = installCommand(manager, packages);

  return (
    <section aria-labelledby="page-needs-heading" className="flex flex-col gap-2 border-t border-border pt-3">
      <h2 id="page-needs-heading" className="type-label text-muted-foreground">
        What this page needs
      </h2>
      <div className="flex flex-wrap items-center gap-2">
        <code className="rounded-sm bg-background px-2 py-1 type-code">{command}</code>
        <CopyButton text={command} label="Copy install command" />
      </div>
      <p className="type-small text-muted-foreground">
        Then copy each component into your project:{" "}
        {used.map((manifest, index) => (
          <span key={manifest.name}>
            {index > 0 && ", "}
            <a href={`/components/${manifest.name}#add-to-project`} target="_blank" rel="noreferrer" className="rounded-sm text-primary underline underline-offset-4">
              {manifest.title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </span>
        ))}
        .
      </p>
    </section>
  );
}
