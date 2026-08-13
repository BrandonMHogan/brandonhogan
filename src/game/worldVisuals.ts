import type { GameState } from "./model";
import type { WorldMode } from "./worldLayout";

export type WorldTextureKeys = { empty: string; completed: string };

export const getWorldTextureKeys = (mode: WorldMode): WorldTextureKeys => mode === "narrow"
  ? { empty: "world-mobile-empty", completed: "world-mobile-castle" }
  : { empty: "world-empty", completed: "world-castle" };

export const getWideProgressionTextureKey = (state: GameState): string => {
  if (state.unlocked.castle) return "wide-full";
  if (state.unlocked.quarry) return "wide-through-quarry";
  if (state.unlocked.town) return "wide-through-town";
  if (state.unlocked.lumberCamp) return "wide-through-lumber";
  return state.farmRestored ? "wide-through-farm" : "wide-farm-decrepit";
};
