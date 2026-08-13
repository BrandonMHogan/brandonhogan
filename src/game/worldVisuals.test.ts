import { describe, expect, it } from "vitest";
import { createInitialState } from "./model";
import { getWideProgressionTextureKey, getWorldTextureKeys } from "./worldVisuals";

describe("world visuals", () => {
  it("provides empty and castle-complete background keys for each layout", () => {
    expect(getWorldTextureKeys("wide")).toEqual({ empty: "world-empty", completed: "world-castle" });
    expect(getWorldTextureKeys("narrow")).toEqual({ empty: "world-mobile-empty", completed: "world-mobile-castle" });
  });

  it("selects each approved wide progression background", () => {
    const state = createInitialState(100);
    expect(getWideProgressionTextureKey(state)).toBe("wide-farm-decrepit");

    state.farmRestored = true;
    expect(getWideProgressionTextureKey(state)).toBe("wide-through-farm");

    state.unlocked.lumberCamp = true;
    expect(getWideProgressionTextureKey(state)).toBe("wide-through-lumber");

    state.unlocked.town = true;
    expect(getWideProgressionTextureKey(state)).toBe("wide-through-town");

    state.unlocked.quarry = true;
    expect(getWideProgressionTextureKey(state)).toBe("wide-through-quarry");

    state.unlocked.castle = true;
    expect(getWideProgressionTextureKey(state)).toBe("wide-full");
  });
});
