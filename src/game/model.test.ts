import { describe, expect, it } from "vitest";
import { advanceGame, createInitialState, getRecruitCost, MAX_VILLAGERS, reduceGame } from "./model";

describe("game model", () => {
  it("restores the farm for free on the first click", () => {
    const initial = createInitialState(100);
    const restored = reduceGame(initial, { type: "gather", location: "farm" });

    expect(initial.farmRestored).toBe(false);
    expect(restored.farmRestored).toBe(true);
    expect(restored.resources.food).toBe(0);
  });

  it("gathers food at the farm", () => {
    const state = createInitialState(100);
    state.farmRestored = true;
    const next = reduceGame(state, { type: "gather", location: "farm" });
    expect(next.resources.food).toBe(1);
  });

  it("builds locations only when their costs are met", () => {
    const poor = reduceGame(createInitialState(100), { type: "build", location: "lumberCamp" });
    expect(poor.unlocked.lumberCamp).toBe(false);

    const ready = createInitialState(100);
    ready.resources.food = 15;
    const built = reduceGame(ready, { type: "build", location: "lumberCamp" });
    expect(built.unlocked.lumberCamp).toBe(true);
    expect(built.resources.food).toBe(0);
  });

  it("recruits and assigns one persistent villager per population", () => {
    const state = createInitialState(100);
    state.unlocked.town = true;
    state.resources.food = 100;
    const recruited = reduceGame(state, { type: "recruit" });
    const assigned = reduceGame(recruited, { type: "assign", location: "farm", amount: 1 });
    expect(assigned.villagers).toHaveLength(1);
    expect(assigned.villagers[0].assignment).toBe("farm");
  });

  it("advances automatic production and caps offline time", () => {
    const state = createInitialState(100);
    state.villagers = [{ id: "villager-1", assignment: "farm" }];
    const advanced = advanceGame(state, 60 * 60 * 1000);
    expect(advanced.resources.food).toBe(30 * 60 * 0.65);
    expect(advanced.lastUpdatedAt).toBe(100 + 30 * 60 * 1000);
  });

  it("pauses automatic production while villagers are away from work", () => {
    const state = createInitialState(100);
    state.villagers = [{ id: "villager-1", assignment: "farm" }];
    expect(advanceGame(state, 10_000, false).resources.food).toBe(0);
  });

  it("increases recruitment by ten food for each villager", () => {
    expect(getRecruitCost(createInitialState())).toBe(25);
    const state = createInitialState();
    state.villagers = Array.from({ length: 4 }, (_, index) => ({ id: `v-${index}`, assignment: "idle" as const }));
    expect(getRecruitCost(state)).toBe(65);
  });

  it("caps the visible town population at ten villagers", () => {
    let state = createInitialState();
    state.unlocked.town = true;
    state.resources.food = 10_000;
    for (let index = 0; index < MAX_VILLAGERS + 2; index += 1) state = reduceGame(state, { type: "recruit" });
    expect(state.villagers).toHaveLength(10);
  });
});
