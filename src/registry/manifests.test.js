import { readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { manifests } from "./index.js";

// Rules every manifest must follow that its shape alone can't express.
// `describe.each` runs the whole block once per manifest, so a new component
// gets all of these checks without writing a single new test.

// Manifest files are every .js file in this folder except the shared modules and tests.
const manifestFiles = readdirSync(new URL(".", import.meta.url)).filter(
  (file) => file.endsWith(".js") && !file.endsWith(".test.js") && !["schema.js", "index.js"].includes(file),
);

describe("the manifest list", () => {
  it("includes every manifest file in src/registry", () => {
    const listed = manifests.map((manifest) => `${manifest.name}.js`).sort();
    expect(listed).toEqual([...manifestFiles].sort());
  });

  it("has no duplicate names", () => {
    const names = manifests.map((manifest) => manifest.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe.each(manifests)("$name manifest", (manifest) => {
  it("has a default for every prop, so a new block is valid with no input", () => {
    expect(() => manifest.props.parse({})).not.toThrow();
  });

  it.each(manifest.variants)("variant '$name' has valid props", (variant) => {
    expect(() => manifest.props.parse(variant.props)).not.toThrow();
  });

  it("has variants with distinct names", () => {
    const names = manifest.variants.map((variant) => variant.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("converts to JSON Schema with a title on every prop, for the inspector's labels", () => {
    const jsonSchema = z.toJSONSchema(manifest.props);
    const properties = Object.entries(jsonSchema.properties ?? {});
    expect(properties.length).toBeGreaterThan(0);
    for (const [propName, property] of properties) {
      // `property` can be `true` or `false` in JSON Schema, so check it's an object first.
      const title = typeof property === "object" ? property.title : undefined;
      expect(title, `prop "${propName}" needs .meta({ title })`).toBeTruthy();
    }
  });
});
