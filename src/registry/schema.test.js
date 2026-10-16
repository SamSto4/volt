import { describe, expect, it } from "vitest";
import { z } from "zod";
import { defineManifest } from "./schema.js";

/**
 * A small, valid manifest. Each test breaks one thing about it.
 * @returns {import("./schema.js").Manifest}
 */
function validManifest() {
  return {
    name: "test-widget",
    title: "Test widget",
    category: "display",
    description: "A widget used only by these tests.",
    usage: { whenToUse: "Never.", whenNotToUse: "Always." },
    props: z.object({ label: z.string().default("Hi").meta({ title: "Label" }) }),
    variants: [{ name: "Default", props: {} }],
    fits: ["inline"],
    a11y: { keyboard: [], notes: [] },
    install: { dependencies: [], registryDependencies: [] },
  };
}

describe("defineManifest", () => {
  it("returns a valid manifest unchanged, keeping the same props schema", () => {
    const manifest = validManifest();
    const result = defineManifest(manifest);
    expect(result).toBe(manifest);
    expect(result.props).toBe(manifest.props);
  });

  it("rejects a name that isn't kebab-case", () => {
    expect(() => defineManifest({ ...validManifest(), name: "TestWidget" })).toThrow(/kebab-case/);
  });

  it("rejects props that aren't a z.object schema", () => {
    // @ts-expect-error: deliberately passing the wrong type
    expect(() => defineManifest({ ...validManifest(), props: { label: "Hi" } })).toThrow(
      /props must be a z\.object/,
    );
  });

  it("rejects unknown keys, so typos don't pass silently", () => {
    // @ts-expect-error: `fit` is a typo for `fits`
    expect(() => defineManifest({ ...validManifest(), fit: ["inline"] })).toThrow(/fit/);
  });

  it("rejects a slot kind that doesn't exist", () => {
    // @ts-expect-error: "sidebar" isn't a slot kind
    expect(() => defineManifest({ ...validManifest(), fits: ["sidebar"] })).toThrow(/fits/);
  });

  it("requires at least one variant", () => {
    expect(() => defineManifest({ ...validManifest(), variants: [] })).toThrow(/variants/);
  });

  it("names the broken manifest in the error message", () => {
    expect(() => defineManifest({ ...validManifest(), title: "" })).toThrow(/"test-widget"/);
  });
});
