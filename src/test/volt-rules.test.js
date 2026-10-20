import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// Volt's "don'ts" (DESIGN.md §5b and §14), checked over the source like a
// lint rule. Each check reads every component and stylesheet as text and
// lists the lines that break the rule, so a failure points at the exact spot.

const SRC = fileURLToPath(new URL("..", import.meta.url));

/**
 * Every file under `dir` whose name ends with one of `extensions`, skipping tests.
 *
 * @param {string} dir
 * @param {string[]} extensions
 * @returns {string[]}
 */
function sourceFiles(dir, extensions) {
  // `recursive: true` walks every subfolder; entries come back as relative paths.
  return readdirSync(dir, { recursive: true, encoding: "utf8" })
    .filter((file) => extensions.some((extension) => file.endsWith(extension)))
    .filter((file) => !/\.test\.jsx?$/.test(file))
    .map((file) => path.join(dir, file));
}

/**
 * The lines of `files` that match `pattern`, as "file:line: text".
 *
 * @param {string[]} files
 * @param {RegExp} pattern  tested per line, so no `g` flag
 */
function offenders(files, pattern) {
  return files.flatMap((file) =>
    readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, index) =>
        pattern.test(line) && !isComment(line) ? [`${path.relative(SRC, file)}:${index + 1}: ${line.trim()}`] : [],
      ),
  );
}

/**
 * Comments may name a rule ("no gradients") without breaking it.
 * @param {string} line
 */
function isComment(line) {
  return /^\s*(\/\/|\/\*|\*|\{\/\*)/.test(line);
}

const components = sourceFiles(SRC, [".jsx"]);
const styles = sourceFiles(SRC, [".css"]);

describe("Volt rules", () => {
  it("uses no stock shadow utilities (only shadow-lift, shadow-glow, shadow-focus)", () => {
    // `shadow-sm`, `hover:shadow-lg`, a bare `shadow`, ... `shadow-none` is allowed.
    expect(offenders(components, /(?<![\w-])shadow(-(2xs|xs|sm|md|lg|xl|2xl|inner))?(?![\w-])/)).toEqual([]);
  });

  it("shows Volt's shadows only in response to the user, never at rest", () => {
    // Each use needs a state in front of it: hover:, focus-visible:, active:, ...
    const atRest = /(^|[\s"'`])shadow-(lift|glow|focus)\b/;
    expect(offenders(components, atRest)).toEqual([]);
  });

  it("keeps the glow for the primary action: one glowing thing per view", () => {
    const glows = offenders(components, /shadow-glow/).map((line) => line.split(":")[0]);
    expect([...new Set(glows)]).toEqual([path.join("components", "ui", "button.jsx")]);
  });

  it("uses no gradients, glassmorphism or backdrop blur", () => {
    const pattern = /gradient|bg-linear|bg-radial|bg-conic|backdrop-blur|backdrop-filter/;
    expect(offenders([...components, ...styles], pattern)).toEqual([]);
  });

  it("writes no raw hex colors in components (tokens only)", () => {
    // "#2b5cff" fails; "#add-to-project" (a link) doesn't, because a hex color
    // isn't followed by more name characters.
    expect(offenders(components, /#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})(?![\w-])/i)).toEqual([]);
  });

  it("type styles read fonts with --theme(), which works under @theme inline", () => {
    // `@theme inline` doesn't output --font-display etc. on the page, so
    // var(--font-display) is empty there and headlines silently fall back to
    // the body font. That shipped once without anyone noticing.
    expect(offenders(styles, /font-family:\s*var\(--font-(display|sans|mono)\)/)).toEqual([]);
  });

  it("gives every text field the same focus style", () => {
    // Each field file is copied into projects on its own, so the classes are
    // repeated rather than shared. This keeps the copies identical.
    const focus = ["transition-[border-color,box-shadow] duration-100 ease-out", "focus-visible:shadow-focus focus-visible:not-aria-invalid:border-primary"];
    for (const name of ["input", "textarea", "select"]) {
      const source = readFileSync(path.join(SRC, "components", "ui", `${name}.jsx`), "utf8");
      for (const classes of focus) expect(source, `${name}.jsx`).toContain(classes);
    }
  });
});
