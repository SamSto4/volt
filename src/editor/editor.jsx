"use client";

import { ChevronRight, Command as CommandIcon, Download, PanelLeft, PanelRight, Redo2, Undo2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { SegmentedControl } from "@/components/segmented-control";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { generatePageCode } from "@/lib/codegen";
import { manifests } from "@/registry";
import { sections } from "@/registry/sections";
import { describeBlock, PageCanvas } from "./canvas";
import { CanvasErrorBoundary } from "./canvas-error-boundary";
import { CommandPalette } from "./command-palette";
import { CodeView } from "./code-view";
import { ComponentsPanel } from "./components-panel";
import { EditorProvider, useEditor, useEditorStore, useHistory } from "./editor-context";
import { Frame } from "./frame";
import { InspectorPanel } from "./inspector-panel";
import { download } from "./download.js";
import { clearSavedTree, loadTree, saveTree } from "./persistence.js";
import { UndoToast } from "./undo-toast";
import { findParent, getManifest, getSectionTemplate, slotLabel } from "./store/tree.js";

/** The editor page (DESIGN.md §11): top bar, components, canvas, properties. */
export function Editor() {
  return (
    <EditorProvider>
      <EditorShell />
    </EditorProvider>
  );
}

const WIDTHS = [
  { value: 375, label: "375" },
  { value: 768, label: "768" },
  { value: 1280, label: "1280" },
];

function EditorShell() {
  const store = useEditorStore();
  const history = useHistory();
  const [mode, setMode] = useState(/** @type {"edit" | "try"} */ ("edit"));
  const [view, setView] = useState(/** @type {"preview" | "code" | "split"} */ ("preview"));
  const [width, setWidth] = useState(1280);
  const [showComponents, setShowComponents] = useState(true);
  const [showProperties, setShowProperties] = useState(true);
  const [frameDoc, setFrameDoc] = useState(/** @type {Document | null} */ (null));
  const [paletteOpen, setPaletteOpen] = useState(false);
  const tree = useEditor((state) => state.tree);
  const selectedId = useEditor((state) => state.selectedId);

  usePersistence();
  useUndoShortcuts(frameDoc, () => setPaletteOpen(true));

  const commands = editorCommands({
    store,
    tree,
    selectedId,
    setView,
    setMode,
    setWidth,
    showComponents,
    setShowComponents,
    showProperties,
    setShowProperties,
  });

  const showCanvas = view !== "code";
  const showCode = view !== "preview";

  return (
    // A full-screen app (DESIGN.md §11): one 56px top bar, then the panels.
    <div className="flex h-dvh flex-col bg-background">
      <LiveRegion />
      <UndoToast onUndo={() => undo(store)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} commands={commands} />

      <header className="flex h-14 shrink-0 items-center gap-4 overflow-x-auto border-b border-border px-4">
        <Link href="/" className="shrink-0 rounded-sm font-display text-xl font-bold">
          Volt
        </Link>
        <span aria-hidden="true" className="h-6 w-px shrink-0 bg-border" />
        <div role="group" aria-label="History" className="flex shrink-0 gap-1">
          <IconButton label="Undo" disabled={!history.canUndo} onClick={() => undo(store)} keyshortcuts="Control+Z Meta+Z">
            <Undo2 aria-hidden="true" strokeWidth={1.5} />
          </IconButton>
          <IconButton
            label="Redo"
            disabled={!history.canRedo}
            onClick={() => redo(store)}
            keyshortcuts="Control+Shift+Z Meta+Shift+Z Control+Y"
          >
            <Redo2 aria-hidden="true" strokeWidth={1.5} />
          </IconButton>
        </div>
        <SegmentedControl
          label="Mode"
          hideLabel
          className="shrink-0"
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
          className="shrink-0"
          options={[
            { value: "preview", label: "Preview" },
            { value: "code", label: "Code" },
            { value: "split", label: "Split" },
          ]}
          value={view}
          onChange={setView}
        />
        <SegmentedControl label="Canvas width in pixels" hideLabel className="shrink-0" options={WIDTHS} value={width} onChange={setWidth} />

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <IconButton label="Commands" keyshortcuts="Control+K Meta+K" onClick={() => setPaletteOpen(true)}>
            <CommandIcon aria-hidden="true" strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Components panel" pressed={showComponents} onClick={() => setShowComponents(!showComponents)}>
            <PanelLeft aria-hidden="true" strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Properties panel" pressed={showProperties} onClick={() => setShowProperties(!showProperties)}>
            <PanelRight aria-hidden="true" strokeWidth={1.5} />
          </IconButton>
          <ThemeToggle />
          <ExportMenu />
        </div>
      </header>

      <p className="border-b border-border px-4 py-2 type-small text-muted-foreground sm:hidden">
        Best on a larger screen. Everything still works: use “Add to page” and the action buttons.
      </p>

      {/* Below 1024px the panels stack under the canvas and the page scrolls. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        {showComponents && (
          <aside
            aria-label="Components and layers"
            className="order-2 shrink-0 border-t border-border p-4 lg:order-1 lg:w-70 lg:overflow-y-auto lg:border-t-0 lg:border-r"
          >
            <ComponentsPanel />
            <PageReset />
          </aside>
        )}

        <div className="order-1 flex min-h-[32rem] min-w-0 flex-col gap-3 p-4 lg:order-2 lg:min-h-0 lg:flex-1">
          <SelectionBreadcrumb />
          <div className={`grid min-h-0 flex-1 gap-4 ${view === "split" ? "xl:grid-cols-2" : ""}`}>
            {showCanvas && (
              <ScaledFrame width={width}>
                <Frame title={mode === "edit" ? "Page canvas (editing)" : "Page canvas (try it)"} width={width} onDocument={setFrameDoc}>
                  <SafeCanvas mode={mode} />
                </Frame>
              </ScaledFrame>
            )}
            {showCode && <CodeView />}
          </div>
        </div>

        {showProperties && (
          <aside
            aria-label="Properties"
            className="order-3 shrink-0 border-t border-border p-4 lg:w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l"
          >
            <InspectorPanel />
          </aside>
        )}
      </div>
    </div>
  );
}

/**
 * A ghost icon-only button with a tooltip that is also its accessible name
 * (DESIGN.md §8: icon-only buttons need a label and a tooltip). Keyboard
 * shortcuts go in aria-keyshortcuts, which screen readers announce properly,
 * rather than in the name, where "⌘Z" would be read out symbol by symbol.
 *
 * @param {{
 *   label: string,
 *   keyshortcuts?: string,
 *   pressed?: boolean,
 *   disabled?: boolean,
 *   onClick: () => void,
 *   children: import("react").ReactNode,
 * }} props
 */
function IconButton({ label, keyshortcuts, pressed, disabled, onClick, children }) {
  return (
    <Tooltip content={label} kind="label" side="bottom">
      <Button
        variant="ghost"
        size="sm"
        className="w-8 px-0 aria-pressed:bg-accent"
        disabled={disabled}
        aria-pressed={pressed}
        aria-keyshortcuts={keyshortcuts}
        onClick={onClick}
      >
        {children}
      </Button>
    </Tooltip>
  );
}

/**
 * Where the selection sits: Page › Hero › Actions › Button (DESIGN.md §11).
 * Each level above the selection is a button that selects it.
 */
function SelectionBreadcrumb() {
  const tree = useEditor((state) => state.tree);
  const selectedId = useEditor((state) => state.selectedId);
  const select = useEditor((state) => state.select);
  const node = selectedId ? tree.nodes[selectedId] : undefined;
  const parent = node?.kind === "block" && selectedId ? findParent(tree, selectedId) : null;
  const sectionId = node?.kind === "section" ? selectedId : parent?.sectionId;
  const section = sectionId ? tree.nodes[sectionId] : undefined;
  const crumb = "rounded-sm type-small text-muted-foreground hover:text-foreground";

  return (
    <nav aria-label="Selection" className="shrink-0">
      <ol className="flex flex-wrap items-center gap-1 type-small">
        <li>
          {node ? (
            <button type="button" className={crumb} onClick={() => select(null)}>
              Page
            </button>
          ) : (
            <span aria-current="true" className="font-medium">
              Page
            </span>
          )}
        </li>
        {section?.kind === "section" && sectionId && (
          <li className="flex items-center gap-1">
            <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="text-muted-foreground" />
            {node?.kind === "block" ? (
              <button type="button" className={crumb} onClick={() => select(sectionId)}>
                {getSectionTemplate(section.template).title}
              </button>
            ) : (
              <span aria-current="true" className="font-medium">
                {getSectionTemplate(section.template).title}
              </span>
            )}
          </li>
        )}
        {node?.kind === "block" && parent && (
          <>
            <li className="flex items-center gap-1 text-muted-foreground">
              <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} />
              {slotLabel(tree, parent.sectionId, parent.slot).split(" · ")[1]}
            </li>
            <li className="flex items-center gap-1">
              <ChevronRight aria-hidden="true" size={16} strokeWidth={1.5} className="text-muted-foreground" />
              <span aria-current="true" className="font-medium">
                {getManifest(node.component).title}
              </span>
            </li>
          </>
        )}
      </ol>
    </nav>
  );
}

/**
 * Export (the editor's one primary action): copy the page's code or download
 * it. A disclosure, not an ARIA menu: two ordinary buttons don't need menu
 * keyboard handling, and Tab reaches both.
 */
function ExportMenu() {
  const tree = useEditor((state) => state.tree);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  const code = useMemo(() => (open ? generatePageCode(tree, { manifests, sections }).module : ""), [open, tree]);

  // Close on a click outside, like other popovers.
  useEffect(() => {
    if (!open) return;
    /** @param {PointerEvent} event */
    const onPointerDown = (event) => {
      if (!ref.current?.contains(/** @type {Node} */ (event.target))) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          event.stopPropagation();
          setOpen(false);
        }
      }}
    >
      <Button size="sm" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen(!open)}>
        <Download aria-hidden="true" strokeWidth={1.5} />
        Export
      </Button>
      <div
        id={panelId}
        hidden={!open}
        className="absolute top-full right-0 z-50 mt-2 flex w-64 flex-col gap-3 rounded-md border border-border bg-card p-4"
      >
        <p className="type-small text-muted-foreground">The whole page as one React component file.</p>
        <CopyButton text={code} label="Copy page code" />
        <Button variant="secondary" size="sm" onClick={() => download("Page.jsx", code)}>
          <Download aria-hidden="true" strokeWidth={1.5} />
          Download Page.jsx
        </Button>
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

/**
 * The canvas inside an error boundary: if a block fails to render, the
 * editor keeps working and offers a way back.
 *
 * @param {{ mode: "edit" | "try" }} props
 */
function SafeCanvas({ mode }) {
  const store = useEditorStore();
  const tree = useEditor((state) => state.tree);
  return (
    <CanvasErrorBoundary
      resetKey={tree}
      fallback={() => (
        <div role="alert" className="flex flex-col items-start gap-4 p-10">
          <p className="type-heading-2">This page couldn&apos;t be shown.</p>
          <p className="max-w-prose text-muted-foreground">
            Something in the last change stopped it from rendering. Your page is still here: undo the change, or load
            the example to start again.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => undo(store)}>
              Undo the last change
            </Button>
            <Button variant="ghost" size="sm" onClick={() => store.getState().loadExample()}>
              Load the example
            </Button>
          </div>
        </div>
      )}
    >
      <PageCanvas mode={mode} />
    </CanvasErrorBoundary>
  );
}

/** The one polite live region for editor announcements (DESIGN.md §13). */
function LiveRegion() {
  const announcement = useEditor((state) => state.announcement);
  const id = useEditor((state) => state.announcementId);
  // Screen readers skip a region whose text didn't change. Alternating a
  // trailing non-breaking space makes the same sentence count as new.
  return (
    <div role="status" aria-live="polite" aria-label="Editor announcements" className="sr-only">
      {announcement}
      {id % 2 === 1 ? " " : ""}
    </div>
  );
}

/** Load an example, or start blank: all undoable. */
function PageReset() {
  const store = useEditorStore();
  return (
    <div className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
      <h2 className="type-label text-muted-foreground">Page</h2>
      <p className="type-small text-muted-foreground">Your page is saved in this browser as you work.</p>
      <div className="flex flex-wrap gap-2">
        <Button variant="ghost" size="sm" onClick={() => store.getState().loadExample("landing")}>
          Landing page example
        </Button>
        <Button variant="ghost" size="sm" onClick={() => store.getState().loadExample("blog")}>
          Blog post example
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
 * Editor shortcuts, in the editor and inside the canvas frame:
 * Cmd/Ctrl+K opens the command palette (anywhere, even in a text field);
 * Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z (or Ctrl+Y) undo and redo, except in text
 * fields, where they undo typing.
 *
 * @param {Document | null} frameDoc
 * @param {() => void} openPalette
 */
function useUndoShortcuts(frameDoc, openPalette) {
  const store = useEditorStore();

  useEffect(() => {
    /** @param {KeyboardEvent} event */
    function onKeyDown(event) {
      const mod = event.metaKey || event.ctrlKey;
      if (!mod) return;
      if (event.key.toLowerCase() === "k") {
        event.preventDefault();
        openPalette();
        return;
      }
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
    // openPalette only sets state; a new function each render shouldn't re-attach listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

/**
 * Every command the palette offers, built from the registries and the page,
 * so new components, sections and blocks appear without extra code.
 *
 * @param {{
 *   store: import("./editor-context").EditorStore,
 *   tree: import("./store/tree.js").Tree,
 *   selectedId: string | null,
 *   setView: (view: "preview" | "code" | "split") => void,
 *   setMode: (mode: "edit" | "try") => void,
 *   setWidth: (width: number) => void,
 *   showComponents: boolean,
 *   setShowComponents: (show: boolean) => void,
 *   showProperties: boolean,
 *   setShowProperties: (show: boolean) => void,
 * }} context
 * @returns {import("./commands.js").Command[]}
 */
function editorCommands({ store, tree, selectedId, setView, setMode, setWidth, showComponents, setShowComponents, showProperties, setShowProperties }) {
  const actions = store.getState();
  const selected = selectedId ? tree.nodes[selectedId] : undefined;

  /** @type {import("./commands.js").Command[]} */
  const commands = [
    ...manifests.map((manifest) => ({
      id: `add:${manifest.name}`,
      title: `Add ${manifest.title} to page`,
      group: "Components",
      run: () => actions.insertBlock(manifest.name),
    })),
    ...sections.map((template) => ({
      id: `section:${template.name}`,
      title: `Add ${template.title} section`,
      group: "Sections",
      run: () => actions.addSection(template.name),
    })),
    { id: "undo", title: "Undo", group: "History", shortcut: "⌘Z", run: () => undo(store) },
    { id: "redo", title: "Redo", group: "History", shortcut: "⇧⌘Z", run: () => redo(store) },
    { id: "view:preview", title: "Show the preview", group: "View", run: () => setView("preview") },
    { id: "view:code", title: "Show the code", group: "View", run: () => setView("code") },
    { id: "view:split", title: "Show preview and code side by side", group: "View", keywords: ["split"], run: () => setView("split") },
    { id: "mode:edit", title: "Edit the page", group: "Mode", run: () => setMode("edit") },
    { id: "mode:try", title: "Try the page", group: "Mode", keywords: ["interact", "use"], run: () => setMode("try") },
    { id: "width:375", title: "Canvas width 375", group: "View", keywords: ["phone", "mobile"], run: () => setWidth(375) },
    { id: "width:768", title: "Canvas width 768", group: "View", keywords: ["tablet"], run: () => setWidth(768) },
    { id: "width:1280", title: "Canvas width 1280", group: "View", keywords: ["desktop"], run: () => setWidth(1280) },
    {
      id: "panel:components",
      title: `${showComponents ? "Hide" : "Show"} the components panel`,
      group: "Panels",
      run: () => setShowComponents(!showComponents),
    },
    {
      id: "panel:properties",
      title: `${showProperties ? "Hide" : "Show"} the properties panel`,
      group: "Panels",
      run: () => setShowProperties(!showProperties),
    },
    { id: "page:landing", title: "Load the landing page example", group: "Page", run: () => actions.loadExample("landing") },
    { id: "page:blog", title: "Load the blog post example", group: "Page", run: () => actions.loadExample("blog") },
    { id: "page:blank", title: "Start a blank page", group: "Page", keywords: ["new", "empty", "clear"], run: () => actions.startBlank() },
  ];

  if (selected && selectedId) {
    const name = selected.kind === "block" ? getManifest(selected.component).title : getSectionTemplate(selected.template).title;
    commands.unshift(
      { id: "selected:delete", title: `Delete the selected ${name}`, group: "Selection", run: () => actions.remove(selectedId) },
      ...(selected.kind === "block"
        ? [{ id: "selected:duplicate", title: `Duplicate the selected ${name}`, group: "Selection", run: () => actions.duplicate(selectedId) }]
        : []),
    );
  }

  // Jump to any layer: every section and block on the page.
  for (const sectionId of tree.sections) {
    const section = tree.nodes[sectionId];
    if (!section || section.kind !== "section") continue;
    const sectionTitle = getSectionTemplate(section.template).title;
    commands.push({ id: `go:${sectionId}`, title: `Go to the ${sectionTitle} section`, group: "Layers", run: () => actions.select(sectionId) });
    for (const blockId of Object.values(section.slots).flat()) {
      const block = tree.nodes[blockId];
      if (!block || block.kind !== "block") continue;
      const summary = describeBlock(block.props);
      commands.push({
        id: `go:${blockId}`,
        title: `Go to ${getManifest(block.component).title}${summary ? ` · ${summary}` : ""}`,
        group: `Layers · ${sectionTitle}`,
        run: () => actions.select(blockId),
      });
    }
  }
  return commands;
}
