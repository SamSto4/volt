"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Frame } from "@/editor/frame";
import { Inspector } from "@/editor/inspector/inspector";
import { validate } from "@/editor/inspector/fields.js";
import { renderElement } from "@/editor/render-element";
import { generateBlockCode } from "@/lib/codegen";
import { cn } from "@/lib/utils";
import { manifests } from "@/registry";

/**
 * Try a component live: pick a preset, change any prop in the inspector, and
 * watch the preview and the exact code update together.
 *
 * Takes the manifest's *name*, not the manifest: a Server Component can only
 * pass plain data to a Client Component, and a manifest holds functions.
 *
 * @param {{ name: string }} props
 */
export function Playground({ name }) {
  const manifest = getManifest(name);
  const defaults = manifest.props.parse({});

  // `draft` is what the inspector shows, valid or not. `props` is the last
  // valid version, so a half-typed value never breaks the preview or code.
  const [draft, setDraft] = useState(/** @type {Record<string, any>} */ (defaults));
  const [props, setProps] = useState(/** @type {Record<string, any>} */ (defaults));
  const [errors, setErrors] = useState(/** @type {Record<string, string>} */ ({}));
  const [preset, setPreset] = useState(manifest.variants[0].name);
  // How the preview is shown (DESIGN.md §12: viewport and theme toggles).
  // "fit" renders in place; a number renders in an iframe of that width, so
  // the component's own breakpoints respond.
  const [viewport, setViewport] = useState(/** @type {"fit" | 375 | 768 | 1280} */ ("fit"));
  const [previewTheme, setPreviewTheme] = useState(/** @type {"page" | "light" | "dark"} */ ("page"));

  /** @param {Record<string, any>} next */
  function apply(next) {
    setDraft(next);
    const result = validate(manifest, next);
    setErrors(result.errors);
    if (result.props) setProps(result.props);
  }

  /** @param {string} variantName */
  function loadPreset(variantName) {
    const variant = manifest.variants.find((candidate) => candidate.name === variantName);
    if (!variant) return;
    setPreset(variantName);
    apply(manifest.props.parse(variant.props));
  }

  const element = manifest.code.render(props, defaults);
  const code = generateBlockCode({ component: manifest.name, props }, manifests);
  const codeId = `playground-code-${manifest.name}`;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div data-slot="playground" className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <Tabs defaultValue="preview">
          <TabsList aria-label="Preview or code">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview" className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-4">
              <SegmentedControl
                label="Preview width"
                hideLabel
                options={[
                  { value: "fit", label: "Fit" },
                  { value: 375, label: "375" },
                  { value: 768, label: "768" },
                  { value: 1280, label: "1280" },
                ]}
                value={viewport}
                onChange={setViewport}
              />
              <SegmentedControl
                label="Preview theme"
                hideLabel
                options={[
                  { value: "page", label: "Page theme" },
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                ]}
                value={previewTheme}
                onChange={setPreviewTheme}
              />
            </div>
            {viewport === "fit" ? (
              <PreviewSurface theme={previewTheme} className="rounded-md border border-border">
                {/* Remount when props change, so components that only read their
                    starting state (like Tabs' defaultValue) pick up the new props. */}
                <div key={JSON.stringify(props)} className="w-full max-w-xl">
                  {renderElement(element)}
                </div>
              </PreviewSurface>
            ) : (
              <div className="h-80 overflow-x-auto">
                <div className="h-full" style={{ width: viewport }}>
                  <Frame title={`${manifest.title} preview at ${viewport} pixels`} width={viewport}>
                    <PreviewSurface theme={previewTheme} className="min-h-dvh">
                      <div key={JSON.stringify(props)} className="w-full max-w-xl">
                        {renderElement(element)}
                      </div>
                    </PreviewSurface>
                  </Frame>
                </div>
              </div>
            )}
          </TabsContent>
          <TabsContent value="code" className="flex flex-col gap-2 rounded-md border border-border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="type-label text-muted-foreground">Example.jsx</span>
              <CopyButton text={code.module} targetId={codeId} />
            </div>
            <CodeBlock code={code.module} id={codeId} label="Example code" />
          </TabsContent>
        </Tabs>
        {hasErrors && (
          <p role="status" className="type-small text-muted-foreground">
            Showing the last valid version. Fix the highlighted field to update it.
          </p>
        )}
      </div>

      <aside aria-label={`${manifest.title} props`} className="flex flex-col gap-4 rounded-md border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${codeId}-preset`} className="type-label text-muted-foreground">
            Start from
          </label>
          <select
            id={`${codeId}-preset`}
            value={preset}
            onChange={(event) => loadPreset(event.target.value)}
            className="h-8 max-sm:h-10 pointer-coarse:h-10 w-full rounded-sm border border-input bg-card px-3 type-small"
          >
            {manifest.variants.map((variant) => (
              <option key={variant.name} value={variant.name}>
                {variant.name}
              </option>
            ))}
          </select>
        </div>
        <Inspector manifest={manifest} draft={draft} errors={errors} onChange={(key, value) => apply({ ...draft, [key]: value })} />
        <Button variant="ghost" size="sm" className="self-start" onClick={() => loadPreset(preset)}>
          <RotateCcw aria-hidden="true" strokeWidth={1.5} />
          Reset to preset
        </Button>
      </aside>
    </div>
  );
}

/**
 * Returns the manifest or throws, so the type checker knows it's defined
 * everywhere below, including inside the event handlers.
 *
 * @param {string} name
 * @returns {import("@/registry/schema").Manifest}
 */
function getManifest(name) {
  const manifest = manifests.find((candidate) => candidate.name === name);
  if (!manifest) throw new Error(`Unknown component "${name}"`);
  return manifest;
}

/**
 * The surface a preview sits on. "light" or "dark" force that theme for this
 * subtree only: Volt's tokens are CSS variables scoped to `.light` and `.dark`.
 *
 * @param {{ theme: "page" | "light" | "dark", className?: string, children: import("react").ReactNode }} props
 */
function PreviewSurface({ theme, className, children }) {
  return (
    <div
      className={cn(
        theme === "page" ? undefined : theme,
        "flex min-h-48 items-center justify-center bg-card p-4 text-card-foreground md:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
