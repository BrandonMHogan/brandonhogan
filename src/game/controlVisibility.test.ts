import { describe, expect, it } from "vitest";
import { createInitialState } from "./model";
import { getVisibleWorldControls } from "./controlVisibility";

describe("world control visibility", () => {
  it("shows only the farm restoration prompt before the first farm click", () => {
    expect(getVisibleWorldControls(createInitialState())).toEqual(["farmRestore"]);
  });

  it("reveals the farm controls and Lumber Camp build prompt after restoration", () => {
    const state = { ...createInitialState(), farmRestored: true };
    expect(getVisibleWorldControls(state)).toEqual(["farm", "lumberCamp"]);
  });

  it("removes the Castle control after the Castle is built", () => {
    const initial = createInitialState();
    const state = { ...initial, farmRestored: true, unlocked: { farm: true as const, lumberCamp: true, town: true, quarry: true, castle: true } };
    expect(getVisibleWorldControls(state)).toEqual(["farm", "lumberCamp", "town", "quarry"]);
  });
});
