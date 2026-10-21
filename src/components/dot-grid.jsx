import { useId } from "react";

/**
 * A still grid of small dots behind a hero, in the `line` color. One of
 * Volt's recurring motifs, so the home page and the gallery feel like one
 * place. It's an SVG pattern, not a CSS gradient (Volt uses none), and it
 * never moves.
 *
 * Put it first inside a `relative isolate` section; it sits behind the content.
 */
export function DotGrid() {
  // Each grid gets its own pattern id, so two on one page never clash.
  const id = useId();
  return (
    <svg aria-hidden="true" className="absolute inset-0 -z-10 size-full text-border">
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
