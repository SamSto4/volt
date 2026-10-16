import { h } from "./jsx.js";

// Section templates mark where blocks go with h("Slot", { name, className })
// (ADR 0004). This swaps each marker for real content. Codegen fills slots
// with block code; the editor canvas fills them with interactive drop zones.
// Same template tree, two uses.

/**
 * @typedef {object} SlotMarker
 * @property {string} name
 * @property {string} [className]
 */

/**
 * Returns a copy of `node` with every Slot marker replaced by what `fill`
 * returns for it. Returning null drops the marker entirely.
 *
 * @param {import("./jsx.js").Element} node
 * @param {(slot: SlotMarker) => import("./jsx.js").Child} fill
 * @returns {import("./jsx.js").Element}
 */
export function fillSlots(node, fill) {
  /** @param {import("./jsx.js").Child} child @returns {import("./jsx.js").Child} */
  const visit = (child) => {
    if (!child || typeof child === "string") return child;
    if (child.type === "Slot") {
      return fill({ name: String(child.props.name), className: child.props.className ? String(child.props.className) : undefined });
    }
    return { ...child, children: child.children.map(visit) };
  };
  return /** @type {import("./jsx.js").Element} */ (visit(node));
}

/**
 * The usual codegen filling: the slot's elements inside a div with the
 * slot's layout classes, or nothing at all when the slot is empty.
 *
 * @param {SlotMarker} slot
 * @param {import("./jsx.js").Element[]} elements
 * @returns {import("./jsx.js").Child}
 */
export function slotWrapper(slot, elements) {
  if (elements.length === 0) return null;
  return h("div", { className: slot.className }, elements);
}
