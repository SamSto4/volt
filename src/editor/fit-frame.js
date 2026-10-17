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
