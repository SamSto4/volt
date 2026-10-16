# 0006. Drag and drop: native HTML5 events for now, not dnd-kit

- Status: accepted. Approved by Sam on 2026-10-17, replacing dnd-kit for now; revisit if touch press-and-hold or a keyboard drag mode is needed.
- Date: 2026-10-16

## Context

Blocks can be dropped from the palette (in the editor page) into slots on the canvas (inside an iframe, ADR 0005), and moved between slots. Every drag action already has a click and keyboard path (Add to page, the + menus, the action bar, Alt+arrows), so WCAG 2.5.7 is met without drag. Drag is the pointer convenience on top.

This was built while the browser tools were disconnected, so nothing pointer-driven could be watched in a real browser.

## Options

1. **dnd-kit** (CLAUDE.md's choice). Pointer and touch sensors, keyboard dragging with screen-reader announcements, sortable animations, collision detection.
   It's the better end state. But it measures layout and tracks pointers itself, and dragging *from* the parent page *into* an iframe needs its iframe support set up and checked by hand. With jsdom (no layout) as the only test bed, a broken drag would ship unnoticed.
2. **Native HTML5 drag and drop.** `draggable`, `dragstart`, `dragover`, `drop`.
   The browser handles the pointer, the ghost image and Escape-to-cancel. It works across a same-origin iframe without extra setup, and the events can be dispatched in jsdom, so the behavior is tested. Downsides:
   - weaker touch support (iOS has it, but it's not press-and-hold friendly);
   - no keyboard dragging (covered by the action bar and Alt+arrows instead);
   - the ghost image is the browser's, not DESIGN.md's compact card.

## Decision

**Option 2 for now**, built so swapping in dnd-kit later touches only the event wiring:

- **Placement uses the same `canPlace()` rule** as every other action. A slot that can't take the item doesn't call `preventDefault` on `dragover`, so the browser refuses the drop. There's no red state (DESIGN.md §11).
- **Where it lands** is computed by pure functions over boxes (`drop-position.js`: `insertionIndex`, `insertionLine`, `finalIndex`), unit-tested for rows, columns and grids. A dnd-kit version would reuse them.
- **The tree changes only on drop**, so one drag is one undo step without needing the store's transaction API.
- What's being dragged lives in React context, because browsers hide `dataTransfer` from `dragover` handlers.

## Consequences

- Done from DESIGN.md §11:
  - only the slot that will accept is highlighted (2px primary outline + tint);
  - a 2px insertion line with an 8px dot;
  - the original fades to 40% while dragged;
  - the drop flashes `primary-tint` for 700ms;
  - the dropped block is selected and focused.
- **Missing compared with dnd-kit:** touch press-and-hold, keyboard drag mode (Space to pick up, arrows, Space to drop), neighbors animating aside, and a custom drag preview.
- **Needs a hand check in a real browser:** palette → iframe drops, the insertion line's position at 375 / 768 / 1280 px (the canvas is scaled), and Escape to cancel.
