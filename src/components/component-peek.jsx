"use client";

import { Keyboard, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { fieldsFor } from "@/editor/inspector/fields.js";
import { renderElement } from "@/editor/render-element";
import { cn } from "@/lib/utils";
import { manifests } from "@/registry";

// Shows what a component can do, from its manifest: its presets as chips that
// switch a live preview, the keys it responds to, and the props you can change.
// Used by the catalog cards and the editor's component palette.

/** @param {string} name */
function getManifest(name) {
  const manifest = manifests.find((candidate) => candidate.name === name);
  if (!manifest) throw new Error(`Unknown component "${name}"`);
  return manifest;
}

/**
 * The preset being shown, shared by a preview and its preset chips.
 * @param {string} name
 */
export function usePreset(name) {
  const manifest = getManifest(name);
  const [presetName, setPresetName] = useState(manifest.variants[0].name);
  const preset = manifest.variants.find((variant) => variant.name === presetName) ?? manifest.variants[0];
  return { manifest, preset, setPresetName };
}

/**
 * A live, interactive render of one preset.
 *
 * @param {{ name: string, preset: { name: string, props: Record<string, unknown> } }} props
 */
export function LivePreview({ name, preset }) {
  const manifest = getManifest(name);
  const defaults = manifest.props.parse({});
  return (
    // Keyed by preset, so components that read only their starting state reset.
    <div key={preset.name} className="w-full">
      {renderElement(manifest.code.render(manifest.props.parse(preset.props), defaults))}
    </div>
  );
}

/**
 * Chips that switch the preview between the component's presets.
 *
 * @param {{ name: string, current: string, onChange: (preset: string) => void, className?: string }} props
 */
export function PresetChips({ name, current, onChange, className }) {
  const manifest = getManifest(name);
  if (manifest.variants.length < 2) return null;
  return (
    <div role="group" aria-label={`${manifest.title} presets`} className={cn("flex flex-wrap gap-1", className)}>
      {manifest.variants.map((variant) => (
        <button
          key={variant.name}
          type="button"
          aria-pressed={variant.name === current}
          onClick={() => onChange(variant.name)}
          className="h-8 max-sm:h-10 pointer-coarse:h-10 cursor-pointer rounded-full border border-transparent px-3 type-small text-muted-foreground hover:text-foreground aria-pressed:border-input aria-pressed:bg-background aria-pressed:text-foreground"
        >
          {variant.name}
        </button>
      ))}
    </div>
  );
}

/**
 * The keys a component responds to and the props it has, in a few lines.
 *
 * @param {{ name: string, className?: string }} props
 */
export function Abilities({ name, className }) {
  const manifest = getManifest(name);
  const props = fieldsFor(manifest).map((field) => field.label.toLowerCase());
  return (
    <ul className={cn("flex flex-col gap-1 type-small text-muted-foreground", className)}>
      {manifest.a11y.keyboard.length > 0 && (
        <li className="flex items-start gap-2">
          <Keyboard aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
          <span>
            <span className="sr-only">Keyboard: </span>
            {manifest.a11y.keyboard.map((row) => `${row.keys} ${row.action.charAt(0).toLowerCase()}${row.action.slice(1)}`).join("; ")}.
          </span>
        </li>
      )}
      <li className="flex items-start gap-2">
        <SlidersHorizontal aria-hidden="true" size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
        <span>
          {props.length} {props.length === 1 ? "setting" : "settings"} to change: {props.join(", ")}.
        </span>
      </li>
    </ul>
  );
}
