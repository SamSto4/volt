"use client";

import { useEffect, useState } from "react";
import { highlightLines } from "@/lib/highlight/highlighter.js";
import { cn } from "@/lib/utils";

/**
 * Code with syntax highlighting, line by line. Plain text renders first (and
 * on the server); colors arrive once the highlighter has loaded, without
 * changing the layout. Lines in `highlight` get Volt's primary tint and a 2px
 * gutter marker (DESIGN.md §11 Split view).
 *
 * @param {{
 *   code: string,
 *   lang?: "jsx" | "shellscript",
 *   id?: string,
 *   label: string,
 *   highlight?: { start: number, end: number },
 *   lineRef?: import("react").Ref<HTMLSpanElement>,
 *   className?: string,
 * }} props
 *   id: on the <code>, so a copy button can select its text if copying fails
 *   lineRef: attached to the first highlighted line, for scrolling it into view
 */
export function CodeBlock({ code, lang = "jsx", id, label, highlight, lineRef, className }) {
  const [result, setResult] = useState(/** @type {{ code: string, lines: import("@/lib/highlight/highlighter.js").Token[][] } | null} */ (null));

  useEffect(() => {
    let current = true;
    highlightLines(code, lang)
      .then((lines) => {
        // Ignore a slow result for code that has changed since.
        if (current) setResult({ code, lines });
      })
      .catch(() => {
        // Highlighting is an enhancement: plain text is still correct.
      });
    return () => {
      current = false;
    };
  }, [code, lang]);

  // Highlighted tokens only count if they're for the code shown now.
  const tokens = result?.code === code ? result.lines : null;
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    // tabIndex makes the scrollable block reachable by keyboard (axe: scrollable-region-focusable).
    <pre tabIndex={0} aria-label={label} className={cn("overflow-auto rounded-sm type-code", className)}>
      <code id={id}>
        {lines.map((line, index) => {
          const number = index + 1;
          const highlighted = highlight !== undefined && number >= highlight.start && number <= highlight.end;
          return (
            <span
              key={index}
              ref={highlighted && number === highlight?.start ? lineRef : undefined}
              className={cn(
                "block border-l-2 pr-4 pl-3",
                highlighted ? "border-primary bg-primary-tint" : "border-transparent",
              )}
            >
              {tokens?.[index]
                ? tokens[index].map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      // Each token carries both colors as CSS variables; the
                      // class picks one from the theme.
                      style={/** @type {import("react").CSSProperties} */ ({ "--token-light": token.light, "--token-dark": token.dark })}
                      className="text-(--token-light) dark:text-(--token-dark)"
                    >
                      {token.content}
                    </span>
                  ))
                : line}
              {/* Each line is its own block, so no "\n" is needed; an empty
                  line gets a space so it keeps its height. */}
              {line === "" && " "}
            </span>
          );
        })}
      </code>
    </pre>
  );
}
