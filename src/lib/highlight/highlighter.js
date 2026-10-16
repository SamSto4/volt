// Syntax highlighting with Shiki (CLAUDE.md stack), loaded only when a code
// block first needs it, so the page's first load doesn't pay for it.
//
// - Fine-grained imports: just JSX and shell, two themes, and Shiki's
//   JavaScript regex engine (no WebAssembly download).
// - Dual themes: each token carries a light and a dark color, and CSS picks one
//   from the .dark class, so switching themes needs no re-highlighting.
// - Two github-light colors fail 4.5:1 on the editor's highlighted-line tint
//   (keyword red 3.85:1, tag green 3.90:1), so they're swapped for darker
//   shades of the same hue (5.66:1 and 5.29:1). Every other token color was
//   measured on Volt's raised surface and the tint, in both themes.

/** @typedef {{ content: string, light: string, dark: string }} Token */

const LIGHT_FIXES = /** @type {Record<string, string>} */ ({
  "#D73A49": "#B31D28",
  "#22863A": "#176F2C",
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
      return { content: token.content, light: LIGHT_FIXES[light] ?? light, dark: style["--shiki-dark"] ?? "" };
    }),
  );
}
