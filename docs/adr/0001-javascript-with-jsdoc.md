# 0001. Write the codebase in JavaScript with JSDoc types

- Status: accepted
- Date: 2026-10-16

## Context

Volt is Sam's portfolio project, and Sam is learning JavaScript. The original brief said "TypeScript `strict`," and `create-next-app` scaffolded a TypeScript project.

The project still needs what types give a codebase like this one: a normalized editor store, a code generator and manifests are all full of object shapes that are easy to get subtly wrong. We want those mistakes caught before runtime.

## Options

1. **TypeScript (`.ts` / `.tsx`).** The default for Next.js and shadcn, with the best editor tooling. But it means learning TypeScript syntax alongside JavaScript, and the language Sam is studying would be one step removed from the code he writes.
2. **Plain JavaScript, no type checking.** The simplest to write. Shape bugs in the store and codegen would only show up at runtime or in tests, and the "typed editor state" story goes away.
3. **JavaScript with JSDoc types, checked by `tsc` (`checkJs`).** Files are ordinary `.js` / `.jsx` that run as written. Types live in comments (`@param`, `@typedef`), and `tsc` checks them in CI. This is how projects such as Svelte and webpack type their own source.

## Decision

Option 3. Source files are JavaScript, and `jsconfig.json` turns on `checkJs` and `strict`. `pnpm typecheck` runs `tsc -p jsconfig.json` and fails CI on errors. Zod schemas remain the runtime source of truth, and their static types are pulled in with `z.infer` inside JSDoc.

## Consequences

- Sam writes and reads real JavaScript every day, and nothing gets compiled away that he didn't write.
- We keep compile-time checks for the store, codegen and manifests.
- JSDoc is wordier than TypeScript annotations, and a few advanced type patterns (generics with constraints, overloads) are clumsier. Where that hurts, prefer a simpler design over a clever type.
- Next.js and shadcn docs mostly show TypeScript, so examples need translating. shadcn is configured with `"tsx": false` so its CLI writes `.jsx`.
- Code we **generate for users** is unaffected: the exporter can still emit TSX. That's a product choice.
- Moving to TypeScript later is mechanical (rename files, turn JSDoc into annotations), so this decision is easy to revisit.
