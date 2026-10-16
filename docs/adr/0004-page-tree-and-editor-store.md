# 0004. Page tree, section templates and the editor store

- Status: accepted. Sam asked the agent to keep building without check-ins (2026-10-16), so this is recorded for review afterwards rather than approved up front.
- Date: 2026-10-16

## Context

The editor needs a data model for "real components in slots on realistic pages." CLAUDE.md fixes the shape (page → sections → named slots, a normalized `nodes` map, Zustand + zundo, all mutations through store actions, one drag = one undo step). This ADR records how that's built.

## Decisions

### 1. Two levels: sections with named slots (not arbitrary nesting)

A page is an ordered list of **sections** (Hero, Features, FAQ, Sign-up). Each section comes from a **section template** that has its own props (headline, intro) and named **slots** (`actions`, `items`). Each slot lists the slot kinds it `accepts` and a `max`. Blocks (component instances) live only in slots.

*Alternative:* arbitrary nesting (any block inside any block), like Puck or Craft.js. It's more powerful, but every operation becomes a tree walk with cycle checks, the inspector and DnD get much harder, and "where can this go?" stops having a simple answer. Two levels covers realistic marketing pages and keeps every rule checkable. Nesting stays on the roadmap (CLAUDE.md, phase 5).

### 2. A normalized state, with pure functions doing the work

```js
{
  sections: ["s1", "s2"],                  // page order
  nodes: {
    s1: { id: "s1", kind: "section", template: "hero", props: {...}, slots: { actions: ["b1"] } },
    b1: { id: "b1", kind: "block", component: "button", props: {...} },
  },
}
```

- Nodes are looked up by id in O(1). Order lives only in `sections` and in `slots` arrays, so nothing is stored twice. There are no parent pointers to keep in sync: a block's parent is found by scanning slots, which is cheap at page size.
- Every change (`insertBlock`, `moveBlock`, `removeBlock`, `duplicateBlock`, `updateProps`) is a **pure function** in `src/editor/store/tree.js`: `(tree, …) → { tree, message }` or `{ error }`. They never mutate, so the old tree is a valid undo snapshot for free.
- The Zustand store is a thin wrapper: it calls the pure function, stores the result and exposes the message for the live region. The hard logic is tested with no React and no store.

*Alternative:* nested objects (`sections[i].slots.actions[j]`). They're easier to read, but moving a block means deep copies along two paths, and ids aren't unique handles.

### 3. Slot rules are enforced in one place

`canPlace(tree, component, target)` checks that the slot exists, that it accepts the component's `fits` kind, and that it isn't full. Insert, move and duplicate all go through it. The UI asks the same function before offering a target, so the "only the container that will accept the drop is highlighted" rule (DESIGN.md §11) uses the exact same logic as the store.

### 4. Undo/redo with zundo

- History tracks `{ sections, nodes }` only. Selection and UI state are left out (`partialize`), so undo doesn't just move the selection around.
- **Typing is one undo step, not one per keystroke.** `updateProps` takes a coalesce key (`nodeId:prop`). Edits to the same key within 1 second are applied with tracking paused, so the history keeps the state from before the burst.
- **One drag = one undo step:** `beginTransaction()` pauses tracking and `commitTransaction()` resumes it. Zundo then records the whole drag as a single change.
- History is capped at 100 steps.

### 5. Messages for the live region

Each action returns a sentence ("Button added to Hero actions, position 2 of 2."). The editor puts it in its single polite live region (DESIGN.md §13). Because it's computed in the pure function, it's tested.

## Consequences

- `src/editor/store/tree.js` and its invariant tests are the core of the editor. The tests check that no block is orphaned or referenced twice, that slot rules hold, and that every operation leaves the input tree untouched.
- Section templates live in `src/registry/sections/`, with Zod props like component manifests and a `render(props)` that returns an element tree with `Slot` markers. The same tree is printed as page code and rendered on the canvas (ADR 0003).
- Saved and shared pages (phase 3) will be validated against a Zod schema of this exact shape on the server.
