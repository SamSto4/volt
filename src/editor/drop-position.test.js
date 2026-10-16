import { describe, expect, it } from "vitest";
import { finalIndex, insertionIndex, insertionLine } from "./drop-position.js";

/** A box from x, y, width, height. */
const box = (/** @type {number} */ x, /** @type {number} */ y, w = 100, h = 40) => ({ left: x, top: y, right: x + w, bottom: y + h });

describe("insertionIndex", () => {
  // Three buttons in one row: 0–100, 120–220, 240–340.
  const row = [box(0, 0), box(120, 0), box(240, 0)];
  // Three fields in one column, 60px apart.
  const column = [box(0, 0, 300), box(0, 60, 300), box(0, 120, 300)];
  // A 2×2 grid of cards.
  const grid = [box(0, 0), box(120, 0), box(0, 60), box(120, 60)];

  it.each([
    [10, 20, 0],
    [60, 20, 1],
    [170, 20, 1],
    [300, 20, 3],
  ])("row: pointer at x=%i,y=%i inserts at %i", (x, y, expected) => {
    expect(insertionIndex(row, { x, y })).toBe(expected);
  });

  it.each([
    [10, -5, 0],
    [10, 50, 1],
    [10, 170, 3],
  ])("column: pointer at x=%i,y=%i inserts at %i", (x, y, expected) => {
    expect(insertionIndex(column, { x, y })).toBe(expected);
  });

  it.each([
    [10, 20, 0],
    [180, 20, 2],
    [10, 80, 2],
    [180, 80, 4],
  ])("grid: pointer at x=%i,y=%i inserts at %i", (x, y, expected) => {
    expect(insertionIndex(grid, { x, y })).toBe(expected);
  });

  it("is 0 for an empty slot", () => {
    expect(insertionIndex([], { x: 5, y: 5 })).toBe(0);
  });
});

describe("insertionLine", () => {
  const slot = box(0, 0, 400, 200);

  it("is vertical between two blocks on the same row", () => {
    const row = [box(0, 0), box(120, 0)];
    expect(insertionLine(row, 1, slot)).toEqual({ left: 109, top: 0, width: 2, height: 40 });
  });

  it("is horizontal above the next block in a column", () => {
    const column = [box(0, 0, 300), box(0, 60, 300)];
    expect(insertionLine(column, 1, slot)).toEqual({ left: 0, top: 57, width: 300, height: 2 });
  });

  it("is horizontal below the last block when inserting at the end of a column", () => {
    const column = [box(0, 0, 300)];
    expect(insertionLine(column, 1, slot)).toEqual({ left: 0, top: 41, width: 300, height: 2 });
  });

  it("is vertical after the last block of a row", () => {
    const row = [box(0, 0), box(120, 0)];
    expect(insertionLine(row, 2, slot)).toEqual({ left: 221, top: 0, width: 2, height: 40 });
  });

  it("spans the slot when it's empty", () => {
    expect(insertionLine([], 0, slot)).toEqual({ left: 0, top: 0, width: 400, height: 2 });
  });
});

describe("finalIndex", () => {
  it("shifts down by one when moving a block later in its own slot", () => {
    expect(finalIndex(3, 0)).toBe(2);
  });

  it("is unchanged when moving earlier, or when coming from another slot", () => {
    expect(finalIndex(0, 2)).toBe(0);
    expect(finalIndex(1, -1)).toBe(1);
  });
});
