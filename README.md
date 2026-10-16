# Volt

UI/UX creation and learning: drop real components into real pages, then learn exactly how to put them in your project.

> **Status: early foundations.** What's here so far is the project setup only. There's no catalog, editor or export yet. See the roadmap in [`CLAUDE.md`](CLAUDE.md).

## What it will be

A component workbench for website creators and junior developers:

1. Browse a catalog of accessible, shadcn-style components.
2. Drop them into slots on example pages (landing page, dashboard, blog post) by drag, click or keyboard.
3. Tweak props, see the exact generated code, and follow a step-by-step guide for Next.js, Vite or plain HTML.

## Tech

Next.js (App Router), React, JavaScript with JSDoc types checked by `tsc` ([why](docs/adr/0001-javascript-with-jsdoc.md)), Tailwind CSS v4, and the Volt design system ([`DESIGN.md`](DESIGN.md)).

## Running it

Requires Node 24 and pnpm (pinned via `packageManager`; run `corepack enable pnpm` once).

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm lint
pnpm typecheck
pnpm build
```

## How it's built

This project is built with AI assistance (Claude Code), in the open: [`CLAUDE.md`](CLAUDE.md) holds the agent's instructions, decisions are recorded as ADRs in [`docs/adr/`](docs/adr/), and commits the agent wrote carry a co-author trailer.
