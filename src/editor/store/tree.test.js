import { describe, expect, it } from "vitest";
import { buildTemplate, createBlogPage, createExamplePage, TEMPLATES } from "./example-page.js";
import * as ops from "./tree.js";

/** Predictable ids ("n1", "n2", …) so tests can name nodes. */
function counter() {
  let n = 0;
  return () => `n${++n}`;
}

/**
 * Unwraps a successful result, or fails the test with its error.
 * @param {import("./tree.js").Result} result
 */
function ok(result) {
  if ("error" in result) throw new Error(`Expected success, got: ${result.error}`);
  return result;
}

/** A page with a hero (empty) and a features section, plus their ids. */
function setup() {
  const newId = counter();
  const hero = ok(ops.addSection(ops.emptyTree(), "hero", newId));
  const features = ok(ops.addSection(hero.tree, "features", newId));
  return { tree: features.tree, hero: /** @type {string} */ (hero.id), features: /** @type {string} */ (features.id), newId };
}

/**
 * Deep-freezes a tree, so any operation that tries to mutate it throws.
 * @template T @param {T} value @returns {T}
 */
function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

describe("the example page", () => {
  it("is a sound tree with four sections", () => {
    const { tree } = createExamplePage(counter());
    expect(ops.treeProblems(tree)).toEqual([]);
    expect(tree.sections.map((id) => ops.getSection(tree, id)?.template)).toEqual(["hero", "features", "faq", "signup"]);
  });
});

describe("templates", () => {
  it.each(Object.keys(TEMPLATES))("the %s template builds a sound tree", (name) => {
    const { tree, firstSectionId } = buildTemplate(/** @type {any} */ (name), counter());
    expect(ops.treeProblems(tree)).toEqual([]);
    expect(tree.sections[0]).toBe(firstSectionId);
  });

  it("applies section props from the template (the contact page's hero)", () => {
    const { tree, firstSectionId } = buildTemplate("contact", counter());
    expect(ops.getSection(tree, firstSectionId)?.props.headline).toBe("Get in touch");
  });
});

describe("the blog example", () => {
  it("is a sound tree: article, callout and sign-up", () => {
    const { tree } = createBlogPage(counter());
    expect(ops.treeProblems(tree)).toEqual([]);
    expect(tree.sections.map((id) => ops.getSection(tree, id)?.template)).toEqual(["article", "callout", "signup"]);
  });
});

describe("insertBlock", () => {
  it("adds a block with the manifest's defaults and says where it went", () => {
    const { tree, hero, newId } = setup();
    const result = ok(ops.insertBlock(freeze(tree), "button", { sectionId: hero, slot: "actions" }, newId));
    const block = ops.getBlock(result.tree, /** @type {string} */ (result.id));
    expect(block?.props).toMatchObject({ label: "Get started", variant: "primary" });
    expect(result.message).toBe("Button added to Hero · Actions, position 1 of 1.");
    expect(ops.treeProblems(result.tree)).toEqual([]);
  });

  it("inserts at the given index", () => {
    const { tree, hero, newId } = setup();
    const first = ok(ops.insertBlock(tree, "button", { sectionId: hero, slot: "actions" }, newId));
    const second = ok(ops.insertBlock(first.tree, "button", { sectionId: hero, slot: "actions", index: 0 }, newId));
    expect(ops.getSection(second.tree, hero)?.slots.actions).toEqual([second.id, first.id]);
    expect(second.message).toContain("position 1 of 2");
  });

  it("refuses a component the slot doesn't accept, and says why", () => {
    const { tree, hero, newId } = setup();
    expect(ops.insertBlock(tree, "card", { sectionId: hero, slot: "actions" }, newId)).toEqual({
      error: "Card doesn't fit in Hero · Actions.",
    });
  });

  it("refuses when the slot is full", () => {
    let { tree, hero, newId } = setup();
    for (let i = 0; i < 3; i++) tree = ok(ops.insertBlock(tree, "button", { sectionId: hero, slot: "actions" }, newId)).tree;
    expect(ops.insertBlock(tree, "button", { sectionId: hero, slot: "actions" }, newId)).toEqual({
      error: "Hero · Actions is full (3 at most).",
    });
  });
});

describe("moveBlock", () => {
  /** Features with three cards: a, b, c. */
  function withCards() {
    const base = setup();
    let { tree } = base;
    /** @type {string[]} */
    const ids = [];
    for (const title of ["a", "b", "c"]) {
      const result = ok(ops.insertBlock(tree, "card", { sectionId: base.features, slot: "items" }, base.newId, { title }));
      tree = result.tree;
      ids.push(/** @type {string} */ (result.id));
    }
    return { ...base, tree, ids };
  }

  it("reorders within a slot; index is the final position", () => {
    const { tree, features, ids } = withCards();
    const result = ok(ops.moveBlock(freeze(tree), ids[0], { sectionId: features, slot: "items", index: 2 }));
    expect(ops.getSection(result.tree, features)?.slots.items).toEqual([ids[1], ids[2], ids[0]]);
    expect(result.message).toBe("Card moved to Features · Items, position 3 of 3.");
    expect(ops.treeProblems(result.tree)).toEqual([]);
  });

  it("moves between sections when the target accepts the block", () => {
    const base = setup();
    const withBadge = ok(ops.insertBlock(base.tree, "badge", { sectionId: base.hero, slot: "eyebrow" }, base.newId));
    const faq = ok(ops.addSection(withBadge.tree, "faq", base.newId));
    const card = ok(ops.insertBlock(faq.tree, "card", { sectionId: base.features, slot: "items" }, base.newId));
    const moved = ok(ops.moveBlock(card.tree, /** @type {string} */ (card.id), { sectionId: /** @type {string} */ (faq.id), slot: "content" }));
    expect(ops.findParent(moved.tree, /** @type {string} */ (card.id))).toEqual({ sectionId: faq.id, slot: "content", index: 0 });
    expect(ops.getSection(moved.tree, base.features)?.slots.items).toEqual([]);
    expect(ops.treeProblems(moved.tree)).toEqual([]);
  });

  it("refuses a target that doesn't accept the block, leaving the tree as it was", () => {
    const { tree, hero, ids } = withCards();
    expect(ops.moveBlock(tree, ids[0], { sectionId: hero, slot: "actions" })).toEqual({
      error: "Card doesn't fit in Hero · Actions.",
    });
  });

  it("lets a block move inside a full slot (it doesn't count against itself)", () => {
    let { tree, hero, newId } = setup();
    /** @type {string[]} */
    const ids = [];
    for (let i = 0; i < 3; i++) {
      const result = ok(ops.insertBlock(tree, "button", { sectionId: hero, slot: "actions" }, newId));
      tree = result.tree;
      ids.push(/** @type {string} */ (result.id));
    }
    expect("error" in ops.moveBlock(tree, ids[2], { sectionId: hero, slot: "actions", index: 0 })).toBe(false);
  });

  it("moveBlockBy moves one step and stops at the ends", () => {
    const { tree, features, ids } = withCards();
    const down = ok(ops.moveBlockBy(tree, ids[0], 1));
    expect(ops.getSection(down.tree, features)?.slots.items).toEqual([ids[1], ids[0], ids[2]]);
    expect(ops.moveBlockBy(tree, ids[0], -1)).toEqual({ error: "It's already first." });
    expect(ops.moveBlockBy(tree, ids[2], 1)).toEqual({ error: "It's already last." });
  });
});

describe("removeBlock and duplicateBlock", () => {
  it("removes a block entirely and selects the one that took its place", () => {
    const { tree } = createExamplePage(counter());
    const features = tree.sections[1];
    const [first, second] = /** @type {import("./tree.js").SectionNode} */ (tree.nodes[features]).slots.items;
    const result = ok(ops.removeBlock(freeze(tree), first));
    expect(result.tree.nodes[first]).toBeUndefined();
    expect("nextSelection" in result && result.nextSelection).toBe(second);
    expect(ops.treeProblems(result.tree)).toEqual([]);
  });

  it("selects the section when its last block in a slot is removed", () => {
    const { tree, hero, newId } = setup();
    const added = ok(ops.insertBlock(tree, "badge", { sectionId: hero, slot: "eyebrow" }, newId));
    const result = ok(ops.removeBlock(added.tree, /** @type {string} */ (added.id)));
    expect("nextSelection" in result && result.nextSelection).toBe(hero);
  });

  it("duplicates right after the original with a deep copy of its props", () => {
    const base = setup();
    const faq = ok(ops.addSection(base.tree, "faq", base.newId));
    const accordion = ok(ops.insertBlock(faq.tree, "accordion", { sectionId: /** @type {string} */ (faq.id), slot: "content" }, base.newId));
    const copy = ok(ops.duplicateBlock(freeze(accordion.tree), /** @type {string} */ (accordion.id), base.newId));
    const original = ops.getBlock(copy.tree, /** @type {string} */ (accordion.id));
    const duplicate = ops.getBlock(copy.tree, /** @type {string} */ (copy.id));
    expect(duplicate?.props).toEqual(original?.props);
    expect(duplicate?.props.items).not.toBe(original?.props.items);
    expect(ops.findParent(copy.tree, /** @type {string} */ (copy.id))?.index).toBe(1);
    expect(ops.treeProblems(copy.tree)).toEqual([]);
  });

  it("won't duplicate into a full slot", () => {
    const base = setup();
    const faq = ok(ops.addSection(base.tree, "faq", base.newId));
    const target = { sectionId: /** @type {string} */ (faq.id), slot: "content" };
    const a = ok(ops.insertBlock(faq.tree, "accordion", target, base.newId));
    const b = ok(ops.insertBlock(a.tree, "accordion", target, base.newId));
    expect(ops.duplicateBlock(b.tree, /** @type {string} */ (a.id), base.newId)).toEqual({
      error: "FAQ · Content is full (2 at most).",
    });
  });
});

describe("updateProps", () => {
  it("stores parsed props for blocks and sections", () => {
    const { tree, hero, newId } = setup();
    const added = ok(ops.insertBlock(tree, "button", { sectionId: hero, slot: "actions" }, newId));
    const block = ok(ops.updateProps(freeze(added.tree), /** @type {string} */ (added.id), { label: "Go", variant: "ghost" }));
    expect(ops.getBlock(block.tree, /** @type {string} */ (added.id))?.props).toMatchObject({ label: "Go", variant: "ghost", size: "md" });
    const section = ok(ops.updateProps(block.tree, hero, { headline: "Hello" }));
    expect(ops.getSection(section.tree, hero)?.props.headline).toBe("Hello");
  });

  it("refuses invalid props, so the tree never holds them", () => {
    const { tree, hero } = setup();
    expect(ops.updateProps(tree, hero, { headline: "" })).toEqual({ error: "Those props aren't valid." });
  });
});

describe("sections", () => {
  it("moves a section and refuses past the ends", () => {
    const { tree, hero, features } = setup();
    const moved = ok(ops.moveSectionBy(freeze(tree), hero, 1));
    expect(moved.tree.sections).toEqual([features, hero]);
    expect(moved.message).toBe("Hero section moved to position 2 of 2.");
    expect(ops.moveSectionBy(tree, hero, -1)).toEqual({ error: "It's already first." });
  });

  it("removes a section with all of its blocks, leaving no orphans", () => {
    const { tree } = createExamplePage(counter());
    const result = ok(ops.removeSection(freeze(tree), tree.sections[1]));
    expect(result.tree.sections).toHaveLength(3);
    expect(ops.treeProblems(result.tree)).toEqual([]);
  });
});

describe("treeProblems", () => {
  it("reports orphans, duplicates and blocks in the wrong slot", () => {
    const { tree, hero, newId } = setup();
    const added = ok(ops.insertBlock(tree, "button", { sectionId: hero, slot: "actions" }, newId));
    const id = /** @type {string} */ (added.id);
    const section = /** @type {import("./tree.js").SectionNode} */ (added.tree.nodes[hero]);
    const broken = {
      sections: added.tree.sections,
      nodes: {
        ...added.tree.nodes,
        [hero]: { ...section, slots: { actions: [id], eyebrow: [id] } },
        stray: { id: "stray", kind: /** @type {const} */ ("block"), component: "badge", props: {} },
      },
    };
    expect(ops.treeProblems(broken)).toEqual(
      expect.arrayContaining([`"${id}" appears in more than one place`, '"stray" is orphaned']),
    );
  });
});
