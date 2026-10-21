"use client";

import { useState } from "react";
import { SegmentedControl } from "@/components/segmented-control";
import { Badge } from "@/components/ui/badge";
import { InputField } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

/** @type {{ value: string, label: string }[]} */
const WIDTHS = [
  { value: "375", label: "375" },
  { value: "768", label: "768" },
  { value: "1280", label: "1280" },
];

/**
 * A small live panel for the hero, so the page shows what it promises before
 * the first scroll: type in the field, flip the switch (the badge follows),
 * pick a width. Real Volt components on local state; nothing is saved (the
 * hero text beside it says so).
 * No primary button: the hero's only action is the link to the gallery.
 */
export function HeroSpecimen() {
  const [published, setPublished] = useState(false);
  const [width, setWidth] = useState(/** @type {string} */ ("768"));

  return (
    <aside aria-label="A live example" className="flex flex-col gap-4 rounded-md border border-border bg-card p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="type-body font-semibold">Page settings</p>
        {/* A polite status, so flipping the switch is announced. The word, not
            only the color and icon, carries the state. */}
        <span role="status">
          <Badge variant={published ? "success" : "neutral"}>{published ? "Published" : "Draft"}</Badge>
        </span>
      </div>
      <InputField label="Page name" defaultValue="Pricing" description="Shown in the browser tab." />
      <Switch label="Publish this page" description="Anyone with the link can see it." checked={published} onCheckedChange={setPublished} />
      <SegmentedControl label="Preview width" options={WIDTHS} value={width} onChange={setWidth} />
      <p className="type-small text-muted-foreground">Previewing at {width}px.</p>
    </aside>
  );
}
