import { addSection, emptyTree, insertBlock } from "./tree.js";

/**
 * The prefilled landing page the editor opens with (DESIGN.md §11
 * onboarding). Built with the same operations the editor uses, so it can
 * never be a shape the editor couldn't produce itself.
 *
 * @param {() => string} newId
 * @returns {{ tree: import("./tree.js").Tree, heroId: string }}
 */
export function createExamplePage(newId) {
  let tree = emptyTree();
  /** @type {Record<string, string>} */
  const sectionIds = {};

  /** @param {import("./tree.js").Result} result */
  const take = (result) => {
    if ("error" in result) throw new Error(`Example page is invalid: ${result.error}`);
    tree = result.tree;
    return /** @type {string} */ (result.id);
  };

  for (const template of ["hero", "features", "faq", "signup"]) {
    sectionIds[template] = take(addSection(tree, template, newId));
  }

  /** @param {string} sectionId @param {string} slot @param {string} component @param {Record<string, unknown>} [props] */
  const add = (sectionId, slot, component, props) => take(insertBlock(tree, component, { sectionId, slot }, newId, props));

  add(sectionIds.hero, "eyebrow", "badge", { label: "New", variant: "highlight" });
  add(sectionIds.hero, "actions", "button", { label: "Get started" });
  add(sectionIds.hero, "actions", "button", { label: "See how it works", variant: "secondary" });

  add(sectionIds.features, "items", "card", { title: "Fast to set up", description: "Go from an empty page to a published one in an afternoon." });
  add(sectionIds.features, "items", "card", { title: "Works on any screen", description: "Every layout adapts from phones to wide monitors." });
  add(sectionIds.features, "items", "card", { title: "Keyboard first", description: "Every action works without a mouse." });

  add(sectionIds.faq, "content", "accordion");

  add(sectionIds.signup, "fields", "input", { label: "Email", type: "email", placeholder: "you@example.com" });
  add(sectionIds.signup, "actions", "button", { label: "Subscribe" });

  return { tree, heroId: sectionIds.hero };
}
