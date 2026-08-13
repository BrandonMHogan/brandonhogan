import { describe, expect, it } from "vitest";
import { createInitialState } from "./model";
import { CONTROL_REVEAL_DELAY_MS, getProgressionStage, PROGRESSION_CROSSFADE_MS, RESOURCE_POPUP_MS } from "./interactionMotion";

describe("kingdom interaction motion", () => {
  it("uses the approved transition and feedback timing", () => {
    expect(PROGRESSION_CROSSFADE_MS).toBe(900);
    expect(CONTROL_REVEAL_DELAY_MS).toBe(550);
    expect(RESOURCE_POPUP_MS).toBe(1400);
  });

  it("assigns a monotonically increasing stage to every wide background", () => {
    const initial = createInitialState();
    const farm = { ...initial, farmRestored: true };
    const lumber = { ...farm, unlocked: { ...farm.unlocked, lumberCamp: true } };
    const town = { ...lumber, unlocked: { ...lumber.unlocked, town: true } };
    const quarry = { ...town, unlocked: { ...town.unlocked, quarry: true } };
    const castle = { ...quarry, unlocked: { ...quarry.unlocked, castle: true } };
    expect([initial, farm, lumber, town, quarry, castle].map(getProgressionStage)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
