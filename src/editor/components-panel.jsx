"use client";

import { GripVertical, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Abilities, LivePreview, PresetChips, usePreset } from "@/components/component-peek";
import { Button } from "@/components/ui/button";
import { manifests } from "@/registry";
import { sections as sectionTemplates } from "@/registry/sections";
import { describeBlock, setDragPreview } from "./canvas";
import { missedDropMessage } from "./drop-hint.js";
import { useDrag, useEditor, useEditorStore } from "./editor-context";
import { getManifest, getSection, getSectionTemplate } from "./store/tree.js";

/**
 * The left-hand panel: components and sections to add, and the page's layers.
 * "Add to page" is the click alternative to dragging (DESIGN.md §11): it puts
 * the block after the selected one, or into the selected section, or into
 * the first slot on the page that takes it.
 */
export function ComponentsPanel() {
  const store = useEditorStore();

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="palette-heading" className="flex flex-col gap-3">
        <h2 id="palette-heading" className="type-label text-muted-foreground">
          Components
        </h2>
        <ul className="flex flex-col gap-2">
          {manifests.map((manifest) => (
            <PaletteItem key={manifest.name} name={manifest.name} />
          ))}
        </ul>
      </section>

      <section aria-labelledby="sections-heading" className="flex flex-col gap-3">
        <h2 id="sections-heading" className="type-label text-muted-foreground">
          Sections
        </h2>
        <ul className="flex flex-col gap-2">
          {sectionTemplates.map((template) => (
            <li key={template.name} className="flex items-center justify-between gap-2 rounded-md border border-border bg-card p-3">
              <span className="type-small font-medium">{template.title}</span>
              <Button
                variant="secondary"
                size="sm"
                aria-label={`Add ${template.title} section`}
                onClick={() => store.getState().addSection(template.name)}
              >
                <Plus aria-hidden="true" strokeWidth={1.5} />
                Add section
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <LayersList />
    </div>
  );
}

/** An outline of the page: every section and block, in order, selectable. */
function LayersList() {
  const tree = useEditor((state) => state.tree);
  const selectedId = useEditor((state) => state.selectedId);
  const select = useEditor((state) => state.select);

  return (
    <nav aria-labelledby="layers-heading" className="flex flex-col gap-3">
      <h2 id="layers-heading" className="type-label text-muted-foreground">
        Layers
      </h2>
      {tree.sections.length === 0 ? (
        <p className="type-small text-muted-foreground">The page is empty.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {tree.sections.map((sectionId) => {
            const section = getSection(tree, sectionId);
            if (!section) return null;
            const blockIds = Object.values(section.slots).flat();
            return (
              <li key={sectionId} className="flex flex-col gap-1">
                <LayerButton id={sectionId} selected={selectedId === sectionId} onSelect={select}>
                  {getSectionTemplate(section.template).title}
                </LayerButton>
                {blockIds.length > 0 && (
                  <ol className="flex flex-col gap-1 pl-4">
                    {blockIds.map((blockId) => {
                      const block = tree.nodes[blockId];
                      if (!block || block.kind !== "block") return null;
                      const summary = describeBlock(block.props);
                      return (
                        <li key={blockId}>
                          <LayerButton id={blockId} selected={selectedId === blockId} onSelect={select}>
                            {getManifest(block.component).title}
                            {summary && <span className="text-muted-foreground"> · {summary}</span>}
                          </LayerButton>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}

/**
 * @param {{ id: string, selected: boolean, onSelect: (id: string) => void, children: import("react").ReactNode }} props
 */
function LayerButton({ id, selected, onSelect, children }) {
  return (
    <button
      type="button"
      aria-current={selected ? "true" : undefined}
      onClick={() => onSelect(id)}
      className="flex min-h-8 w-full cursor-pointer items-center truncate rounded-sm px-2 text-left type-small hover:bg-accent aria-[current=true]:bg-primary-tint aria-[current=true]:font-medium"
    >
      {children}
    </button>
  );
}

const PEEK_DELAY_MS = 300;
const PEEK_WIDTH = 320;

/**
 * One component in the palette: drag it, or "Add to page". Pointing at it
 * (after a short delay) or moving keyboard focus into it opens a peek beside
 * the palette: the component, live and interactive, with its presets and what
 * it can do. Moving the pointer onto the peek keeps it open; Escape closes it
 * (WCAG 1.4.13). It's fixed-positioned so the scrolling panel doesn't clip it.
 *
 * @param {{ name: string }} props
 */
function PaletteItem({ name }) {
  const store = useEditorStore();
  const drag = useDrag();
  const { manifest, preset, setPresetName } = usePreset(name);
  const [position, setPosition] = useState(/** @type {{ top: number, left: number } | null} */ (null));
  const item = useRef(/** @type {HTMLLIElement | null} */ (null));
  const addButton = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const timer = useRef(/** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined));
  // Which input moved focus here: a focus right after a pointer press came
  // from the mouse (hover already handles that); any other focus came from
  // the keyboard and opens the peek. Timestamps, not :focus-visible, so it
  // behaves the same in every browser and in tests.
  const lastPointerDown = useRef(0);
  const ignoreFocusUntil = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  function open() {
    clearTimeout(timer.current);
    const box = item.current?.getBoundingClientRect();
    if (!box) return;
    // Beside the palette if it fits, otherwise on the other side; never off-screen.
    const fitsRight = box.right + 8 + PEEK_WIDTH <= window.innerWidth - 8;
    const left = fitsRight ? box.right + 8 : Math.max(8, box.left - 8 - PEEK_WIDTH);
    const top = Math.max(8, Math.min(box.top, window.innerHeight - 440));
    setPosition({ top, left });
  }
  function close() {
    clearTimeout(timer.current);
    setPosition(null);
  }

  return (
    <li
      ref={item}
      onPointerEnter={() => {
        clearTimeout(timer.current);
        timer.current = setTimeout(open, PEEK_DELAY_MS);
      }}
      onPointerLeave={close}
      onPointerDown={() => {
        lastPointerDown.current = Date.now();
      }}
      onFocus={() => {
        const now = Date.now();
        const fromPointer = now - lastPointerDown.current < 500;
        if (!position && !fromPointer && now > ignoreFocusUntil.current) open();
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(/** @type {Node | null} */ (event.relatedTarget))) close();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape" && position) {
          event.stopPropagation();
          close();
          // Focus goes back to Add to page without reopening the peek.
          ignoreFocusUntil.current = Date.now() + 100;
          addButton.current?.focus();
        }
      }}
    >
      <div
        // Drag the card onto the page, or use its "Add to page" button.
        draggable
        onDragStart={(event) => {
          close();
          event.dataTransfer.effectAllowed = "copy";
          event.dataTransfer.setData("text/plain", manifest.title);
          setDragPreview(event, manifest.title);
          drag.setPayload({ kind: "component", name: manifest.name });
        }}
        onDragEnd={(event) => {
          drag.setPayload(null);
          // dropEffect is "none" when the drag ended anywhere that didn't take
          // it. Say why, and where it would fit (the browser only shows a
          // not-allowed cursor, which doesn't explain anything).
          if (event.dataTransfer?.dropEffect === "none") {
            const message = missedDropMessage(store.getState().tree, { kind: "component", name: manifest.name });
            if (message) store.getState().showHint(message);
          }
        }}
        className="flex cursor-grab items-center justify-between gap-2 rounded-md border border-border bg-card p-3 active:cursor-grabbing"
      >
        <GripVertical aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
        {/* The name gets the room: the button beside it is short, so no
            component's name is cut off (it used to be, at 280px wide). */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate type-small font-medium">{manifest.title}</span>
          <span className="truncate type-small text-muted-foreground">{manifest.category}</span>
        </div>
        <Button
          ref={addButton}
          variant="ghost"
          size="sm"
          // Says "Add" on screen and "Add to page: Button" to assistive tech:
          // the visible word is the start of the name (WCAG 2.5.3), and the
          // rest tells the eighteen buttons apart.
          aria-label={`Add to page: ${manifest.title}`}
          onClick={() => store.getState().insertBlock(manifest.name)}
        >
          <Plus aria-hidden="true" strokeWidth={1.5} />
          Add
        </Button>
      </div>

      {position && (
        <div
          role="group"
          aria-label={`${manifest.title} preview`}
          style={{ top: position.top, left: position.left, width: PEEK_WIDTH }}
          className="fixed z-50 flex flex-col gap-3 rounded-md border border-border bg-card p-4"
        >
          <div className="flex flex-col gap-1">
            <span className="font-semibold">{manifest.title}</span>
            <span className="type-small text-muted-foreground">{manifest.description}</span>
          </div>
          <div className="flex min-h-24 items-center justify-center rounded-md border border-border bg-background p-4">
            <LivePreview name={name} preset={preset} />
          </div>
          <PresetChips name={name} current={preset.name} onChange={setPresetName} />
          <Abilities name={name} />
        </div>
      )}
    </li>
  );
}
