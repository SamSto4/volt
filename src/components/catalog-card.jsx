"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Abilities, LivePreview, PresetChips, usePreset } from "./component-peek";

/**
 * A catalog card (DESIGN.md §12). The preview is the real component and works
 * right there: click it, type in it, tab through it. Pointing at the card, or
 * moving focus into it, shows its presets (switch them to see what it can do)
 * and its abilities over the lower half, without changing the card's size.
 *
 * Those details are always in the page, only visually hidden until then, so
 * screen-reader users get them without hovering, and touch users get them by
 * tapping into the card.
 *
 * @param {{ name: string }} props
 */
export function CatalogCard({ name }) {
  const { manifest, preset, setPresetName } = usePreset(name);

  return (
    <li className="group flex flex-col gap-4 rounded-md border border-border bg-card p-4 hover:border-input focus-within:border-input md:p-6">
      <div className="flex min-h-32 items-center justify-center rounded-md border border-border bg-background p-4">
        <LivePreview name={name} preset={preset} />
      </div>
      <div className="relative flex min-h-28 flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <h2 className="type-heading-2">
            {/* The link is on the title only, so the card's other text isn't
                read as part of the link (Card a11y notes). */}
            <Link href={`/components/${manifest.name}`} className="rounded-sm hover:underline">
              {manifest.title}
            </Link>
          </h2>
          {/* The accessibility badge (DESIGN.md §12). */}
          <Badge>{manifest.a11y.role ? `role: ${manifest.a11y.role}` : "No ARIA needed"}</Badge>
        </div>
        <p className="type-small text-muted-foreground">{manifest.usage.whenToUse}</p>

        {/* What it can do: over the description on hover and focus. Opacity,
            not display, so it stays readable to screen readers. */}
        <div
          data-slot="abilities"
          className="absolute inset-x-0 bottom-0 flex flex-col gap-2 bg-card pt-2 opacity-0 transition-opacity duration-100 group-focus-within:opacity-100 group-hover:opacity-100"
        >
          <PresetChips name={name} current={preset.name} onChange={setPresetName} />
          <Abilities name={name} />
        </div>
      </div>
    </li>
  );
}
