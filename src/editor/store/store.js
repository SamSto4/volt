import { temporal } from "zundo";
import { create } from "zustand";
import { createBlogPage, createExamplePage } from "./example-page.js";
import * as ops from "./tree.js";

// The editor store (ADR 0004): a thin wrapper around the pure functions in
// tree.js. Components never change the tree themselves; they call these
// actions. Each action stores the new tree and the sentence for the live region.

/**
 * @typedef {object} EditorState
 * @property {import("./tree.js").Tree} tree
 * @property {string | null} selectedId
 * @property {string} announcement  the latest message for the polite live region
 * @property {number} announcementId  bumps on every message, so the same sentence twice is still announced
 * @property {(id: string | null) => void} select
 * @property {(template: string, index?: number) => string | null} addSection
 * @property {(component: string, target?: import("./tree.js").Target) => string | null} insertBlock
 * @property {(blockId: string, target: import("./tree.js").Target) => boolean} moveBlock
 * @property {(id: string, delta: -1 | 1) => boolean} moveBy
 * @property {(id: string) => boolean} duplicate
 * @property {(id: string) => boolean} remove
 * @property {(nodeId: string, props: Record<string, unknown>, coalesceKey?: string) => boolean} updateProps
 * @property {(tree: import("./tree.js").Tree) => void} load
 * @property {() => void} startBlank
 * @property {(kind?: "landing" | "blog") => void} loadExample
 * @property {(text: string) => void} announce
 * @property {() => void} beginTransaction
 * @property {() => void} commitTransaction
 * @property {() => void} cancelTransaction
 */

/** Short unique ids for new nodes. */
function newId() {
  return Math.random().toString(36).slice(2, 10);
}

// The example page gets predictable ids ("ex1", "ex2", …) so the server's HTML
// and the browser's first render match. New nodes get random ids, but those
// are only ever made in the browser, in response to a click.
const example = createExamplePage(
  (() => {
    let n = 0;
    return () => `ex${++n}`;
  })(),
);

// Edits to the same field within this window become one undo step.
const COALESCE_MS = 1000;
const HISTORY_LIMIT = 100;

/**
 * Creates an editor store. A factory (not a single global) so every test gets
 * a fresh store with fresh history.
 *
 * @param {{ tree?: import("./tree.js").Tree, selectedId?: string | null, idFactory?: () => string }} [initial]
 */
export function createEditorStore(initial = {}) {
  const makeId = initial.idFactory ?? newId;
  // Per store, so separate stores (and tests) never share typing bursts.
  let lastEdit = { key: "", time: 0 };
  /** @type {import("./tree.js").Tree | null} */
  let transactionStart = null;

  /**
   * Declaring the creator's type up front gives every action below typed
   * parameters (set, get, and each action's arguments).
   *
   * @type {import("zustand").StateCreator<EditorState, [["temporal", unknown]], []>}
   */
  const creator = (set, get) => {
    /** A message for the live region. @param {string} text */
    const announce = (text) => ({ announcement: text, announcementId: get().announcementId + 1 });

    /**
     * Applies one pure operation: store the tree and message, or announce the error.
     * @param {import("./tree.js").Result & { nextSelection?: string | null }} result
     * @param {{ select?: string | null }} [options]
     */
    function apply(result, options = {}) {
      if ("error" in result) {
        set(announce(result.error));
        return false;
      }
      // Who's selected next: an explicit choice, else what the operation
      // suggests (after a removal), else the node it created or moved.
      let selectedId = get().selectedId;
      if ("select" in options) selectedId = options.select ?? null;
      else if (result.nextSelection !== undefined) selectedId = result.nextSelection;
      else if (result.id) selectedId = result.id;
      set({ tree: result.tree, selectedId, ...announce(result.message) });
      return true;
    }

    return {
      tree: initial.tree ?? example.tree,
      selectedId: initial.selectedId === undefined ? (initial.tree ? null : example.heroId) : initial.selectedId,
      announcement: "",
      announcementId: 0,

      select: (id) => set({ selectedId: id }),

      addSection: (template, index) => {
        const result = ops.addSection(get().tree, template, makeId, index);
        return apply(result) && "id" in result ? result.id ?? null : null;
      },

      // Click "Add to page" (DESIGN.md §11): into the selected slot, else after
      // the selected block, else into the first slot on the page that accepts it.
      insertBlock: (component, target) => {
        const { tree, selectedId } = get();
        const destination = target ?? defaultTarget(tree, component, selectedId);
        if (!destination) {
          set(announce(`There's no slot on this page that takes a ${ops.getManifest(component).title}. Add a section that does.`));
          return null;
        }
        const result = ops.insertBlock(tree, component, destination, makeId);
        return apply(result) && "id" in result ? result.id ?? null : null;
      },

      moveBlock: (blockId, target) => apply(ops.moveBlock(get().tree, blockId, target)),

      moveBy: (id, delta) => {
        const { tree } = get();
        return apply(tree.nodes[id]?.kind === "section" ? ops.moveSectionBy(tree, id, delta) : ops.moveBlockBy(tree, id, delta));
      },

      duplicate: (id) => apply(ops.duplicateBlock(get().tree, id, makeId)),

      remove: (id) => {
        const { tree } = get();
        return apply(tree.nodes[id]?.kind === "section" ? ops.removeSection(tree, id) : ops.removeBlock(tree, id));
      },

      updateProps: (nodeId, props, coalesceKey) => {
        const now = Date.now();
        const coalesce = coalesceKey !== undefined && coalesceKey === lastEdit.key && now - lastEdit.time < COALESCE_MS;
        lastEdit = { key: coalesceKey ?? "", time: now };
        // Paused tracking means this change joins the previous history entry.
        const history = store.temporal.getState();
        const wasTracking = history.isTracking;
        if (coalesce && wasTracking) history.pause();
        const ok = apply(ops.updateProps(get().tree, nodeId, props), { select: get().selectedId });
        if (coalesce && wasTracking) history.resume();
        return ok;
      },

      load: (tree) => set({ tree, selectedId: null, ...announce("Page loaded.") }),

      startBlank: () => set({ tree: ops.emptyTree(), selectedId: null, ...announce("Started a blank page.") }),

      loadExample: (kind = "landing") => {
        const fresh = kind === "blog" ? createBlogPage(makeId) : createExamplePage(makeId);
        set({ tree: fresh.tree, selectedId: fresh.heroId, ...announce(`${kind === "blog" ? "Blog post" : "Landing page"} example loaded.`) });
      },

      // For messages that aren't tree changes ("Undone.", "Restored…").
      announce: (text) => set(announce(text)),

      // Drags (ADR 0004): one drag = one undo step, however many moves it
      // makes on the way. History is paused while dragging; on commit, the
      // tree from *before* the drag is pushed as the single undo entry.
      beginTransaction: () => {
        transactionStart = get().tree;
        store.temporal.getState().pause();
      },
      commitTransaction: () => {
        const history = store.temporal.getState();
        history.resume();
        if (transactionStart && transactionStart !== get().tree) {
          store.temporal.setState({
            pastStates: [...history.pastStates, { tree: transactionStart }].slice(-HISTORY_LIMIT),
            futureStates: [],
          });
        }
        transactionStart = null;
      },
      // Escape during a drag: put everything back and record nothing.
      cancelTransaction: () => {
        if (transactionStart) set({ tree: transactionStart, ...announce("Move cancelled.") });
        store.temporal.getState().resume();
        transactionStart = null;
      },
    };
  };

  const store = create(
    temporal(creator, {
      // Only the page is history. Undo shouldn't just move the selection.
      partialize: (state) => ({ tree: state.tree }),
      // Skip snapshots that didn't change the page (selection, messages).
      equality: (past, current) => past.tree === current.tree,
      limit: HISTORY_LIMIT,
    }),
  );
  return store;
}

/**
 * Where a clicked "Add to page" should go.
 *
 * @param {import("./tree.js").Tree} tree
 * @param {string} component
 * @param {string | null} selectedId
 * @returns {import("./tree.js").Target | null}
 */
export function defaultTarget(tree, component, selectedId) {
  // 1. After the selected block, if its slot takes this component.
  if (selectedId) {
    const parent = ops.findParent(tree, selectedId);
    if (parent) {
      const target = { sectionId: parent.sectionId, slot: parent.slot, index: parent.index + 1 };
      if (ops.canPlace(tree, component, target).ok) return target;
    }
  }
  // 2. Into the selected section's first slot that takes it.
  // 3. Otherwise the first slot on the page that takes it.
  const order = selectedId && ops.getSection(tree, selectedId) ? [selectedId, ...tree.sections] : tree.sections;
  for (const sectionId of order) {
    const section = ops.getSection(tree, sectionId);
    if (!section) continue;
    for (const slot of Object.keys(section.slots)) {
      if (ops.canPlace(tree, component, { sectionId, slot }).ok) return { sectionId, slot };
    }
  }
  return null;
}
