# CLAUDE.md

Guidance for AI coding agents working in this repository. Read this file, then `DESIGN.md`, before writing code.

## Why this project exists

This is Sam's flagship portfolio project for full-stack web development internships. It has two jobs, and every decision should serve both:

1. **Show real coding ability.** Hard, well-tested engineering that Sam can explain line by line in an interview: nested drag-and-drop, a typed editor state with undo/redo, a pure code generator, an iframe preview, auth and a Postgres schema.
2. **Show real AI skill.** Not "I asked an AI to make an app," but *disciplined AI-assisted engineering* (visible in the repo's process) plus *AI features that are well engineered* (streaming, structured output, grounding, evals, cost and abuse limits).

If a change makes the app bigger but doesn't make either story stronger, push back and suggest the smaller version.

## The product

A "learn while composing" UI component workbench. Website creators and junior devs:

1. Browse a catalog of accessible, shadcn-style components (Preview / Code tabs, live variants, copy, install command).
2. Drop components into **slots on realistic example pages** (landing page, dashboard, blog post) by drag, click-to-add, or keyboard.
3. Tweak props in an inspector generated from each component's schema.
4. See the exact code for the selected block in a **Split view** that highlights the matching lines.
5. Follow a step-by-step "How to add this" guide for their stack: Next.js App Router, Vite, or plain HTML.
6. Install any component with `npx shadcn add <site>/r/<name>.json`.

Positioning line: *Drop real components into real pages, then learn exactly how to put them in your project.*

**Non-goals:** not an AI site generator, not a hosting platform, no paid tiers or login walls for browsing/composing/exporting, no Vue/Svelte/Figma export, no real-time collaboration.

## Stack

| Concern | Choice |
| --- | --- |
| App | Next.js App Router, React, **JavaScript** (`.js` / `.jsx`) with JSDoc types, Tailwind CSS v4, shadcn/ui |
| Type checking | `tsc` in `checkJs` mode over the JavaScript, configured in `jsconfig.json`. No `.ts` / `.tsx` source files (see "Language") |
| Design system | Volt (see `DESIGN.md`), mapped onto shadcn CSS variables |
| Drag-and-drop | `@dnd-kit/react` + `@dnd-kit/helpers`, **exact version pinned** (npm and the changelog have disagreed; check the registry before installing) |
| Editor state | Zustand with a normalized `nodes` map; `zundo` `temporal` middleware for undo/redo |
| Schemas | Zod. One manifest per component drives catalog, palette, inspector, codegen and registry |
| Preview | Same-origin `/preview` route rendered in an iframe at 375 / 768 / 1280 px |
| Code display | Shiki (server-rendered in docs, lazy on the client), Prettier standalone (lazy-loaded) |
| Tutorials | MDX via Fumadocs or content-collections (not Contentlayer, not next-mdx-remote) |
| Data | Neon Postgres + Drizzle ORM (page trees stored as JSONB) |
| Auth | Better Auth with GitHub OAuth |
| AI | Anthropic Claude API, server-side only. Model ID comes from an env var, never hard-coded |
| Tests | Vitest + React Testing Library, Playwright + `@axe-core/playwright` |
| CI/CD | GitHub Actions + Vercel preview deploys |

Do not add a dependency without saying why in the PR description. Avoid: react-dnd, react-beautiful-dnd, Craft.js, Monaco, WebContainers, Clerk, Contentlayer.

## Language

Sam is learning JavaScript, so **this codebase is written in JavaScript, not TypeScript.** See `docs/adr/0001-javascript-with-jsdoc.md`.

- Source files are `.js` (logic) and `.jsx` (components). Config files are `.mjs` or `.js`. Don't add `.ts` / `.tsx` files; if a tool truly requires one, explain why in the PR.
- Types live in **JSDoc comments**: `@param`, `@returns`, `@typedef`, `@type`. Export shared shapes as `@typedef`s from the module that owns them (e.g. the tree types next to the store) and pull them in with `@import`.
- Derive types from Zod schemas instead of writing them twice: `/** @typedef {import("zod").infer<typeof buttonProps>} ButtonProps */`.
- `pnpm typecheck` runs `tsc` with `checkJs` and `strict`, so JSDoc types are actually enforced. Type errors fail CI just like lint errors.
- Prefer modern, plain JavaScript a learner can read: `const`/`let`, arrow functions, destructuring, `?.` and `??`, array methods over manual loops. Avoid clever one-liners.
- When you use a JavaScript feature or pattern Sam may not know yet (closures in store actions, immutability with spread, `async` iterators for streaming, `structuredClone`), add a one-line comment saying what it does, and explain it in the PR's "What to understand" section.
- shadcn components are added with `"tsx": false` in `components.json`, so the CLI writes `.jsx`.
- **Generated code for users is a product decision, not a codebase one.** The exporter emits TSX by default (what shadcn users expect) and may offer a JSX option. That's separate from the language this repo is written in.

## Architecture

```
src/
  app/                  # routes: catalog, /editor, /preview, /docs, /p/[slug], /r (registry), /api
  registry/             # component manifests (Zod schemas, defaults, variants, slots, a11y notes, guidance)
  components/ui/        # the components themselves (shadcn-style, Volt-themed)
  editor/               # editor UI: palette, canvas, layers, inspector, toolbar, DnD wiring
  editor/store/         # Zustand store, actions, selectors, history
  lib/codegen/          # PURE JavaScript: tree -> TSX / HTML / registry JSON. No React, no DOM imports
  lib/ai/               # prompts, schemas, model client, eval fixtures
  db/                   # Drizzle schema, migrations, queries
content/docs/           # MDX tutorials
docs/adr/               # architecture decision records
tests/e2e/              # Playwright
```

Rules that matter:

- **The manifest is the single source of truth.** If you are about to hand-write a component's props, defaults or install info in a second place, derive it from the manifest instead.
- **The page tree is two levels:** page → sections → named slots. Arbitrary nesting is a deliberate roadmap item, not something to sneak in.
- **`lib/codegen` stays pure.** It takes a tree and manifests, returns strings. That makes it exhaustively testable and the best file to walk an interviewer through.
- **All tree mutations go through store actions** (`insert`, `move`, `remove`, `duplicate`, `updateProps`). Components never mutate state directly. Pause history during a drag so one drag = one undo step.
- **Validate everything that crosses a trust boundary with Zod on the server**: saved trees, share links, AI outputs, API inputs.
- Start as a single Next.js app with strict folder boundaries. Split into a monorepo only after v1.0, and only via an ADR.

## AI features (the "AI skills" story)

AI features must *serve the learning thesis*, not replace it. A "generate a page" button is never the headline.

Planned, in priority order:

1. **"Copy prompt for your AI agent"** on every component: a precise, structured prompt (registry URL, dependencies, target file, framework) a user pastes into Claude Code or Cursor.
2. **Agent-installable registry.** The `/r` registry is a valid shadcn registry, so AI agents with the shadcn MCP server can install from it. Document this in the README.
3. **"Explain this block" tutor** in the Split view: streams an explanation of the selected component's code, ARIA attributes and integration steps for the user's chosen stack.
4. **Accessibility reviewer**: checks the composed page (missing alt text, heading order, contrast) and returns structured findings that link to the offending block.

Engineering bar for every AI feature:

- Server-side calls only; API key never reaches the client. Rate-limit per IP/user and cap tokens per request.
- **Grounded**: prompts are built from the component's manifest and generated code, not from free-form guessing. Say what context was sent.
- **Structured output** validated with Zod; handle refusals, timeouts and malformed output with a visible, friendly fallback.
- **Streaming UI** with a cancel button; never block the editor.
- **Evals**: each feature has a small fixture set in `lib/ai/evals/` with expected properties (e.g. "mentions the install command", "names the ARIA role"), runnable via `pnpm eval`. Record results in the PR.
- Prompts live in versioned files, not inline strings, with a comment explaining each design choice.
- The app works fully with AI disabled (no key set). AI is an enhancement.

## How to work with Sam

Sam has to be able to defend every part of this codebase in an interview. Optimize for his understanding, not just for working code.

- **Plan before big changes.** For anything touching the editor store, DnD, codegen, the preview bridge, auth or the DB schema: propose the approach and trade-offs first and wait for a go-ahead.
- **Small, reviewable steps.** One concern per PR. Keep diffs readable; avoid sweeping reformatting.
- **Explain the non-obvious.** Each PR description ends with a short "What to understand" section: the key idea, the trade-off made, and one question an interviewer might ask about it.
- **Record decisions.** When choosing between real alternatives, write an ADR in `docs/adr/NNNN-title.md` (context, options, decision, consequences). Expected early ADRs: dnd-kit vs. Puck, slot tree vs. arbitrary nesting, iframe vs. same-document preview, template vs. AST codegen, Neon vs. Supabase.
- **Never fake it.** No placeholder tests that assert nothing, no hard-coded demo data pretending to be persisted, no README claims the code doesn't back up. If something is stubbed, say so in the code and the PR.
- **Leave the history honest.** Bug-fix and refactor commits stay; don't squash the story of how a hard problem was solved into one commit.
- If Sam asks to write a piece himself, give hints and review instead of code.

## Git and PR conventions

- Branch per change off `main`; open a PR even though this is a solo repo.
- Conventional Commits: `feat(editor): ...`, `fix(codegen): ...`, `test(e2e): ...`, `docs(adr): ...`, `refactor(store): ...`.
- Include the AI co-author trailer on commits the agent writes. Transparency about AI use is part of the story.
- Never commit secrets. New env vars go in `.env.example` with a comment.

## Commands

```bash
pnpm dev          # local dev server
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # tsc -p jsconfig.json (checks JSDoc types in .js/.jsx)
pnpm test         # Vitest unit + integration (one run)
pnpm test:watch   # Vitest in watch mode while you code
pnpm test:e2e     # Playwright (includes axe scans)
pnpm eval         # AI feature evals (needs API key)
pnpm db:generate  # Drizzle migrations
pnpm db:migrate
pnpm registry:build  # shadcn build -> public/r
```

Keep this list accurate as scripts are added or renamed.

## Testing

- **Codegen:** golden-file tests. Fixture tree in, expected TSX / HTML / registry JSON out. Every new component adds a fixture.
- **Store:** invariant tests for insert, move, remove, duplicate, undo and redo (no orphan nodes, slot rules respected, one drag = one history entry).
- **Components:** RTL tests for behavior and ARIA, not snapshots of markup.
- **E2E:** drag a component into a slot (pointer: `mouse.down`, stepped `mouse.move`, `mouse.up`), click-to-add, keyboard move with live-region assertion, copy code, save and reopen a share link.
- **Accessibility:** axe scans on catalog, editor and preview at WCAG 2.1 AA tags. Automated checks don't catch everything, so also test keyboard flows by hand.
- Bugs get a failing test first, then the fix.

## Definition of done

A change is done when:

- `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass; E2E passes for editor changes.
- It meets `DESIGN.md`: Volt tokens only (no raw hex or ad-hoc spacing), both themes checked, reduced motion respected.
- Every drag action also works by click and by keyboard (WCAG 2.2 SC 2.5.7), with targets at least 24×24 px.
- New or changed UI has been looked at in the browser at 375 px and 1280 px.
- Docs, README, `.env.example` and the command list are updated if affected.
- The PR has a "What to understand" section.

## Roadmap (current focus first)

1. **Foundations:** repo, JavaScript with strict JSDoc type checking, lint, CI, Vercel deploy; 8 components with manifests; pure codegen with golden tests.
2. **v0.1 interview slice:** catalog pages; one example page with slots; drag + click-add + action bar; inspector; undo/redo; iframe preview at 3 widths; TSX export; Next.js tutorial; README with demo GIF; "Copy prompt for your AI agent."
3. **v1.0 full-stack:** GitHub OAuth, saved projects and `/p/[slug]` share links; `/r` registry; Vite and HTML tutorials plus HTML export; keyboard DnD announcements; layers panel; Cmd+K; Playwright + axe; ADRs; "Explain this block" with evals.
4. **Feedback and depth:** public launch, feedback-driven fixes, accessibility reviewer, ZIP / StackBlitz export, more example pages.
5. **Later:** arbitrary nesting, theme editor, editable code, community submissions.

Don't start a later phase's work while the current phase's exit criteria aren't met.