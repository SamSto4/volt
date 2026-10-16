// Where a drop lands inside a slot, from the pointer and the blocks' boxes.
// Pure functions over rectangles, so they're tested without a browser.

/** @typedef {{ left: number, top: number, right: number, bottom: number }} Rect */

/**
 * The insertion index for a pointer over a slot's blocks, in reading order:
 * a block counts as "before" the pointer when the pointer is below its row,
 * or on its row and past its middle. Works for rows (hero actions), columns
 * (sign-up fields) and grids (feature cards) alike.
 *
 * @param {Rect[]} blocks  the slot's blocks, in order
 * @param {{ x: number, y: number }} point
 * @returns {number} 0..blocks.length
 */
export function insertionIndex(blocks, { x, y }) {
  let index = 0;
  for (const box of blocks) {
    const belowRow = y > box.bottom;
    const onRowPastMiddle = y >= box.top && y <= box.bottom && x > (box.left + box.right) / 2;
    if (belowRow || onRowPastMiddle) index += 1;
  }
  return index;
}

/**
 * Where to draw the 2px insertion line (DESIGN.md §11), relative to the slot.
 * Between two blocks on the same row it's vertical; otherwise it's a
 * horizontal line above the next block (or below the last one).
 *
 * @param {Rect[]} blocks
 * @param {number} index
 * @param {Rect} slot
 * @returns {{ left: number, top: number, width: number, height: number }}
 */
export function insertionLine(blocks, index, slot) {
  const before = blocks[index - 1];
  const after = blocks[index];
  const sameRow = (/** @type {Rect} */ a, /** @type {Rect} */ b) => a.top < b.bottom && b.top < a.bottom;

  if (!before && !after) return { left: 0, top: 0, width: slot.right - slot.left, height: 2 };
  if (before && after && sameRow(before, after)) {
    const x = (before.right + after.left) / 2 - slot.left;
    return { left: x - 1, top: Math.min(before.top, after.top) - slot.top, width: 2, height: Math.max(before.bottom, after.bottom) - Math.min(before.top, after.top) };
  }
  if (after) {
    // A row of blocks that wraps: if the next block shares a row with the one
    // after it, the line goes at its left edge, not across the whole slot.
    const next = blocks[index + 1];
    if (next && sameRow(after, next)) return { left: after.left - slot.left - 3, top: after.top - slot.top, width: 2, height: after.bottom - after.top };
    return { left: after.left - slot.left, top: after.top - slot.top - 3, width: after.right - after.left, height: 2 };
  }
  const last = /** @type {Rect} */ (before);
  const previous = blocks[index - 2];
  if (previous && sameRow(previous, last)) return { left: last.right - slot.left + 1, top: last.top - slot.top, width: 2, height: last.bottom - last.top };
  return { left: last.left - slot.left, top: last.bottom - slot.top + 1, width: last.right - last.left, height: 2 };
}

/**
 * Turns "insert at position k among the slot's current blocks" into the
 * final index moveBlock() expects, for a block already in that slot: taking
 * it out first shifts everything after it up by one.
 *
 * @param {number} insertAt
 * @param {number} currentIndex  the dragged block's index in this slot, or -1
 */
export function finalIndex(insertAt, currentIndex) {
  return currentIndex !== -1 && insertAt > currentIndex ? insertAt - 1 : insertAt;
}
