/**
 * How much to scale a frame of `width` pixels so it fits the space available,
 * and how tall to make it so that, once scaled, it still fills the space.
 *
 * Before layout (or while hidden) the space can measure 0×0; dividing by a
 * zero scale would give NaN or Infinity, so the frame is left unscaled then.
 *
 * @param {{ width: number, height: number }} available
 * @param {number} width
 * @returns {{ scale: number, height: number }}
 */
export function fitFrame(available, width) {
  if (!(available.width > 0) || !(available.height > 0) || !(width > 0)) {
    return { scale: 1, height: Math.max(available.height, 0) };
  }
  const scale = Math.min(1, available.width / width);
  return { scale, height: available.height / scale };
}

/**
 * The widest preview width that still fits without shrinking much, so the
 * editor opens at a size where the page's text is readable: a 1280px page in
 * a 650px canvas would be drawn at half size (text around 7px).
 *
 * "Without shrinking much" means a scale of at least `minScale`. When none
 * fits, the narrowest is used. When the space isn't known yet (before
 * layout), the widest is, which is what the editor always used to open at.
 *
 * @param {number} availableWidth  the canvas's width in pixels
 * @param {number[]} widths        the widths the editor offers, any order
 * @param {number} [minScale]
 * @returns {number}
 */
export function bestFitWidth(availableWidth, widths, minScale = 0.75) {
  const sorted = [...widths].sort((a, b) => a - b);
  if (!(availableWidth > 0)) return sorted[sorted.length - 1];
  const fitting = sorted.filter((width) => availableWidth / width >= minScale);
  return fitting.length > 0 ? fitting[fitting.length - 1] : sorted[0];
}
