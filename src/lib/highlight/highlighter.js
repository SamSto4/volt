// Syntax highlighting with Shiki (CLAUDE.md stack), loaded only when a code
// block first needs it, so the page's first load doesn't pay for it.
//
// - Fine-grained imports: just JSX and shell, two themes, and Shiki's
//   JavaScript regex engine (no WebAssembly download).
// - Dual themes: each token carries a light and a dark color, and CSS picks one
//   from the .dark class, so switching themes needs no re-highlighting.
// - Some GitHub theme colors fail 4.5:1 on Volt's surfaces or on the editor's
//   highlighted-line tint, so they're swapped for shades of the same hue from
//   GitHub's own palette. highlighter.test.js measures every token color in
//   every code sample the app shows, in both themes, so a new failure shows up
//   as a failing test rather than by eye.

/** @typedef {{ content: string, light: string, dark: string }} Token */

/** github-light colors to replace, uppercase hex -> replacement. */
export const LIGHT_FIXES = /** @type {Record<string, string>} */ ({
  "#D73A49": "#B31D28", // keywords like `import`: 3.85:1 on the tint
  "#22863A": "#176F2C", // JSX tags: 3.90:1 on the tint
  "#E36209": "#953800", // orange (props, shell flags): 3.49:1 even on white
  "#6A737D": "#57606A", // comments: 3.84:1 on the tint
});

/** github-dark colors to replace. */
export const DARK_FIXES = /** @type {Record<string, string>} */ ({
  "#6A737D": "#959DA5", // comments: 3.65:1 on Volt's dark raised surface
});

/** @type {Promise<import("shiki/core").HighlighterCore> | null} */
let highlighter = null;

function load() {
  highlighter ??= Promise.all([
    import("shiki/core"),
    import("shiki/engine/javascript"),
  ]).then(([{ createHighlighterCore }, { createJavaScriptRegexEngine }]) =>
    createHighlighterCore({
      themes: [import("shiki/themes/github-light.mjs"), import("shiki/themes/github-dark.mjs")],
      langs: [import("shiki/langs/jsx.mjs"), import("shiki/langs/shellscript.mjs")],
      engine: createJavaScriptRegexEngine(),
    }),
  );
  return highlighter;
}

/**
 * Splits code into lines of colored tokens.
 *
 * @param {string} code
 * @param {"jsx" | "shellscript"} lang
 * @returns {Promise<Token[][]>}
 */
export async function highlightLines(code, lang) {
  const shiki = await load();
  const { tokens } = shiki.codeToTokens(code, { lang, themes: { light: "github-light", dark: "github-dark" } });
  return tokens.map((line) =>
    line.map((token) => {
      const style = /** @type {Record<string, string>} */ (token.htmlStyle ?? {});
      const light = (style.color ?? "").toUpperCase();
      const dark = (style["--shiki-dark"] ?? "").toUpperCase();
      return { content: token.content, light: LIGHT_FIXES[light] ?? light, dark: DARK_FIXES[dark] ?? dark };
    }),
  );
}
