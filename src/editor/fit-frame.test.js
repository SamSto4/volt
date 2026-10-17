import { describe, expect, it } from "vitest";
import { fitFrame } from "./fit-frame.js";

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
