import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateBlockCode } from "@/lib/codegen";
import { installSteps } from "@/lib/install/guide.js";
import { manifests } from "@/registry";
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
      expect(token.dark).toMatch(/^#[0-9A-F]{6}$/);
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

// Contrast of every token color the app can show (WCAG 1.4.3, 4.5:1).
// Code sits on `surface-raised`, sometimes on `surface`, and a selected line
// gets the `primary-tint` wash on top (DESIGN.md §2 and §11).

/** @param {string} hex  "#RRGGBB" @returns {number[]} 0-255 channels */
const channels = (hex) => [1, 3, 5].map((start) => parseInt(hex.slice(start, start + 2), 16));

/** WCAG relative luminance. @param {number[]} rgb */
function luminance(rgb) {
  const [r, g, b] = rgb.map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** @param {number[]} a @param {number[]} b */
function contrast(a, b) {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

/** A translucent color laid over a solid one. @param {string} tint @param {number} alpha @param {string} base */
const over = (tint, alpha, base) => channels(tint).map((value, i) => alpha * value + (1 - alpha) * channels(base)[i]);

const BACKGROUNDS = {
  // surface-raised, surface, and the primary-tint wash on each.
  light: [channels("#ffffff"), channels("#f7f8fa"), over("#2b5cff", 0.12, "#ffffff"), over("#2b5cff", 0.12, "#f7f8fa")],
  dark: [channels("#151922"), channels("#0b0d12"), over("#5b82ff", 0.18, "#151922"), over("#5b82ff", 0.18, "#0b0d12")],
};

/** Every code sample the app shows: generated components and pages, and the install guide's steps. */
function samples() {
  const golden = new URL("../codegen/__golden__/", import.meta.url);
  const generated = readdirSync(golden).map((file) => ({ code: readFileSync(new URL(file, golden), "utf8"), lang: /** @type {const} */ ("jsx") }));
  const steps = manifests.flatMap((manifest) => {
    const { module: code } = generateBlockCode({ component: manifest.name, props: manifest.variants[0].props }, manifests);
    return /** @type {const} */ (["next", "vite"]).flatMap((framework) =>
      (installSteps(manifest, framework, "pnpm", code) ?? []).flatMap((step) =>
        step.code ? [{ code: step.code.text, lang: step.code.filename === "Terminal" ? /** @type {const} */ ("shellscript") : /** @type {const} */ ("jsx") }] : [],
      ),
    );
  });
  return [...generated, ...steps];
}

describe("token colors", () => {
  it("reach 4.5:1 on every surface a code block can sit on, in both themes", async () => {
    /** @type {{ light: Set<string>, dark: Set<string> }} */
    const colors = { light: new Set(), dark: new Set() };
    for (const { code, lang } of samples()) {
      for (const token of (await highlightLines(code, lang)).flat()) {
        if (!token.content.trim()) continue;
        colors.light.add(token.light);
        colors.dark.add(token.dark);
      }
    }
    const failures = /** @type {const} */ (["light", "dark"]).flatMap((theme) =>
      [...colors[theme]].flatMap((color) => {
        const worst = Math.min(...BACKGROUNDS[theme].map((background) => contrast(channels(color), background)));
        return worst < 4.5 ? [`${theme} ${color}: ${worst.toFixed(2)}:1`] : [];
      }),
    );
    expect(failures).toEqual([]);
  });
});
