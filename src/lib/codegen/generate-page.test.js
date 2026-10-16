import { describe, expect, it } from "vitest";
import { createBlogPage, createExamplePage } from "@/editor/store/example-page.js";
import { emptyTree, insertBlock, addSection } from "@/editor/store/tree.js";
import { manifests } from "@/registry";
import { sections } from "@/registry/sections";
import { generatePageCode } from "./generate-page.js";
import { syntaxErrors } from "./jsx.test.js";

const registries = { manifests, sections };

function counter() {
  let n = 0;
  return () => `n${++n}`;
}

describe("generatePageCode", () => {
  const { tree } = createExamplePage(counter());
  const code = generatePageCode(tree, registries);

  it("matches the example page's golden file", async () => {
    await expect(code.module).toMatchFileSnapshot("./__golden__/page.example.tsx");
  });

  it("is valid JSX/TSX", () => {
    expect(syntaxErrors(code.module)).toEqual([]);
  });

  it("imports each component once, grouped by module", () => {
    expect(code.imports.split("\n")).toEqual([
      'import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";',
      'import { Badge } from "@/components/ui/badge";',
      'import { Button } from "@/components/ui/button";',
      'import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";',
      'import { InputField } from "@/components/ui/input";',
    ]);
  });

  it("has exactly one h1, from the hero", () => {
    expect(code.jsx.match(/<h1/g)).toHaveLength(1);
  });

  it("leaves empty slots out entirely", () => {
    const newId = counter();
    const hero = addSection(emptyTree(), "hero", newId);
    if ("error" in hero) throw new Error(hero.error);
    const { jsx, imports } = generatePageCode(hero.tree, registries);
    expect(jsx).not.toContain("<div");
    expect(imports).toBe("");
    const withButton = insertBlock(hero.tree, "button", { sectionId: /** @type {string} */ (hero.id), slot: "actions" }, newId);
    if ("error" in withButton) throw new Error(withButton.error);
    expect(generatePageCode(withButton.tree, registries).jsx).toContain(
      '<div className="flex flex-wrap items-center justify-center gap-4">\n      <Button>Get started</Button>\n    </div>',
    );
  });

  it("records each section's and block's lines, without changing the code", () => {
    const lines = code.module.split("\n");
    const hero = tree.sections[0];
    const heroRange = code.ranges.get(hero);
    expect(lines[(heroRange?.start ?? 0) - 1].trim()).toMatch(/^<section/);
    expect(lines[(heroRange?.end ?? 0) - 1].trim()).toBe("</section>");

    const heroNode = /** @type {import("@/editor/store/tree.js").SectionNode} */ (tree.nodes[hero]);
    const [firstButton] = heroNode.slots.actions;
    const buttonRange = code.ranges.get(firstButton);
    expect(buttonRange?.start).toBe(buttonRange?.end);
    expect(lines[(buttonRange?.start ?? 0) - 1].trim()).toBe("<Button>Get started</Button>");

    // The marked printing produced exactly the same text as the plain one.
    expect(code.module).not.toContain("\u0000");
  });

  it("matches the blog example's golden file, with one h1 and paragraphs split at blank lines", async () => {
    const blog = generatePageCode(createBlogPage(counter()).tree, registries);
    await expect(blog.module).toMatchFileSnapshot("./__golden__/page.blog.tsx");
    expect(syntaxErrors(blog.module)).toEqual([]);
    expect(blog.jsx.match(/<h1/g)).toHaveLength(1);
    expect(blog.jsx.match(/^\s*<p>/gm)).toHaveLength(2);
  });

  it("rejects a tree with invalid props", () => {
    const broken = structuredClone(tree);
    broken.nodes[tree.sections[0]].props.headline = "";
    expect(() => generatePageCode(broken, registries)).toThrow(/Invalid props for section "hero"/);
  });
});
