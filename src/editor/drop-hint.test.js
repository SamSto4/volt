import { describe, expect, it } from "vitest";
import { buildTemplate } from "./store/example-page.js";
import { addSection } from "./store/tree.js";
import { missedDropMessage, placesFor } from "./drop-hint.js";

/** The landing page template: hero, features, FAQ, sign-up. */
function landing() {
  let next = 0;
  return buildTemplate("landing", () => `id${next++}`).tree;
}

describe("placesFor", () => {
  it("lists the slots that take a component, in page order, as people read them", () => {
    // A Button is an action: the hero's Actions and the sign-up's Actions take it.
    expect(placesFor(landing(), "button")).toEqual(["Hero · Actions", "Sign-up · Actions"]);
  });

  it("lists the slots for a component that fits several kinds", () => {
    // A Card is content: Features' Items and the FAQ's Content.
    expect(placesFor(landing(), "card")).toEqual(["Features · Items", "FAQ · Content"]);
  });

  it("leaves out a slot that is full, but not a block's own slot when it's the one moving", () => {
    const tree = landing();
    const heroId = tree.sections[0];
    const hero = /** @type {import("./store/tree.js").SectionNode} */ (tree.nodes[heroId]);
    const [first] = hero.slots.actions;
    // Hero Actions holds two buttons and takes three at most: add one more to fill it.
    const full = {
      ...tree,
      nodes: { ...tree.nodes, [heroId]: { ...hero, slots: { ...hero.slots, actions: [...hero.slots.actions, first] } } },
    };
    expect(placesFor(full, "button")).toEqual(["Sign-up · Actions"]);
    // Moving one of its own buttons, its slot has room again (it leaves one place).
    expect(placesFor(full, "button", { movingId: first })).toEqual(["Hero · Actions", "Sign-up · Actions"]);
  });

  it("is empty when the page has no section that takes it", () => {
    expect(placesFor({ sections: [], nodes: {} }, "button")).toEqual([]);
  });
});

describe("missedDropMessage", () => {
  it("says a component wasn't added, and where it would fit", () => {
    expect(missedDropMessage(landing(), { kind: "component", name: "button" })).toBe(
      "Button wasn't added. Drop it on a highlighted slot: Hero · Actions, Sign-up · Actions.",
    );
  });

  it("names three places and counts the rest", () => {
    // Two heroes are added after the sign-up, so the order is page order: four slots take a Button.
    let tree = landing();
    let next = 100;
    for (let i = 0; i < 2; i++) {
      const result = addSection(tree, "hero", () => `extra${next++}`);
      if ("error" in result) throw new Error(result.error);
      tree = result.tree;
    }
    expect(placesFor(tree, "button")).toHaveLength(4);
    expect(missedDropMessage(tree, { kind: "component", name: "button" })).toBe(
      "Button wasn't added. Drop it on a highlighted slot: Hero · Actions, Sign-up · Actions, Hero · Actions and 1 more.",
    );
  });

  it("says a dragged block stayed where it was", () => {
    const tree = landing();
    const features = /** @type {import("./store/tree.js").SectionNode} */ (tree.nodes[tree.sections[1]]);
    const message = missedDropMessage(tree, { kind: "block", id: features.slots.items[0] });
    expect(message).toBe("Card stayed where it was. Drop it on a highlighted slot: Features · Items, FAQ · Content.");
  });

  it("says so when nothing takes the component", () => {
    expect(missedDropMessage({ sections: [], nodes: {} }, { kind: "component", name: "button" })).toBe(
      "Button wasn't added. Every slot that takes it is full, or the page has none. Add a section that does.",
    );
  });

  it("says nothing for a block that no longer exists", () => {
    expect(missedDropMessage(landing(), { kind: "block", id: "gone" })).toBe("");
  });
});
