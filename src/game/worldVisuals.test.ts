import { describe, expect, it } from "vitest";
import { getWorldTextureKeys } from "./worldVisuals";

describe("world visuals", () => {
  it("provides empty and castle-complete background keys for each layout", () => {
    expect(getWorldTextureKeys("wide")).toEqual({ empty: "world-empty", completed: "world-castle" });
    expect(getWorldTextureKeys("narrow")).toEqual({ empty: "world-mobile-empty", completed: "world-mobile-castle" });
  });
});
