"use client";

import { Redo2, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import { PageCanvas } from "./canvas";
import { CodeView } from "./code-view";
import { ComponentsPanel } from "./components-panel";
import { EditorProvider, useEditor, useEditorStore, useHistory } from "./editor-context";
import { Frame } from "./frame";
import { InspectorPanel } from "./inspector-panel";
import { clearSavedTree, loadTree, saveTree } from "./persistence.js";

/** The editor page (DESIGN.md §11): top bar, components, canvas, properties. */
export function Editor() {
  return (
    <EditorProvider>
      <EditorShell />
    </EditorProvider>
  );
}

const WIDTHS = [
  { value: 375, label: "375 px" },
  { value: 768, label: "768 px" },
  { value: 1280, label: "1280 px" },
];

function EditorShell() {
  const store = useEditorStore();
  const history = useHistory();
  const [mode, setMode] = useState(/** @type {"edit" | "try"} */ ("edit"));
  const [view, setView] = useState(/** @type {"canvas" | "code" | "split"} */ ("canvas"));
  const [width, setWidth] = useState(1280);
  const [frameDoc, setFrameDoc] = useState(/** @type {Document | null} */ (null));

  usePersistence();
  useUndoShortcuts(frameDoc);

  const showCanvas = view !== "code";
  const showCode = view !== "canvas";

  return (
    <div className="flex flex-col">
      <LiveRegion />

      <div
        role="toolbar"
        aria-label="Editor"
        className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border px-4 py-3"
      >
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" disabled={!history.canUndo} onClick={() => undo(store)} aria-keyshortcuts="Control+Z Meta+Z">
            <Undo2 aria-hidden="true" strokeWidth={1.5} />
            Undo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!history.canRedo}
            onClick={() => redo(store)}
            aria-keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
          >
            <Redo2 aria-hidden="true" strokeWidth={1.5} />
            Redo
          </Button>
        </div>
        <SegmentedControl
          label="Mode"
          hideLabel
          options={[
            { value: "edit", label: "Edit" },
            { value: "try", label: "Try it" },
          ]}
          value={mode}
          onChange={setMode}
        />
        <SegmentedControl
          label="View"
          hideLabel
          options={[
            { value: "canvas", label: "Canvas" },
            { value: "code", label: "Code" },
            { value: "split", label: "Split" },
          ]}
          value={view}
          onChange={setView}
        />
        <SegmentedControl label="Canvas width" hideLabel options={WIDTHS} value={width} onChange={setWidth} />
      </div>

      <p className="border-b border-border px-4 py-2 type-small text-muted-foreground sm:hidden">
        Best on a larger screen. Everything still works: use “Add to page” and the action buttons.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-[17.5rem_minmax(0,1fr)_20rem]">
        <aside
          aria-label="Components and layers"
          className="order-2 border-t border-border p-4 lg:order-1 lg:h-[calc(100dvh-7.5rem)] lg:overflow-y-auto lg:border-t-0 lg:border-r"
        >
          <ComponentsPanel />
          <PageReset />
        </aside>

        <div
          className={`order-1 grid min-h-[32rem] gap-4 p-4 lg:order-2 lg:h-[calc(100dvh-7.5rem)] ${
            view === "split" ? "xl:grid-cols-2" : ""
          }`}
        >
          {showCanvas && (
            <ScaledFrame width={width}>
              <Frame title={mode === "edit" ? "Page canvas (editing)" : "Page canvas (try it)"} width={width} onDocument={setFrameDoc}>
                <PageCanvas mode={mode} />
              </Frame>
            </ScaledFrame>
          )}
          {showCode && <CodeView />}
        </div>

        <aside
          aria-label="Properties"
          className="order-3 border-t border-border p-4 lg:h-[calc(100dvh-7.5rem)] lg:overflow-y-auto lg:border-t-0 lg:border-l"
        >
          <InspectorPanel />
        </aside>
      </div>
    </div>
  );
}

/**
 * Fits a fixed-width frame into the space available by scaling it down, so a
 * 1280px page can be seen whole on a laptop. Media queries inside still see
 * the full chosen width.
 *
 * @param {{ width: number, children: import("react").ReactNode }} props
 */
function ScaledFrame({ width, children }) {
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [available, setAvailable] = useState({ width, height: 640 });

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setAvailable({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const scale = Math.min(1, available.width / width);
  return (
    <div ref={ref} className="relative min-h-[32rem] min-w-0 overflow-hidden">
      {/* Scaling shrinks how it looks, not how much room it takes, so the
          frame is made taller by the same factor to still fill the space. */}
      <div
        style={{ width, height: available.height / scale, transform: `scale(${scale})`, transformOrigin: "top left" }}
        className="absolute top-0 left-0"
      >
        {children}
      </div>
    </div>
  );
}

/** The one polite live region for editor announcements (DESIGN.md §13). */
function LiveRegion() {
  const announcement = useEditor((state) => state.announcement);
  const id = useEditor((state) => state.announcementId);
  // Screen readers skip a region whose text didn't change. Alternating a
  // trailing non-breaking space makes the same sentence count as new.
  return (
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
      {id % 2 === 1 ? " " : ""}
    </div>
  );
}

/** "Reset to example" and "Start blank": both undoable. */
function PageReset() {
  const store = useEditorStore();
  return (
    <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
      <h2 className="type-label text-muted-foreground">Page</h2>
      <p className="type-small text-muted-foreground">Your page is saved in this browser as you work.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => store.getState().loadExample()}>
          Load the example
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            store.getState().startBlank();
            clearSavedTree();
          }}
        >
          Start blank
        </Button>
      </div>
    </div>
  );
}

/** Restores the saved page once, then saves after every change. */
function usePersistence() {
  const store = useEditorStore();
  useEffect(() => {
    const saved = loadTree();
    if (saved) {
      store.getState().load(saved);
      // A restored page starts with a clean history.
      store.temporal.getState().clear();
      store.getState().announce("Restored your page from this browser.");
    }
    return store.subscribe((state, previous) => {
      if (state.tree !== previous.tree) saveTree(state.tree);
    });
  }, [store]);
}

/**
 * Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z (or Ctrl+Y), in the editor and inside the
 * canvas frame. Left alone in text fields, where they undo typing.
 *
 * @param {Document | null} frameDoc
 */
function useUndoShortcuts(frameDoc) {
  const store = useEditorStore();

  useEffect(() => {
    /** @param {KeyboardEvent} event */
    function onKeyDown(event) {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      const target = /** @type {HTMLElement | null} */ (event.target);
      if (target?.closest?.("input, textarea, select, [contenteditable]")) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo(store);
      } else if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        redo(store);
      }
    }
    const targets = [document, frameDoc].filter((doc) => doc !== null);
    targets.forEach((doc) => doc.addEventListener("keydown", onKeyDown));
    return () => targets.forEach((doc) => doc.removeEventListener("keydown", onKeyDown));
  }, [store, frameDoc]);
}

/**
 * Reads the history at the moment of the action, so it's never stale.
 * @param {import("./editor-context").EditorStore} store
 */
function undo(store) {
  const history = store.temporal.getState();
  if (history.pastStates.length === 0) return;
  history.undo();
  store.getState().announce("Undone.");
}

/** @param {import("./editor-context").EditorStore} store */
function redo(store) {
  const history = store.temporal.getState();
  if (history.futureStates.length === 0) return;
  history.redo();
  store.getState().announce("Redone.");
}
