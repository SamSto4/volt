"use client";

import { useState } from "react";
import { CodeBlock } from "@/components/code-block";
import { LivePreview, PresetChips, usePreset } from "@/components/component-peek";
import { SegmentedControl } from "@/components/segmented-control";
import { generateBlockCode } from "@/lib/codegen";
import { manifests } from "@/registry";

/** The components the demo can show: three that look and behave differently. */
const CHOICES = [
  { value: "alert", label: "Alert" },
  { value: "button", label: "Button" },
  { value: "accordion", label: "Accordion" },
];

/**
 * Volt's whole idea on the home page, shown instead of described: a real
 * component you can use, and beside it the exact code that produces it.
 * Switch the component or its preset and both change together, because the
 * code comes from the same function the editor's Code tab uses
 * (generateBlockCode), fed the same props as the preview.
 */
export function LiveCodeDemo() {
  // Starts on the Alert: calm, and no second cobalt button beside the hero's one action.
  const [name, setName] = useState("alert");

  return (
    <aside aria-label="A live component and its code" className="flex min-w-0 flex-col gap-4 rounded-md border border-border bg-card p-4 md:p-6">
      <SegmentedControl label="Component" options={CHOICES} value={name} onChange={setName} />
      {/* Keyed by component, so each one starts on its own first preset. */}
      <Demo key={name} name={name} />
    </aside>
  );
}

/** @param {{ name: string }} props */
function Demo({ name }) {
  const { manifest, preset, setPresetName } = usePreset(name);
  const { module: code } = generateBlockCode({ component: name, props: preset.props }, manifests);

  return (
    <>
      <div data-specimen className="flex min-h-32 items-center justify-center rounded-md border border-border bg-background p-4">
        <LivePreview name={name} preset={preset} />
      </div>
      <PresetChips name={name} current={preset.name} onChange={setPresetName} />
      <div className="flex flex-col gap-2">
        <p className="type-label text-muted-foreground">The code it produces</p>
        <CodeBlock code={code} label={`${manifest.title} code`} className="max-h-64 rounded-md border border-border bg-background py-3" />
      </div>
    </>
  );
}
