// Generates the code for a whole page: every section's layout with its slots
// filled by block code, as one file that can be pasted into a project.
// Pure (ADR 0003): the registries are passed in, nothing is imported from the editor.

import { z } from "zod";
import { collectTypes, extractRanges, h, printJsx } from "./jsx.js";
import { printImports, printModule } from "./module.js";
import { fillSlots, slotWrapper } from "./slots.js";

/**
 * The parts of an editor tree codegen needs (ADR 0004). Kept structural, so
 * codegen doesn't depend on the editor's code.
 *
 * @typedef {object} PageTree
 * @property {string[]} sections
 * @property {Record<string, any>} nodes
 */

/**
 * @typedef {object} Registries
 * @property {import("@/registry/schema").Manifest[]} manifests
 * @property {import("@/registry/sections/schema").SectionTemplate[]} sections
 */

/**
 * The page as one element tree, plus which module each component comes from
 * and which element belongs to which block id.
 *
 * @param {PageTree} tree
 * @param {Registries} registries
 * @returns {{ element: import("./jsx.js").Element, moduleOf: Map<string, string>, blockOf: WeakMap<object, string> }}
 */
export function pageElement(tree, { manifests, sections }) {
  /** @type {Map<string, string>} */
  const moduleOf = new Map();
  // A WeakMap lets us tag element objects with their block id without adding
  // a prop that would be printed into the code.
  /** @type {WeakMap<object, string>} */
  const blockOf = new WeakMap();

  const sectionElements = tree.sections.map((sectionId) => {
    const node = tree.nodes[sectionId];
    const template = sections.find((candidate) => candidate.name === node?.template);
    if (!node || !template) throw new Error(`Unknown section "${sectionId}"`);
    const props = parseOrThrow(template.props, node.props, `section "${template.name}"`);

    return fillSlots(template.render(props), (slot) => {
      const blocks = (node.slots[slot.name] ?? []).map((/** @type {string} */ blockId) => {
        const block = tree.nodes[blockId];
        const manifest = manifests.find((candidate) => candidate.name === block?.component);
        if (!block || !manifest) throw new Error(`Unknown block "${blockId}"`);
        const element = manifest.code.render(parseOrThrow(manifest.props, block.props, manifest.name), manifest.props.parse({}));
        for (const type of collectTypes(element)) {
          if (/^[A-Z]/.test(type)) moduleOf.set(type, manifest.code.uses?.[type] ?? manifest.code.from);
        }
        blockOf.set(element, blockId);
        return element;
      });
      return slotWrapper(slot, blocks);
    });
  });

  const main = h("main", {}, sectionElements);
  sectionElements.forEach((element, index) => blockOf.set(element, tree.sections[index]));
  return { element: main, moduleOf, blockOf };
}

/**
 * @param {PageTree} tree
 * @param {Registries} registries
 * @returns {{ imports: string, jsx: string, module: string, ranges: Map<string, { start: number, end: number }> }}
 *   ranges: for each section and block id, its lines in `module` (1-based, inclusive)
 */
export function generatePageCode(tree, registries) {
  const { element, moduleOf, blockOf } = pageElement(tree, registries);
  /** @type {Map<string, Set<string>>} */
  const namesByModule = new Map();
  for (const [name, from] of moduleOf) namesByModule.set(from, (namesByModule.get(from) ?? new Set()).add(name));
  const imports = printImports(namesByModule);
  const jsx = printJsx(element);
  const marked = printModule(imports, printJsx(element, 0, { mark: (child) => blockOf.get(child) }), "Page");
  const { code, ranges } = extractRanges(marked);
  return { imports, jsx, module: code, ranges };
}

/**
 * Saved trees are untrusted, so every node's props are checked here too.
 * @param {z.ZodObject} schema @param {unknown} props @param {string} label
 */
function parseOrThrow(schema, props, label) {
  const result = schema.safeParse(props);
  if (!result.success) throw new Error(`Invalid props for ${label}:\n${z.prettifyError(result.error)}`);
  return result.data;
}
