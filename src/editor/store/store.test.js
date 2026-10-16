import { describe, expect, it, vi } from "vitest";
import { createEditorStore, defaultTarget } from "./store.js";
import { createExamplePage } from "./example-page.js";
import * as ops from "./tree.js";

function counter() {
  let n = 0;
  return () => `n${++n}`;
}

function setup() {
  const idFactory = counter();
  const { tree, heroId } = createExamplePage(idFactory);
  const store = createEditorStore({ tree, selectedId: heroId, idFactory });
  return { store, heroId, history: () => store.temporal.getState() };
}

describe("editor store", () => {
  it("opens the example page with the hero selected", () => {
    const store = createEditorStore();
    const { tree, selectedId } = store.getState();
    expect(ops.getSection(tree, /** @type {string} */ (selectedId))?.template).toBe("hero");
  });

  it("insert selects the new block and announces it", () => {
    const { store } = setup();
    const id = store.getState().insertBlock("badge");
    expect(store.getState().selectedId).toBe(id);
    expect(store.getState().announcement).toBe("Badge added to Hero · Above the headline, position 2 of 2.");
  });

  it("a refused action changes nothing and announces why", () => {
    const { store } = setup();
    const before = store.getState().tree;
    const faq = before.sections[2];
    store.getState().insertBlock("accordion", { sectionId: faq, slot: "content" });
    store.getState().insertBlock("accordion", { sectionId: faq, slot: "content" });
    const full = store.getState().tree;
    expect(store.getState().insertBlock("accordion", { sectionId: faq, slot: "content" })).toBeNull();
    expect(store.getState().tree).toBe(full);
    expect(store.getState().announcement).toBe("FAQ · Content is full (2 at most).");
  });

  it("undo and redo restore the page exactly, without touching selection", () => {
    const { store, history } = setup();
    const before = store.getState().tree;
    const id = /** @type {string} */ (store.getState().insertBlock("button"));
    const after = store.getState().tree;

    history().undo();
    expect(store.getState().tree).toEqual(before);
    expect(store.getState().selectedId).toBe(id); // selection isn't history
    history().redo();
    expect(store.getState().tree).toEqual(after);
  });

  it("selecting or announcing doesn't create history entries", () => {
    const { store, history } = setup();
    store.getState().select(store.getState().tree.sections[1]);
    store.getState().select(null);
    expect(history().pastStates).toHaveLength(0);
  });

  it("typing in one field is a single undo step", () => {
    vi.useFakeTimers();
    const { store, history, heroId } = setup();
    const original = ops.getSection(store.getState().tree, heroId)?.props.headline;
    for (const headline of ["H", "He", "Hel", "Hello"]) {
      store.getState().updateProps(heroId, { headline }, `${heroId}:headline`);
      vi.advanceTimersByTime(200);
    }
    expect(history().pastStates).toHaveLength(1);
    history().undo();
    expect(ops.getSection(store.getState().tree, heroId)?.props.headline).toBe(original);
    vi.useRealTimers();
  });

  it("edits to the same field after a pause are separate undo steps", () => {
    vi.useFakeTimers();
    const { store, history, heroId } = setup();
    store.getState().updateProps(heroId, { headline: "One" }, `${heroId}:headline`);
    vi.advanceTimersByTime(1500);
    store.getState().updateProps(heroId, { headline: "Two" }, `${heroId}:headline`);
    expect(history().pastStates).toHaveLength(2);
    vi.useRealTimers();
  });

  it("a transaction (one drag) is one undo step, however many moves it makes", () => {
    const { store, history } = setup();
    const features = store.getState().tree.sections[1];
    const before = store.getState().tree;
    const [card] = /** @type {import("./tree.js").SectionNode} */ (before.nodes[features]).slots.items;

    store.getState().beginTransaction();
    store.getState().moveBlock(card, { sectionId: features, slot: "items", index: 1 });
    store.getState().moveBlock(card, { sectionId: features, slot: "items", index: 2 });
    store.getState().commitTransaction();

    expect(history().pastStates).toHaveLength(1);
    history().undo();
    // Undo goes back to before the drag, not to a point halfway through it.
    expect(store.getState().tree).toBe(before);
    history().redo();
    const items = /** @type {import("./tree.js").SectionNode} */ (store.getState().tree.nodes[features]).slots.items;
    expect(items[2]).toBe(card);
  });

  it("a cancelled transaction restores the page and records nothing", () => {
    const { store, history } = setup();
    const features = store.getState().tree.sections[1];
    const before = store.getState().tree;
    const [card] = /** @type {import("./tree.js").SectionNode} */ (before.nodes[features]).slots.items;

    store.getState().beginTransaction();
    store.getState().moveBlock(card, { sectionId: features, slot: "items", index: 2 });
    store.getState().cancelTransaction();

    expect(store.getState().tree).toBe(before);
    expect(history().pastStates).toHaveLength(0);
    expect(store.getState().announcement).toBe("Move cancelled.");
  });

  it("a transaction that changes nothing records nothing", () => {
    const { store, history } = setup();
    store.getState().beginTransaction();
    store.getState().commitTransaction();
    expect(history().pastStates).toHaveLength(0);
  });

  it("moveBy and remove work on both blocks and sections", () => {
    const { store, heroId } = setup();
    expect(store.getState().moveBy(heroId, 1)).toBe(true);
    expect(store.getState().tree.sections[1]).toBe(heroId);
    expect(store.getState().remove(heroId)).toBe(true);
    expect(store.getState().tree.sections).not.toContain(heroId);
    expect(ops.treeProblems(store.getState().tree)).toEqual([]);
  });
});

describe("defaultTarget (click 'Add to page')", () => {
  it("goes after the selected block when its slot accepts the component", () => {
    const { tree } = createExamplePage(counter());
    const hero = /** @type {import("./tree.js").SectionNode} */ (tree.nodes[tree.sections[0]]);
    const [firstButton] = hero.slots.actions;
    expect(defaultTarget(tree, "button", firstButton)).toEqual({ sectionId: hero.id, slot: "actions", index: 1 });
  });

  it("goes into the selected section's first slot that takes it", () => {
    const { tree } = createExamplePage(counter());
    const signup = tree.sections[3];
    expect(defaultTarget(tree, "button", signup)).toEqual({ sectionId: signup, slot: "actions" });
  });

  it("otherwise uses the first slot on the page that takes it, or null", () => {
    const { tree } = createExamplePage(counter());
    expect(defaultTarget(tree, "input", null)).toEqual({ sectionId: tree.sections[3], slot: "fields" });
    expect(defaultTarget(ops.emptyTree(), "button", null)).toBeNull();
  });
});
