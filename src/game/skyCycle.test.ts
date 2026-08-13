import { describe, expect, it } from "vitest";
import { getCelestialPosition } from "./skyCycle";

describe("celestial cycle", () => {
  it("moves from the left horizon through a high midpoint to the right horizon", () => {
    expect(getCelestialPosition(0, 1000, 600)).toEqual({ x: -60, y: 270 });
    expect(getCelestialPosition(.5, 1000, 600)).toEqual({ x: 500, y: 72 });
    expect(getCelestialPosition(1, 1000, 600)).toEqual({ x: 1060, y: 270 });
  });

  it("clamps elapsed progress to the visible arc", () => {
    expect(getCelestialPosition(-1, 1000, 600)).toEqual(getCelestialPosition(0, 1000, 600));
    expect(getCelestialPosition(2, 1000, 600)).toEqual(getCelestialPosition(1, 1000, 600));
  });
});
