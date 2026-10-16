# 0003. Codegen: manifests describe an element tree; one printer turns it into code

- Status: **proposed** (implemented on `feat/codegen-block`, waiting for Sam's go-ahead before merge)
- Date: 2026-10-16

## Context

Volt's promise is "see the exact code for the selected block." Each component's manifest has to say what code it produces for a given set of props. That code ends up in people's real projects, so it must be:

- **valid**: it always parses, whatever text the user typed (quotes, braces, `<`, `&`, emoji);
- **minimal**: props left at their default aren't written out;
- **readable**: formatted the way a person would write it, with only the imports it uses;
- **testable**: golden files in, exact text out (CLAUDE.md), and pure (no React, no DOM).

ADR 0002 left the manifest's `code` field to this decision.

## Options

1. **Template strings.** Each manifest has `render(props) => string`, like `` `<Button variant="${props.variant}">${props.label}</Button>` ``.
   Easiest to start with. But every template has to remember to escape every value. One forgotten escape and a label like `Save {draft}` produces code that doesn't compile. Formatting and imports get re-solved in eight places.
2. **Element tree + one printer (AST-lite).** Each manifest has `render(props) => element`, where an element is plain data: `h("Button", { variant: "secondary" }, "Learn more")`. One small printer in `src/lib/codegen/` turns elements into JSX. It escapes, formats, collects imports and drops `undefined`/`false` attributes.
3. **A real AST** (Babel types or the TypeScript factory) plus a printer.
   Maximum correctness. But it's a heavy dependency, and building nodes is verbose (`t.jsxElement(t.jsxOpeningElement(t.jsxIdentifier(...)))`). That's hard to read for a learner and overkill for a few components per page.

## Decision

**Option 2.** Escaping and formatting live in exactly one place, and the manifests stay short and declarative. The same element tree can later be printed as plain HTML for the HTML export, by mapping components to their markup, without touching the manifests again.

Concretely:

- The manifest gains `code: { from, render }`. `from` is the module the component's parts are imported from (`"@/components/ui/card"`). `render(props, defaults)` returns an element tree and must be pure.
- `generateBlockCode(block, manifests)`:
  1. validates `block.props` with the manifest's Zod schema (trees come from saved data, a trust boundary);
  2. calls `render`;
  3. prints `{ imports, jsx, module }`.
  Only capitalized element types that are actually used are imported, so a Card without a description doesn't import `CardDescription`.
- **Text escaping:** text with `{ } < > &` or quotes, or leading/trailing spaces, is printed as a JS string expression, `{"Couldn't save"}`. Plain text is printed as-is. The quote rule exists so generated code passes `react/no-unescaped-entities` in the user's own lint setup.
- **Attribute values:** `true` → bare attribute, `false`/`undefined`/`null` → omitted, numbers → `{3}`, strings → `"..."`, or `{"..."}` when they contain `"`, `&` or a newline.
- **Formatting:** an element with only text children prints on one line, otherwise children go on their own lines with 2-space indents. No Prettier at this layer. The output is deterministic, so golden files are stable. Prettier can still format on the client later.

## Consequences

- **Golden files:** one per manifest variant (`src/lib/codegen/__golden__/`), via Vitest's `toMatchFileSnapshot`. A new component's variants get golden files automatically. In CI, a missing or changed golden fails the run.
- **Validity is tested:** every golden module is parsed with TypeScript's parser, and the test fails on any syntax error. A separate test checks that every name the code imports is really exported by that component file.
- **Purity is enforced:** an ESLint rule forbids importing `react`, `react-dom` or `next` anywhere in `src/lib/codegen/`.
- **Limits:** the printer doesn't wrap long attribute lists. Page-level codegen (sections and slots) comes with the page templates in Phase 2. Line ranges for the Split view's highlighting come later and can be added to the printer, since it knows where each element starts and ends.
- Generated snippets are plain JSX with no type annotations, so the same text is valid in `.tsx` and `.jsx` files.
