# 0005. Canvas: a same-tree iframe (portal), not a separate /preview route

- Status: accepted. Recorded for review afterwards (Sam asked the agent to keep building without check-ins, 2026-10-16). **This departs from CLAUDE.md's stack table** ("Same-origin `/preview` route rendered in an iframe"), so it needs Sam's explicit OK. If he prefers the route, the canvas can be moved behind it without touching the store or codegen.
- Date: 2026-10-16

## Context

The canvas must show the page at 375 / 768 / 1280 px with its **real** responsive behavior. Tailwind's `md:` and `lg:` follow the viewport, so a narrow `div` inside a wide editor would still show the desktop layout. That rules out rendering the page directly in the editor's document. Some form of iframe is needed.

## Options

1. **Separate `/preview` route in an iframe** (CLAUDE.md's plan). The page runs as its own React app, and the editor sends it the tree with `postMessage`.
   It gives strong isolation: a crash or global CSS in the page can't touch the editor. But it needs a message protocol both ways (tree → frame, selection and clicks ← frame), serialization of every update, two React roots to keep in sync, and focus and keyboard handling split across them.
2. **Same React tree, rendered into an iframe with a portal.** The editor creates an empty iframe, copies its stylesheets in, and renders the page into the iframe's `<body>` with `createPortal`.
   The iframe's viewport gives correct media queries. State, context and event handlers work as usual, because it's one React app (React attaches its event listeners to portal containers, including ones in another document). There's no protocol to write or test.
3. **CSS container queries** instead of an iframe. Components would have to use `@container` rather than viewport breakpoints, and the generated code would then behave differently in the user's own app. That's no good for a tool that teaches real code.

## Decision

**Option 2.** `src/editor/frame.jsx` does four things:

- writes a standards-mode document (the initial `about:blank` is in quirks mode);
- copies `<link rel=stylesheet>` and `<style>` tags into the frame and keeps them in sync with a `MutationObserver` (Next swaps style tags during navigation and hot reload);
- mirrors `<html>`'s classes (next/font variables, the `dark` theme class) into the frame;
- portals the page in.

A wrapper scales the frame down to fit the available space, so a 1280 px page can be seen whole. The frame still reports its full width to media queries.

## Consequences

- **Tested in jsdom:** content renders into the frame's own document, React state and click handlers work across the boundary, the document is in standards mode, and styles are copied. The editor's integration tests drive the canvas inside the iframe.
- **Less isolation than option 1.** A component that throws would take down the editor too (one React tree). That's acceptable while the only code on the canvas is our own tested components. An error boundary around the canvas is a cheap follow-up.
- **Not yet verified in a real browser.** This was built while the browser tools were disconnected. Fonts, the theme class and Tailwind's breakpoints inside the frame need a look at 375 / 768 / 1280 px.
- Drag and drop across the frame boundary (next) needs pointer coordinates translated between the two documents. dnd-kit supports iframes, but it has to be checked by hand.
