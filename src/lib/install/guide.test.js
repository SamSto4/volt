import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { generateBlockCode } from "@/lib/codegen";
import { manifests } from "@/registry";
import { installCommand, installSteps, packagesFor, UTILS_SOURCE } from "./guide.js";

const byName = (/** @type {string} */ name) => /** @type {import("@/registry/schema").Manifest} */ (manifests.find((m) => m.name === name));
const example = (/** @type {string} */ name) => generateBlockCode({ component: name, props: {} }, manifests).module;

describe("install guide", () => {
  it("hands out exactly the cn() helper this repo uses", () => {
    expect(UTILS_SOURCE).toBe(readFileSync(new URL("../utils.js", import.meta.url), "utf8"));
  });

  it("derives packages from the manifest, including what registry items bring", () => {
    expect(packagesFor(byName("button"))).toEqual(["clsx", "tailwind-merge"]);
    expect(packagesFor(byName("alert"))).toEqual(["clsx", "lucide-react", "tailwind-merge"]);
  });

  it.each([
    ["npm", "npm install clsx tailwind-merge"],
    ["pnpm", "pnpm add clsx tailwind-merge"],
    ["yarn", "yarn add clsx tailwind-merge"],
    ["bun", "bun add clsx tailwind-merge"],
  ])("writes the %s command", (manager, expected) => {
    expect(installCommand(/** @type {any} */ (manager), ["clsx", "tailwind-merge"])).toBe(expected);
  });

  it.each(manifests.map((m) => m.name))("has Next.js and Vite steps for %s that end with its usage code", (name) => {
    for (const framework of /** @type {const} */ (["next", "vite"])) {
      const steps = installSteps(byName(name), framework, "npm", example(name));
      expect(steps?.at(-1)?.code?.text).toBe(example(name));
      expect(steps?.some((step) => step.link?.href.endsWith(`/src/components/ui/${name}.jsx`))).toBe(true);
    }
  });

  it("uses each framework's own paths", () => {
    const next = installSteps(byName("card"), "next", "npm", "x") ?? [];
    const vite = installSteps(byName("card"), "vite", "npm", "x") ?? [];
    expect(next.map((s) => s.code?.filename)).toContain("lib/utils.js");
    expect(vite.map((s) => s.code?.filename)).toEqual(expect.arrayContaining(["vite.config.js", "src/lib/utils.js", "src/App.jsx"]));
  });

  it("includes the components a component is built on (Tooltip uses Button)", () => {
    const steps = installSteps(byName("tooltip"), "next", "npm", "x") ?? [];
    const titles = steps.map((step) => step.title);
    expect(titles.indexOf("Copy the Button component")).toBeLessThan(titles.indexOf("Copy the Tooltip component"));
    expect(packagesFor(byName("tooltip"))).toEqual(["clsx", "tailwind-merge"]);
  });

  it("has no HTML guide yet, rather than a made-up one", () => {
    expect(installSteps(byName("button"), "html", "npm", "x")).toBeNull();
  });
});
