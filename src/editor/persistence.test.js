// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { createExamplePage } from "./store/example-page.js";
import { loadTree, saveTree } from "./persistence.js";
import { parseTree } from "./store/tree.js";

function counter() {
  let n = 0;
  return () => `n${++n}`;
}

afterEach(() => localStorage.clear());

describe("persistence", () => {
  it("saves and restores a page", () => {
    const { tree } = createExamplePage(counter());
    expect(saveTree(tree)).toBe(true);
    expect(loadTree()).toEqual(tree);
  });

  it("ignores missing, unreadable or wrong-version data", () => {
    expect(loadTree()).toBeNull();
    localStorage.setItem("volt:editor:v1", "{not json");
    expect(loadTree()).toBeNull();
    localStorage.setItem("volt:editor:v1", JSON.stringify({ version: 2, tree: {} }));
    expect(loadTree()).toBeNull();
  });
});

describe("parseTree (untrusted input)", () => {
  const { tree } = createExamplePage(counter());

  it("accepts a sound tree", () => {
    expect(parseTree(structuredClone(tree))).toEqual(tree);
  });

  it.each([
    ["an unknown component", (/** @type {any} */ t) => (Object.values(t.nodes).find((n) => n.kind === "block").component = "script")],
    ["invalid props", (/** @type {any} */ t) => (t.nodes[t.sections[0]].props.headline = "")],
    ["an orphaned node", (/** @type {any} */ t) => (t.nodes.stray = { id: "stray", kind: "block", component: "badge", props: {} })],
    ["an id that doesn't match its key", (/** @type {any} */ t) => (t.nodes[t.sections[0]].id = "other")],
    ["an extra field", (/** @type {any} */ t) => (t.nodes[t.sections[0]].onclick = "alert(1)")],
    ["a block in a slot that doesn't take it", (/** @type {any} */ t) => {
      const hero = t.nodes[t.sections[0]];
      const card = Object.values(t.nodes).find((n) => n.component === "card");
      const features = t.nodes[t.sections[1]];
      features.slots.items = features.slots.items.filter((/** @type {string} */ id) => id !== card.id);
      hero.slots.actions.push(card.id);
    }],
  ])("rejects %s", (_, breakIt) => {
    const broken = structuredClone(tree);
    breakIt(broken);
    expect(parseTree(broken)).toBeNull();
  });
});
