import { describe, expect, it } from "vitest";
import { manifests } from "@/registry";
import { generateBlockCode } from "./generate-block.js";
import { syntaxErrors } from "./jsx.test.js";

// Golden files: for every variant of every manifest, the generated example
// file is compared with a checked-in file in __golden__/. A code change that
// alters output shows up as a diff in the PR. Locally, `pnpm test -u` rewrites
// them; in CI a missing or different file fails the run.

const cases = manifests.flatMap((manifest) =>
  manifest.variants.map((variant) => ({
    manifest,
    variant,
    file: `./__golden__/${manifest.name}.${variant.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.tsx`,
  })),
);

describe.each(cases)("$manifest.name / $variant.name", ({ manifest, variant, file }) => {
  const code = generateBlockCode({ component: manifest.name, props: variant.props }, manifests);

  it("matches its golden file", async () => {
    await expect(code.module).toMatchFileSnapshot(file);
  });

  it("is valid JSX/TSX", () => {
    expect(syntaxErrors(code.module)).toEqual([]);
  });

  it("imports exactly the components its JSX uses", () => {
    const used = [...code.jsx.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((match) => match[1]);
    const imported = code.imports.match(/\{ (.*) \}/)?.[1].split(", ") ?? [];
    expect(imported).toEqual([...new Set(used)].sort());
  });
});

describe("generateBlockCode", () => {
  it("writes out only the props that differ from the defaults", () => {
    const { jsx } = generateBlockCode({ component: "button", props: {} }, manifests);
    expect(jsx).toBe("<Button>Get started</Button>");
  });

  it("keeps user text with braces, quotes and < > intact and valid", () => {
    const label = `Save "draft" {now} <fast> & go`;
    const { module, jsx } = generateBlockCode({ component: "button", props: { label } }, manifests);
    expect(jsx).toBe(`<Button>{${JSON.stringify(label)}}</Button>`);
    expect(syntaxErrors(module)).toEqual([]);
  });

  it("leaves out an optional part, and its import, when it's empty", () => {
    const { imports, jsx } = generateBlockCode({ component: "card", props: { description: "" } }, manifests);
    expect(jsx).not.toContain("CardDescription");
    expect(imports).toBe('import { Card, CardHeader, CardTitle } from "@/components/ui/card";');
  });

  it("rejects an unknown component", () => {
    expect(() => generateBlockCode({ component: "carousel", props: {} }, manifests)).toThrow(
      'Unknown component "carousel"',
    );
  });

  it("rejects props that break the manifest's rules, naming the component", () => {
    expect(() => generateBlockCode({ component: "avatar", props: { src: "javascript:alert(1)" } }, manifests)).toThrow(
      /Invalid props for "avatar"/,
    );
  });
});
