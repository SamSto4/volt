import { describe, expect, it } from "vitest";
import { bestFitWidth, fitFrame } from "./fit-frame.js";

describe("fitFrame", () => {
  it("leaves a frame that fits at full size", () => {
    expect(fitFrame({ width: 1400, height: 800 }, 1280)).toEqual({ scale: 1, height: 800 });
  });

  it("scales a wider frame down and makes it taller by the same factor", () => {
    expect(fitFrame({ width: 640, height: 800 }, 1280)).toEqual({ scale: 0.5, height: 1600 });
  });

  // The bug: a 0-wide space (not laid out yet, or hidden) gave scale 0 and
  // height 0 / 0 = NaN, which React reported as an invalid CSS height.
  it.each([
    [{ width: 0, height: 0 }],
    [{ width: 0, height: 600 }],
    [{ width: 500, height: 0 }],
  ])("never returns NaN or Infinity for an unmeasured space %j", (available) => {
    const { scale, height } = fitFrame(available, 1280);
    expect(Number.isFinite(scale) && scale > 0).toBe(true);
    expect(Number.isFinite(height)).toBe(true);
  });
});

describe("bestFitWidth", () => {
  const widths = [375, 768, 1280];

  it("picks the widest width that stays at least 75% size", () => {
    // 1280 * 0.75 = 960 needed; 768 * 0.75 = 576; 375 * 0.75 = 281.
    expect(bestFitWidth(1000, widths)).toBe(1280);
    expect(bestFitWidth(960, widths)).toBe(1280); // exactly 75%
    expect(bestFitWidth(959, widths)).toBe(768);
    expect(bestFitWidth(650, widths)).toBe(768);
    expect(bestFitWidth(576, widths)).toBe(768);
    expect(bestFitWidth(575, widths)).toBe(375);
  });

  it("falls back to the narrowest when nothing fits well", () => {
    expect(bestFitWidth(200, widths)).toBe(375);
  });

  it("uses the widest while the space is unknown (before layout, or hidden)", () => {
    expect(bestFitWidth(0, widths)).toBe(1280);
    expect(bestFitWidth(Number.NaN, widths)).toBe(1280);
  });

  it("doesn't depend on the order the widths are listed in", () => {
    expect(bestFitWidth(650, [1280, 375, 768])).toBe(768);
  });

  it("takes a different threshold", () => {
    expect(bestFitWidth(650, widths, 0.5)).toBe(1280); // 650 / 1280 = 0.51
  });
});
