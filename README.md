# Volt

UI/UX creation and learning: drop real components into real pages, then learn exactly how to put them in your project.

> **Status: Phase 1 (foundations).** The design system and eight accessible components with manifests and tests are built. There's no catalog, editor or export yet; today the home page is a reference page showing the tokens and components. See the roadmap in [`CLAUDE.md`](CLAUDE.md).

## What it will be

A component workbench for website creators and junior developers:

1. Browse a catalog of accessible, shadcn-style components.
2. Drop them into slots on example pages (landing page, dashboard, blog post) by drag, click or keyboard.
3. Tweak props, see the exact generated code, and follow a step-by-step guide for Next.js, Vite or plain HTML.

## What's built so far

- **Volt design tokens** for light and dark themes, mapped onto shadcn's CSS variables ([`DESIGN.md`](DESIGN.md)). Contrast for every text pair is measured and recorded.
- **Eight components** in [`src/components/ui/`](src/components/ui/): Button, Badge, Card, Input, Alert, Avatar, Tabs and Accordion.
  - **Tabs** and **Accordion** implement the WAI-ARIA patterns by hand, with no headless library: roving tabindex, arrow keys, Home and End.
  - **Input** links its label, hint and error with `htmlFor`, `aria-describedby` and `aria-invalid`.
  - **Alert** only interrupts screen readers when told to (`role="alert"` for errors, `role="status"` otherwise).
- **One manifest per component** in [`src/registry/`](src/registry/): a Zod props schema with defaults, presets, slot kinds, accessibility notes and install info. It's the single source of truth for everything else ([ADR 0002](docs/adr/0002-component-manifests.md)).
- **Tests:**
  - behavior and ARIA tests for every component, with React Testing Library and `user-event`;
  - checks that run over every manifest;
  - sync tests that fail if a component and its manifest disagree.

**In review:** pure code generation with golden files ([ADR 0003](docs/adr/0003-codegen-element-tree.md), [PR #14](https://github.com/SamSto4/volt/pull/14)).

## Tech

Next.js (App Router), React, JavaScript with JSDoc types checked by `tsc` ([why](docs/adr/0001-javascript-with-jsdoc.md)), Tailwind CSS v4, Zod, Vitest + React Testing Library, and the Volt design system.

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

## How it's built

This project is built with AI assistance (Claude Code), in the open:

- [`CLAUDE.md`](CLAUDE.md) holds the agent's instructions.
- Decisions are recorded as ADRs in [`docs/adr/`](docs/adr/).
- Every change goes through a pull request whose description ends with a "What to understand" section.
- Commits the agent wrote carry a co-author trailer.
