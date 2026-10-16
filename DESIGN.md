# DESIGN.md

The visual and interaction rules for this project. It is built on **Volt**, Sam's design system: *bold, quiet interfaces for what's next.* Volt is the source of truth for color, type, spacing and radius; this file maps it into the codebase and adds the rules the editor needs.

Anything marked **[Project addition]** is not in Volt yet. Use it here, and propose adding it to Volt if it proves itself.

## 1. Principles

- **Quiet ground, bold signal.** Surfaces stay calm (`surface`, `surface-raised`). Color carries meaning: `primary` for the one main action in a view, `accent` for highlights.
- **Clarity first.** Plain words, one primary action per view, generous spacing.
- **Lines, not shadows.** Separate things with a `line` hairline or a `surface-raised` panel. No drop shadows, anywhere.
- **Pills and soft corners.** Buttons, badges and toggles are pills (`radius-full`); cards and panels use `radius-md`; inputs use `radius-sm`.
- **Flat color.** No gradients. A flat cobalt or lime block is the look.
- **Every interaction has three paths.** Anything you can drag, you can also click and do from the keyboard.

## 2. Color tokens

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `surface` | `#f7f8fa` | `#0b0d12` | Page background |
| `surface-raised` | `#ffffff` | `#151922` | Cards, panels, inputs, menus |
| `line` | `#e3e6ec` | `#252b36` | Decorative hairlines and dividers |
| `ink` | `#0e1116` | `#f2f4f8` | Primary text and icons |
| `ink-muted` | `#5a6372` | `#9aa3b2` | Secondary text, captions, placeholders |
| `primary` | `#2b5cff` | `#5b82ff` | Electric cobalt: primary buttons, links, focus rings, selection |
| `on-primary` | `#ffffff` | `#0b0d12` | Text and icons on a `primary` fill |
| `accent` | `#c6f432` | `#c6f432` | Volt lime: badges, "new" markers, data emphasis. **Fill only** |
| `success` | `#0b7f57` | `#3dd68c` | Confirmations and positive status |
| `danger` | `#d13438` | `#ff6369` | Errors and destructive actions |

**[Project additions]**

| Token | Light | Dark | Why |
| --- | --- | --- | --- |
| `line-strong` | `#868f9e` | `#646d7d` | Borders of inputs, checkboxes and other controls. `line` is only 1.2–1.4:1 against the surfaces, which fails WCAG 1.4.11 (3:1) for control boundaries. These values were checked at 3.07–3.73:1 |
| `on-danger` | `#ffffff` | `#0b0d12` | Text on `danger` fills (danger buttons). Codifies §10's "white text in light / `surface` text in dark". Exposed as `destructive-foreground`. Measured 4.9:1 (light) and 6.7:1 (dark) |
| `on-accent` | `#0e1116` | `#0e1116` | Text on `accent`. Codifies Volt's rule that lime always carries the light theme's ink, in both themes |
| `primary-tint` | `rgba(43, 92, 255, 0.12)` | `rgba(91, 130, 255, 0.18)` | Background of drop targets, highlighted code lines, the post-drop flash |

### Color rules

- `accent` is never used as text on `surface`, and never as a large background. One lime element per region is plenty.
- `success` and `danger` are for status only, never decoration.
- Never write raw hex in components. Use Tailwind classes backed by tokens (`bg-background`, `text-muted-foreground`, `border-input`).
- Colors that must be told apart differ in lightness, not hue alone.

### Measured contrast

| Pair | Light | Dark |
| --- | --- | --- |
| `ink` on `surface` | 17.8 | 17.7 |
| `ink-muted` on `surface` | 5.7 | 7.6 |
| `ink-muted` on `surface-raised` | 6.1 | 6.9 |
| `on-primary` on `primary` | 5.2 | 5.6 |
| `primary` (as link text) on `surface` | 4.9 | 5.6 |
| `success` on `surface` | 4.7 | 10.4 |
| `danger` on `surface` | 4.6 | 6.7 |
| `on-accent` on `accent` | 14.8 | 14.8 |

All text pairs pass 4.5:1. `success` and `danger` in the light theme pass with little margin, so don't put them on tinted backgrounds without rechecking.

## 3. Typography

| Family | Font | Use |
| --- | --- | --- |
| `display` | Space Grotesk | Headlines only |
| `sans` | Inter | Everything else |
| `mono` **[Project addition]** | JetBrains Mono | Code blocks, install commands, inline code |

Load all three with `next/font/google` and expose them as `--font-display`, `--font-sans`, `--font-mono`.

| Style | Family | Size / line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- | --- |
| `display` | display | 56 / 60 | 700 | -0.02em | Hero headline, once per page |
| `heading-1` | display | 36 / 42 | 600 | -0.01em | Page titles |
| `heading-2` | display | 24 / 30 | 600 | 0 | Section titles, card headers |
| `body` | sans | 16 / 24 | 400 | 0 | Default reading text |
| `small` | sans | 14 / 20 | 400 | 0 | Helper text, table cells, editor panels |
| `label` | sans | 12 / 16 | 600 | 0.08em, uppercase | Eyebrows, badges, panel section headers |
| `code` **[Project addition]** | mono | 13 / 20 | 400 | 0 | Code view and snippets |

On screens under 640 px, step `display` down to 40/44 and `heading-1` to 28/34.

The editor chrome is dense: panels use `small` for content and `label` for section headers. Reading pages (catalog, tutorials) use `body`.

## 4. Spacing

Volt's steps line up exactly with Tailwind's default scale, so use these classes:

| Token | Value | Tailwind | Use |
| --- | --- | --- | --- |
| `space-2` | 8px | `2` | Icon-to-label gaps, tight inline groups |
| `space-4` | 16px | `4` | Padding inside controls and cards; gap between related items |
| `space-6` | 24px | `6` | Card padding on large screens; gap between groups |
| `space-10` | 40px | `10` | Between page sections |

**[Project addition]** The editor chrome may also use `1` (4px) and `3` (12px) for dense toolbars, layer rows and inspector fields. Don't use them on content pages. Avoid other values.

## 5. Radius

| Token | Value | Use |
| --- | --- | --- |
| `radius-sm` | 6px | Inputs, small chips, checkboxes |
| `radius-md` | 12px | Cards, panels, modals, the preview frame |
| `radius-full` | 9999px | Buttons, badges, toggles, segmented controls. The pill is Volt's signature |

## 6. Wiring Volt into Tailwind v4 and shadcn

shadcn's `--accent` means "subtle hover background," which is not Volt's `accent`. Map shadcn's slot to a quiet surface and expose Volt's lime as `highlight` so the two never collide.

```css
/* app/globals.css */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  --background: #f7f8fa;          /* surface */
  --foreground: #0e1116;          /* ink */
  --card: #ffffff;                /* surface-raised */
  --card-foreground: #0e1116;
  --popover: #ffffff;
  --popover-foreground: #0e1116;
  --primary: #2b5cff;
  --primary-foreground: #ffffff;  /* on-primary */
  --secondary: #ffffff;           /* secondary buttons: raised + strong border */
  --secondary-foreground: #0e1116;
  --muted: #ffffff;
  --muted-foreground: #5a6372;    /* ink-muted */
  --accent: #eef0f4;              /* shadcn hover surface, NOT Volt lime */
  --accent-foreground: #0e1116;
  --destructive: #d13438;         /* danger */
  --success: #0b7f57;
  --border: #e3e6ec;              /* line */
  --input: #868f9e;               /* line-strong */
  --ring: #2b5cff;
  --highlight: #c6f432;           /* Volt accent */
  --highlight-foreground: #0e1116;/* on-accent */
  --primary-tint: rgba(43, 92, 255, 0.12);
}

.dark {
  --background: #0b0d12;
  --foreground: #f2f4f8;
  --card: #151922;
  --card-foreground: #f2f4f8;
  --popover: #151922;
  --popover-foreground: #f2f4f8;
  --primary: #5b82ff;
  --primary-foreground: #0b0d12;
  --secondary: #151922;
  --secondary-foreground: #f2f4f8;
  --muted: #151922;
  --muted-foreground: #9aa3b2;
  --accent: #1c212c;
  --accent-foreground: #f2f4f8;
  --destructive: #ff6369;
  --success: #3dd68c;
  --border: #252b36;
  --input: #646d7d;
  --ring: #5b82ff;
  --highlight: #c6f432;
  --highlight-foreground: #0e1116;
  --primary-tint: rgba(91, 130, 255, 0.18);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-highlight: var(--highlight);
  --color-highlight-foreground: var(--highlight-foreground);
  --color-primary-tint: var(--primary-tint);

  --font-sans: var(--font-inter);
  --font-display: var(--font-space-grotesk);
  --font-mono: var(--font-jetbrains-mono);

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 12px;

  --shadow-xs: none;
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
}
```

The `--accent` hover values (`#eef0f4`, `#1c212c`) are **[Project additions]**: neutral steps between `surface` and `line` for hover rows and menu items.

Themes: use `next-themes` with the `class` strategy, default to the system setting, and offer a light/dark toggle in the top bar. The preview iframe receives the theme via a `data-theme` / class change, not a reload.

## 7. Motion **[Project addition]**

Volt doesn't define motion yet. Use these:

| Token | Value | Use |
| --- | --- | --- |
| `motion-fast` | 100ms | Hover, press, items making room during a drag, snap into place |
| `motion-base` | 200ms | Panels, popovers, tabs, theme switch |
| `motion-slow` | 300ms | Drawers, dialogs |
| `ease-out` | `cubic-bezier(0.2, 0, 0, 1)` | Things entering or settling |

- The more often an animation is seen, the shorter it is.
- Write no-motion styles first; add movement only under `@media (prefers-reduced-motion: no-preference)`. With reduced motion, keep fades and color changes, drop movement, scaling and spinning.
- Nothing decorative. Motion explains where something came from or went.
- Direct manipulation responds within 100ms. Use optimistic updates; never wait on the network to move a block.

## 8. Iconography

Lucide icons (shadcn's default) at 20px with `strokeWidth={1.5}`, colored `ink` or `ink-muted`. Use `primary` only when the icon is itself the action. Icon-only buttons need an `aria-label` and a tooltip.

No logo yet: set the product name in Space Grotesk 700.

## 9. Voice and microcopy

Short, direct, friendly. Sentence case everywhere ("Copy code", not "COPY CODE"). Say what happens next.

| Situation | Write |
| --- | --- |
| Palette card action | "Add to page" |
| Empty slot | "Drag a component here, or press + to add one" |
| Copy button, idle | "Copy code" / "Copy install command" (say *what* it copies) |
| Copy button, done | "Copied" with a check icon |
| Blank page | "Start from an example, or add your first block." |
| Undo toast | "Hero removed." + "Undo" |
| Save error | "Couldn't save. Your changes are still here. Try again." |
| AI unavailable | "Explanations are off right now. The code and guide still work." |

Errors say what happened and what to do. No exclamation marks, no jokes in errors.

## 10. Components

Build these as shadcn components restyled to Volt. Every component documents its states: default, hover, focus-visible, active, disabled, loading.

**Button.** Pill (`rounded-full`). Heights 32 / 40 / 48 px; horizontal padding `4`; icon gap `2`.
- *Primary:* `primary` fill, `on-primary` text. One per view.
- *Secondary:* `surface-raised` fill, 1px `line-strong` border, `ink` text.
- *Ghost:* transparent, `ink` text, `accent` (hover surface) on hover. For toolbars.
- *Danger:* `danger` fill, white text in light / `surface` text in dark. Confirm destructive actions or make them undoable.

**Badge.** Pill, `label` style. Highlight variant: `highlight` fill + `highlight-foreground` text. Neutral variant: `line` border, `ink-muted` text.

**Input / Select / Textarea.** `radius-sm`, `surface-raised` fill, 1px `line-strong` border, `small` text in the editor and `body` on content pages. Labels always visible (no placeholder-only labels).

**Card.** `surface-raised`, 1px `line` border, `radius-md`, padding `4` (mobile) / `6` (desktop). No shadow, no colored left border.

**Tabs / Segmented control.** Pill track on `surface`, active segment `surface-raised` with `ink` text. Used for Preview | Code | Split, framework choice (Next.js / Vite / HTML) and package manager.

**Copy button.** Always visible, labeled with what it copies. Show the check + "Copied" for about 2 seconds, **only after** the clipboard promise resolves; keep focus on the button; announce via a polite live region. On failure, show "Couldn't copy" and select the text.

**Code block.** `surface-raised` with `line` border, `radius-md`, `code` type, copy button top-right, file name / language label in `label` style. Highlight with Shiki dual themes (`github-light` / `github-dark` to start; a Volt Shiki theme later).

**Command palette (Cmd+K).** Centered dialog, `radius-md`. Fuzzy search with synonyms, shortcuts shown right-aligned in `mono`, recent items first.

**Toast.** Bottom-center, `surface-raised` + `line` border, `radius-md`, includes "Undo" for reversible actions. Auto-dismiss after 5s; pause on hover and focus.

**Tooltip.** `ink` fill, `surface` text, `small`, `radius-sm`, after a 400ms delay, also shown on keyboard focus.

**Focus ring (all interactive elements).** 2px `ring` (primary) outline with 2px offset, on `:focus-visible` only. Never remove focus styles. Sticky panels must never fully cover a focused element.

## 11. The editor

### Layout

```
┌──────────────────────── Top bar (56px) ────────────────────────┐
│ Name · Undo/Redo · Preview|Code|Split · 375/768/1280 · Theme · Export · ⌘K │
├───────────────┬──────────────────────────────┬─────────────────┤
│ Left panel    │ Canvas                        │ Inspector       │
│ 280px         │ iframe preview on `surface`   │ 320px           │
│ Components    │ framed by `line`, `radius-md` │ props from Zod  │
│ Layers        │ selection breadcrumb on top   │ a11y notes      │
│ Pages         │                               │ "How to add this"│
└───────────────┴──────────────────────────────┴─────────────────┘
```

- Panels are docked, collapsible and resizable (min 240px, max 400px). No floating panels.
- Panel chrome: `surface` background, `line` dividers, `label` section headers, `small` content.
- Under 1024px, the side panels become sheets opened from the top bar; under 640px the editor shows a "Best on a larger screen" note but still supports click-to-add.

### Canvas states

| State | Treatment |
| --- | --- |
| Hover over a block | 1px dashed `ink-muted` outline, block name tag in `label` style |
| Selected block | 2px solid `primary` outline, 2px offset; floating action bar above it |
| Empty slot | 1px dashed `line-strong` border, `radius-md`, `ink-muted` hint text, centered "+" button |
| Valid drop target (while dragging) | 2px `primary` outline + `primary-tint` fill, 350ms fade in |
| Insertion point | 2px `primary` line with an 8px `primary` circle at the start |
| Invalid target | No highlight at all (don't show red; just don't accept) |
| Dragged original | `opacity: 0.4` in place |
| Drag preview | Compact card ≤ 280×280px: `surface-raised`, 1px `primary` border, `radius-md`, component name + icon |
| Just dropped | `primary-tint` flash that fades out over 700ms, then the block is selected |

Only the container that will actually accept the drop is highlighted. Reflow neighbors when the dragged item's center crosses their edge (100ms). Drop zones are slightly magnetic: accept drops a few pixels outside their edge.

### Floating action bar

Pill, `surface-raised`, 1px `line` border, ghost icon buttons (24×24px minimum hit area): Move up, Move down, Duplicate, Delete, Select parent. Actions announce their result ("Hero moved to position 1 of 3") and return focus to the triggering button.

### Input paths (all required)

1. **Drag** from the palette or a layer row. Touch: short press-and-hold to start; `touch-action: none` only on drag handles so panels still scroll.
2. **Click "Add to page"** on a palette card: inserts after the selected block, or into the selected slot, or at the end of the page.
3. **Keyboard:** Space to pick up, arrows to move, Space to drop, Escape to cancel, with screen-reader announcements; plus the action bar's menu commands.

Undo / redo: Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z. One drag = one undo step.

### Split view

Canvas left, generated code right. Selecting a block scrolls the code to its lines and highlights them with a `primary-tint` row background and a 2px `primary` gutter marker. Hovering code lines outlines the matching block. The "How to add this" drawer follows the user's framework choice, which is remembered globally.

### Onboarding

No product tour. First visit opens a prefilled example landing page with the hero selected, so the first useful action (change a prop, copy code) is one click away. "Start blank" is always available. Contextual hints appear when a feature is first reached, once, and can be dismissed.

## 12. Catalog and tutorial pages

- Catalog grid: cards with a **live** preview (not screenshots), name in `heading-2`, one-line "when to use" in `small`, an accessibility badge.
- Component page: Preview | Code tabs, variant and theme toggles, viewport toggle, install command with package-manager tabs, "Copy prompt for your AI agent," then usage guidance, accessibility behavior and keyboard notes.
- Tutorials: max reading width 72ch, `body` type, numbered steps, framework tabs that stay in sync across the page, code blocks with file-name labels, a "You're done when..." check at the end.

## 13. Accessibility checklist

- Text contrast ≥ 4.5:1 (≥ 3:1 at 24px+), control borders and focus rings ≥ 3:1, in both themes.
- Every drag has a non-drag single-pointer alternative (WCAG 2.2 SC 2.5.7).
- Targets ≥ 24×24px (SC 2.5.8).
- Visible focus on everything, never fully obscured (SC 2.4.11).
- One polite live region for editor announcements.
- `prefers-reduced-motion` respected.
- Generated code is accessible too: correct roles, labels and heading order in every component's output.

## 14. Don'ts

- No drop shadows, gradients, glassmorphism or glow.
- No blue-purple gradients, emoji feature cards, or cards with a colored left border.
- No lime text on light surfaces; no lime as a large background.
- No more than one primary button per view.
- No raw hex, arbitrary spacing or arbitrary radii in components.
- No placeholder-only form labels.
- No motion that runs when reduced motion is on.