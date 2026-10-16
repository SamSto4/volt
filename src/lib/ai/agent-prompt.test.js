import { describe, expect, it } from "vitest";
import { generateBlockCode } from "@/lib/codegen";
import { manifests } from "@/registry";
import { buildAgentPrompt } from "./agent-prompt.js";

// Eval-style checks (CLAUDE.md: "expected properties" for each AI feature):
// the prompt must carry every fact the agent needs, for every component.

describe.each(manifests)("agent prompt for $name", (manifest) => {
  const code = generateBlockCode({ component: manifest.name, props: {} }, manifests).module;
  const next = buildAgentPrompt(manifest, "next", "pnpm", code);
  const vite = buildAgentPrompt(manifest, "vite", "npm", code);

  it("names the framework, the install command and the exact file path", () => {
    expect(next).toContain("Next.js (App Router)");
    expect(next).toContain("`pnpm add ");
    expect(next).toContain(`\`components/ui/${manifest.name}.jsx\``);
    expect(vite).toContain("Vite + React");
    expect(vite).toContain("`npm install ");
    expect(vite).toContain(`\`src/components/ui/${manifest.name}.jsx\``);
  });

  it("links the real source file instead of guessing it", () => {
    expect(next).toContain(`https://github.com/SamSto4/volt/blob/main/src/components/ui/${manifest.name}.jsx`);
  });

  it("includes the generated usage code verbatim", () => {
    expect(next).toContain(code.trimEnd());
  });

  it("carries every accessibility note as a rule to keep", () => {
    for (const note of manifest.a11y.notes) expect(next).toContain(`- ${note}`);
    expect(next).toContain("Don't remove or rename ARIA attributes");
  });

  it("ends with a checkable definition of done, naming the keys when there are any", () => {
    expect(next).toContain("## Done when");
    for (const row of manifest.a11y.keyboard) expect(next).toContain(row.keys);
  });
});
