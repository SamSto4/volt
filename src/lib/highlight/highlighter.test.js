import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { highlightLines } from "./highlighter.js";

const page = readFileSync(new URL("../codegen/__golden__/page.example.tsx", import.meta.url), "utf8");

describe("highlightLines", () => {
  it("returns tokens that put each line back together exactly", async () => {
    const lines = await highlightLines(page, "jsx");
    const rebuilt = lines.map((line) => line.map((token) => token.content).join("")).join("\n");
    expect(rebuilt).toBe(page);
  });

  it("gives every visible token a light and a dark color", async () => {
    const tokens = (await highlightLines(page, "jsx")).flat().filter((token) => token.content.trim());
    for (const token of tokens) {
      expect(token.light).toMatch(/^#[0-9A-F]{6}$/);
      expect(token.dark).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it("swaps the two github-light colors that fail contrast on the line tint", async () => {
    const colors = new Set((await highlightLines(page, "jsx")).flat().map((token) => token.light));
    expect(colors.has("#D73A49")).toBe(false);
    expect(colors.has("#22863A")).toBe(false);
    expect(colors.has("#B31D28")).toBe(true); // keywords like `import`, darker red
  });

  it("highlights shell commands too", async () => {
    const [line] = await highlightLines("pnpm add clsx", "shellscript");
    expect(line.map((token) => token.content).join("")).toBe("pnpm add clsx");
  });
});
