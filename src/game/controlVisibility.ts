import type { GameState } from "./model";

export type WorldControlName = "farmRestore" | "farm" | "lumberCamp" | "town" | "quarry" | "castle";

export const getVisibleWorldControls = (state: GameState): WorldControlName[] => {
  if (!state.farmRestored) return ["farmRestore"];

  const controls: WorldControlName[] = ["farm"];
  if (state.unlocked.lumberCamp) controls.push("lumberCamp");
  else return [...controls, "lumberCamp"];
  if (state.unlocked.town) controls.push("town");
  else return [...controls, "town"];
  if (state.unlocked.quarry) controls.push("quarry");
  else return [...controls, "quarry"];
  controls.push("castle");
  return controls;
};
