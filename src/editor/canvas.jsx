"use client";

import { ArrowDown, ArrowUp, Copy, Plus, SquareDashed, Trash2 } from "lucide-react";
import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import { h } from "@/lib/codegen/jsx.js";
import { fillSlots } from "@/lib/codegen/slots.js";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { manifests } from "@/registry";
import { finalIndex, insertionIndex, insertionLine } from "./drop-position.js";
import { useDrag, useEditor, useEditorStore, useFocusRequests } from "./editor-context";
import { renderElement } from "./render-element";
import { canPlace, findParent, getManifest, getSectionTemplate } from "./store/tree.js";

// The page on the canvas, built from the same section and block element trees
// codegen prints (ADR 0003/0004). In "edit" mode blocks are selectable and
// their content is inert; in "try" mode the page is fully interactive.

/** @typedef {"edit" | "try"} CanvasMode */

const ModeContext = createContext(/** @type {CanvasMode} */ ("edit"));

// Selectors must return the same object when nothing changed, or React
// re-renders forever. A fresh `[]` each time would never be "the same".
/** @type {string[]} */
const NO_IDS = [];

/** @param {{ mode: CanvasMode }} props */
export function PageCanvas({ mode }) {
  const sections = useEditor((state) => state.tree.sections);
  const select = useEditor((state) => state.select);

  if (sections.length === 0) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-2 p-10 text-center">
        <p className="type-heading-2">Start from an example, or add your first block.</p>
        <p className="max-w-prose text-muted-foreground">Add a section from the Components panel to begin.</p>
      </div>
    );
  }

  return (
    <ModeContext value={mode}>
      <main
        // Clicking empty canvas space clears the selection.
        onClick={(event) => {
          if (mode === "edit" && event.target === event.currentTarget) select(null);
        }}
        className="flex min-h-full flex-col"
      >
        {sections.map((id) => (
          <CanvasSection key={id} id={id} />
        ))}
      </main>
    </ModeContext>
  );
}

/** @param {{ id: string }} props */
function CanvasSection({ id }) {
  const mode = useContext(ModeContext);
  const focus = useFocusRequests();
  const section = useEditor((state) => state.tree.nodes[id]);
  const selected = useEditor((state) => state.selectedId === id);
  const select = useEditor((state) => state.select);
  if (!section || section.kind !== "section") return null;

  const template = getSectionTemplate(section.template);
  // The template's own tree, with each Slot marker swapped for a live slot.
  const element = fillSlots(template.render(template.props.parse(section.props)), (slot) =>
    h("CanvasSlot", { sectionId: id, name: slot.name, className: slot.className }),
  );
  const content = renderElement(element, { CanvasSlot });

  if (mode === "try") return content;

  return (
    <div
      data-section-id={id}
      onClick={(event) => {
        // A click that reached here didn't land on a block: select the section.
        event.stopPropagation();
        select(id);
      }}
      className={cn(
        "relative -outline-offset-2",
        selected ? "outline-2 outline-solid outline-primary" : "hover:outline-1 hover:outline-dashed hover:outline-muted-foreground",
      )}
    >
      {/* A real button names and selects the section from the keyboard. */}
      <button
        ref={(button) => {
          // Take focus when an action asked for it (Select section, deleting
          // a section's last block).
          if (button && focus.claim(id)) button.focus();
        }}
        type="button"
        aria-pressed={selected}
        onClick={(event) => {
          event.stopPropagation();
          select(id);
        }}
        onKeyDown={(event) => {
          // Escape on a section clears the selection: the top of the walk up.
          if (event.key === "Escape") select(null);
        }}
        className="absolute top-2 left-2 z-10 rounded-full border border-input bg-card px-3 py-1 type-label text-muted-foreground hover:text-foreground"
      >
        {template.title} section
      </button>
      {content}
    </div>
  );
}

/** @param {{ sectionId: string, name: string, className?: string }} props */
function CanvasSlot({ sectionId, name, className }) {
  const mode = useContext(ModeContext);
  const ids = useEditor((state) => {
    const node = state.tree.nodes[sectionId];
    return node?.kind === "section" ? node.slots[name] ?? NO_IDS : NO_IDS;
  });
  const section = useEditor((state) => state.tree.nodes[sectionId]);
  const definition =
    section?.kind === "section" ? getSectionTemplate(section.template).slots.find((slot) => slot.name === name) : undefined;

  if (mode === "try") {
    // Same as the exported code: empty slots disappear.
    if (ids.length === 0) return null;
    return (
      <div className={className}>
        {ids.map((id) => (
          <CanvasBlock key={id} id={id} />
        ))}
      </div>
    );
  }

  return <EditableSlot sectionId={sectionId} name={name} className={className} ids={ids} definition={definition} />;
}

/**
 * A slot in edit mode: its blocks, its + menu, and a drop target.
 *
 * @param {{ sectionId: string, name: string, className?: string, ids: string[], definition?: import("@/registry/sections/schema").SlotDefinition }} props
 */
function EditableSlot({ sectionId, name, className, ids, definition }) {
  const { dropRef, handlers, over } = useDropTarget(sectionId, name, ids);
  const full = definition ? ids.length >= definition.max : true;
  const label = definition?.title ?? name;
  // Only the slot that will accept this drop is highlighted (DESIGN.md §11).
  const highlight = over && "outline-2 outline-solid outline-primary bg-primary-tint transition-colors duration-300";
  const line = over?.line;
  const indicator = line && (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute z-10 rounded-full bg-primary"
      style={{ left: line.left, top: line.top, width: line.width, height: line.height }}
    >
      <span className="absolute -top-1 -left-1 size-2 rounded-full bg-primary" />
    </div>
  );

  if (ids.length === 0) {
    return (
      <div
        ref={dropRef}
        {...handlers}
        data-slot-target={`${sectionId}:${name}`}
        className={cn(
          "relative flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-input p-4 text-center",
          highlight,
        )}
      >
        <p className="type-small text-muted-foreground">Drag a component here, or press + to add one</p>
        <AddMenu sectionId={sectionId} slot={name} label={label} />
      </div>
    );
  }

  return (
    <div
      ref={dropRef}
      {...handlers}
      data-slot-target={`${sectionId}:${name}`}
      className={cn("relative rounded-md", className, highlight)}
    >
      {ids.map((id) => (
        <CanvasBlock key={id} id={id} />
      ))}
      {!full && <AddMenu sectionId={sectionId} slot={name} label={label} compact />}
      {indicator}
    </div>
  );
}

/**
 * Makes a slot accept drops of components (from the palette) and blocks
 * (from the canvas), using the same canPlace() rule as every other action.
 * The tree only changes on drop, so one drag is one undo step.
 *
 * @param {string} sectionId
 * @param {string} slot
 * @param {string[]} ids  the slot's blocks
 */
function useDropTarget(sectionId, slot, ids) {
  const store = useEditorStore();
  const focus = useFocusRequests();
  const { payload, setPayload, setLastDropped } = useDrag();
  const tree = useEditor((state) => state.tree);
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [over, setOver] = useState(/** @type {{ index: number, line: ReturnType<typeof insertionLine> } | null} */ (null));

  const movingId = payload?.kind === "block" ? payload.id : undefined;
  const moving = movingId ? tree.nodes[movingId] : undefined;
  const component = payload?.kind === "component" ? payload.name : moving?.kind === "block" ? moving.component : undefined;
  const accepts = component !== undefined && canPlace(tree, component, { sectionId, slot }, { movingId }).ok;

  /** @param {{ clientX: number, clientY: number }} event */
  function measure(event) {
    const element = /** @type {HTMLDivElement} */ (ref.current);
    // Only this slot's own blocks (its direct children), not blocks further down.
    const blocks = [...element.children]
      .filter((node) => node.hasAttribute("data-block-id"))
      .map((node) => node.getBoundingClientRect());
    const index = insertionIndex(blocks, { x: event.clientX, y: event.clientY });
    return { index, line: insertionLine(blocks, index, element.getBoundingClientRect()) };
  }

  /** @type {Pick<import("react").DOMAttributes<HTMLDivElement>, "onDragOver" | "onDragLeave" | "onDrop">} */
  const handlers = {
    onDragOver: (event) => {
      // Not calling preventDefault is how a drop target says "no": the
      // browser then shows the not-allowed cursor and never fires drop here.
      if (!accepts) return;
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = movingId ? "move" : "copy";
      const next = measure(event);
      if (next.index !== over?.index) setOver(next);
    },
    onDragLeave: (event) => {
      if (!ref.current?.contains(/** @type {Node | null} */ (event.relatedTarget))) setOver(null);
    },
    onDrop: (event) => {
      if (!accepts || !payload) return;
      event.preventDefault();
      event.stopPropagation();
      const { index } = measure(event);
      setOver(null);
      setPayload(null);
      const actions = store.getState();
      const id =
        payload.kind === "component"
          ? actions.insertBlock(payload.name, { sectionId, slot, index })
          : actions.moveBlock(payload.id, { sectionId, slot, index: finalIndex(index, ids.indexOf(payload.id)) })
            ? payload.id
            : null;
      if (id) {
        setLastDropped(id);
        focus.request(id);
      }
    },
  };

  // A drag that ended somewhere else leaves no highlight behind.
  return { dropRef: ref, handlers, over: payload && accepts ? over : null };
}

/** @param {{ id: string }} props */
function CanvasBlock({ id }) {
  const mode = useContext(ModeContext);
  const store = useEditorStore();
  const focus = useFocusRequests();
  const drag = useDrag();
  const block = useEditor((state) => state.tree.nodes[id]);
  const selected = useEditor((state) => state.selectedId === id);
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));

  // Take focus if an action asked for it (after add, remove, move).
  useEffect(() => {
    if (ref.current && focus.claim(id)) ref.current.focus();
  });

  if (!block || block.kind !== "block") return null;
  const manifest = getManifest(block.component);
  const defaults = manifest.props.parse({});
  const content = renderElement(manifest.code.render(manifest.props.parse(block.props), defaults));

  if (mode === "try") return content;

  const { select, remove, moveBy, duplicate } = store.getState();
  const summary = describeBlock(block.props);

  /** @param {import("react").KeyboardEvent<HTMLDivElement>} event */
  function handleKeyDown(event) {
    if (event.target !== event.currentTarget) return;
    const mod = event.metaKey || event.ctrlKey;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      select(id);
    } else if (event.key === "Escape") {
      // Escape walks up: block -> its section (Select parent, DESIGN.md §11).
      const parent = findParent(store.getState().tree, id);
      if (parent) {
        event.preventDefault();
        select(parent.sectionId);
      }
    } else if (event.key === "Delete" || event.key === "Backspace") {
      event.preventDefault();
      if (remove(id)) focus.request(store.getState().selectedId);
    } else if (event.altKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      if (moveBy(id, event.key === "ArrowUp" ? -1 : 1)) focus.request(id);
    } else if (mod && event.key.toLowerCase() === "d") {
      event.preventDefault();
      if (duplicate(id)) focus.request(store.getState().selectedId);
    }
  }

  return (
    // The outer wrapper is the drag source and what drop-position measures.
    // The selectable block and its action bar are siblings inside it, so the
    // bar's buttons are never nested inside the block's role="button".
    <div
      data-block-id={id}
      // Drag is the pointer extra; the action bar, Alt+arrows and Move to do
      // the same without dragging (WCAG 2.5.7).
      draggable
      onDragStart={(event) => {
        event.stopPropagation();
        event.dataTransfer.effectAllowed = "move";
        // Some browsers only start a drag when there's data to carry.
        event.dataTransfer.setData("text/plain", manifest.title);
        setDragPreview(event, manifest.title);
        drag.setPayload({ kind: "block", id });
      }}
      onDragEnd={() => drag.setPayload(null)}
      onAnimationEnd={() => drag.setLastDropped(null)}
      className={cn(
        "group relative",
        // The original stays in place, faded, while it's dragged (DESIGN.md §11).
        drag.payload?.kind === "block" && drag.payload.id === id && "opacity-40",
        drag.lastDropped === id && "animate-drop-flash",
      )}
    >
      {/* inert: in edit mode the block is one selectable thing. Its own
          buttons and fields can't take focus or clicks until "Try it" mode. */}
      <div inert>{content}</div>
      {/* The selectable block: an empty layer exactly over the content, not
          a wrapper around it. Wrapped, the content's text ("Fast to set up")
          would be the button's visible label while its name says "Card: ...",
          which breaks Label in Name (WCAG 2.5.3) for speech-input users. */}
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        aria-label={`${manifest.title}${summary ? `: ${summary}` : ""}`}
        aria-keyshortcuts="Enter Delete Escape Alt+ArrowUp Alt+ArrowDown Control+D Meta+D"
        onClick={(event) => {
          event.stopPropagation();
          select(id);
        }}
        onKeyDown={handleKeyDown}
        className={cn(
          "absolute inset-0 cursor-pointer rounded-sm outline-offset-2",
          selected ? "outline-2 outline-solid outline-primary" : "hover:outline-1 hover:outline-dashed hover:outline-muted-foreground",
        )}
      />
      {/* The block's name on hover and keyboard focus (DESIGN.md §11). Hidden
          from screen readers: the block's aria-label already says it. */}
      {!selected && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-6 left-0 z-10 hidden rounded-full border border-border bg-card px-2 type-label whitespace-nowrap text-muted-foreground group-hover:block group-has-[:focus-visible]:block"
        >
          {manifest.title}
        </span>
      )}
      {selected && <FloatingActionBar id={id} title={manifest.title} />}
    </div>
  );
}

/**
 * The floating action bar over the selected block (DESIGN.md §11): a pill of
 * ghost icon buttons, each named by its tooltip. After an action, focus goes
 * back to the button that was pressed, even though moving a block moves its
 * DOM node (which would otherwise drop focus).
 *
 * @param {{ id: string, title: string }} props
 */
function FloatingActionBar({ id, title }) {
  const store = useEditorStore();
  const focus = useFocusRequests();
  const tree = useEditor((state) => state.tree);
  const parent = findParent(tree, id);
  /** @type {import("react").RefObject<Record<string, HTMLButtonElement | null>>} */
  const buttons = useRef({});

  // Give focus back to the pressed button once the move has re-rendered.
  useEffect(() => {
    for (const [action, button] of Object.entries(buttons.current)) {
      if (button && focus.claim(`bar:${id}:${action}`)) button.focus();
    }
  });

  if (!parent) return null;
  const section = tree.nodes[parent.sectionId];
  const count = section?.kind === "section" ? section.slots[parent.slot].length : 0;
  const { moveBy, duplicate, remove, select } = store.getState();

  /** @type {{ action: string, label: string, icon: typeof Copy, disabled?: boolean, run: () => void }[]} */
  const actions = [
    {
      action: "up",
      label: "Move up",
      icon: ArrowUp,
      disabled: parent.index === 0,
      run: () => {
        if (moveBy(id, -1)) focus.request(`bar:${id}:up`);
      },
    },
    {
      action: "down",
      label: "Move down",
      icon: ArrowDown,
      disabled: parent.index === count - 1,
      run: () => {
        if (moveBy(id, 1)) focus.request(`bar:${id}:down`);
      },
    },
    {
      action: "duplicate",
      label: "Duplicate",
      icon: Copy,
      run: () => {
        if (!duplicate(id)) return;
        const copy = store.getState().selectedId;
        if (copy) focus.request(`bar:${copy}:duplicate`);
      },
    },
    {
      action: "parent",
      label: "Select section",
      icon: SquareDashed,
      run: () => {
        select(parent.sectionId);
        focus.request(parent.sectionId);
      },
    },
    {
      action: "delete",
      label: "Delete",
      icon: Trash2,
      run: () => {
        if (remove(id)) focus.request(store.getState().selectedId);
      },
    },
  ];

  return (
    <div
      role="group"
      aria-label={`${title} actions`}
      onClick={(event) => event.stopPropagation()}
      className="absolute -top-11 right-0 z-20 flex items-center gap-1 rounded-full border border-border bg-card p-1"
    >
      {actions.map(({ action, label, icon: Icon, disabled, run }) => (
        <Tooltip key={action} content={label} kind="label">
          <button
            ref={(button) => {
              buttons.current[action] = button;
            }}
            type="button"
            disabled={disabled}
            onClick={run}
            className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
          >
            <Icon aria-hidden="true" size={20} strokeWidth={1.5} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

/**
 * The drag preview (DESIGN.md §11): a compact card with the component's name
 * instead of the browser's ghost of the whole block. It's built in the
 * document the drag starts in (the editor page or the canvas iframe), shown
 * as the drag image, and removed right after.
 *
 * @param {import("react").DragEvent} event
 * @param {string} title
 */
export function setDragPreview(event, title) {
  const transfer = event.dataTransfer;
  if (typeof transfer.setDragImage !== "function") return;
  const doc = /** @type {Element} */ (event.currentTarget).ownerDocument;
  const card = doc.createElement("div");
  // Off-screen but rendered: browsers can only snapshot a laid-out element.
  card.className =
    "fixed -top-96 left-0 flex max-w-70 items-center gap-2 rounded-md border border-primary bg-card px-4 py-3 type-small font-medium text-foreground";
  // Lucide's "box" icon, inline because this element isn't rendered by React.
  card.innerHTML =
    '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>';
  card.append(doc.createTextNode(title));
  doc.body.append(card);
  transfer.setDragImage(card, 16, 16);
  // The browser has taken its snapshot by the next task.
  setTimeout(() => card.remove(), 0);
}

/**
 * The "+" button in a slot, with a short list of the components that fit.
 *
 * @param {{ sectionId: string, slot: string, label: string, compact?: boolean }} props
 */
function AddMenu({ sectionId, slot, label, compact = false }) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const store = useEditorStore();
  const focus = useFocusRequests();
  const tree = useEditor((state) => state.tree);
  const options = manifests.filter((manifest) => canPlace(tree, manifest.name, { sectionId, slot }).ok);
  if (options.length === 0) return null;

  return (
    <div className={cn("flex flex-col items-center gap-2", compact && "self-center")} onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`Add to ${label}`}
        onClick={() => setOpen(!open)}
        className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full border border-dashed border-input bg-card text-muted-foreground hover:text-foreground"
      >
        <Plus aria-hidden="true" size={20} strokeWidth={1.5} />
      </button>
      <ul id={listId} hidden={!open} className="flex flex-wrap justify-center gap-2">
        {options.map((manifest) => (
          <li key={manifest.name}>
            <button
              type="button"
              onClick={() => {
                const id = store.getState().insertBlock(manifest.name, { sectionId, slot });
                if (id) focus.request(id);
                setOpen(false);
              }}
              className="h-8 cursor-pointer rounded-full border border-input bg-card px-3 type-small hover:bg-accent"
            >
              {manifest.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A few words that tell blocks of the same kind apart in labels and layers:
 * the first text prop ("Get started", "Starter plan").
 *
 * @param {Record<string, unknown>} props
 */
export function describeBlock(props) {
  for (const key of ["label", "title", "name", "headline"]) {
    if (typeof props[key] === "string" && props[key]) return /** @type {string} */ (props[key]);
  }
  const items = props.items;
  if (Array.isArray(items) && items.length > 0) return `${items.length} items`;
  return "";
}
