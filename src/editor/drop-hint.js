import { canPlace, getBlock, getManifest, getSection, getSectionTemplate, slotLabel } from "./store/tree.js";

// Explains a drag that didn't land. Dropping on a slot that doesn't accept a
// component is refused (the browser shows a not-allowed cursor and never
// fires a drop), which is correct but silent. These say where it would have
// worked. Pure: a tree in, words out, so it's tested without a browser.

/** The most places named in one message; the rest are counted. */
const MAX_NAMED = 3;

/**
 * Every slot on the page a component could go in right now, in page order,
 * as people read them ("Hero · Actions"). Uses canPlace, the one rule that
 * insert, move and the drop highlight all use, so this can't disagree.
 *
 * @param {import("./store/tree.js").Tree} tree
 * @param {string} component  a manifest name
 * @param {{ movingId?: string }} [options]  a block being moved doesn't count against its own slot
 * @returns {string[]}
 */
export function placesFor(tree, component, { movingId } = {}) {
  /** @type {string[]} */
  const places = [];
  for (const sectionId of tree.sections) {
    const section = getSection(tree, sectionId);
    if (!section) continue;
    for (const definition of getSectionTemplate(section.template).slots) {
      if (canPlace(tree, component, { sectionId, slot: definition.name }, { movingId }).ok) {
        places.push(slotLabel(tree, sectionId, definition.name));
      }
    }
  }
  return places;
}

/**
 * What to say when a drag ended without dropping on a slot that takes it.
 *
 * @param {import("./store/tree.js").Tree} tree
 * @param {{ kind: "component", name: string } | { kind: "block", id: string }} payload  what was dragged
 * @returns {string}
 */
export function missedDropMessage(tree, payload) {
  const movingId = payload.kind === "block" ? payload.id : undefined;
  const block = movingId ? getBlock(tree, movingId) : null;
  const component = payload.kind === "component" ? payload.name : block?.component;
  if (!component) return "";

  const title = getManifest(component).title;
  const places = placesFor(tree, component, { movingId });
  const outcome = payload.kind === "component" ? `${title} wasn't added.` : `${title} stayed where it was.`;
  if (places.length === 0) {
    return `${outcome} Every slot that takes it is full, or the page has none. Add a section that does.`;
  }
  const named = places.slice(0, MAX_NAMED).join(", ");
  const rest = places.length > MAX_NAMED ? ` and ${places.length - MAX_NAMED} more` : "";
  return `${outcome} Drop it on a highlighted slot: ${named}${rest}.`;
}
