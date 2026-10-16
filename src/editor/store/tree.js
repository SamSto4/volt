import { manifests } from "@/registry";
import { sections as sectionTemplates } from "@/registry/sections";

// Pure operations on the page tree (ADR 0004). Each one takes a tree and
// returns a *new* tree, never changing the one it was given, so any old tree
// is a valid undo snapshot. Each also returns a sentence for the editor's live
// region, or an `error` explaining why the change isn't allowed.

/**
 * @typedef {object} SectionNode
 * @property {string} id
 * @property {"section"} kind
 * @property {string} template            a section template name, e.g. "hero"
 * @property {Record<string, unknown>} props
 * @property {Record<string, string[]>} slots  slot name -> block ids, in order
 */

/**
 * @typedef {object} BlockNode
 * @property {string} id
 * @property {"block"} kind
 * @property {string} component             a manifest name, e.g. "button"
 * @property {Record<string, unknown>} props
 */

/**
 * @typedef {object} Tree
 * @property {string[]} sections                        page order
 * @property {Record<string, SectionNode | BlockNode>} nodes
 */

/** @typedef {{ sectionId: string, slot: string, index?: number }} Target */
/** @typedef {{ tree: Tree, message: string, id?: string } | { error: string }} Result */

/** @returns {Tree} */
export function emptyTree() {
  return { sections: [], nodes: {} };
}

/** @param {string} name */
export function getManifest(name) {
  const manifest = manifests.find((candidate) => candidate.name === name);
  if (!manifest) throw new Error(`Unknown component "${name}"`);
  return manifest;
}

/** @param {string} name */
export function getSectionTemplate(name) {
  const template = sectionTemplates.find((candidate) => candidate.name === name);
  if (!template) throw new Error(`Unknown section "${name}"`);
  return template;
}

/**
 * @param {Tree} tree
 * @param {string} id
 * @returns {SectionNode | null}
 */
export function getSection(tree, id) {
  const node = tree.nodes[id];
  return node?.kind === "section" ? node : null;
}

/**
 * @param {Tree} tree
 * @param {string} id
 * @returns {BlockNode | null}
 */
export function getBlock(tree, id) {
  const node = tree.nodes[id];
  return node?.kind === "block" ? node : null;
}

/**
 * Where a block sits. There are no parent pointers to keep in sync; scanning
 * a page's slots is cheap.
 *
 * @param {Tree} tree
 * @param {string} blockId
 * @returns {{ sectionId: string, slot: string, index: number } | null}
 */
export function findParent(tree, blockId) {
  for (const sectionId of tree.sections) {
    const section = getSection(tree, sectionId);
    if (!section) continue;
    for (const [slot, ids] of Object.entries(section.slots)) {
      const index = ids.indexOf(blockId);
      if (index !== -1) return { sectionId, slot, index };
    }
  }
  return null;
}

/** "Hero · Actions" for messages and labels. @param {Tree} tree @param {string} sectionId @param {string} slot */
export function slotLabel(tree, sectionId, slot) {
  const section = getSection(tree, sectionId);
  if (!section) return slot;
  const template = getSectionTemplate(section.template);
  const definition = template.slots.find((candidate) => candidate.name === slot);
  return `${template.title} · ${definition?.title ?? slot}`;
}

/**
 * Can a component go into a slot? One rule used by insert, move, duplicate and
 * the UI's drop-target highlighting, so they can never disagree.
 *
 * @param {Tree} tree
 * @param {string} component
 * @param {Target} target
 * @param {{ movingId?: string }} [options]  a block being moved doesn't count against `max` in its own slot
 * @returns {{ ok: true } | { ok: false, reason: string }}
 */
export function canPlace(tree, component, { sectionId, slot }, { movingId } = {}) {
  const section = getSection(tree, sectionId);
  if (!section) return { ok: false, reason: "That section doesn't exist." };
  const definition = getSectionTemplate(section.template).slots.find((candidate) => candidate.name === slot);
  if (!definition) return { ok: false, reason: "That slot doesn't exist." };

  const manifest = getManifest(component);
  if (!manifest.fits.some((kind) => definition.accepts.includes(kind))) {
    return { ok: false, reason: `${manifest.title} doesn't fit in ${slotLabel(tree, sectionId, slot)}.` };
  }
  const others = (section.slots[slot] ?? []).filter((id) => id !== movingId);
  if (others.length >= definition.max) {
    return { ok: false, reason: `${slotLabel(tree, sectionId, slot)} is full (${definition.max} at most).` };
  }
  return { ok: true };
}

/** Clamp an insertion index into a list of `length` items. @param {number | undefined} index @param {number} length */
function clampIndex(index, length) {
  if (index === undefined) return length;
  return Math.max(0, Math.min(index, length));
}

/**
 * Returns a copy of the section with one slot's list replaced.
 * @param {SectionNode} section @param {string} slot @param {string[]} ids
 * @returns {SectionNode}
 */
function withSlot(section, slot, ids) {
  return { ...section, slots: { ...section.slots, [slot]: ids } };
}

/**
 * Adds a section from a template, with default props and empty slots.
 *
 * @param {Tree} tree
 * @param {string} templateName
 * @param {() => string} newId
 * @param {number} [index]  defaults to the end of the page
 * @returns {Result}
 */
export function addSection(tree, templateName, newId, index) {
  const template = getSectionTemplate(templateName);
  const id = newId();
  /** @type {SectionNode} */
  const section = {
    id,
    kind: "section",
    template: template.name,
    props: template.props.parse({}),
    slots: Object.fromEntries(template.slots.map((slot) => [slot.name, []])),
  };
  const at = clampIndex(index, tree.sections.length);
  const order = [...tree.sections.slice(0, at), id, ...tree.sections.slice(at)];
  return {
    tree: { sections: order, nodes: { ...tree.nodes, [id]: section } },
    id,
    message: `${template.title} section added, position ${at + 1} of ${order.length}.`,
  };
}

/**
 * Adds a new block (with the manifest's defaults, or given props) to a slot.
 *
 * @param {Tree} tree
 * @param {string} component
 * @param {Target} target
 * @param {() => string} newId
 * @param {Record<string, unknown>} [props]
 * @returns {Result}
 */
export function insertBlock(tree, component, target, newId, props) {
  const check = canPlace(tree, component, target);
  if (!check.ok) return { error: check.reason };
  const manifest = getManifest(component);
  const section = /** @type {SectionNode} */ (getSection(tree, target.sectionId));
  const ids = section.slots[target.slot] ?? [];
  const at = clampIndex(target.index, ids.length);
  const id = newId();
  /** @type {BlockNode} */
  const block = { id, kind: "block", component, props: manifest.props.parse(props ?? {}) };
  const nextIds = [...ids.slice(0, at), id, ...ids.slice(at)];

  return {
    tree: {
      sections: tree.sections,
      nodes: { ...tree.nodes, [id]: block, [section.id]: withSlot(section, target.slot, nextIds) },
    },
    id,
    message: `${manifest.title} added to ${slotLabel(tree, target.sectionId, target.slot)}, position ${at + 1} of ${nextIds.length}.`,
  };
}

/**
 * Moves a block to a position in any slot that accepts it. `index` is the
 * block's position in the target slot *after* the move.
 *
 * @param {Tree} tree
 * @param {string} blockId
 * @param {Target} target
 * @returns {Result}
 */
export function moveBlock(tree, blockId, target) {
  const block = getBlock(tree, blockId);
  const from = findParent(tree, blockId);
  if (!block || !from) return { error: "That block doesn't exist." };
  const check = canPlace(tree, block.component, target, { movingId: blockId });
  if (!check.ok) return { error: check.reason };

  // Take the block out first, then put it in, so moving within one slot and
  // moving between slots are the same two steps.
  const source = /** @type {SectionNode} */ (getSection(tree, from.sectionId));
  const afterRemoval = withSlot(source, from.slot, source.slots[from.slot].filter((id) => id !== blockId));
  /** @type {Record<string, SectionNode | BlockNode>} */
  const nodes = { ...tree.nodes, [source.id]: afterRemoval };

  const destination = /** @type {SectionNode} */ (nodes[target.sectionId]);
  const ids = destination.slots[target.slot] ?? [];
  const at = clampIndex(target.index, ids.length);
  nodes[destination.id] = withSlot(destination, target.slot, [...ids.slice(0, at), blockId, ...ids.slice(at)]);

  const unchanged = from.sectionId === target.sectionId && from.slot === target.slot && from.index === at;
  if (unchanged) return { error: "It's already there." };
  const count = ids.length + 1;
  return {
    tree: { sections: tree.sections, nodes },
    id: blockId,
    message: `${getManifest(block.component).title} moved to ${slotLabel(tree, target.sectionId, target.slot)}, position ${at + 1} of ${count}.`,
  };
}

/**
 * Moves a block up (-1) or down (+1) within its slot: the action bar and
 * keyboard alternative to dragging.
 *
 * @param {Tree} tree
 * @param {string} blockId
 * @param {-1 | 1} delta
 * @returns {Result}
 */
export function moveBlockBy(tree, blockId, delta) {
  const from = findParent(tree, blockId);
  if (!from) return { error: "That block doesn't exist." };
  const section = /** @type {SectionNode} */ (getSection(tree, from.sectionId));
  const next = from.index + delta;
  if (next < 0) return { error: "It's already first." };
  if (next >= section.slots[from.slot].length) return { error: "It's already last." };
  return moveBlock(tree, blockId, { sectionId: from.sectionId, slot: from.slot, index: next });
}

/**
 * Removes a block. Also says which block to select next (the one that took
 * its place, else the one before it, else its section), so focus never falls
 * off the page.
 *
 * @param {Tree} tree
 * @param {string} blockId
 * @returns {Result & { nextSelection?: string }}
 */
export function removeBlock(tree, blockId) {
  const block = getBlock(tree, blockId);
  const from = findParent(tree, blockId);
  if (!block || !from) return { error: "That block doesn't exist." };
  const section = /** @type {SectionNode} */ (getSection(tree, from.sectionId));
  const remaining = section.slots[from.slot].filter((id) => id !== blockId);
  // Destructuring with a computed name pulls the removed node out and keeps the rest.
  const { [blockId]: _removed, ...rest } = tree.nodes;
  return {
    tree: { sections: tree.sections, nodes: { ...rest, [section.id]: withSlot(section, from.slot, remaining) } },
    nextSelection: remaining[from.index] ?? remaining[from.index - 1] ?? section.id,
    message: `${getManifest(block.component).title} removed from ${slotLabel(tree, from.sectionId, from.slot)}.`,
  };
}

/**
 * Copies a block (and its props) right after itself.
 *
 * @param {Tree} tree
 * @param {string} blockId
 * @param {() => string} newId
 * @returns {Result}
 */
export function duplicateBlock(tree, blockId, newId) {
  const block = getBlock(tree, blockId);
  const from = findParent(tree, blockId);
  if (!block || !from) return { error: "That block doesn't exist." };
  // structuredClone makes a deep copy, so the two blocks never share an items array.
  const result = insertBlock(tree, block.component, { ...from, index: from.index + 1 }, newId, structuredClone(block.props));
  if ("error" in result) return result;
  return { ...result, message: `${getManifest(block.component).title} duplicated. ${result.message}` };
}

/**
 * Replaces a section's or block's props. They're parsed with the node's own
 * schema, so the tree can never hold invalid props.
 *
 * @param {Tree} tree
 * @param {string} nodeId
 * @param {Record<string, unknown>} props
 * @returns {Result}
 */
export function updateProps(tree, nodeId, props) {
  const node = tree.nodes[nodeId];
  if (!node) return { error: "That item doesn't exist." };
  const schema = node.kind === "block" ? getManifest(node.component).props : getSectionTemplate(node.template).props;
  const result = schema.safeParse(props);
  if (!result.success) return { error: "Those props aren't valid." };
  return {
    tree: { sections: tree.sections, nodes: { ...tree.nodes, [nodeId]: { ...node, props: result.data } } },
    id: nodeId,
    message: "",
  };
}

/**
 * Moves a section up (-1) or down (+1) on the page.
 *
 * @param {Tree} tree
 * @param {string} sectionId
 * @param {-1 | 1} delta
 * @returns {Result}
 */
export function moveSectionBy(tree, sectionId, delta) {
  const index = tree.sections.indexOf(sectionId);
  const section = getSection(tree, sectionId);
  if (index === -1 || !section) return { error: "That section doesn't exist." };
  const next = index + delta;
  if (next < 0) return { error: "It's already first." };
  if (next >= tree.sections.length) return { error: "It's already last." };
  const order = tree.sections.filter((id) => id !== sectionId);
  order.splice(next, 0, sectionId);
  return {
    tree: { sections: order, nodes: tree.nodes },
    id: sectionId,
    message: `${getSectionTemplate(section.template).title} section moved to position ${next + 1} of ${order.length}.`,
  };
}

/**
 * Removes a section and every block in its slots.
 *
 * @param {Tree} tree
 * @param {string} sectionId
 * @returns {Result & { nextSelection?: string | null }}
 */
export function removeSection(tree, sectionId) {
  const index = tree.sections.indexOf(sectionId);
  const section = getSection(tree, sectionId);
  if (index === -1 || !section) return { error: "That section doesn't exist." };
  const gone = new Set([sectionId, ...Object.values(section.slots).flat()]);
  const nodes = Object.fromEntries(Object.entries(tree.nodes).filter(([id]) => !gone.has(id)));
  const order = tree.sections.filter((id) => id !== sectionId);
  return {
    tree: { sections: order, nodes },
    nextSelection: order[index] ?? order[index - 1] ?? null,
    message: `${getSectionTemplate(section.template).title} section removed.`,
  };
}

/**
 * Checks the invariants every tree must keep. Used by the tests after every
 * operation, and available for validating saved trees later.
 *
 * @param {Tree} tree
 * @returns {string[]} problems found (empty when the tree is sound)
 */
export function treeProblems(tree) {
  /** @type {string[]} */
  const problems = [];
  const seen = new Set();
  for (const sectionId of tree.sections) {
    const section = getSection(tree, sectionId);
    if (!section) {
      problems.push(`page lists "${sectionId}", which isn't a section`);
      continue;
    }
    seen.add(sectionId);
    const template = getSectionTemplate(section.template);
    for (const definition of template.slots) {
      const ids = section.slots[definition.name] ?? [];
      if (ids.length > definition.max) problems.push(`${sectionId}.${definition.name} holds more than ${definition.max}`);
      for (const id of ids) {
        const block = getBlock(tree, id);
        if (!block) problems.push(`${sectionId}.${definition.name} lists "${id}", which isn't a block`);
        else if (seen.has(id)) problems.push(`"${id}" appears in more than one place`);
        else if (!getManifest(block.component).fits.some((kind) => definition.accepts.includes(kind))) {
          problems.push(`"${id}" (${block.component}) doesn't fit in ${sectionId}.${definition.name}`);
        }
        seen.add(id);
      }
    }
  }
  for (const id of Object.keys(tree.nodes)) if (!seen.has(id)) problems.push(`"${id}" is orphaned`);
  return problems;
}
