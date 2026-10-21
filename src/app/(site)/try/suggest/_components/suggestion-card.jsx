"use client";

import Link from "next/link";
import { interactiveCardClasses } from "@/components/ui/card";
import { LivePreview, PresetChips, usePreset } from "@/components/component-peek";
import { cn } from "@/lib/utils";

// "“A”, “B” and “C”": the answers that led to a suggestion, read as a sentence.
const listFormat = new Intl.ListFormat("en", { style: "long", type: "conjunction" });

/**
 * One suggested component: the real component to try, why it's here, which
 * of your answers led to it, and where to get the code. It lifts on hover
 * and when focus is inside it, like every interactive card (DESIGN.md §7).
 *
 * @param {{ suggestion: import("@/lib/suggest/recommend.js").Suggestion }} props
 */
export function SuggestionCard({ suggestion }) {
  const { manifest, preset, setPresetName } = usePreset(suggestion.name);
  const because = listFormat.format(suggestion.because.map((label) => `“${label}”`));

  return (
    <li className={cn("flex min-w-0 flex-col gap-4 rounded-md border border-border bg-card p-4", interactiveCardClasses)}>
      <div className="flex min-h-24 items-center justify-center rounded-md border border-border bg-background p-4">
        <LivePreview name={suggestion.name} preset={preset} />
      </div>
      <PresetChips name={suggestion.name} current={preset.name} onChange={setPresetName} />
      <div className="flex flex-1 flex-col gap-2">
        <h4 className="type-body font-semibold">{manifest.title}</h4>
        <p className="type-small">{suggestion.why}</p>
        <p className="type-small text-muted-foreground">Because you chose {because}.</p>
      </div>
      {/* The name starts with the visible words (WCAG 2.5.3) and adds which component, since the page has many of these links. */}
      <Link
        href={`/components/${manifest.name}`}
        aria-label={`Code and install guide for ${manifest.title}`}
        className="w-fit rounded-sm type-small text-primary underline underline-offset-4"
      >
        Code and install guide
      </Link>
    </li>
  );
}
