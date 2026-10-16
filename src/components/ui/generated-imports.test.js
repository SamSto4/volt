import { describe, expect, it } from "vitest";
import { generateBlockCode } from "@/lib/codegen";
import { manifests } from "@/registry";

// Codegen (pure) can't import components, so this test, outside
// src/lib/codegen, checks the other direction: every name the generated code
// imports is a real export of that component's file. Otherwise pasted code
// would fail with "X is not exported".

describe.each(manifests)("generated code for $name", (manifest) => {
  it.each(manifest.variants)("imports only real exports ($name)", async (variant) => {
    const { imports } = generateBlockCode({ component: manifest.name, props: variant.props }, manifests);
    const names = imports.match(/\{ (.*) \}/)?.[1].split(", ") ?? [];
    // "@/components/ui/card" -> the actual module, through the same @/ alias.
    const componentModule = await import(/* @vite-ignore */ manifest.code.from);
    for (const name of names) expect(componentModule, `${manifest.code.from} should export ${name}`).toHaveProperty(name);
  });
});
