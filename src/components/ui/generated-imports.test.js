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
    // One line per module: import { A, B } from "@/components/ui/x";
    for (const [, names, from] of imports.matchAll(/import \{ (.*) \} from "(.*)";/g)) {
      // "@/components/ui/card" -> the actual module, through the same @/ alias.
      const componentModule = await import(/* @vite-ignore */ from);
      for (const name of names.split(", ")) expect(componentModule, `${from} should export ${name}`).toHaveProperty(name);
    }
  });
});
