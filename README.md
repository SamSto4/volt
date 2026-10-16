# Volt

UI/UX creation and learning: drop real components into real pages, then learn exactly how to put them in your project.

> **Status: early version.** The catalog, the editor and code export work. The component registry (`npx shadcn add …`), accounts and share links are next. See the roadmap in [`CLAUDE.md`](CLAUDE.md).

## What you can do

- **Browse the catalog** (`/components`). Fourteen accessible components: Button, Badge, Card, Input, Textarea, Select, Checkbox, Switch, Alert, Avatar, Tabs, Accordion, Tooltip and Dialog. Each one has:
  - a **live playground**: pick a preset, change any prop in a schema-generated inspector, and watch the preview and the exact code update together, at a real 375 / 768 / 1280 px width and in light or dark;
  - **step-by-step instructions** for Next.js or Vite, for npm, pnpm, yarn or bun, ending with a "You're done when…" check;
  - a **"Copy prompt for your AI agent"** button, which builds a prompt for Claude Code or Cursor from the same facts.
- **Compose a page** (`/editor`), a full-screen app. Start from the landing page or blog post example, or a blank page.
  - **Add** blocks by dragging, by clicking "Add to page", or with the keyboard.
  - **Change** them in the inspector, or with the floating action bar (move, duplicate, delete). Undo and redo anything, with an undo toast after deletes.
  - **⌘K command palette:** add anything, change the view, or jump to any layer by typing.
  - **Preview** at 375, 768 or 1280 px in an iframe, so breakpoints really respond. Switch to **Try it** to use the page.
  - **See the code** in Split view, with the selected block's lines highlighted.
  - **Copy or download** `Page.jsx`.
  - Your page is **saved in this browser**.

## How it's built

| Piece | Where | Decision |
| --- | --- | --- |
| One manifest per component (Zod props, presets, slots, a11y notes, install info) drives the catalog, inspector, codegen and guides | [`src/registry/`](src/registry/) | [ADR 0002](docs/adr/0002-component-manifests.md) |
| Pure codegen: manifests describe an element tree; one printer turns it into JSX. The canvas renders the *same* tree, so preview and code can't disagree | [`src/lib/codegen/`](src/lib/codegen/) | [ADR 0003](docs/adr/0003-codegen-element-tree.md) |
| Page tree (sections → named slots) changed only by pure functions; Zustand + zundo for undo/redo | [`src/editor/store/`](src/editor/store/) | [ADR 0004](docs/adr/0004-page-tree-and-editor-store.md) |
| Canvas: an iframe rendered through a React portal | [`src/editor/frame.jsx`](src/editor/frame.jsx) | [ADR 0005](docs/adr/0005-canvas-iframe-portal.md) |
| Drag and drop with native HTML5 events, sharing one placement rule with click and keyboard | [`src/editor/canvas.jsx`](src/editor/canvas.jsx) | [ADR 0006](docs/adr/0006-native-drag-and-drop.md) |

**Accessibility:**
- Tabs, Accordion, the command palette's combobox and Switch implement the WAI-ARIA patterns. Dialog is built on the native `<dialog>`.
- Every drag has a click and keyboard alternative (WCAG 2.5.7).
- The editor announces each action in one polite live region.
- axe scans the home, catalog and editor pages on every change.

**Tests:** about 800 Vitest tests, covering:
- behavior and ARIA for every component;
- invariants for every tree operation, with inputs deep-frozen so a mutation throws;
- golden files for the generated code, each parsed as TSX;
- the editor driven end to end inside its iframe.

**Tech:** Next.js (App Router), React, JavaScript with JSDoc types checked by `tsc` ([why](docs/adr/0001-javascript-with-jsdoc.md)), Tailwind CSS v4, Zod, Zustand + zundo, Vitest + React Testing Library + axe-core, and the Volt design system ([`DESIGN.md`](DESIGN.md)).

## Running it

Requires Node 24 and pnpm (pinned via `packageManager`; run `corepack enable pnpm` once).

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm lint
pnpm typecheck    # tsc over the JavaScript, using the JSDoc types
pnpm test         # Vitest, single run
pnpm test:watch   # Vitest in watch mode
pnpm build
```

CI runs lint, typecheck, test and build on every pull request.

## Built with AI, in the open

This project is built with AI assistance (Claude Code):

- [`CLAUDE.md`](CLAUDE.md) holds the agent's instructions.
- Every decision is an ADR in [`docs/adr/`](docs/adr/).
- Every change is a pull request ending in a "What to understand" section.
- Commits the agent wrote carry a co-author trailer.

ADRs 0004–0006 were written while the agent worked without check-ins and approved afterwards. Two of them changed the original plan: the canvas and drag and drop.
